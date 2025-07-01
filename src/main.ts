import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import PrimeVue from 'primevue/config'
import { definePreset } from '@primeuix/themes'
import Lara from '@primeuix/themes/aura'
import ToastService from 'primevue/toastservice'

import App from './App.vue'
import router from './router'

const app = createApp(App)

const estebanGold = definePreset(Lara, {
  semantic: {
    primary: {
      50: '#faf9f0',
      100: '#f1efd4',
      200: '#e2dea5',
      300: '#d3c976',
      400: '#cebe65',
      500: '#bfa041',
      600: '#a88237',
      700: '#8c6431',
      800: '#73502d',
      900: '#604327',
      950: '#362412',
    },
  },
})

app.use(PrimeVue, {
  ripple: true,
  theme: {
    preset: estebanGold,
    options: {
      darkModeSelector: '.p-dark',
      cssLayer: false,
    },
  },
})

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(ToastService)
app.use(pinia)
app.use(router)

app.mount('#app')
