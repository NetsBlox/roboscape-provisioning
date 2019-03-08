'use strict';

// needs main mixins
const xbeeMixins = {
  data: function() {
    return {
      sharedState: sharedStore.state,
    };
  }, // end of data

  methods: {

    // submits the robot form given the key,value pairs
    // inp: data: key values with keys being valid xbee key
    submitForm(config) {

      const POST_TIMEOUT = 10e3;

      const isConsideredSuccess = xhr => {
        let hasSuccess = xhr.status >= 200 && xhr.status < 300 && xhr.responseText.indexOf('<title>Success</title>') !== -1;
        let isCase0 = xhr.status === 0 && xhr.responseText === '';
        return hasSuccess || isCase0;
      };

      // create the submission string
      const keyValPair = Object.keys(config)
        .map(key => {
          // maybe sanitize
          return `${key}=${config[key]}`;
        })
        .join('&');

      return new Promise((resolve, reject) => {
        let data = keyValPair;

        let xhr = new XMLHttpRequest();
        xhr.withCredentials = true;
        xhr.timeout = POST_TIMEOUT;

        xhr.addEventListener('readystatechange', function () {
          if (xhr.readyState === 4) {
            console.log('form submit response', xhr.responseText);
            // FIXME should the response status 0 and '' response text be considered successful?
            if (isConsideredSuccess(xhr)) {
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
        return this.sharedState.curSSID === WifiWizard.formatWifiString(ssid);
      };
      await waitUntilPromiseTF(hasMatchingSsid.bind(this), {maxWait: 15000, msg: `could not connect to the access point ${ssid}`});

      this.status = `verifying connection with ${ssid}..`;
      this.log(`verifying connection with ${ssid}..`);
      await waitUntilPromiseTF(this.pingTest.bind(this), {maxWait: 5000, delayPerCheck: 300, msg: 'could not ping the xbee module'});
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
        console.error(`failed to connect to ${targetAp.SSID}`);
        throw e;
      }
      this.status = `configuring robot ${ssid}..`;
      this.log(`configuring robot ${ssid}..`);
      let xbeeConf = this._generateXbeeConfig(config);
      let res = await this.submitForm(xbeeConf);
      this.status = `configured robot ${ssid}`;
      this.log(`configured robot ${ssid}`);

      return res;
    },


  }

};
