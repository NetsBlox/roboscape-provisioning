// login page
'use strict';

Vue.component('page-login', {
  template: '#page-login',
  data() {
    return {
      username: '',
      password: '',
      authenticator: new AuthHandler(SERVER_ADDRESS),
      sharedState:sharedStore.state,
    };
  },
  async created() {
    await this.checkLoginStatus();
  },
  methods: {
    async login() {
      const app = this.$f7;
      const router = this.$f7router;
      app.dialog.preloader('logging in..');
      try {
        await this.authenticator.login(this.username, this.password);
        router.back();
      } catch (e) {
        app.dialog.alert('failed to login.');
      } finally {
        app.dialog.close(); // gets called before alert dialog..
      }
    },

    async logout() {
      this.$f7.dialog.preloader('logging out..');
      await this.authenticator.logout();
      this.$f7.dialog.close();
      this.$f7router.back();
    },

    // checks login status and sets the user profile
    async checkLoginStatus() {
      try {
        let rv = await this.authenticator.getProfile();
        this.sharedState.profile = rv;
        return !!rv.username;
      } catch(e) {
        this.sharedState.profile = null;
        return false;
      }
    }
  },
});
