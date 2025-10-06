<template>
  <q-app>
    <q-layout view="lHh Lpr lFf" :style="{
      backgroundColor: siteSettings.colorScheme.backgroundColor,
      color: siteSettings.colorScheme.foregroundColor
    }">
      <q-header elevated :style="{
        backgroundColor: darkerBackgroundColor,
        color: siteSettings.colorScheme.foregroundColor
      }">
        <q-toolbar :style="{
          backgroundColor: darkerBackgroundColor,
          color: siteSettings.colorScheme.foregroundColor
        }">
          <q-btn
            v-if="currentUser"
            flat
            dense
            round
            icon="menu"
            aria-label="Menu"
            @click="toggleLeftDrawer"
          />

          <q-toolbar-title v-if="siteSettings.siteTitle && siteSettings.siteTitle.trim()">
            {{ siteSettings.siteTitle }}
          </q-toolbar-title>

          <q-btn
            v-if="siteSettings.showPrivacyPolicy && siteSettings.privacyPolicy && siteSettings.privacyPolicy.trim()"
            flat
            label="Privacy"
            @click="showPrivacyPolicy"
          />

          <q-btn
            v-if="hasContactInfo"
            flat
            label="Contact"
            @click="showContact"
          />

          <q-space />

          <q-btn-dropdown v-if="testaments.length > 1" flat label="Recent Testaments" icon="list">
            <q-list :style="{
              backgroundColor: siteSettings.colorScheme.backgroundColor,
              color: siteSettings.colorScheme.foregroundColor
            }">
              <q-item
                v-if="testaments.length === 0"
                dense
              >
                <q-item-section>
                  <q-item-label class="text-grey-6">No testaments yet</q-item-label>
                </q-item-section>
              </q-item>
              <q-item
                v-for="testament in testaments"
                :key="testament.id"
                clickable
                v-close-popup
                @click="viewTestament(testament.id)"
              >
                <q-item-section>
                  <q-item-label>{{ testament.title }}</q-item-label>
                  <q-item-label caption>{{ testament.topic }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>

          <div v-if="currentUser" class="q-mr-md">
            <q-chip color="primary" text-color="white" icon="person">
              {{ currentUser.name }}
            </q-chip>
          </div>

          <q-btn
            v-if="!currentUser"
            flat
            label="Login"
            @click="$router.push('/login')"
          />

          <q-btn
            v-else
            flat
            label="Logout"
            @click="handleLogout"
          />
        </q-toolbar>
      </q-header>

      <q-drawer
        v-if="currentUser"
        v-model="leftDrawerOpen"
        show-if-above
        bordered
        :width="drawerWidth"
        :style="{
          backgroundColor: darkerBackgroundColor,
          color: siteSettings.colorScheme.foregroundColor
        }"
      >
        <q-list>

          <q-item clickable @click="$router.push('/')">
            <q-item-section avatar>
              <q-icon name="home" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Home</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            v-if="canEdit"
            clickable
            @click="$router.push('/create')"
          >
            <q-item-section avatar>
              <q-icon name="add" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Create Testament</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            v-if="isAdmin"
            clickable
            @click="$router.push('/settings')"
          >
            <q-item-section avatar>
              <q-icon name="settings" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Settings</q-item-label>
            </q-item-section>
          </q-item>

          <q-separator v-if="currentUser" />

          <q-item
            v-if="!currentUser"
            clickable
            @click="$router.push('/login')"
          >
            <q-item-section avatar>
              <q-icon name="login" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Login</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            v-else
            clickable
            @click="handleLogout"
          >
            <q-item-section avatar>
              <q-icon name="logout" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Logout</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-drawer>

      <q-page-container>
        <router-view />
      </q-page-container>

      <q-footer v-if="siteSettings.showCopyright && siteSettings.copyright && siteSettings.copyright.trim()" class="bg-white text-grey-8">
        <q-separator />
        <div class="q-pa-md text-center">
          {{ siteSettings.copyright }}
        </div>
      </q-footer>
    </q-layout>
  </q-app>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuth } from './utils/authState'
