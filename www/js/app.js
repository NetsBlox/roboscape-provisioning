const XBEE_ENDPOINT = 'http://192.168.1.10/';
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

    };
  }, // end of data

  created() {
    document.addEventListener('deviceready', this.onDeviceReady.bind(this));
  },

  methods: {
    onDeviceReady() { // only runs when cordova is available
      console.log('Device ready');
      Perms.ensureLocPerm(); // async
      const SCAN_INTERVAL = 1000 * 5;
      Wifi.startDiscovering(SCAN_INTERVAL);
      // TODO update to events
      setInterval(this.updateAps.bind(this), SCAN_INTERVAL + 1000); // due to lack of computed property auto update.

      this.updateCurSSID().then(ssid => {
        this.originalAp = ssid;
      })
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

      return this.submitFormXhr(keyValPair)
    },

    submitFormXhr(str) {
      return new Promise((resolve, reject) => {
        var data = str;

        var xhr = new XMLHttpRequest();
        xhr.withCredentials = true;
        xhr.timeout = 1000 * 2; // 2s timeout

        xhr.addEventListener("readystatechange", function () {
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

        xhr.open("POST", XBEE_ENDPOINT);
        xhr.setRequestHeader("cache-control", "no-cache");
        xhr.setRequestHeader("content-type", "application/x-www-form-urlencoded");

        xhr.send(data);
      })
    },

    // opts: {ssid, encryption, psk, payload}
    generateXbeeConfig(opts) {
      let config = {};
      // if (!opts.ssid) throw new Error('ssid is required');
      // config.ID = opts.ssid;
      if (opts.encryption) config.EE = opts.encryption;
      if (opts.psk) config.PK = opts.psk;
      if (opts.payload) config.EQ = opts.payload;
      return config;
    },

    // connects to a xbee softap
    async connect(ssid) {
      // reset?
      // add network to known networks
      await Wifi.addOpenNetwork(ssid);
      await Wifi.connectNetwork(ssid);

      // TODO wait until connected
      await sleep(10000);
    },

    async checkConnection(ssid) {
      return new Promise(async (resolve, reject) => {
        let curSSID = await Wifi.getCurrentSSID();
        if (curSSID !== WifiWizard.formatWifiString(ssid)) {
          reject('mismatching ssids');
        }
        axios.get(XBEE_ENDPOINT)
          .then(resolve)
          .catch(err => {
            reject('cant talk to xbee webserver', err)
          })
      })
    },

    async test() {
      let targetAp = this.xbeeAps[0];
      let xbeeConf = this.generateXbeeConfig({
        payload: 'payload',
      })
      await Wifi.removeNetwork(targetAp.SSID);
      await this.connect(targetAp.SSID);
      await this.checkConnection(targetAp.SSID);
      let res = await this.submitForm(xbeeConf);
      return res;
    },

  }
});
