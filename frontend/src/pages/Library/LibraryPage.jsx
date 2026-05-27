import { useState, useEffect, useCallback } from 'react'
import { getBooks } from '../../api/books'
import BookCard from '../../components/BookCard'
import AddBookModal from '../../components/AddBookModal'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'

const STATUS_FILTERS = [
  { value: '',             label: 'Все книги'          },
  { value: 'reading',      label: 'Читаю'              },
  { value: 'want_to_read', label: 'Хочу прочитать'     },
  { value: 'finished',     label: 'Прочитал'           },
  { value: 'dropped',      label: 'Не буду дочитывать' },
]

const LibraryPage = () => {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeStatus, setActiveStatus] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const fetchBooks = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = {}
      if (activeStatus) params.status = activeStatus
      if (searchQuery) {
        params.title = searchQuery
      }
      const response = await getBooks(params)
      setBooks(response.data)
    } catch {
      setError('Не удалось загрузить библиотеку.')
    } finally {
      setLoading(false)
    }
  }, [activeStatus, searchQuery])

  useEffect(() => {
    fetchBooks()
  }, [fetchBooks])

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') setSearchQuery(searchInput)
  }

  const handleSearchClear = () => {
    setSearchInput('')
    setSearchQuery('')
  }

  const handleBookAdded = (newBook) => {
    setBooks(prev => [newBook, ...prev])
  }

  return (
    <div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Библиотека</h1>
          <p className="text-gray-500 text-sm mt-1">
            {books.length} {getBookWord(books.length)}
          </p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          + Добавить книгу
        </Button>
      </div>

      {/* Фильтры и поиск */}
      <div className="flex flex-col gap-4 mb-6">

        {/* Вкладки статусов */}
        <div className="flex gap-1 flex-wrap">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setActiveStatus(filter.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium
                transition-colors duration-150
                ${activeStatus === filter.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Строка поиска */}
        <div className="flex gap-2 max-w-md">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Поиск по названию..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300
                rounded-lg outline-none focus:border-blue-500 text-sm"
            />

            <svg className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5"
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" />
            </svg>
          </div>
          <Button onClick={() => setSearchQuery(searchInput)}>
            Найти
          </Button>
          {searchQuery && (
            <Button variant="secondary" onClick={handleSearchClear}>
              Сбросить
            </Button>
          )}
        </div>

      </div>

      {loading ? (
        <div className="py-20">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="py-20 text-center">
          <p className="text-red-500">{error}</p>
          <Button
            variant="secondary"
            onClick={fetchBooks}
            className="mt-4"
          >
            Повторить
          </Button>
        </div>
      ) : books.length === 0 ? (
        <EmptyState
          hasFilters={!!activeStatus || !!searchQuery}
          onAdd={() => setIsAddModalOpen(true)}
          onClear={() => {
            setActiveStatus('')
            setSearchInput('')
            setSearchQuery('')
          }}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {books.map((userBook) => (
            <BookCard key={userBook.id} userBook={userBook} />
          ))}
        </div>
      )}

      {/* Модалка добавления книги */}
      <AddBookModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onBookAdded={handleBookAdded}
      />

    </div>
  )
}

const EmptyState = ({ hasFilters, onAdd, onClear }) => (
  <div className="py-20 flex flex-col items-center gap-4 text-center">
    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
      <svg className="w-8 h-8 text-gray-400" fill="none"
        stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    </div>
    {hasFilters ? (
      <>
        <p className="text-gray-500">Ничего не найдено по вашему запросу</p>
        <Button variant="secondary" onClick={onClear}>
          Сбросить фильтры
        </Button>
      </>
    ) : (
      <>
        <p className="text-gray-500">В вашей библиотеке пока нет книг</p>
        <Button onClick={onAdd}>Добавить первую книгу</Button>
      </>
    )}
  </div>
)

// Склонение слова "книга"
const getBookWord = (count) => {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod100 >= 11 && mod100 <= 14) return 'книг'
  if (mod10 === 1) return 'книга'
  if (mod10 >= 2 && mod10 <= 4) return 'книги'
  return 'книг'
}

export default LibraryPage
