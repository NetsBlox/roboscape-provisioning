'use strict';
/* global sharedStore */
// wifi manipulation helpers

const Wifi = {
  aps: [],

  addOpenNetwork(ssid) {
    console.debug('adding open network', ssid);
    return new Promise((resolve, reject) => {
      WifiWizard.addNetwork(WifiWizard.formatWifiConfig(ssid), resolve, reject);
    });
  },

  removeNetwork(ssid) {
    ssid = WifiWizard.formatWifiString(ssid);

    // check to see if the network is saved
    return this.savedNetworks().then(nets => {
      let network = nets.find(net => net === ssid);
      if (!network) {
        console.log(ssid, 'was not found in the saved networks');
        return;
      }
      console.debug('removing', ssid);
      return new Promise((resolve, reject) => {
        WifiWizard.removeNetwork(ssid, resolve, reject);
      });

    });
  },

  disconnectNetwork(ssid) {
    console.debug('removing', ssid);
    return new Promise((resolve, reject) => {
      WifiWizard.disconnectNetwork(WifiWizard.formatWifiString(ssid), resolve, reject);
    });
  },

  // connects to a known network
  connectNetwork(ssid) {
    console.debug('connecting to network', ssid);
    return new Promise((resolve, reject) => {
      WifiWizard.connectNetwork(WifiWizard.formatWifiString(ssid), resolve, reject);
    });
  },

  // updates scan results on an interval
  startDiscovering(interval=5000) {
    let getResults = () => {
      WifiWizard.startScan(console.log, console.error);
      WifiWizard.getScanResults(undefined, visibleAps => {
        // TODO append, update, merge or overwrite current aps
        this.aps = visibleAps;
        sharedStore.state.aps = visibleAps;
        let event = new CustomEvent('scanresults', {
          detail: visibleAps
        });
        document.dispatchEvent(event);
      }, console.error);
    };
    getResults();
    return setInterval(getResults.bind(this), interval);
  },

  savedNetworks() {
    return new Promise((resolve, reject) => {
      WifiWizard.listNetworks(resolve, reject);
    });
  },

  getCurrentSSID() {
    return new Promise(WifiWizard.getCurrentSSID);
  },

};

