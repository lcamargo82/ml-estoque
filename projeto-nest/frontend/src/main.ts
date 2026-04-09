import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import Toast, { type PluginOptions, POSITION } from "vue-toastification";

// Styles
import './assets/main.css';
import "vue-toastification/dist/index.css";

const app = createApp(App);
const pinia = createPinia();

// Toast configuration
const toastOptions: PluginOptions = {
    position: POSITION.TOP_RIGHT,
    timeout: 3000,
    closeOnClick: true,
    pauseOnFocusLoss: true,
    pauseOnHover: true,
    draggable: true,
    draggablePercent: 0.6,
    showCloseButtonOnHover: false,
    hideProgressBar: false,
    closeButton: "button",
    icon: true,
    rtl: false
};

app.use(pinia);
app.use(router);
app.use(Toast, toastOptions);

app.mount('#app');
