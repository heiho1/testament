<template>
  <q-page padding>
    <div style="padding: 0 10px">
      <div class="col-12">
        <!-- Default Testament -->
        <q-card v-if="defaultTestament" class="q-mb-lg" :style="{
          backgroundColor: testamentBackgroundColor,
          color: testamentForegroundColor
        }">
          <q-card-section>
            <div class="text-h4 q-mb-sm">{{ defaultTestament.title }}</div>
            <div class="text-subtitle1 q-mb-sm" :style="{ color: testamentForegroundColor }">{{ defaultTestament.topic }}</div>
            <div class="text-caption q-mb-lg" :style="{ color: lighterForegroundColor }">
              Published {{ formatDate(defaultTestament.createdAt) }}
            </div>
          </q-card-section>

          <template v-if="hasOptionalSections">
            <q-tabs
              v-model="tab"
              dense
              :text-color="lighterForegroundColor"
              :active-color="testamentForegroundColor"
              :indicator-color="testamentForegroundColor"
              align="justify"
            >
              <q-tab name="testament" label="Testament" />
              <q-tab v-if="defaultTestament.goal && defaultTestament.goal.trim()" name="goal" label="Goal" />
              <q-tab v-if="defaultTestament.images && defaultTestament.images.length > 0" name="gallery" label="Image Gallery" />
              <q-tab v-if="defaultTestament.references && defaultTestament.references.length > 0" name="references" label="References" />
            </q-tabs>

            <q-separator />

            <q-tab-panels v-model="tab" animated :style="{
              backgroundColor: testamentBackgroundColor
            }">
              <q-tab-panel name="testament">
                <div class="text-body1" v-html="defaultTestament.content"></div>
              </q-tab-panel>

              <q-tab-panel name="goal" v-if="defaultTestament.goal && defaultTestament.goal.trim()">
                <div class="text-body1 text-center" v-html="defaultTestament.goal"></div>
              </q-tab-panel>

              <q-tab-panel name="references" v-if="defaultTestament.references && defaultTestament.references.length > 0">
                <q-list separator>
                  <q-item v-for="(ref, index) in defaultTestament.references" :key="index" class="q-pa-md">
                    <q-item-section>
                      <q-item-label class="text-h6">
                        <a :href="ref.uri" target="_blank" rel="noopener noreferrer" class="text-primary">
                          {{ ref.title }}
                        </a>
                      </q-item-label>
                      <q-item-label caption class="q-mt-xs">
                        {{ ref.uri }}
                      </q-item-label>
                      <q-item-label v-if="ref.description && ref.description.trim()" class="q-mt-sm text-body2">
                        {{ ref.description }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-tab-panel>

              <q-tab-panel name="gallery" v-if="defaultTestament.images && defaultTestament.images.length > 0">
                <div
                  v-if="defaultTestament.galleryCaption && defaultTestament.galleryCaption.trim()"
                  class="text-body2 q-mb-md q-pa-md text-center rounded-borders"
                  :style="{ backgroundColor: lighterBackgroundColor, borderRadius: '8px' }"
                >
                  {{ defaultTestament.galleryCaption }}
                </div>
                <div class="row q-gutter-sm">
                  <div v-for="(image, index) in defaultTestament.images" :key="index">
                    <q-img
                      :src="image.data"
                      style="width: 200px; height: 200px"
                      class="rounded-borders cursor-pointer"
                      @click="viewImage(index)"
                    />
                  </div>
                </div>
              </q-tab-panel>
            </q-tab-panels>
          </template>

          <q-card-section v-else>
            <div class="text-body1" v-html="defaultTestament.content"></div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn
              flat
              :text-color="testamentForegroundColor"
              label="Testament Home"
              icon="arrow_forward"
              @click="viewTestament(defaultTestament.id)"
            />
          </q-card-actions>
        </q-card>

        <!-- Welcome Card (only show if no default) -->
        <q-card v-else class="q-mb-lg">
          <q-card-section>
            <div class="text-h4 text-center q-mb-md">Welcome to Testament</div>
            <div class="text-body1 text-center text-grey-7">
              Share your personal beliefs and testaments with the world
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { getDefaultTestament } from '../utils/storage'
import { canEditTestament } from '../utils/auth'
import { getSettings } from '../utils/settings'
import { lightenColor } from '../utils/colors'

export default {
  name: 'HomePage',
  setup() {
    const router = useRouter()
    const $q = useQuasar()
    const defaultTestament = ref(null)
    const tab = ref('testament')

    const canEdit = computed(() => canEditTestament())

    // Site settings for fallback colors
    const siteSettings = ref({
      colorScheme: {
        backgroundColor: '#ffffff',
        foregroundColor: '#000000'
      }
    })

    // Get colors with fallback to site settings
    const testamentBackgroundColor = computed(() => {
      if (defaultTestament.value && defaultTestament.value.backgroundColor && defaultTestament.value.backgroundColor.trim()) {
        return defaultTestament.value.backgroundColor
      }
      return lightenColor(siteSettings.value.colorScheme.backgroundColor, 10)
    })

    const testamentForegroundColor = computed(() => {
      if (defaultTestament.value && defaultTestament.value.foregroundColor && defaultTestament.value.foregroundColor.trim()) {
        return defaultTestament.value.foregroundColor
      }
      return siteSettings.value.colorScheme.foregroundColor
    })

    const lighterForegroundColor = computed(() => {
      return lightenColor(testamentForegroundColor.value, 20)
    })

    const lighterBackgroundColor = computed(() => {
      return lightenColor(testamentBackgroundColor.value, 30)
    })

    const hasOptionalSections = computed(() => {
      if (!defaultTestament.value) return false
      return (defaultTestament.value.goal && defaultTestament.value.goal.trim()) ||
             (defaultTestament.value.images && defaultTestament.value.images.length > 0) ||
             (defaultTestament.value.references && defaultTestament.value.references.length > 0)
    })

    const loadTestaments = async () => {
      try {
        defaultTestament.value = await getDefaultTestament()
        siteSettings.value = await getSettings()
      } catch (error) {
        console.error('Failed to load testament data:', error)
        $q.notify({
          type: 'negative',
          message: 'Failed to load testament data'
        })
      }
    }

    const viewTestament = (id) => {
      router.push(`/testament/${id}`)
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString()
    }

    const viewImage = (index) => {
      $q.dialog({
        message: `<img src="${defaultTestament.value.images[index].data}" style="max-width: 100%; max-height: 70vh; width: auto; height: auto; display: block; margin: 0 auto;" />`,
        html: true,
        fullWidth: false,
        maximized: false,
        style: `background-color: ${testamentBackgroundColor.value}; color: ${testamentForegroundColor.value};`,
        ok: {
          color: testamentForegroundColor.value,
          textColor: testamentBackgroundColor.value,
          flat: true
        }
      })
    }

    onMounted(async () => {
      await loadTestaments()
    })

    return {
      defaultTestament,
      tab,
      canEdit,
      siteSettings,
      testamentBackgroundColor,
      testamentForegroundColor,
      lighterForegroundColor,
      lighterBackgroundColor,
      hasOptionalSections,
      viewTestament,
      formatDate,
      viewImage
    }
  }
}
</script>