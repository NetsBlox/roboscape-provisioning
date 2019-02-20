'use strict';

const aMixin = {
  data: function() {
    return {
      sharedState: sharedStore.state,
    };
  }, // end of data

  computed: {
    xbeeAps() {
      return this.sharedState.aps.filter(ap => this.isXbeeAp(ap));
    },

    // freq, level, capabilities
    useableAps() {
      let isTwoGhzChannel = ap => ap.frequency < 3000;
      let hasGoodSignal = ap => ap.level > -80;
      let supportsPsk = ap => ap.capabilities.includes('PSK');
      let isOpen = ap => ap.capabilities === '[ESS]';

      let goodAps = this.sharedState.aps
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


    // performs different checks based on input (either ssid or AP obj)
    isXbeeAp(input) {
      let ssid = input;
      if (input instanceof Object) {
        // check for mac mactching
        ssid = input.SSID;
      }
      ssid = ssid.replace('"', '');
      if (ssid.startsWith(XBEE_AP_PREFIX)
        && ssid.length === XBEE_AP_PREFIX.length + 12)
        return true;

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
}; // end of aMixin
