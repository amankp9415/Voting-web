import axios from 'axios'

const apiBaseURL = import.meta.env.VITE_API_URL || '/api'
const backendOrigin = apiBaseURL.endsWith('/api')
  ? apiBaseURL.slice(0, -4)
  : apiBaseURL

const api = axios.create({
  baseURL: apiBaseURL,
  withCredentials: true // for cookies (JWT)
});

export const getAssetUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('blob:') || path.startsWith('data:') || /^https?:\/\//i.test(path)) {
    return path
  }
  return `${backendOrigin}${path.startsWith('/') ? path : `/${path}`}`
}

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('role')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
