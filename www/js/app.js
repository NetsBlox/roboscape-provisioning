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

  methods: {
    startSetup() {
      console.log('started configuring robots');
      // TODO make sure the configuration is received and is correct

      // TODO find the selected APs

      // TODO connect to each AP and submit the form

      // TODO show status on the screen
    }
  }


});

// Init App
new Vue({
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

    };
  }, // end of data

  created() {
    document.addEventListener('deviceready', this.onDeviceReady.bind(this));
  },

  methods: {
    onDeviceReady() { // only runs when cordova is available
      Perms.ensureLocPerm(); // async
      const SCAN_INTERVAL = 1000 * 10;
      Wifi.startDiscovering(SCAN_INTERVAL);
      this.aps = Wifi.aps;
    },

  }
});
