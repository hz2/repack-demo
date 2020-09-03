import Vue from "vue";

import ElementUI from "element-ui";

import App from "./demo.vue";

Vue.config.productionTip = false;

Vue.use(ElementUI);

Vue.prototype._get = (a) => a;

new Vue({
  render: (h) => h(App)
}).$mount("#app");
