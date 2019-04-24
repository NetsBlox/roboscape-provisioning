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

    async promptServerChange() {
      let newServer = prompt('What is the server address you want to connect to?');
      if (!newServer) return; // cancel
      this.$f7.dialog.preloader('checking the server..');
      try {
        await axios.post(newServer + '/api', {
          api: false,
          return_user: false,
          silent: true,
        }, {
          timeout: 1000, // the server should respond within 2 second
        });
        this.sharedState.serverAddress = newServer;

        // the server address for the authenticator is not updated through 2way binding
        this.updateAuthServerAddr();

        window.localStorage.setItem('serverAddress', newServer);
        this.$f7.dialog.close();
        this.$f7.dialog.alert(`changed the target server to ${this.sharedState.serverAddress}`);
        // TODO handle the authentication status change
      } catch (e) {
        console.error(e);
        this.$f7.dialog.close();
        this.$f7.dialog.alert('failed to set the server: address unreachable.');
      }
    },
  },
});
