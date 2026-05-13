from django.urls import path
from . import views

urlpatterns = [
    path('', views.goals_view, name='goals'),
    path('<int:pk>/', views.goal_detail_view, name='goal-detail'),
]
