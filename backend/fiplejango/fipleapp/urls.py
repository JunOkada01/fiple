from django.urls import path
from . import views
from .views import data_view
from .views import adminlogin_view

urlpatterns = [
    path('data/', data_view, name='data'),
    path('adminlogin/', adminlogin_view, name='adminlogin'),
    
]
from .views import *
from .views import RegisterView
from .views import LoginView

urlpatterns = [
    path('data/', data_view, name='data'),
    path('users/', views.user_list, name='user-list'),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
]
