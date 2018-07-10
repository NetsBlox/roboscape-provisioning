const XBEE_ENDPOINT = 'http://192.168.1.10/',
  XBEE_AP_PREFIX = 'xbee';
// Init F7 Vue Plugin
Framework7.use(Framework7Vue);

// Init Page Components
Vue.component('page-about', {
  template: '#page-about'
});


Vue.component('page-form', {
  template: '#page-form',
  mixins: [apsMixin],
  data: function() {
    return {
      config: {
        ssid: '',
        encryption: '', //encryption algorithm
        psk: ''
      },
    };
  }, // end of data

  created() {
    this.updateAps();
  },

  methods: {
    startSetup() {
      console.log('started configuring robots');
      // TODO make sure the configuration is received and is correct

      // TODO find the selected APs

      // TODO connect to each AP and submit the form

      // TODO show status on the screen
    },

  }


});

// Init App
const app = new Vue({
  el: '#app',
  mixins: [apsMixin],
  data: function() {
    return {
      // Framework7 parameters here
      f7params: {
        root: '#app', // App root element
        id: 'edu.vanderbilt.roboscape', // App bundle ID
        name: 'Roboscape', // App name
        theme: 'auto', // Automatic theme detection
        pushState: true,
        // App routes
        routes: [
          {
            path: '/about/',
            component: 'page-about'
          },
          {
            path: '/form/',
            component: 'page-form'
          },
          {
            path: '/dynamic-route/blog/:blogId/post/:postId/',
            component: 'page-dynamic-routing'
          },
          {
            path: '(.*)',
            component: 'page-not-found',
          },
        ],
      }, // end of f7 parameters

      originalAp: '',
      status: '',

    };
  }, // end of data

  created() {
    document.addEventListener('deviceready', this.onDeviceReady.bind(this));
  },

  methods: {
    async onDeviceReady() { // only runs when cordova is available
      console.debug('cordova ready');
      Perms.ensureLocPerm(); // async
      const SCAN_INTERVAL = 1000 * 5;
      Wifi.startDiscovering(SCAN_INTERVAL);
      // TODO update to events
      setInterval(this.updateAps.bind(this), SCAN_INTERVAL + 1000); // due to lack of computed property auto update.

      let curSSID = await this.updateCurSSID();
      this.originalAp = curSSID;
      await this.removeXbeeConnections();
      console.debug('app ready');
    },

    // forgets xbee aps and connect to the last good AP
    async removeXbeeConnections() {
      let savedNets = await Wifi.savedNetworks();
      for (let i=0; i<savedNets.length; i++) {
        let ap = savedNets[i];
        if (this.isXbeeAp(ap)) await Wifi.removeNetwork(ap);
      }
      await this.updateCurSSID();
      if (this.isXbeeAp(this.curSSID)) { // if connected to a xbee AP
        if (this.originalAp && !this.isXbeeAp(this.originalAp)) {
          // then we have a connection to connect to
          await Wifi.connectNetwork(this.originalAp);
        } else {
          await Wifi.disconnectNetwork(this.curSSID);
        }
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
      // config.ID = opts.ssid;
      if (opts.encryption) config.EE = opts.encryption;
      if (opts.psk) config.PK = opts.psk;
      if (opts.payload) config.EQ = opts.payload;
      return config;
    },

    // performs different checks based on input (either ssid or AP obj)
    isXbeeAp(input) {
      let ssid = input;
      if (input instanceof Object) {
        // check for mac mactching
        ssid = input.SSID;
      }
      ssid = ssid.replace('"', '');
      if (ssid.startsWith(XBEE_AP_PREFIX)) return true;

      // if all checks failed
      return false;
    },

    // connects to a xbee softap
    async connect(ssid) {
      await Wifi.removeNetwork(ssid);
      // add network to known networks
      await Wifi.addOpenNetwork(ssid);
      await Wifi.connectNetwork(ssid);

      // TODO wait until connected
      await sleep(10000);
    },

    async checkConnection(ssid) {
      return new Promise(async (resolve, reject) => {
        await this.updateCurSSID();
        if (this.curSSID !== WifiWizard.formatWifiString(ssid)) {
          reject('mismatching ssids');
        }
        axios.get(XBEE_ENDPOINT)
          .then(resolve)
          .catch(err => {
            reject('cant talk to xbee webserver', err);
          });
      });
    },

    async setupRobot(ssid) {
      // check if it's still visible
      this.updateAps();
      let targetAp = this.aps.find(ap => ap.SSID === ssid);
      if (!targetAp) throw new Error(`AP ${ssid} is not visible.`); // or assert?

      // CHECK this should resolve after the connection is fully established
      this.status = `connecting to ${ssid}`;
      await this.connect(targetAp.SSID);

      this.status = `checking connection with ${ssid}`;
      await this.checkConnection(targetAp.SSID);

      let xbeeConf = this._generateXbeeConfig({
        payload: 'payload',
      });

      this.status = `configuring robot ${ssid}`;
      let res = await this.submitForm(xbeeConf);
      return res;
    },

  }
});
