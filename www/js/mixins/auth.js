'use strict';

const authMixin = {
  data: { // share between instances
    authenticator: null,
    sharedState: sharedStore.state,
  },

  created() {
    this.authenticator = new AuthHandler(this.sharedState.serverAddress);
  },

  methods: {
    // updates the server address for the authenticator
    updateAuthServerAddr() {
      this.authenticator.serverUrl = this.sharedState.serverAddress;
    },

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
