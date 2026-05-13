import api from './axios'

export const register = (data) =>
  api.post('/auth/register/', data)

export const login = (data) =>
  api.post('/auth/login/', data)

export const logout = (refreshToken) =>
  api.post('/auth/logout/', { refresh: refreshToken })

export const getMe = () =>
  api.get('/auth/me/')

export const updateMe = (data) =>
  api.patch('/auth/me/', data)
