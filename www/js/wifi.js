'use strict';
// wifi manipulation helpers

const Wifi = {
  aps: [],

  addOpenNetwork(ssid) {
    return new Promise((resolve, reject) => {
      WifiWizard.addNetwork(WifiWizard.formatWifiConfig(ssid), resolve, reject);
    });
  },

  removeNetwork(ssid) {
    return new Promise((resolve, reject) => {
      WifiWizard.removeNetwork(WifiWizard.formatWifiString(ssid), resolve, reject);
    });
  },

  // connects to a known network
  connectNetwork(ssid) {
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

