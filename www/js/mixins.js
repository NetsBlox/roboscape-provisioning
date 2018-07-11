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
          store.curSSID = ssid;
          return ssid;
        });
    },

    // updates the reference to live accesspoints
    // it's done this way because since I couldn't get 'computed' to auto update properly.
    keepApsUptodate() {
      try {
        if (cordova) { // if cordova is availabe then we are on a device
          this.aps = Wifi.aps;
          document.addEventListener('scanresults', this.onScanResults.bind(this));
          return Wifi.aps;
        }
      } catch (e) {
        console.error(e);
      }
    },

    onScanResults(event) {
      this.aps = Wifi.aps; // we already have a handle to it and just want to be notified of updates
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

    // forgets xbee aps and connect to the last good AP
    async removeXbeeConnections() {
      let savedNets = await Wifi.savedNetworks();
      for (let i=0; i<savedNets.length; i++) {
        let ap = savedNets[i];
        if (this.isXbeeAp(ap)) await Wifi.removeNetwork(ap);
      }
      await this.updateCurSSID();
      if (this.isXbeeAp(store.curSSID)) { // if connected to a xbee AP
        if (store.originalAp && !this.isXbeeAp(store.originalAp)) {
          // then we have a connection to connect to
          await Wifi.connectNetwork(store.originalAp);
        } else {
          await Wifi.disconnectNetwork(store.curSSID);
        }
      }
    },

  }
};
