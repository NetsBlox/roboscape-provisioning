const XBEE_ENDPOINT = 'http://192.168.1.10',
  XBEE_AP_PREFIX = 'xbee',
  SERVER_ADDRESS = 'https://dev.netsblox.org',
  store = {originalAp: '', curSSID: ''};

// Init F7 Vue Plugin
Framework7.use(Framework7Vue);

Vue.config.devtools = true;

// Init App
const app = new Vue({
  el: '#app',
  mixins: [aMixin],
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
            component: 'page-config'
          },
          {
            path: '/login/',
            component: 'page-login'
          },
          {
            path: '(.*)',
            component: 'page-not-found',
          },
        ],
      }, // end of f7 parameters

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
      this.keepApsUptodate();

      let curSSID = await this.updateCurSSID();
      store.originalAp = curSSID;

      await this.removeXbeeConnections();
      console.debug('app ready');
    },

  }
});
