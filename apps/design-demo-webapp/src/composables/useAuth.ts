import { ref } from 'vue'

const AUTH_KEY = 'nomacom-webapp-auth'
const isAuthenticated = ref(localStorage.getItem(AUTH_KEY) === 'true')

export function useAuth() {
  function login() {
    localStorage.setItem(AUTH_KEY, 'true')
    isAuthenticated.value = true
  }

  function logout() {
    localStorage.removeItem(AUTH_KEY)
    isAuthenticated.value = false
  }

  return { isAuthenticated, login, logout }
}
