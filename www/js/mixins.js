'use strict';

const apsMixin = {
  data: function() {
    return {
      aps: [
        {
          SSID: 'xbee-23423 test ssid',
          BSSID: 'test:bssid'
        },
        {
          SSID: 'test ssid',
          BSSID: 'test:bssid'
        },
      ], // live accesspoints
      status: 'UNKNOWN',
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
          this.status = `connected to ${ssid}`;
          return ssid;
        });
    },

    // updates the reference to live accesspoints
    // it's done this way because since I couldn't get 'computed' to auto update properly.
    updateAps() {
      if (!cordova) return;

      this.aps = Wifi.aps;
      return Wifi.aps;
    }

  }
};
