from django.urls import path
from . import views
from .views import data_view
from .views import adminlogin_view

urlpatterns = [
    path('data/', data_view, name='data'),
    path('adminlogin/', adminlogin_view, name='adminlogin'),
    
]
