'use strict';

const XBEE_ENDPOINT = 'http://192.168.1.10',
  XBEE_AP_PREFIX = 'xbee-';

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
        ],
      }, // end of f7 parameters
      sharedState: sharedStore.state,
    };
  }, // end of data

  created() {
    document.addEventListener('deviceready', this.onDeviceReady.bind(this));
    this.fetchLoginStatus();
  },

  methods: {
    async promptServerChange() {
      let newServer = prompt('What is the server address you want to connect to?');
      if (!newServer) return; // cancel
      this.$f7.dialog.preloader('checking the server..');
      try {
        await axios.post(newServer + '/api', {
          api: false,
          return_user: false,
          silent: true,
        }, {
          timeout: 1000, // the server should respond within 2 second
        });
        SERVER_ADDRESS = newServer;
        window.localStorage.setItem('serverAddress', newServer);
        this.$f7.dialog.close();
        this.$f7.dialog.alert(`changed the target server to ${SERVER_ADDRESS}`);
        // TODO handle the authentication status change
      } catch (e) {
        this.$f7.dialog.close();
        this.$f7.dialog.alert('failed to set the server: address unreachable.');
      }
    },

    async onDeviceReady() { // only runs when cordova is available
      console.debug('cordova ready');

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
