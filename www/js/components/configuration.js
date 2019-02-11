// configuration component

Vue.component('page-config', {
  template: '#page-config',
  mixins: [aMixin],
  data: function() {
    return {
      config: {
        ssid: '',
        encryption: 0, //encryption algorithm
        psk: '',
        payload: ''
      },
      selectedAps: [],
      status: '',
      logs: []
    };
  }, // end of data

  created() {
    this.keepApsUptodate();
    app.$f7.dialog.alert('Make sure mobile data is turned off.');
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
      try {
        this.validateConfig();
      } catch (e) {
        alert(e.message);
        return;
      }
      console.log('started configuring robots');
      console.log(this.config);
      console.log(this.selectedAps);

      // TODO make sure the configuration is received and is correct

      // TODO lock the configuration (disable changes)

      // TODO connect to each AP and submit the form
      this.log('configuring', this.selectedAps.length, 'robot(s)');
      for (let i=0; i<this.selectedAps.length; i++) {
        let ap = this.selectedAps[i];
        try {
          await this.setupRobot(ap, this.config);
        } catch (e) {
          this.log('failed to configure', ap.SSID);
        }
      }

      // TODO show per AP status text
      // TODO auto retry for unconfigured robots

      this.status = `finished configuring ${this.selectedAps.length} robots.`;
      this.log (`finished configuring ${this.selectedAps.length} robots.`);
      this.removeXbeeConnections();
    },

    log(msg) {
      this.logs.push({
        time: new Date().toTimeString().match(/[0-9:]+/)[0],
        text: msg
      });
    },

    checkSelectedAps() {
      const self = this;
      const value = event.target.value;
      if (event.target.checked) {
        self.selectedAps.push(value);
      } else {
        self.selectedAps.splice(self.selectedAps.indexOf(value), 1);
      }
    },

    // submits the robot form given the key,value pairs
    // inp: data: key values with keys being valid xbee key
    submitForm(config) {
      var keyValPair = Object.keys(config)
        .map(key => {
          // maybe sanitize
          return `${key}=${config[key]}`;
        })
        .join('&');

      return this._submitFormXhr(keyValPair);
    },

    _submitFormXhr(str) {
      return new Promise((resolve, reject) => {
        var data = str;

        var xhr = new XMLHttpRequest();
        xhr.withCredentials = true;
        xhr.timeout = 1000 * 5; // 5s timeout

        xhr.addEventListener('readystatechange', function () {
          if (xhr.readyState === 4) {
            console.log(this.responseText);
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(xhr);
            } else {
              let err = new Error(xhr.statusText || 'Unsuccessful Xhr response');
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
      if (opts.payload) config.EQ = opts.payload;
      return config;
    },

    // connects to a xbee softap
    async connect(ssid) {
      await Wifi.removeNetwork(ssid);
      // add network to known networks
      await Wifi.addOpenNetwork(ssid);
      await Wifi.connectNetwork(ssid);

      // TODO wait until connected
      let connected = async () => {
        await this.updateCurSSID();
        if (store.curSSID !== WifiWizard.formatWifiString(ssid)) {
          throw new Error(`Not connected to ${ssid} yet`);
        }
      };
      await waitUntilPromise(connected.bind(this), 10000);

      await sleep(3000); // also needed since matching ssid names doens't mean an established connection
    },

    async checkConnection(ssid) {
      return new Promise(async (resolve, reject) => {
        await this.updateCurSSID();
        if (store.curSSID !== WifiWizard.formatWifiString(ssid)) {
          reject('mismatching ssids');
        }

        var xhr = new XMLHttpRequest();
        xhr.timeout = 1000 * 5; // 5s timeout

        xhr.addEventListener('readystatechange', function () {
          if (xhr.readyState === 4) {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(xhr);
            } else {
              let err = new Error(xhr.statusText || 'Unsuccessful Xhr response');
              err.xhr = xhr;
              reject(err);
            }
          }
        });

        xhr.open('GET', XBEE_ENDPOINT);
        xhr.send();
      });
    },

    async setupRobot(ssid, config) {
      if (!config) throw new Error('missing the configuration');
      // check if it's still visible
      let targetAp = this.aps.find(ap => ap.SSID === ssid);
      if (!targetAp) throw new Error(`AP ${ssid} is not visible.`); // or assert?

      // CHECK this should resolve after the connection is fully established
      this.status = `connecting to ${ssid}`;
      this.log(`connecting to ${ssid}`);
      await this.connect(targetAp.SSID);

      this.status = `verifying connection with ${ssid}`;
      this.log(`verifying connection with ${ssid}`);
      await this.checkConnection(targetAp.SSID);

      let xbeeConf = this._generateXbeeConfig(config);

      this.status = `configuring robot ${ssid}`;
      this.log(`configuring robot ${ssid}`);
      let res = await this.submitForm(xbeeConf);
      this.status = `configured robot ${ssid}`;
      this.log(`configured robot ${ssid}`);

      return res;
    },

    turnOffMobileData() {
      // TODO
    }

  }


});

