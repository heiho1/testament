import { ref } from 'vue'
import { getCurrentUser } from './auth'

const currentUser = ref(getCurrentUser())

export function useAuth() {
  const updateUser = () => {
    currentUser.value = getCurrentUser()
  }

  return {
    currentUser,
    updateUser
  }
}
