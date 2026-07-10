import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { vHover } from './directives/hover'
import './style.css'

createApp(App)
  .use(router)
  .directive('hover', vHover)
  .mount('#app')
