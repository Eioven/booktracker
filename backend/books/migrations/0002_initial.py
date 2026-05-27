

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models

class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('books', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='userbook',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='user_books', to=settings.AUTH_USER_MODEL, verbose_name='Пользователь'),
        ),
        migrations.AddField(
            model_name='readingsession',
            name='user_book',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reading_sessions', to='books.userbook', verbose_name='Книга пользователя'),
        ),
        migrations.AddField(
            model_name='quote',
            name='user_book',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='quotes', to='books.userbook', verbose_name='Книга пользователя'),
        ),
        migrations.AddField(
            model_name='note',
            name='user_book',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='notes', to='books.userbook', verbose_name='Книга пользователя'),
        ),
        migrations.AlterUniqueTogether(
            name='userbook',
            unique_together={('user', 'book')},
        ),
    ]
