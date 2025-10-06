import { createApp } from 'vue'
import { Quasar, Dialog, Notify } from 'quasar'
import router from './router'
import App from './App.vue'

// Import icon libraries
import '@quasar/extras/material-icons/material-icons.css'

// Import Quasar css
import 'quasar/src/css/index.sass'

const app = createApp(App)

app.use(Quasar, {
  plugins: [
    Dialog,
    Notify
  ]
})

app.use(router)

app.mount('#app')