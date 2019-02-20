'use strict';

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
