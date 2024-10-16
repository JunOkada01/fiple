from django.urls import path
from . import views
from .views import data_view

urlpatterns = [
    path('data/', data_view, name='data'),
]