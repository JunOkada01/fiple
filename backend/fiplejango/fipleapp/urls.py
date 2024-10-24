from django.urls import path
from . import views
from .views import *
from django.views.generic import TemplateView

app_name = 'accounts'

urlpatterns = [
    path('data/', data_view, name='data'),
    path('users/', views.user_list, name='user-list'),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('admin_create/', admin_create, name='admin_create'),
    path('admin_login/', admin_login, name='admin_login'),
    path('admin_top/', AdminTop.as_view(), name='admin_top'),
]