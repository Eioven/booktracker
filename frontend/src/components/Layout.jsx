import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { logout } from '../api/auth'

const HomeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
)

const BookIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
)

const GoalIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
)

const StatsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
  </svg>
)

const ProfileIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

const LogoutIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
)

const navItems = [
  { to: '/',        label: 'Дашборд',   icon: <HomeIcon />    },
  { to: '/library', label: 'Библиотека', icon: <BookIcon />    },
  { to: '/goals',   label: 'Цели',       icon: <GoalIcon />    },
  { to: '/stats',   label: 'Статистика', icon: <StatsIcon />   },
  { to: '/profile', label: 'Профиль',    icon: <ProfileIcon /> },
]

const Layout = ({ children }) => {
  const { user, logoutUser } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token')
      await logout(refreshToken)
    } catch {
    } finally {
      logoutUser()
      navigate('/login')
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* Боковая навигация */}
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col fixed h-full">

        {/* Логотип */}
        <div className="px-6 py-5 border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-600">BookTracker</h1>
          <p className="text-xs text-gray-400 mt-1">Ваша читальня</p>
        </div>

        {/* Пункты меню */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg
                text-sm font-medium transition-colors duration-150
                ${isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }
              `}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Нижняя часть — пользователь и выход */}
        <div className="px-3 py-4 border-t border-gray-200">

          {/* Имя пользователя */}
          <div className="px-3 py-2 mb-1">
            <p className="text-xs text-gray-400">Вы вошли как</p>
            <p className="text-sm font-medium text-gray-700 truncate">
              {user?.username}
            </p>
          </div>

          {/* Кнопка выхода */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
              text-sm font-medium text-gray-600
              hover:bg-red-50 hover:text-red-600
              transition-colors duration-150"
          >
            <LogoutIcon />
            Выйти
          </button>

        </div>
      </aside>

      {/* Основной контент */}
      {/* ml-60 отступает на ширину боковой панели */}
      <main className="ml-60 flex-1 p-8">
        {children}
      </main>

    </div>
  )
}

export default Layout
