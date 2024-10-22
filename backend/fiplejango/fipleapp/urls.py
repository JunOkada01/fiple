from django.urls import path
from . import views
from .views import *
from .views import RegisterView
from .views import LoginView

urlpatterns = [
    path('data/', data_view, name='data'),
    path('users/', views.user_list, name='user-list'),
    path('register/', UserCreate.as_view(), name='register-user'),
    path('/register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
]