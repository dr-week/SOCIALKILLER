import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import Button from 'primevue/button'
import Aura from '@primevue/themes/aura'
import { autoAnimatePlugin } from '@formkit/auto-animate/vue'
import App from './App.vue'
import './styles.scss'

createApp(App)
  .use(PrimeVue, { theme: { preset: Aura } })
  .use(autoAnimatePlugin)
  .component('Button', Button)
  .mount('#app')
