<template>
  <q-page padding :style="{
    backgroundColor: settings.colorScheme.backgroundColor,
    color: settings.colorScheme.foregroundColor
  }">
    <div style="padding: 0 10px">
      <div class="col-12">
        <q-card :style="{
          backgroundColor: settings.colorScheme.backgroundColor,
          color: settings.colorScheme.foregroundColor
        }">
          <q-card-section>
            <div class="text-h5 q-mb-md" :style="{ color: settings.colorScheme.foregroundColor }">Site Settings</div>
            <div class="text-body2 q-mb-lg" :style="{ color: settings.colorScheme.foregroundColor, opacity: 0.7 }">
              Configure site-wide settings (Admin only)
            </div>

            <q-form @submit="onSubmit" class="q-gutter-md">
              <div class="q-mb-md">
                <q-input
                  v-model="settings.siteTitle"
                  label="Site Title"
                  hint="Optional title to display in the header (leave empty to show nothing)"
                  outlined
                  dense
                  clearable
                />
              </div>

              <q-separator class="q-my-lg" />

              <div class="q-mb-md">
                <q-checkbox
                  v-model="settings.showCopyright"
                  label="Show Copyright Statement"
                  class="q-mb-sm"
                />
                <q-input
                  v-if="settings.showCopyright"
                  v-model="settings.copyright"
                  label="Copyright Statement"
                  hint="Single line copyright text to display"
                  outlined
                  dense
                />
              </div>

              <div class="q-mb-md">
                <q-checkbox
                  v-model="settings.showPrivacyPolicy"
                  label="Show Privacy Policy"
                  class="q-mb-sm"
                />
                <q-input
                  v-if="settings.showPrivacyPolicy"
                  v-model="settings.privacyPolicy"
                  label="Privacy Policy"
                  hint="Privacy policy text - will create a clickable link in navbar"
                  outlined
                  dense
                  type="textarea"
                  rows="10"
                />
              </div>

              <q-separator class="q-my-lg" />

              <div class="text-h6 q-mb-md" :style="{ color: settings.colorScheme.foregroundColor }">Color Scheme</div>

              <div class="row q-col-gutter-md q-mb-md">
                <div class="col-12 col-sm-6">
                  <q-input
                    v-model="settings.colorScheme.backgroundColor"
                    label="Background Color"
                    hint="Select background color for the site"
                    outlined
                    dense
                  >
                    <template v-slot:append>
                      <q-icon name="colorize" class="cursor-pointer">
                        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                          <q-color v-model="settings.colorScheme.backgroundColor" />
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                </div>

                <div class="col-12 col-sm-6">
                  <q-input
                    v-model="settings.colorScheme.foregroundColor"
                    label="Foreground Color"
                    hint="Select text/foreground color for the site"
                    outlined
                    dense
                  >
                    <template v-slot:append>
                      <q-icon name="colorize" class="cursor-pointer">
                        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                          <q-color v-model="settings.colorScheme.foregroundColor" />
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                </div>
              </div>

              <q-separator class="q-my-lg" />

              <div class="text-h6 q-mb-md" :style="{ color: settings.colorScheme.foregroundColor }">Contact Information</div>

              <div class="q-mb-md">
                <q-checkbox
                  v-model="settings.contact.showPhone"
                  label="Show Phone Number"
                  class="q-mb-sm"
                />
                <q-input
                  v-if="settings.contact.showPhone"
                  v-model="settings.contact.phone"
                  label="Phone Number"
                  hint="Contact phone number"
                  outlined
                  dense
                />
              </div>

              <div class="q-mb-md">
                <q-checkbox
                  v-model="settings.contact.showEmail"
                  label="Show Email Address"
                  class="q-mb-sm"
                />
                <q-input
                  v-if="settings.contact.showEmail"
                  v-model="settings.contact.email"
                  label="Email Address"
                  hint="Contact email address"
                  outlined
                  dense
                  type="email"
                />
              </div>

              <div class="q-mb-md">
                <q-checkbox
                  v-model="settings.contact.showAddress"
                  label="Show Mailing Address"
                  class="q-mb-sm"
                />
                <q-input
                  v-if="settings.contact.showAddress"
                  v-model="settings.contact.address"
                  label="Mailing Address"
                  hint="Contact mailing address"
                  outlined
                  dense
                  type="textarea"
                  rows="3"
                />
              </div>

              <div class="row justify-end q-mt-lg">
                <q-btn
                  label="Cancel"
                  color="grey"
                  flat
                  @click="$router.push('/')"
                  class="q-mr-sm"
                />
                <q-btn
                  label="Save Settings"
                  type="submit"
                  color="primary"
                  icon="save"
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { getSettings, saveSettings } from '../utils/settings'
import { getCurrentUser } from '../utils/auth'

export default {
  name: 'SettingsPage',
  setup() {
    const router = useRouter()
    const $q = useQuasar()
    const settings = ref({
      siteTitle: '',
      showCopyright: false,
      copyright: '',
      showPrivacyPolicy: false,
      privacyPolicy: '',
      colorScheme: {
        backgroundColor: '#ffffff',
        foregroundColor: '#000000'
      },
      contact: {
        showPhone: false,
        phone: '',
        showEmail: false,
        email: '',
        showAddress: false,
        address: ''
      }
    })

    // Check if user is admin
    const currentUser = getCurrentUser()
    if (!currentUser || currentUser.role !== 'admin') {
      $q.notify({
        type: 'negative',
        message: 'Access denied. Admin only.',
        position: 'top'
      })
      router.push('/')
    }

    const loadSettings = async () => {
      try {
        const loadedSettings = await getSettings()
        settings.value.siteTitle = loadedSettings.siteTitle || ''
        settings.value.showCopyright = loadedSettings.showCopyright || false
        settings.value.copyright = loadedSettings.copyright || ''
        settings.value.showPrivacyPolicy = loadedSettings.showPrivacyPolicy || false
        settings.value.privacyPolicy = loadedSettings.privacyPolicy || ''
        settings.value.colorScheme = loadedSettings.colorScheme || {
          backgroundColor: '#ffffff',
          foregroundColor: '#000000'
        }
        settings.value.contact = loadedSettings.contact || {
          showPhone: false,
          phone: '',
          showEmail: false,
          email: '',
          showAddress: false,
          address: ''
        }
      } catch (error) {
        console.error('Failed to load settings:', error)
        $q.notify({
          type: 'negative',
          message: 'Failed to load settings'
        })
      }
    }

    const onSubmit = () => {
      saveSettings(settings.value)
      $q.notify({
        type: 'positive',
        message: 'Settings saved successfully!',
        position: 'top'
      })
      // Use setTimeout to ensure navigation happens after settings are saved
      setTimeout(() => {
        router.push('/')
      }, 100)
    }

    onMounted(async () => {
      await loadSettings()
    })

    return {
      settings,
      onSubmit
    }
  }
}
</script>
