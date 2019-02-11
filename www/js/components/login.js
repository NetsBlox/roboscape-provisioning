// login page

Vue.component('page-login', {
  template: '#page-login',
  data() {
    return {
      username: '',
      password: '',
    };
  },
  created() {
    console.log('login created');
    // app.$f7.dialog.alert('created');
  },
  methods: {
    signIn() {
      const self = this;
      const app = self.$f7;
      const router = self.$f7router;
      app.dialog.alert(`Username: ${self.username}<br>Password: ${self.password}`, () => {
        router.back();
      });
    },
  },
});
