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
    };
  }, // end of data

  computed: {
    xbeeAps() {
      return this.aps.filter(ap => ap.SSID.startsWith('xbee'));
    }
  }
};
