import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { login } from '../../api/auth'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'

const LoginPage = () => {
  const navigate = useNavigate()
  const { loginUser } = useAuth()

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })

  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')

  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.username.trim()) {
      newErrors.username = 'Введите имя пользователя'
    }
    if (!formData.password) {
      newErrors.password = 'Введите пароль'
    }
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setServerError('')

    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setLoading(true)

    try {
      const response = await login(formData)
      const { user, tokens } = response.data

      loginUser(user, tokens)

      navigate('/')

    } catch (error) {
      const message = error.response?.data?.error
        || 'Произошла ошибка. Попробуйте ещё раз.'
      setServerError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full max-w-md p-8">

        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Вход в аккаунт
          </h1>
          <p className="text-gray-500 mt-2">
            Добро пожаловать в BookTracker
          </p>
        </div>

        {/* Общая ошибка сервера */}
        {serverError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          <Input
            label="Имя пользователя"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Введите имя пользователя"
            error={errors.username}
            required
          />

          <Input
            label="Пароль"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Введите пароль"
            error={errors.password}
            required
          />

          <Button
            type="submit"
            disabled={loading}
            className="w-full mt-2"
          >
            {loading ? 'Вход...' : 'Войти'}
          </Button>

        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          Нет аккаунта?{' '}
          <Link
            to="/register"
            className="text-blue-600 hover:underline font-medium"
          >
            Зарегистрироваться
          </Link>
        </p>

      </div>
    </div>
  )
}

export default LoginPage
