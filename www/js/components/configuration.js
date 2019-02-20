// configuration component
'use strict';

Vue.component('page-config', {
  template: '#page-config',
  mixins: [aMixin, robotMixin],
  data: function() {
    return {
      config: {
        ssid: '',
        encryption: 0, //encryption algorithm
        psk: '',
        payload: ''
      },
      originalSsid: '',
      selectedSsids: [],
      status: '',
      logs: [],
      sharedState: sharedStore.state,
    };
  }, // end of data

  async created() {
    // load the prev conf
    let prevConf = window.localStorage.getItem('ssidConfig');
    this.originalSsid = await Wifi.getCurrentSSID();
    if (prevConf) {
      prevConf = JSON.parse(prevConf);
      this.config = prevConf;
    }

    app.$f7.dialog.alert('Make sure mobile data is turned off.');
    // TODO create a robot status page within the app?
    // WARN requests made when connected to the xbee module might block other requests
    // this.keepLiveRobotsFresh(3000); // TODO auto stop when leaving the page
  },

  methods: {
    validateConfig() {
      let isUseable = this.useableAps.find(ap => ap.SSID === this.config.ssid);
      if (!isUseable) {
        let resp = confirm(`Access point "${this.config.ssid}" seems unusable or unstable are you sure?`);
        if (resp !== true) throw new Error('bad accessspoint pick another one');
      }

      let missingEncryption = () => this.config.psk !== '' && this.config.encryption === 0;
      if (missingEncryption()) {
        throw new Error('missing encryption protocol');
      }
    },

    async startSetup() {

      // make sure the configuration is received and is correct
      try {
        this.validateConfig();
      } catch (e) {
        alert(e.message);
        return;
      }
      console.log('started configuring robots:');
      console.log({config: this.config, selectedSsids: this.selectedSsids});

      // TODO lock the configuration (disable changes)

      // save the conf
      window.localStorage.setItem('ssidConfig', JSON.stringify(this.config));

      // get the robot ids
      const ids = this.selectedSsids.map(ssid => ssid.replace(XBEE_AP_PREFIX, ''));
      // announce ownership of the robots
      // needs connection to the server (internet)
      await this.ownRobots(ids);

      // connect to each AP and submit the form
      this.log('configuring', this.selectedSsids.length, 'robot(s)');
      for (let ssid of this.selectedSsids) {
        try {
          await this.setupRobot(ssid, this.config);
        } catch (e) {
          console.error('failed to setup', ssid, e);
          this.log('failed to setup', ssid); // FIXME gets triggered when there is no failure
        }
      }

      // TODO auto retry for unconfigured robots

      this.status = `finished configuring ${this.selectedSsids.length} robots.`;
      this.log (`finished configuring ${this.selectedSsids.length} robots.`);
      await this.removeXbeeConnections();
      await this.reconnectToOriginal();
    },

    log() {
      let msgs = Array.from(arguments);
      console.log.apply(console, ['app log:', ...msgs]);
      this.logs.push({
        time: new Date().toTimeString().match(/[0-9:]+/)[0],
        text: msgs.join(', '),
      });
    },

    checkSelectedSsids() {
      const value = event.target.value;
      if (event.target.checked) {
        this.selectedSsids.push(value);
      } else {
        this.selectedSsids.splice(this.selectedSsids.indexOf(value), 1);
      }
    },

    // submits the robot form given the key,value pairs
    // inp: data: key values with keys being valid xbee key
    submitForm(config) {

      const POST_TIMEOUT = 10e3;
      const isSuccessfulResponse = resp => (resp.indexOf('<title>Success</title>') !== -1);

      // create the submission string
      const keyValPair = Object.keys(config)
        .map(key => {
          // maybe sanitize
          return `${key}=${config[key]}`;
        })
        .join('&');

      return new Promise((resolve, reject) => {
        var data = keyValPair;

        var xhr = new XMLHttpRequest();
        xhr.withCredentials = true;
        xhr.timeout = POST_TIMEOUT;

        xhr.addEventListener('readystatechange', function () {
          if (xhr.readyState === 4) {
            console.log('form submit response', this.responseText);
            // FIXME should the response status 0 and '' response text be considered successful?
            if (xhr.status >= 200 && xhr.status < 300 && isSuccessfulResponse(this.responseText)) {
              resolve(xhr);
            } else {
              let err = new Error(xhr.statusText || `Unsuccessful Xhr response status: ${xhr.status}`);
              err.xhr = xhr;
              reject(err);
            }
          }
        });

        xhr.open('POST', XBEE_ENDPOINT);
        xhr.setRequestHeader('cache-control', 'no-cache');
        xhr.setRequestHeader('content-type', 'application/x-www-form-urlencoded');

        xhr.send(data);
      });

    },

    // opts: {ssid, encryption, psk, payload}
    _generateXbeeConfig(opts) {
      let config = {};
      // if (!opts.ssid) throw new Error('ssid is required');
      if (opts.ssid) {
        config.ID = opts.ssid;
        if (opts.encryption) config.EE = opts.encryption;
        if (opts.psk) config.PK = opts.psk; // TODO sanity check for open enc and psk
      }
      if (opts.payload) config.EQ = opts.payload; // sets the FQDN readable with xbee IQ command
      return config;
    },

    async pingTest() {
      try {
        await ping(XBEE_IP, 300); // 300ms timeout
        return true;
      } catch (e) {
        return false;
      }
    },

    // connects to a xbee softap
    async connectXbee(ssid) {
      await Wifi.removeNetwork(ssid);
      // add network to known networks
      await Wifi.addOpenNetwork(ssid);
      await Wifi.connectNetwork(ssid);

      // TODO wait until connected
      let hasMatchingSsid = async () => {
        await this.updateCurSSID();
        console.log('does ssid match?', this.sharedState.curSSID, WifiWizard.formatWifiString(ssid));
        return this.sharedState.curSSID === WifiWizard.formatWifiString(ssid);
      };
      await waitUntilPromiseTF(hasMatchingSsid.bind(this), {maxWait: 5000});

      this.status = `verifying connection with ${ssid}..`;
      this.log(`verifying connection with ${ssid}..`);
      await waitUntilPromiseTF(this.pingTest.bind(this), {maxWait: 5000, delayPerCheck: 200});
    },

    async setupRobot(ssid, config) {
      if (!config) throw new Error('missing the configuration');
      // check if it's still visible
      let targetAp = this.sharedState.aps.find(ap => ap.SSID === ssid);
      if (!targetAp) throw new Error(`AP ${ssid} is not visible.`); // or assert?

      // CHECK this should resolve after the connection is fully established
      this.status = `connecting to ${ssid}..`;
      this.log(`connecting to ${ssid}..`);
      try {
        await this.connectXbee(targetAp.SSID);
      } catch (e) {
        throw new Error(`failed to connect to ${targetAp.SSID}`);
      }
      this.status = `configuring robot ${ssid}..`;
      this.log(`configuring robot ${ssid}..`);
      let xbeeConf = this._generateXbeeConfig(config);
      let res = await this.submitForm(xbeeConf);
      this.status = `configured robot ${ssid}`;
      this.log(`configured robot ${ssid}`);

      return res;
    },

    turnOffMobileData() {
      // TODO
    },

    // reconnects to the initial access point
    async reconnectToOriginal() {
      if (this.originalSsid === '') return; // wasn't intially connected
      await Wifi.connectNetwork(this.originalSsid);
      console.log('connected to the original accesspoint', this.originalSsid);
    }

  }

});

