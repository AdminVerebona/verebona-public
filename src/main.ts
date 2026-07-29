import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { vHover } from './directives/hover'
import { captureReferralCode } from './config/urls'
import './style.css'

// Le code de parrainage present dans l'URL d'arrivee est retenu en memoire
// avant tout rendu, afin que le premier bouton « Essayer gratuitement »
// affiche deja le bon lien. Aucune ecriture dans le navigateur (CDC §4.2).
captureReferralCode()

createApp(App)
  .use(router)
  .directive('hover', vHover)
  .mount('#app')
