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

    turnOffMobileData() {
      // TODO
    },

    // reconnects to the initial access point
    async reconnectToOriginal() {
      if (this.originalSsid === '') return; // wasn't intially connected
      await Wifi.connectNetwork(this.originalSsid);
      console.log('connected to the original accesspoint', this.originalSsid);
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
      this.log(`verifying ownership of ${ids.length} robots..`);
      try {
        await this.ownRobots(ids);
      } catch (e) {
        this.log(`connectivity issue with the server: ${SERVER_ADDRESS}`);
        throw e;
      }

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

  } // end of methods

});

