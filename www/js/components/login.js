// login page
'use strict';

Vue.component('page-login', {
  template: '#page-login',
  mixins: [authMixin],
  data() {
    return {
      username: '',
      password: '',
      sharedState:sharedStore.state,
    };
  },

  async created() {
    await this.fetchLoginStatus();
  },

  methods: {
    async login() {
      const app = this.$f7;
      const router = this.$f7router;
      app.dialog.preloader('logging in..');
      try {
        await this.authenticator.login(this.username, this.password);
        await this.fetchLoginStatus();
        router.back();
      } catch (e) {
        app.dialog.alert('failed to login.');
      } finally {
        app.dialog.close(); // gets called before alert dialog..
      }
    },
  },
});
