'use strict';

const aMixin = {
  data: function() {
    return {
      aps: [ // TODO this is not shared between different components. Switch to using Wifi.aps. sharedStore?
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
}; // end of aMixin


const authMixin = {
  data: () => {
    return {
      authenticator: new AuthHandler(SERVER_ADDRESS),
      sharedState: sharedStore.state,
    };

  },

  methods: {
    // checks login status and sets the user profile
    async fetchLoginStatus() {
      try {
        let rv = await this.authenticator.getProfile();
        this.sharedState.profile = rv;
        return !!rv.username;
      } catch(e) {
        this.sharedState.profile = null;
        return false;
      }
    },

    async logout() {
      this.$f7.dialog.preloader('logging out..');
      await this.authenticator.logout();
      this.sharedState.profile = null;
      this.$f7.dialog.close();
    },

  }
};


const robotMixin = {

  data: () => {
    return {
      liveRobots: [],
    };
  },

  methods: {
    // proves/requests the server to move the robot under the user's ownership
    async ownRobot(robotId) {
      let res = await axios({
        method: 'POST',
        url: SERVER_ADDRESS + '/api/roboscape/robots',
        // url: 'http://requestbin.fullcontact.com/1h98xma1',
        data: {
          robotId
        },
        withCredentials: true,
      });
    },

    async ownRobots(ids) {
      let promises = ids.map(async id => await ownRobot(id)); // WARN race cond on the server
      await Promise.all(promises);
    },

    // checks for live connected robots
    async getMyLiveRobots() {
      const { data } = await axios({
        url: SERVER_ADDRESS + '/rpc//RoboScape/getRobots?uuid=FAKE_CLIENT_ID&projectId=FAKE_ID',
        method: 'post',
        data: {},
        withCredentials: true,
      });
      return data;
    },

    // checks live robots on an interval
    keepLiveRobotsFresh(delay=1000) {
      let intervalHandle = setInterval(async () => {
        let robots = await this.getMyLiveRobots();
        this.liveRobots = robots;
      }, delay);
      return intervalHandle;
    },

    async getMyRobots() {
      const { data } = await axios({
        url: SERVER_ADDRESS + '/api/roboscape/robots',
        method: 'post',
        data: {},
        withCredentials: true,
      });
      return data;
    }
  }

};
