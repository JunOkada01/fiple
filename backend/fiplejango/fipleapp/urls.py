from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import *
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView
)
from django.views.generic import TemplateView

router = DefaultRouter()
router.register(r'contacts', ContactViewSet)
router.register(r'contact-categories', ContactCategoryViewSet)

app_name = 'fipleapp'

urlpatterns = [
    # 管理者関連
    path('admin_create/', admin_create, name='admin_create'),
    path('admin_login/', admin_login, name='admin_login'),
    path('admin_logout/', admin_logout, name='admin_logout'),
    path('', AdminTop.as_view(), name='admin_top'),

    # ユーザー関連
    path('users/', views.user_list, name='user-list'),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    
    path('api/user/', CurrentUserView.as_view(), name='current-user'),
    path('api/products/', APIProductListView.as_view(), name='api_product-list'),
    path('api/products/<int:pk>/', APIProductDetailView.as_view(), name='api_product-detail'),
    path('api/products/category/<str:category_name>/', ProductByCategoryView.as_view(), name='product-by-category'),

    # カテゴリー関連
    path('categories/', CategoryListView.as_view(), name='category_list'),
    path('categories/add/', CategoryCreateView.as_view(), name='category_add'),
    path('categories/edit/<int:pk>/', CategoryUpdateView.as_view(), name='category_edit'),
    path('categories/delete/<int:pk>/', CategoryDeleteView.as_view(), name='category_delete'),

    # 商品関連
    path('products/', ProductListView.as_view(), name='product_list'),
    path('products/add/', ProductCreateView.as_view(), name='product_add'),
    path('products/edit/<int:pk>/', ProductUpdateView.as_view(), name='product_edit'),
    path('products/delete/<int:pk>/', ProductDeleteView.as_view(), name='product_delete'),

    # APIトークン関連
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),

    # API製品関連
    path('api/products/', APIProductListView.as_view(), name='api_product-list'),
    path('api/products/<int:pk>/', APIProductDetailView.as_view(), name='api_product-detail'),

    # カート関連
    path('api/cart/add/', views.add_to_cart, name='add-to-cart'),
    path('api/cart/', CartListView.as_view(), name='cart-list'),
    path('api/cart/<int:pk>/', CartUpdateView.as_view(), name='cart-update'),
    path('api/cart/<int:pk>/delete/', CartDeleteView.as_view(), name='cart-delete'),

    # FAQ関連
    path('faq-manager/', views.faq_manager, name='faq_manager'),
    path('api/faqs/', views.faq_list, name='faq_list'),

    # Contact関連
    path('api/', include(router.urls)),
    path('contact-manager/', views.contact_manager, name='contact_manager'),
    path('contacts/', views.contact_list, name='contact_list'),
    path('api/submit-contact-form/', views.submit_contact_form, name='submit_contact_form'),

    # パスワードリセット関連
    path('password-reset/', PasswordResetRequestView.as_view(), name='password_reset'),
    path('password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    
    # レビュー関連
    path('api/reviews/', ReviewListCreateView.as_view(), name='review-list'),
    path('api/reviews/write/', ReviewWriteView.as_view(), name='review-list-create'),
]
