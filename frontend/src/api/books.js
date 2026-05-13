import api from './axios'


export const getBooks = (params) =>
  api.get('/books/', { params })

export const getBook = (id) =>
  api.get(`/books/${id}/`)

export const addBook = (data) =>
  api.post('/books/', data)

export const updateBook = (id, data) =>
  api.patch(`/books/${id}/`, data)

export const deleteBook = (id) =>
  api.delete(`/books/${id}/`)

export const searchBooks = (query) =>
  api.get('/books/search/', { params: { q: query } })

export const getNotes = (bookId) =>
  api.get(`/books/${bookId}/notes/`)

export const addNote = (bookId, data) =>
  api.post(`/books/${bookId}/notes/`, data)

export const updateNote = (bookId, noteId, data) =>
  api.patch(`/books/${bookId}/notes/${noteId}/`, data)

export const deleteNote = (bookId, noteId) =>
  api.delete(`/books/${bookId}/notes/${noteId}/`)

export const getQuotes = (bookId) =>
  api.get(`/books/${bookId}/quotes/`)

export const addQuote = (bookId, data) =>
  api.post(`/books/${bookId}/quotes/`, data)

export const deleteQuote = (bookId, quoteId) =>
  api.delete(`/books/${bookId}/quotes/${quoteId}/`)

export const uploadCover = (id, formData) =>
  api.post(`/books/${id}/cover/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

export const updateCoverUrl = (id, coverUrl) =>
  api.post(`/books/${id}/cover/`, { cover_url: coverUrl })

export const exportLibraryCSV = () =>
  api.get('/books/export/library/csv/', { responseType: 'blob' })

export const exportLibraryPDF = () =>
  api.get('/books/export/library/pdf/', { responseType: 'blob' })

export const exportNotesCSV = () =>
  api.get('/books/export/notes/csv/', { responseType: 'blob' })

export const exportNotesPDF = () =>
  api.get('/books/export/notes/pdf/', { responseType: 'blob' })

