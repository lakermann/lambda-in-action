import Vue from "vue";
import App from "./App.vue";
// @ts-ignore
import VueYoutube from "vue-youtube";

import "./assets/main.css";

Vue.use(VueYoutube);
new Vue({
  render: (h) => h(App),
}).$mount("#app");
