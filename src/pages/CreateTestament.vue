<template>
  <q-page padding>
    <div class="row justify-center">
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h5 q-mb-md">{{ isEditMode ? 'Edit Testament' : 'Create Your Testament' }}</div>
            <div class="text-body2 text-grey-7 q-mb-lg">
              Share your personal beliefs and perspective on topics that matter to you
            </div>

            <q-form @submit="onSubmit" class="q-gutter-md">
              <q-input
                v-model="form.title"
                label="Title"
                hint="Give your testament a memorable title"
                outlined
                :rules="[val => val && val.length > 0 || 'Title is required']"
              />

              <q-input
                v-model="form.topic"
                label="Topic"
                hint="What is this testament about?"
                outlined
                :rules="[val => val && val.length > 0 || 'Topic is required']"
              />

              <div>
                <q-checkbox
                  v-model="enableCustomColors"
                  label="Customize Colors"
                  class="q-mb-md"
                />

                <div v-if="enableCustomColors" class="q-mb-md">
                  <div class="row q-col-gutter-md">
                    <div class="col-12 col-sm-6">
                      <q-input
                        v-model="form.backgroundColor"
                        label="Background Color"
                        hint="Testament background color"
                        outlined
                        dense
                      >
                        <template v-slot:append>
                          <q-icon name="colorize" class="cursor-pointer">
                            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                              <q-color v-model="form.backgroundColor" />
                            </q-popup-proxy>
                          </q-icon>
                        </template>
                      </q-input>
                    </div>

                    <div class="col-12 col-sm-6">
                      <q-input
                        v-model="form.foregroundColor"
                        label="Foreground Color"
                        hint="Testament text color"
                        outlined
                        dense
                      >
                        <template v-slot:append>
                          <q-icon name="colorize" class="cursor-pointer">
                            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                              <q-color v-model="form.foregroundColor" />
                            </q-popup-proxy>
                          </q-icon>
                        </template>
                      </q-input>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div class="text-caption text-grey-7 q-mb-xs">Your Testament</div>
                <q-editor
                  v-model="form.content"
                  min-height="10rem"
                  :toolbar="[
                    ['bold', 'italic', 'underline', 'strike'],
                    ['unordered', 'ordered'],
                    ['quote', 'link'],
                    [
                      {
                        label: $q.lang.editor.fontSize,
                        icon: $q.iconSet.editor.fontSize,
                        fixedLabel: true,
                        fixedIcon: true,
                        list: 'no-icons',
                        options: ['size-1', 'size-2', 'size-3', 'size-4', 'size-5', 'size-6', 'size-7']
                      },
                      {
                        label: $q.lang.editor.font,
                        icon: $q.iconSet.editor.font,
                        fixedLabel: true,
                        fixedIcon: true,
                        list: 'no-icons',
                        options: [
                          'default_font',
                          'arial',
                          'arial_black',
                          'comic_sans',
                          'courier_new',
                          'impact',
                          'lucida_grande',
                          'times_new_roman',
                          'verdana'
                        ]
                      }
                    ],
                    ['undo', 'redo']
                  ]"
                  :fonts="{
                    arial: 'Arial',
                    arial_black: 'Arial Black',
                    comic_sans: 'Comic Sans MS',
                    courier_new: 'Courier New',
                    impact: 'Impact',
                    lucida_grande: 'Lucida Grande',
                    times_new_roman: 'Times New Roman',
                    verdana: 'Verdana'
                  }"
                />
                <div class="text-caption text-grey-7 q-mt-xs">
                  Express your beliefs, thoughts, and perspective
                </div>
              </div>

              <div>
                <q-checkbox
                  v-model="enableGoal"
                  label="Add Goal"
                  class="q-mb-md"
                />

                <div v-if="enableGoal">
                  <div class="text-caption text-grey-7 q-mb-xs">Goal</div>
                  <q-editor
                    v-model="form.goal"
                    min-height="8rem"
                    :toolbar="[
                      ['bold', 'italic', 'underline', 'strike'],
                      ['unordered', 'ordered'],
                      ['quote', 'link'],
                      [
                        {
                          label: $q.lang.editor.fontSize,
                          icon: $q.iconSet.editor.fontSize,
                          fixedLabel: true,
                          fixedIcon: true,
                          list: 'no-icons',
                          options: ['size-1', 'size-2', 'size-3', 'size-4', 'size-5', 'size-6', 'size-7']
                        },
                        {
                          label: $q.lang.editor.font,
                          icon: $q.iconSet.editor.font,
                          fixedLabel: true,
                          fixedIcon: true,
                          list: 'no-icons',
                          options: [
                            'default_font',
                            'arial',
                            'arial_black',
                            'comic_sans',
                            'courier_new',
                            'impact',
                            'lucida_grande',
                            'times_new_roman',
                            'verdana'
                          ]
                        }
                      ],
                      ['undo', 'redo']
                    ]"
                    :fonts="{
                      arial: 'Arial',
                      arial_black: 'Arial Black',
                      comic_sans: 'Comic Sans MS',
                      courier_new: 'Courier New',
                      impact: 'Impact',
                      lucida_grande: 'Lucida Grande',
                      times_new_roman: 'Times New Roman',
                      verdana: 'Verdana'
                    }"
                  />
                  <div class="text-caption text-grey-7 q-mt-xs">
                    Describe what you wish to accomplish
                  </div>
                </div>
              </div>

              <div>
                <q-checkbox
                  v-model="enableReferences"
                  label="Add References"
                  class="q-mb-md"
                />

                <div v-if="enableReferences">
                  <div class="text-caption text-grey-7 q-mb-xs">References</div>

                  <div v-for="(ref, index) in form.references" :key="index" class="q-mb-md q-pa-md" style="border: 1px solid #e0e0e0; border-radius: 8px;">
                    <div class="row justify-between items-center q-mb-sm">
                      <div class="text-caption text-grey-7">Reference {{ index + 1 }}</div>
                      <q-btn
                        flat
                        dense
                        round
                        icon="close"
                        color="negative"
                        size="sm"
                        @click="removeReference(index)"
                      />
                    </div>
                    <q-input
                      v-model="ref.title"
                      label="Title *"
                      hint="Reference title (required)"
                      outlined
                      dense
                      class="q-mb-sm"
                    />
                    <q-input
                      v-model="ref.uri"
                      label="URI *"
                      hint="Web address (required)"
                      outlined
                      dense
                      class="q-mb-sm"
                    />
                    <q-input
                      v-model="ref.description"
                      label="Description (Optional)"
                      hint="Max 200 words"
                      outlined
                      dense
                      type="textarea"
                      rows="3"
                      maxlength="1000"
                    />
                  </div>

                  <q-btn
                    flat
                    color="primary"
                    icon="add"
                    label="Add Reference"
                    @click="addReference"
                  />
                </div>
              </div>

              <div>
                <q-checkbox
                  v-model="enableImageGallery"
                  label="Add Image Gallery"
                  class="q-mb-md"
                />

                <div v-if="enableImageGallery">
                  <div class="text-caption text-grey-7 q-mb-xs">Image Gallery</div>

                  <q-input
                    v-model="form.galleryCaption"
                    label="Gallery Caption (Optional)"
                    hint="Add a description or explanation for your image gallery"
                    outlined
                    class="q-mb-md"
                  />

                  <q-file
                    v-model="imageFiles"
                    multiple
                    accept="image/*"
                    outlined
                    label="Upload images"
                    @update:model-value="handleImageUpload"
                    hint="Images will be automatically compressed to fit storage limits"
                  >
                    <template v-slot:prepend>
                      <q-icon name="image" />
                    </template>
                  </q-file>

                  <div v-if="form.images.length > 0" class="q-mt-md">
                    <div class="text-caption text-grey-7 q-mb-sm">Uploaded Images:</div>
                    <div class="row q-gutter-sm">
                      <div v-for="(image, index) in form.images" :key="index" class="relative-position">
                        <q-img
                          :src="image.data"
                          style="width: 100px; height: 100px"
                          class="rounded-borders"
                        />
                        <q-btn
                          round
                          dense
                          flat
                          icon="close"
                          color="negative"
                          size="sm"
                          class="absolute-top-right"
                          @click="removeImage(index)"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="row justify-between q-mt-lg">
                <q-btn
                  label="Cancel"
                  color="grey"
                  flat
                  @click="$router.push('/')"
                />
                <q-btn
                  :label="isEditMode ? 'Update Testament' : 'Publish Testament'"
                  type="submit"
                  color="primary"
                  :icon="isEditMode ? 'save' : 'publish'"
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
import { useRouter, useRoute } from 'vue-router'
import { saveTestament, getTestament } from '../utils/storage'
import { useQuasar } from 'quasar'
import { getCurrentUser } from '../utils/auth'

