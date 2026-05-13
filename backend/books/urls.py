from django.urls import path
from . import views

urlpatterns = [
    path('search/', views.search_books_view, name='books-search'),
    path('', views.user_books_view, name='user-books'),
    path('<int:pk>/', views.user_book_detail_view, name='user-book-detail'),
    path('<int:pk>/cover/', views.upload_cover_view, name='upload-cover'),
    path('<int:book_pk>/notes/', views.notes_view, name='notes'),
    path('<int:book_pk>/notes/<int:pk>/', views.note_detail_view, name='note-detail'),
    path('<int:book_pk>/quotes/', views.quotes_view, name='quotes'),
    path('<int:book_pk>/quotes/<int:pk>/', views.quote_detail_view, name='quote-detail'),

    path('export/library/csv/', views.export_library_csv_view, name='export-library-csv'),
    path('export/library/pdf/', views.export_library_pdf_view, name='export-library-pdf'),
    path('export/notes/csv/',   views.export_notes_csv_view,   name='export-notes-csv'),
    path('export/notes/pdf/',   views.export_notes_pdf_view,   name='export-notes-pdf'),
]
