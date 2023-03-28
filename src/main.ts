import { createPinia } from "pinia";
import { createApp } from "vue";
import mdiVue from "mdi-vue/v3";
import * as mdi from "@mdi/js";
import vueTransitions from "@morev/vue-transitions";
import App from "./App.vue";
import i18n from "./i18n";
import router from "./router";

createApp(App)
    .use(createPinia())
    .use(i18n)
    .use(mdiVue, { icons: mdi })
    .use(router)
    .mount("#app");
