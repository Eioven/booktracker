import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { updateMe } from '../../api/auth'
import {
  exportLibraryCSV, exportLibraryPDF,
  exportNotesCSV, exportNotesPDF,
} from '../../api/books'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

const ProfilePage = () => {
  const { user, loginUser } = useAuth()

  return (
    <div className="max-w-2xl flex flex-col gap-6">

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Профиль</h1>
        <p className="text-gray-500 text-sm mt-1">
          Управление аккаунтом и экспорт данных
        </p>
      </div>

      {/* Секция профиля */}
      <ProfileSection user={user} onUpdated={(updatedUser) => {
        const tokens = {
          access:  localStorage.getItem('access_token'),
          refresh: localStorage.getItem('refresh_token'),
        }
        loginUser(updatedUser, tokens)
      }} />

      <ExportSection />

    </div>
  )
}

// ==========================================

const ProfileSection = ({ user, onUpdated }) => {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    username: user?.username || '',
    email:    user?.email    || '',
  })
  const [errors, setErrors]       = useState({})
  const [saving, setSaving]       = useState(false)
  const [serverError, setServerError] = useState('')
  const [successMsg, setSuccessMsg]   = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setServerError('')
    setSuccessMsg('')

    const newErrors = {}
    if (!form.username.trim()) {
      newErrors.username = 'Имя пользователя не может быть пустым'
    }
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Введите корректный email'
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setSaving(true)
    try {
      const response = await updateMe(form)
      onUpdated(response.data)
      setEditing(false)
      setSuccessMsg('Профиль успешно обновлён')
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (error) {
      const data = error.response?.data
      if (data && typeof data === 'object') {
        const fieldErrors = {}
        Object.entries(data).forEach(([key, value]) => {
          fieldErrors[key] = Array.isArray(value) ? value[0] : value
        })
        setErrors(fieldErrors)
      } else {
        setServerError('Не удалось обновить профиль.')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setForm({ username: user?.username || '', email: user?.email || '' })
    setErrors({})
    setServerError('')
    setEditing(false)
  }

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : '??'

  const joinedDate = user?.date_joined
    ? new Date(user.date_joined).toLocaleDateString('ru-RU', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : ''

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-4">
        Данные аккаунта
      </h2>

      {/* Аватар и базовая инфо */}
      <div className="flex items-center gap-4 mb-6">
        {/* Аватар — круг с инициалами */}
        <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center
          justify-center text-white text-xl font-bold flex-shrink-0">
          {initials}
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-lg">
            {user?.username}
          </p>
          <p className="text-sm text-gray-400">
            В системе с {joinedDate}
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200
          rounded-lg text-green-700 text-sm">
          {successMsg}
        </div>
      )}
      {serverError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200
          rounded-lg text-red-600 text-sm">
          {serverError}
        </div>
      )}

      {editing ? (

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <Input
            label="Имя пользователя"
            name="username"
            value={form.username}
            onChange={handleChange}
            error={errors.username}
            required
          />
          <Input
            label="Email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="example@mail.com"
            error={errors.email}
          />
          <div className="flex gap-2">
            <Button type="submit" disabled={saving}>
              {saving ? 'Сохранение...' : 'Сохранить'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
            >
              Отмена
            </Button>
          </div>
        </form>
      ) : (
        <div className="flex flex-col gap-3">
          <InfoRow label="Имя пользователя" value={user?.username} />
          <InfoRow
            label="Email"
            value={user?.email || 'Не указан'}
          />
          <div className="pt-2">
            <Button
              variant="secondary"
              onClick={() => setEditing(true)}
            >
              Редактировать профиль
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

const InfoRow = ({ label, value }) => (
  <div className="flex items-center gap-3 py-2 border-b border-gray-100
    last:border-0">
    <span className="text-sm text-gray-500 w-40 flex-shrink-0">{label}</span>
    <span className="text-sm text-gray-900">{value}</span>
  </div>
)

const ExportSection = () => {
  const [formats, setFormats] = useState({
    library: 'csv',
    notes:   'csv',
  })

  const [loading, setLoading] = useState({
    library: false,
    notes:   false,
  })

  const [error, setError] = useState('')

  const EXPORT_CONFIG = {
    library: {
      label: 'Библиотека',
      desc:  'Список всех книг со статусами, оценками и прогрессом',
      icon:  '📚',
      color: 'border-blue-200 bg-blue-50',
      options: {
        csv: {
          fn:       exportLibraryCSV,
          filename: 'booktracker_library.csv',
        },
        pdf: {
          fn:       exportLibraryPDF,
          filename: 'booktracker_library.pdf',
        },
      },
    },
    notes: {
      label: 'Заметки и цитаты',
      desc:  'Все заметки и цитаты с привязкой к книгам',
      icon:  '📝',
      color: 'border-purple-200 bg-purple-50',
      options: {
        csv: {
          fn:       exportNotesCSV,
          filename: 'booktracker_notes.csv',
        },
        pdf: {
          fn:       exportNotesPDF,
          filename: 'booktracker_notes.pdf',
        },
      },
    },
  }

  const handleExport = async (type) => {
    setError('')
    setLoading(prev => ({ ...prev, [type]: true }))

    const format   = formats[type]
    const config   = EXPORT_CONFIG[type].options[format]

    try {
      const response = await config.fn()

      const url  = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href     = url
      link.download = config.filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

    } catch {
      setError('Не удалось экспортировать данные. Попробуйте ещё раз.')
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }))
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-1">
        Экспорт данных
      </h2>
      <p className="text-sm text-gray-400 mb-4">
        Скачайте свои данные в удобном формате
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200
          rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {Object.entries(EXPORT_CONFIG).map(([type, config]) => (
          <div
            key={type}
            className={`p-4 border rounded-xl ${config.color}`}
          >
            {/* Верхняя строка: иконка + описание */}
            <div className="flex items-start gap-3 mb-3">
              <span className="text-2xl">{config.icon}</span>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {config.label}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {config.desc}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">

              <div className="flex gap-1 bg-white border border-gray-200
                rounded-lg p-0.5">
                {['csv', 'pdf'].map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setFormats(prev =>
                      ({ ...prev, [type]: fmt })
                    )}
                    className={`px-3 py-1 rounded-md text-xs font-medium
                      uppercase tracking-wide transition-colors duration-150
                      ${formats[type] === fmt
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>

              <Button
                variant="secondary"
                disabled={loading[type]}
                onClick={() => handleExport(type)}
                className="flex-shrink-0"
              >
                {loading[type]
                  ? 'Загрузка...'
                  : `Скачать ${formats[type].toUpperCase()}`
                }
              </Button>

            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProfilePage
