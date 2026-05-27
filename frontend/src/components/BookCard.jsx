import { useNavigate } from 'react-router-dom'

const STATUS_CONFIG = {
  want_to_read: {
    label: 'Хочу прочитать',
    className: 'bg-gray-100 text-gray-600',
  },
  reading: {
    label: 'Читаю',
    className: 'bg-blue-100 text-blue-700',
  },
  finished: {
    label: 'Прочитал',
    className: 'bg-green-100 text-green-700',
  },
  dropped: {
    label: 'Не буду дочитывать',
    className: 'bg-red-100 text-red-600',
  },
}

const StarRating = ({ rating }) => {
  if (!rating) return null
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-3.5 h-3.5 ${star <= rating ? 'text-yellow-400' : 'text-gray-200'}`}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  )
}

const BookCard = ({ userBook }) => {
  const navigate = useNavigate()
  const { book, status, progress_percent, rating } = userBook
  const statusConfig = STATUS_CONFIG[status]

  const authors = book.authors?.map(a => a.name).join(', ') || 'Автор неизвестен'

  return (
    <div
      onClick={() => navigate(`/library/${userBook.id}`)}
      className="book-card bg-white rounded-xl border border-gray-200 overflow-hidden
        hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer
        flex flex-col"
    >

      <div className="aspect-[3/4] bg-gray-100 relative overflow-hidden">
        {book.cover_url ? (
          <img
            src={book.cover_url}
            alt={book.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        )}
      </div>

      {/* Информация о книге */}
      <div className="p-3 flex flex-col gap-2 flex-1">

        {/* Название и автор */}
        <div>
          <h3 className="font-medium text-gray-900 text-sm leading-tight line-clamp-2">
            {book.title}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5 truncate">{authors}</p>
        </div>

        <span className={`text-xs px-2 py-0.5 rounded-full font-medium w-fit ${statusConfig.className}`}>
          {statusConfig.label}
        </span>

        {/* Прогресс — только для читаемых книг */}
        {status === 'reading' && (
          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Прогресс</span>
              <span>{progress_percent}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div
                className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progress_percent}%` }}
              />
            </div>
          </div>
        )}

        {/* Рейтинг — только для прочитанных */}
        {status === 'finished' && <StarRating rating={rating} />}

      </div>
    </div>
  )
}

export default BookCard
