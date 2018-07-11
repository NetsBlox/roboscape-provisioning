'use strict';

const aMixin = {
  data: function() {
    return {
      aps: [ // TODO this is not shared between different components. Switch to using Wifi.aps
        {
          SSID: 'xbee-23423 test ssid',
          BSSID: 'test:bssid'
        },
        {
          SSID: 'test ssid',
          BSSID: 'test:bssid'
        },
      ], // live accesspoints
      curSSID: '',
    };
  }, // end of data

  computed: {
    xbeeAps() {
      return this.aps.filter(ap => ap.SSID.startsWith('xbee'));
    }
  },

  methods: {
    updateCurSSID() {
      return Wifi.getCurrentSSID()
        .then(ssid => {
          this.curSSID = ssid;
          return ssid;
        });
    },

    // updates the reference to live accesspoints
    // it's done this way because since I couldn't get 'computed' to auto update properly.
    updateAps() {
      try {
        if (!cordova) {
          this.aps = Wifi.aps;
          return Wifi.aps;
        }
      } catch (e) {
      }
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

  }
};
