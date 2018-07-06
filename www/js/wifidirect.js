'use strict';

const WD = {

  node: undefined,
  peerList: [],

  getNode() {
    const wd = cordova.plugins.wifi_direct;
    return new Promise((accept, reject) => {
      wd.getInstance(1, 1, 1, 1, 1, accept, reject);
    })
      .then(node => {
        this.node = node;
        return node;
      });
  },

  stopDiscovering() {
    this.node.stopDiscovering(console.log, console.error);
  },

  // checks for peers every 15 secs
  startDiscovering() {
    this.node.startDiscovering(peers => {
      // filter and save the robot peers
      this.peerList = peers.filter(() => true);
    }, console.error);
  },

  connectPeer(target) {
    return new Promise((accept, reject) => {
      this.node.connect(target, accept, reject);
    });
  }

};

