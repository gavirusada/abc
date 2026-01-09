import { createPinia } from 'pinia'

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli-vite/boot-files
export default ({ app }) => {
  const pinia = createPinia()
  app.use(pinia)
}
