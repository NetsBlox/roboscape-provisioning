'use strict';

const XBEE_IP = '192.168.1.10';
const XBEE_ENDPOINT = 'http://' + XBEE_IP;
const XBEE_AP_PREFIX = 'xbee-';

let SERVER_ADDRESS = window.localStorage.getItem('serverAddress') || 'https://dev.netsblox.org';


// Init F7 Vue Plugin
Framework7.use(Framework7Vue);

Vue.config.devtools = true;

// Init App
const app = new Vue({
  el: '#app',
  mixins: [aMixin, authMixin],
  data: function() {
    return {
      // Framework7 parameters here
      f7params: {
        root: '#app', // App root element
        id: 'edu.vanderbilt.roboscape', // App bundle ID
        touch: {
          tapHold: true, // enable tap hold events
        },
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
            path: '/setup/',
            component: 'page-config'
          },
          {
            path: '/login/',
            component: 'page-login'
          },
        ],
      }, // end of f7 parameters
      sharedState: sharedStore.state,
      loaded: false,
    };
  }, // end of data

  created() {
    document.addEventListener('deviceready', this.onDeviceReady.bind(this));
    this.fetchLoginStatus();
  },

  mounted() {
    if (this.runningInBrowser()) this.loaded = true;
  },

  methods: {

    runningInBrowser() {
      return !window.cordova;
    },

    async onDeviceReady() { // only runs when cordova is available
      console.debug('cordova ready');
      this.loaded = true;

      Perms.ensureLocPerm(); // async
      const SCAN_INTERVAL = 1000 * 3;
      Wifi.startDiscovering(SCAN_INTERVAL);

      // capture backbutton
      document.addEventListener('backbutton', this.onBackButton.bind(this));

      let curSSID = await this.updateCurSSID();
      this.sharedState.originalAp = curSSID;

      await this.removeXbeeConnections();
      console.debug('app ready');
    },

    onBackButton() {
      const router = app.$f7.views.current.router;
      const isOnMainPage = () => {
        // find non main page routes..
        const nonMainRoutes = this.f7params.routes.map(o => o.path);
        return ! nonMainRoutes.includes(router.currentRoute.route.path);
      };
      if (isOnMainPage()) {
        navigator.app.exitApp();
      } else {
        router.back();
      }
    }

  }
});
