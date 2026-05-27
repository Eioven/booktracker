import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getBooks } from '../api/books'
import { getGoals } from '../api/goals'
import Spinner from '../components/ui/Spinner'
import Button from '../components/ui/Button'

const DashboardPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [readingBooks, setReadingBooks] = useState([])
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [booksRes, goalsRes] = await Promise.all([
          getBooks({ status: 'reading' }),
          getGoals(),
        ])
        setReadingBooks(booksRes.data)
        setGoals(goalsRes.data)
      } catch {
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">

      {/* Приветствие */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Добро пожаловать, {user?.username} 👋
        </h1>
        <p className="text-gray-500 mt-1">
          Вот что происходит с вашим чтением
        </p>
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Сейчас читаю
          </h2>
          <button
            onClick={() => navigate('/library')}
            className="text-sm text-blue-600 hover:underline"
          >
            Вся библиотека →
          </button>
        </div>

        {readingBooks.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8
            text-center">
            <p className="text-gray-500 mb-3">Вы сейчас ничего не читаете</p>
            <Button onClick={() => navigate('/library')}>
              Перейти в библиотеку
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {readingBooks.slice(0, 3).map((userBook) => (
              <ReadingBookCard
                key={userBook.id}
                userBook={userBook}
                onClick={() => navigate(`/library/${userBook.id}`)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Цели */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Цели чтения
          </h2>
          <button
            onClick={() => navigate('/goals')}
            className="text-sm text-blue-600 hover:underline"
          >
            Все цели →
          </button>
        </div>

        {goals.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8
            text-center">
            <p className="text-gray-500 mb-3">У вас пока нет целей чтения</p>
            <Button onClick={() => navigate('/goals')}>
              Поставить цель
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {goals.slice(0, 4).map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        )}
      </section>

    </div>
  )
}

// Карточка читаемой книги
const ReadingBookCard = ({ userBook, onClick }) => {
  const { book, progress_percent, current_page } = userBook
  const authors = book.authors?.map(a => a.name).join(', ') || ''

  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-xl p-4
        hover:shadow-md hover:border-gray-300 transition-all cursor-pointer
        flex gap-4"
    >
      {/* Обложка */}
      <div className="w-12 h-16 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
        {book.cover_url ? (
          <img src={book.cover_url} alt={book.title}
            className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-300" fill="none"
              stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        )}
      </div>

      {/* Данные */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <p className="font-medium text-gray-900 text-sm line-clamp-1">
            {book.title}
          </p>
          <p className="text-xs text-gray-500 truncate">{authors}</p>
        </div>
        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Страница {current_page}</span>
            <span>{progress_percent}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div
              className="bg-blue-500 h-1.5 rounded-full"
              style={{ width: `${progress_percent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// Карточка цели
const GoalCard = ({ goal }) => {
  const periodLabel = goal.period_type === 'year' ? 'Год' : 'Месяц'
  const measureLabel = goal.measure_type === 'books' ? 'книг' : 'страниц'
  const percent = goal.progress_percent

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-medium text-gray-900 text-sm">
            {periodLabel}: {goal.target} {measureLabel}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {goal.current_value} из {goal.target} {measureLabel}
          </p>
        </div>
        <span className={`text-sm font-semibold
          ${percent >= 100 ? 'text-green-600' : 'text-blue-600'}`}>
          {percent}%
        </span>
      </div>

      {/* Прогресс-бар */}
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-500
            ${percent >= 100 ? 'bg-green-500' : 'bg-blue-500'}`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
    </div>
  )
}

export default DashboardPage