import { logout, canEditTestament } from './utils/auth'
import { getTestaments } from './utils/storage'
import { getSettings } from './utils/settings'
import { darkenColor } from './utils/colors'

export default {
  name: 'App',
  setup() {
    const router = useRouter()
    const $q = useQuasar()
    const { currentUser, updateUser } = useAuth()
    const leftDrawerOpen = ref(false)
    const testaments = ref([])
    const siteSettings = ref({
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

    const canEdit = computed(() => {
      // Explicitly depend on currentUser for reactivity
      return currentUser.value && canEditTestament()
    })
    const isAdmin = computed(() => currentUser.value && currentUser.value.role === 'admin')
    const hasContactInfo = computed(() => {
      const contact = siteSettings.value.contact || {}
      return contact.showPhone ||
             contact.showEmail ||
             contact.showAddress
    })

    const darkerBackgroundColor = computed(() => {
      const colorScheme = siteSettings.value.colorScheme || {}
      return darkenColor(colorScheme.backgroundColor || '#ffffff', 10)
    })

    // Set drawer width to max 10% of screen width (minimum 150px for usability)
    const drawerWidth = computed(() => {
      const tenPercent = window.innerWidth * 0.1
      return Math.max(150, tenPercent)
    })

    const loadTestaments = async () => {
      try {
        testaments.value = await getTestaments()
      } catch (error) {
        console.error('Failed to load testaments:', error)
        testaments.value = []
      }
    }

    const loadSettings = async () => {
      try {
        const loadedSettings = await getSettings()
        // Merge with defaults to ensure all properties exist
        siteSettings.value = {
          ...siteSettings.value,
          ...loadedSettings,
          colorScheme: {
            ...siteSettings.value.colorScheme,
            ...(loadedSettings.colorScheme || {})
          },
          contact: {
            ...siteSettings.value.contact,
            ...(loadedSettings.contact || {})
          }
        }
      } catch (error) {
        console.error('Failed to load settings:', error)
        // Keep default settings on error
      }
    }

    // Watch for route changes to reload settings
    router.afterEach(async () => {
      await loadSettings()
    })

    const viewTestament = (id) => {
      router.push(`/testament/${id}`)
    }

    const showPrivacyPolicy = () => {
      $q.dialog({
        title: 'Privacy Policy',
        message: siteSettings.value.privacyPolicy,
        fullWidth: true,
        maximized: false
      })
    }

    const showContact = () => {
      const contact = siteSettings.value.contact || {}
      let contactHtml = '<div style="line-height: 1.8;">'

      if (contact.showPhone && contact.phone) {
        contactHtml += `<div><strong>Phone:</strong> ${contact.phone}</div>`
      }

      if (contact.showEmail && contact.email) {
        contactHtml += `<div><strong>Email:</strong> <a href="mailto:${contact.email}">${contact.email}</a></div>`
      }

      if (contact.showAddress && contact.address) {
        contactHtml += `<div><strong>Address:</strong><br/>${contact.address.replace(/\n/g, '<br/>')}</div>`
      }

      contactHtml += '</div>'

      $q.dialog({
        title: 'Contact Information',
        message: contactHtml,
        html: true,
        fullWidth: false,
        maximized: false
      })
    }

    onMounted(async () => {
      await loadTestaments()
      await loadSettings()
    })

    const handleLogout = () => {
      logout()
      updateUser()
      $q.notify({
        type: 'positive',
        message: 'Logged out successfully',
        position: 'top'
      })
      router.push('/login')
    }

    return {
      leftDrawerOpen,
      currentUser,
      canEdit,
      isAdmin,
      hasContactInfo,
      siteSettings,
      darkerBackgroundColor,
      drawerWidth,
      testaments,
      viewTestament,
      showPrivacyPolicy,
      showContact,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value
      },
      handleLogout
    }
  }
}
</script>

<style scoped>
.q-item-section--avatar {
  min-width: 32px;
  padding-right: 8px;
}
</style>