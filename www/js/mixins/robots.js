'use strict';

const robotMixin = {

  data: () => {
    return {
      liveRobots: [],
      ownedRobots: [],
      sharedState: sharedStore.state,
    };
  },

  methods: {
    // proves/requests the server to move the robot under the user's ownership
    async ownRobot(robotId) {
      let res = await axios({
        method: 'POST',
        url: this.sharedState.serverAddress + '/api/roboscape/robots',
        // url: 'http://requestbin.fullcontact.com/1h98xma1',
        data: {
          robotId
        },
        withCredentials: true,
      });
    },

    async ownRobots(ids) {
      let curRobots = await this.getMyRobots();
      if (curRobots) {
        let curIds = curRobots.map(r => r.robotId);
        ids = ids.filter(id => !curIds.includes(id)); // process only unowned robots
      }

      let promises = ids.map(async id => await this.ownRobot(id)); // WARN race cond on the server
      await Promise.all(promises);
    },

    // checks for live connected robots
    async getMyLiveRobots() {
      const { data } = await axios({
        url: this.sharedState.serverAddress + '/rpc//RoboScape/getRobots?uuid=FAKE_CLIENT_ID&projectId=FAKE_ID',
        method: 'post',
        data: {},
        withCredentials: true,
      });
      this.liveRobots = robots;
      return data;
    },

    // checks live robots on an interval
    keepLiveRobotsFresh(delay=5000) {
      let intervalHandle = setInterval(async () => {
        try {
          let robots = await this.getMyLiveRobots();
          this.liveRobots = robots;
        } catch (e) {
          // fail silently
          console.debug('failed to fetch live robots');
        }
      }, delay);
      return intervalHandle;
    },

    async getMyRobots() {
      const { data } = await axios({
        url: this.sharedState.serverAddress + '/api/roboscape/robots',
        method: 'get',
        data: {},
        withCredentials: true,
      });
      this.ownedRobots = data;
      return data;
    }
  }

};
