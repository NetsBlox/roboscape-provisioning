'use strict';
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
  startDiscovering(interval=10000) {
    WifiWizard.startScan(console.log, console.error);
    let getResults = () => {
      WifiWizard.getScanResults(undefined, visibleAps => {
        // TODO append, update, merge or overwrite current aps
        this.aps = visibleAps;
      }, console.error);
    };
    return setInterval(getResults, interval);
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

