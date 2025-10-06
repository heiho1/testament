<template>
  <q-page padding class="flex flex-center">
    <q-card style="width: 400px; max-width: 90vw" :style="{
      backgroundColor: backgroundColor,
      color: foregroundColor
    }">
      <q-card-section>
        <div class="text-h5 text-center q-mb-md">Login</div>
        <div class="text-body2 text-center q-mb-lg" :style="{ color: lighterForegroundColor }">
          Sign in to manage testaments
        </div>

        <q-form @submit="onLogin" class="q-gutter-md">
          <q-input
            v-model="username"
            label="Username"
            outlined
            :rules="[val => val && val.length > 0 || 'Username is required']"
          >
            <template v-slot:prepend>
              <q-icon name="person" />
            </template>
          </q-input>

          <q-input
            v-model="password"
            label="Password"
            type="password"
            outlined
            :rules="[val => val && val.length > 0 || 'Password is required']"
          >
            <template v-slot:prepend>
              <q-icon name="lock" />
            </template>
          </q-input>

          <div class="q-mt-md">
            <q-btn
              label="Login"
              type="submit"
              :text-color="foregroundColor"
              :style="{ backgroundColor: buttonBackgroundColor }"
              class="full-width"
              :loading="loading"
            />
          </div>

          <div class="q-mt-md">
            <q-btn
              label="Back to Home"
              flat
              :text-color="foregroundColor"
              class="full-width"
              @click="$router.push('/')"
            />
          </div>
        </q-form>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <div class="text-caption" :style="{ color: lighterForegroundColor }">
          <div class="q-mb-sm"><strong>Demo Accounts:</strong></div>
          <div>Admin: username: <code>admin</code>, password: <code>admin123</code></div>
          <div>Author: username: <code>author</code>, password: <code>author123</code></div>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { login } from '../utils/auth'
import { useAuth } from '../utils/authState'
import { useQuasar } from 'quasar'
import { getSettings } from '../utils/settings'
import { lightenColor, darkenColor } from '../utils/colors'

export default {
  name: 'LoginPage',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const $q = useQuasar()
    const { updateUser } = useAuth()

    const username = ref('')
    const password = ref('')
    const loading = ref(false)

    // Get site colors
    const siteSettings = ref({
      colorScheme: {
        backgroundColor: '#ffffff',
        foregroundColor: '#000000'
      }
    })
    
    // Load settings
    const loadSettings = async () => {
      try {
        siteSettings.value = await getSettings()
      } catch (error) {
        console.error('Failed to load settings:', error)
        // Keep default colors
      }
    }
    
    const backgroundColor = computed(() => darkenColor(siteSettings.value.colorScheme.backgroundColor, 10))
    const foregroundColor = computed(() => siteSettings.value.colorScheme.foregroundColor)
    const lighterForegroundColor = computed(() => lightenColor(foregroundColor.value, 20))
    const buttonBackgroundColor = computed(() => darkenColor(backgroundColor.value, 10))

    const onLogin = async () => {
      loading.value = true

      try {
        const result = await login(username.value, password.value)

        loading.value = false

        if (result.success) {
          updateUser() // Refresh auth state

          $q.notify({
            type: 'positive',
            message: `Welcome back, ${result.user.name}!`,
            position: 'top'
          })

          // Redirect to the page they were trying to access, or home
          const redirect = route.query.redirect || '/'

          // Use nextTick to ensure state is updated before navigation
          setTimeout(() => {
            router.push(redirect)
          }, 100)
        } else {
          $q.notify({
            type: 'negative',
            message: result.error,
            position: 'top'
          })
        }
      } catch (error) {
        loading.value = false
        console.error('Login error:', error)
        $q.notify({
          type: 'negative',
          message: 'Login failed. Please try again.',
          position: 'top'
        })
      }
    }

    onMounted(async () => {
      await loadSettings()
    })

    return {
      username,
      password,
      loading,
      siteSettings,
      backgroundColor,
      foregroundColor,
      lighterForegroundColor,
      buttonBackgroundColor,
      onLogin
    }
  }
}
</script>
