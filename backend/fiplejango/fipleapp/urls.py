from django.urls import path
from . import views
from .views import *
from django.views.generic import TemplateView

app_name = 'fipleapp'

urlpatterns = [
    path('data/', data_view, name='data'),
    path('users/', views.user_list, name='user-list'),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('admin_create/', admin_create, name='admin_create'),
    path('admin_login/', admin_login, name='admin_login'),
    path('', AdminTop.as_view(), name='admin_top'),
    path('admin_logout/', admin_logout, name='admin_logout'),
    path('categories/', CategoryListView.as_view(), name='category_list'),
    path('categories/add/', CategoryCreateView.as_view(), name='category_add'),
    path('categories/delete/<int:pk>/', CategoryDeleteView.as_view(), name='category_delete'),
    path('subcategories/', SubCategoryListView.as_view(), name='subcategory_list'),
    path('subcategories/add/', SubCategoryCreateView.as_view(), name='subcategory_add'),
    path('subcategories/delete/<int:pk>/', SubCategoryDeleteView.as_view(), name='subcategory_delete'),
]