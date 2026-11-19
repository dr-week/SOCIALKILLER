import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import Button from 'primevue/button'
import Aura from '@primevue/themes/aura'
import App from './App.vue'
import './styles.scss'

createApp(App)
  .use(PrimeVue, { theme: { preset: Aura } })
  .component('Button', Button)
  .mount('#app')
