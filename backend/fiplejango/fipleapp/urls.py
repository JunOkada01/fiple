from django.urls import path
from . import views
from .views import *

urlpatterns = [
    path('data/', data_view, name='data'),
    path('users/', views.user_list, name='user-list'),
    path('register/', UserCreate.as_view(), name='register-user'),
]