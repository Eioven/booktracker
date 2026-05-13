import django_filters
from .models import UserBook


class UserBookFilter(django_filters.FilterSet):
    author = django_filters.CharFilter(
        field_name='book__authors__name',
        lookup_expr='icontains',
        label='Автор'
    )
    title = django_filters.CharFilter(
        field_name='book__title',
        lookup_expr='icontains',
        label='Название'
    )
    genre = django_filters.CharFilter(
        field_name='book__genres__name',
        lookup_expr='icontains',
        label='Жанр'
    )
    status = django_filters.CharFilter(
        field_name='status',
        lookup_expr='exact',
        label='Статус'
    )

    class Meta:
        model = UserBook
        fields = ['status', 'author', 'title', 'genre']
