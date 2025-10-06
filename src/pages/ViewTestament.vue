<template>
  <q-page padding>
    <div style="padding: 0 10px">
      <div class="col-12">
        <q-btn
          flat
          icon="arrow_back"
          label="Back to Home"
          :text-color="testamentForegroundColor"
          @click="$router.push('/')"
          class="q-mb-md"
        />

        <q-card v-if="testament" :style="{
          backgroundColor: testamentBackgroundColor,
          color: testamentForegroundColor
        }">
          <q-card-section>
            <div class="text-h4 q-mb-sm">{{ testament.title }}</div>
            <div class="text-subtitle1 q-mb-sm" :style="{ color: testamentForegroundColor }">{{ testament.topic }}</div>
            <div class="text-caption q-mb-lg" :style="{ color: lighterForegroundColor }">
              Published {{ formatDate(testament.createdAt) }}
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
              <q-tab v-if="testament.goal && testament.goal.trim()" name="goal" label="Goal" />
              <q-tab v-if="testament.images && testament.images.length > 0" name="gallery" label="Images" />
              <q-tab v-if="testament.references && testament.references.length > 0" name="references" label="References" />
            </q-tabs>

            <q-separator />

            <q-tab-panels v-model="tab" animated :style="{
              backgroundColor: testamentBackgroundColor
            }">
              <q-tab-panel name="testament">
                <div class="text-body1" v-html="testament.content"></div>
              </q-tab-panel>

              <q-tab-panel name="goal" v-if="testament.goal && testament.goal.trim()">
                <div class="text-body1 text-center" v-html="testament.goal"></div>
              </q-tab-panel>

              <q-tab-panel name="references" v-if="testament.references && testament.references.length > 0">
                <q-list separator>
                  <q-item v-for="(ref, index) in testament.references" :key="index" class="q-pa-md">
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

              <q-tab-panel name="gallery" v-if="testament.images && testament.images.length > 0">
                <div
                  v-if="testament.galleryCaption && testament.galleryCaption.trim()"
                  class="text-body2 q-mb-md q-pa-md text-center rounded-borders"
                  :style="{ backgroundColor: lighterBackgroundColor, borderRadius: '8px' }"
                >
                  {{ testament.galleryCaption }}
                </div>
                <div class="row q-gutter-sm">
                  <div v-for="(image, index) in testament.images" :key="index">
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
            <div class="text-body1" v-html="testament.content"></div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn
              v-if="canSetDefaultThis"
              flat
              :text-color="isDefault ? lighterForegroundColor : testamentForegroundColor"
              :label="isDefault ? 'Default Testament' : 'Set as Default'"
              :disable="isDefault"
              @click="setAsDefault"
            />
            <q-btn
              v-if="canDeleteThis"
              flat
              :text-color="testamentForegroundColor"
              icon="delete"
              label="Delete"
              @click="confirmDelete"
            />
            <q-btn
              v-if="canEditThis"
              flat
              :text-color="testamentForegroundColor"
              icon="edit"
              label="Edit"
              @click="editTestament"
            />
            <q-btn
              flat
              :text-color="testamentForegroundColor"
              icon="share"
              label="Share"
              @click="shareTestament"
            />
          </q-card-actions>
        </q-card>

        <q-card v-else>
          <q-card-section>
            <div class="text-center text-grey-6 q-py-lg">
              <q-icon name="error_outline" size="4rem" class="q-mb-md" />
              <div class="text-h6">Testament not found</div>
              <div class="q-mt-md">
                <q-btn
                  label="Go to Home"
                  color="primary"
                  @click="$router.push('/')"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getTestament, deleteTestament, setDefaultTestament, isDefaultTestament } from '../utils/storage'
import { canEditTestament, canEditSpecificTestament, canDeleteTestament, canSetDefaultTestament } from '../utils/auth'
import { useQuasar } from 'quasar'
import { getSettings } from '../utils/settings'
import { lightenColor } from '../utils/colors'