export default {
  name: 'CreateTestament',
  props: {
    id: {
      type: String,
      required: false
    }
  },
  setup(props) {
    const router = useRouter()
    const route = useRoute()
    const $q = useQuasar()
    const isEditMode = ref(false)
    const testamentId = ref(null)

    const form = ref({
      title: '',
      topic: '',
      content: '',
      goal: '',
      references: [],
      images: [],
      galleryCaption: '',
      backgroundColor: '',
      foregroundColor: ''
    })

    const imageFiles = ref(null)
    const enableGoal = ref(false)
    const enableReferences = ref(false)
    const enableImageGallery = ref(false)
    const enableCustomColors = ref(false)

    const compressImage = (file, maxSizeKB = 500) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          const img = new Image()
          img.onload = () => {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')

            // Calculate new dimensions (max 1920px width/height)
            let width = img.width
            let height = img.height
            const maxDimension = 1920

            if (width > maxDimension || height > maxDimension) {
              if (width > height) {
                height = (height / width) * maxDimension
                width = maxDimension
              } else {
                width = (width / height) * maxDimension
                height = maxDimension
              }
            }

            canvas.width = width
            canvas.height = height
            ctx.drawImage(img, 0, 0, width, height)

            // Try different quality levels to get under size limit
            let quality = 0.9
            let compressedDataUrl = canvas.toDataURL('image/jpeg', quality)

            // Keep reducing quality until we're under the size limit
            while (compressedDataUrl.length > maxSizeKB * 1024 * 1.37 && quality > 0.1) {
              quality -= 0.1
              compressedDataUrl = canvas.toDataURL('image/jpeg', quality)
            }

            resolve({
              name: file.name,
              data: compressedDataUrl
            })
          }
          img.onerror = reject
          img.src = e.target.result
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
    }

    const handleImageUpload = async (files) => {
      if (!files) return

      const fileArray = Array.isArray(files) ? files : [files]

      for (const file of fileArray) {
        try {
          const compressedImage = await compressImage(file)
          form.value.images.push(compressedImage)

          $q.notify({
            type: 'positive',
            message: `Image "${file.name}" added successfully`,
            position: 'top',
            timeout: 2000
          })
        } catch (error) {
          $q.notify({
            type: 'negative',
            message: `Failed to process image "${file.name}"`,
            position: 'top',
            timeout: 3000
          })
        }
      }

      // Clear the file input
      imageFiles.value = null
    }

    const removeImage = (index) => {
      form.value.images.splice(index, 1)
    }

    const addReference = () => {
      form.value.references.push({
        title: '',
        uri: '',
        description: ''
      })
    }

    const removeReference = (index) => {
      form.value.references.splice(index, 1)
    }

    const loadTestament = async () => {
      if (props.id) {
        try {
          const testament = await getTestament(props.id)
          if (testament) {
            isEditMode.value = true
            testamentId.value = props.id
            form.value = {
              title: testament.title,
              topic: testament.topic,
              content: testament.content,
              goal: testament.goal || '',
              references: testament.references || [],
              images: testament.images || [],
              galleryCaption: testament.galleryCaption || '',
              backgroundColor: testament.backgroundColor || '',
              foregroundColor: testament.foregroundColor || ''
            }
            enableGoal.value = testament.goal && testament.goal.trim().length > 0
            enableReferences.value = testament.references && testament.references.length > 0
            enableImageGallery.value = testament.images && testament.images.length > 0
            enableCustomColors.value = (testament.backgroundColor && testament.backgroundColor.trim().length > 0) ||
                                        (testament.foregroundColor && testament.foregroundColor.trim().length > 0)
          }
        } catch (error) {
          console.error('Failed to load testament for editing:', error)
          $q.notify({
            type: 'negative',
            message: 'Failed to load testament for editing'
          })
        }
      }
    }

    const onSubmit = async () => {
      if (!form.value.content || form.value.content.trim() === '') {
        $q.notify({
          type: 'negative',
          message: 'Content is required',
          position: 'top'
        })
        return
      }

      // Validate references if enabled
      if (enableReferences.value) {
        const validReferences = form.value.references.filter(ref => ref.title && ref.uri)
        if (form.value.references.length > 0 && validReferences.length === 0) {
          $q.notify({
            type: 'warning',
            message: 'Please provide title and URI for at least one reference or disable references',
            position: 'top'
          })
          return
        }
      }

      const currentUser = getCurrentUser()
      
      let existingTestament = null
      if (isEditMode.value) {
        try {
          existingTestament = await getTestament(testamentId.value)
        } catch (error) {
          console.error('Failed to load existing testament:', error)
        }
      }

      const testament = {
        id: isEditMode.value ? testamentId.value : Date.now().toString(),
        title: form.value.title,
        topic: form.value.topic,
        content: form.value.content,
        goal: enableGoal.value ? form.value.goal || '' : '',
        references: enableReferences.value ? form.value.references.filter(ref => ref.title && ref.uri) : [],
        images: enableImageGallery.value ? form.value.images || [] : [],
        galleryCaption: enableImageGallery.value ? form.value.galleryCaption || '' : '',
        backgroundColor: enableCustomColors.value ? form.value.backgroundColor || '' : '',
        foregroundColor: enableCustomColors.value ? form.value.foregroundColor || '' : '',
        author: existingTestament ? existingTestament.author : currentUser?.username,
        createdAt: existingTestament ? existingTestament.createdAt : new Date().toISOString(),
        updatedAt: isEditMode.value ? new Date().toISOString() : undefined
      }

      try {
        await saveTestament(testament)

        $q.notify({
          type: 'positive',
          message: isEditMode.value ? 'Testament updated successfully!' : 'Testament published successfully!',
          position: 'top'
        })

        router.push(`/testament/${testament.id}`)
      } catch (error) {
        if (error.name === 'QuotaExceededError') {
          $q.notify({
            type: 'negative',
            message: 'Storage quota exceeded. Please remove some images or reduce their size.',
            position: 'top',
            timeout: 5000
          })
        } else {
          $q.notify({
            type: 'negative',
            message: 'Failed to save testament. Please try again.',
            position: 'top'
          })
        }
      }
    }

    onMounted(async () => {
      await loadTestament()
    })

    return {
      form,
      imageFiles,
      enableGoal,
      enableReferences,
      enableImageGallery,
      enableCustomColors,
      handleImageUpload,
      removeImage,
      addReference,
      removeReference,
      onSubmit,
      isEditMode
    }
  }
}
</script>
