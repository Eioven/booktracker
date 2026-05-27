import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { register } from '../../api/auth'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'

const RegisterPage = () => {
  const navigate = useNavigate()
  const { loginUser } = useAuth()

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
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
    } else if (formData.username.length < 3) {
      newErrors.username = 'Минимум 3 символа'
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Введите корректный email'
    }

    if (!formData.password) {
      newErrors.password = 'Введите пароль'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Минимум 8 символов'
    }

    if (!formData.password_confirm) {
      newErrors.password_confirm = 'Подтвердите пароль'
    } else if (formData.password !== formData.password_confirm) {
      newErrors.password_confirm = 'Пароли не совпадают'
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
      const response = await register(formData)
      const { user, tokens } = response.data
      loginUser(user, tokens)
      navigate('/')

    } catch (error) {
      const data = error.response?.data

      if (data && typeof data === 'object') {
        const fieldErrors = {}
        let generalError = ''

        Object.entries(data).forEach(([key, value]) => {
          const message = Array.isArray(value) ? value[0] : value
          if (['username', 'email', 'password', 'password_confirm'].includes(key)) {
            fieldErrors[key] = message
          } else {
            generalError = message
          }
        })

        if (Object.keys(fieldErrors).length > 0) setErrors(fieldErrors)
        if (generalError) setServerError(generalError)
      } else {
        setServerError('Произошла ошибка. Попробуйте ещё раз.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full max-w-md p-8">

        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Регистрация
          </h1>
          <p className="text-gray-500 mt-2">
            Создайте аккаунт чтобы начать отслеживать чтение
          </p>
        </div>

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
            placeholder="Минимум 3 символа"
            error={errors.username}
            required
          />

          <Input
            label="Email (необязательно)"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="example@mail.com"
            error={errors.email}
          />

          <Input
            label="Пароль"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Минимум 8 символов"
            error={errors.password}
            required
          />

          <Input
            label="Подтверждение пароля"
            type="password"
            name="password_confirm"
            value={formData.password_confirm}
            onChange={handleChange}
            placeholder="Повторите пароль"
            error={errors.password_confirm}
            required
          />

          <Button
            type="submit"
            disabled={loading}
            className="w-full mt-2"
          >
            {loading ? 'Регистрация...' : 'Создать аккаунт'}
          </Button>

        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          Уже есть аккаунт?{' '}
          <Link
            to="/login"
            className="text-blue-600 hover:underline font-medium"
          >
            Войти
          </Link>
        </p>

      </div>
    </div>
  )
}

export default RegisterPage