export default {
  name: 'ViewTestament',
  props: {
    id: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const route = useRoute()
    const router = useRouter()
    const $q = useQuasar()
    const testament = ref(null)
    const isDefault = ref(false)
    const tab = ref('testament')

    const canEdit = computed(() => canEditTestament())

    // Permission checks for specific testament
    const canEditThis = computed(() => {
      return testament.value && canEditSpecificTestament(testament.value)
    })

    const canDeleteThis = computed(() => {
      return testament.value && canDeleteTestament(testament.value)
    })

    const canSetDefaultThis = computed(() => {
      return testament.value && canSetDefaultTestament(testament.value)
    })

    // Site settings for fallback colors
    const siteSettings = ref({
      colorScheme: {
        backgroundColor: '#ffffff',
        foregroundColor: '#000000'
      }
    })

    // Get colors with fallback to site settings
    const testamentBackgroundColor = computed(() => {
      if (testament.value && testament.value.backgroundColor && testament.value.backgroundColor.trim()) {
        return testament.value.backgroundColor
      }
      return lightenColor(siteSettings.value.colorScheme.backgroundColor, 10)
    })

    const testamentForegroundColor = computed(() => {
      if (testament.value && testament.value.foregroundColor && testament.value.foregroundColor.trim()) {
        return testament.value.foregroundColor
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
      if (!testament.value) return false
      return (testament.value.goal && testament.value.goal.trim()) ||
             (testament.value.images && testament.value.images.length > 0) ||
             (testament.value.references && testament.value.references.length > 0)
    })

    const loadTestament = async () => {
      try {
        testament.value = await getTestament(props.id)
        isDefault.value = await isDefaultTestament(props.id)
        siteSettings.value = await getSettings()
      } catch (error) {
        console.error('Failed to load testament:', error)
        $q.notify({
          type: 'negative',
          message: 'Failed to load testament'
        })
      }
    }

    const setAsDefault = async () => {
      try {
        await setDefaultTestament(props.id)
        isDefault.value = true
        $q.notify({
          type: 'positive',
          message: 'Set as default testament successfully',
          position: 'top'
        })
      } catch (error) {
        console.error('Failed to set default testament:', error)
        $q.notify({
          type: 'negative',
          message: 'Failed to set as default'
        })
      }
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    const viewImage = (index) => {
      $q.dialog({
        message: `<img src="${testament.value.images[index].data}" style="max-width: 100%; max-height: 70vh; width: auto; height: auto; display: block; margin: 0 auto;" />`,
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

    const shareTestament = () => {
      const url = window.location.href
      navigator.clipboard.writeText(url)
      $q.notify({
        type: 'positive',
        message: 'Link copied to clipboard!',
        position: 'top'
      })
    }

    const editTestament = () => {
      router.push(`/edit/${props.id}`)
    }

    const confirmDelete = () => {
      $q.dialog({
        title: 'Confirm Delete',
        message: 'Are you sure you want to delete this testament? This action cannot be undone.',
        cancel: true,
        persistent: true
      }).onOk(async () => {
        try {
          await deleteTestament(props.id)
          $q.notify({
            type: 'positive',
            message: 'Testament deleted successfully',
            position: 'top'
          })
          router.push('/')
        } catch (error) {
          console.error('Failed to delete testament:', error)
          $q.notify({
            type: 'negative',
            message: 'Failed to delete testament'
          })
        }
      })
    }

    onMounted(async () => {
      await loadTestament()
    })

    return {
      testament,
      isDefault,
      tab,
      canEdit,
      canEditThis,
      canDeleteThis,
      canSetDefaultThis,
      siteSettings,
      testamentBackgroundColor,
      testamentForegroundColor,
      lighterForegroundColor,
      lighterBackgroundColor,
      hasOptionalSections,
      formatDate,
      viewImage,
      shareTestament,
      editTestament,
      confirmDelete,
      setAsDefault
    }
  }
}
</script>
