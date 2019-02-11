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
          BSSID: 'test:bssid',
          level: 0,
          frequency: 0,
          capabilities: '',
        },
      ], // live accesspoints
      sharedState: sharedStore.state,
    };
  }, // end of data

  computed: {
    xbeeAps() {
      return this.aps.filter(ap => ap.SSID.startsWith('xbee'));
    },

    // freq, level, capabilities
    useableAps() {
      let isTwoGhzChannel = ap => ap.frequency < 3000;
      let hasGoodSignal = ap => ap.level > -80;
      let supportsPsk = ap => ap.capabilities.includes('PSK');
      let isOpen = ap => ap.capabilities === '[ESS]';

      let goodAps = this.aps
        .filter(ap => !this.isXbeeAp(ap) && isTwoGhzChannel(ap) && hasGoodSignal(ap) && (supportsPsk(ap) || isOpen(ap)));

      return goodAps;
    }
  },

  methods: {
    updateCurSSID() {
      return Wifi.getCurrentSSID()
        .then(ssid => {
          this.sharedState.curSSID = ssid;
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
      if (this.isXbeeAp(this.sharedState.curSSID)) { // if connected to a xbee AP
        if (this.sharedState.originalAp && !this.isXbeeAp(this.sharedState.originalAp)) {
          // then we have a connection to connect to
          await Wifi.connectNetwork(this.sharedState.originalAp);
        } else {
          await Wifi.disconnectNetwork(this.sharedState.curSSID);
        }
      }
    },

  }
};
