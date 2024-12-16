from django.urls import include, path
from rest_framework.routers import DefaultRouter
from django.urls import path, include
from . import views
from .views import *
from django.views.generic import TemplateView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView
)

router = DefaultRouter()
router.register(r'contacts',ContactViewSet)
router.register(r'contact-categories',ContactCategoryViewSet)
router.register(r'delivery-addresses', DeliveryAddressViewSet, basename='delivery-address')
router.register(r'orders', OrderViewSet, basename='order')

app_name = 'fipleapp'
from .views import PasswordResetRequestView, PasswordResetConfirmView

urlpatterns = [
    path('data/', data_view, name='data'),
    path('users/', views.user_list, name='user-list'),
    path('register/', RegisterView.as_view(), name='register'),
    path('api/user/', CurrentUserView.as_view(), name='current-user'),#ログイン中のユーザ情報
 
    path('api/products/search/', ProductSearchView.as_view(), name='product-search'),#検索
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('admin_create/', admin_create, name='admin_create'),
    path('admin_login/', admin_login, name='admin_login'),
    path('', AdminTop.as_view(), name='admin_top'),
    path('admin_logout/', admin_logout, name='admin_logout'),
    # path('api/products/', ProductListView.as_view(), name='product-list'),
    path('categories/', CategoryListView.as_view(), name='category_list'),
    path('categories/add/', CategoryCreateView.as_view(), name='category_add'),
    path('categories/edit/<int:pk>/', CategoryUpdateView.as_view(), name='category_edit'),
    path('categories/delete/<int:pk>/', CategoryDeleteView.as_view(), name='category_delete'),
    path('subcategories/', SubCategoryListView.as_view(), name='subcategory_list'),
    path('subcategories/add/', SubCategoryCreateView.as_view(), name='subcategory_add'),
    path('subcategories/edit/<int:pk>/', SubCategoryUpdateView.as_view(), name='subcategory_edit'),
    path('subcategories/delete/<int:pk>/', SubCategoryDeleteView.as_view(), name='subcategory_delete'),
    path('colors/', ColorListView.as_view(), name='color_list'),
    path('colors/add/', ColorCreateView.as_view(), name='color_add'),
    path('colors/edit/<int:pk>/', ColorUpdateView.as_view(), name='color_edit'),
    path('colors/delete/<int:pk>/', ColorDeleteView.as_view(), name='color_delete'),
    path('sizes/', SizeListView.as_view(), name='size_list'),
    path('sizes/add/', SizeCreateView.as_view(), name='size_add'),
    path('sizes/edit/<int:pk>/', SizeUpdateView.as_view(), name='size_edit'),
    path('sizes/delete/<int:pk>/', SizeDeleteView.as_view(), name='size_delete'),
    path('product-origins/', ProductOriginListView.as_view(), name='product_origin_list'),
    path('product-origins/add/', ProductOriginCreateView.as_view(), name='product_origin_add'),
    path('get-subcategories/', get_subcategories, name='get_subcategories'),
    path('product-origins/edit/<int:pk>/', ProductOriginUpdateView.as_view(), name='product_origin_edit'),
    path('product-origins/delete/<int:pk>/', ProductOriginDeleteView.as_view(), name='product_origin_delete'),
    path('products/', ProductListView.as_view(), name='product_list'),
    path('products/add/', ProductCreateView.as_view(), name='product_add'),
    path('products/edit/<int:pk>/', ProductUpdateView.as_view(), name='product_edit'),
    path('products/delete/<int:pk>/', ProductDeleteView.as_view(), name='product_delete'),
    path('tags/', TagListView.as_view(), name='tag_list'),
    path('tags/add/', TagCreateView.as_view(), name='tag_add'),
    path('tags/edit/<int:pk>/', TagUpdateView.as_view(), name='tag_edit'),
    path('tags/delete/<int:pk>/', TagDeleteView.as_view(), name='tag_delete'),
    path('product-tags/', ProductTagListView.as_view(), name='product_tag_list'),
    path('product-tags/add/', ProductTagCreateView.as_view(), name='product_tag_add'),
    path('product-tags/edit/<int:pk>/', ProductTagUpdateView.as_view(), name='product_tag_edit'),
    path('product-tags/delete/<int:pk>/', ProductTagDeleteView.as_view(), name='product_tag_delete'),
    path('product-images/', ProductImageListView.as_view(), name='product_image_list'),
    path('product-images/add/', ProductImageCreateView.as_view(), name='product_image_add'),
    path('product-images/edit/<int:pk>/', ProductImageUpdateView.as_view(), name='product_image_edit'),
    path('product-images/delete/<int:pk>/', ProductImageDeleteView.as_view(), name='product_image_delete'),
    path('password-change/', PasswordChangeView.as_view(), name='password_change'),
    path('password-reset/', PasswordResetRequestView.as_view(), name='password_reset'),
    path('password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('api/products/', APIProductListView.as_view(), name='api_product-list'),
    path('api/products/<int:pk>/', APIProductDetailView.as_view(), name='api_product-detail'),
    path('api/products/category/<str:category_name>/', ProductByCategoryView.as_view(), name='product-by-category'),
    path('api/products/review/<int:pk>/', APIProductReviewView.as_view(), name='api_product-detail'),
    #カート
    path('api/cart/add/', views.add_to_cart, name='add-to-cart'),
    path('api/cart/', CartListView.as_view(), name='cart-list'),
    path('api/cart/<int:pk>/', CartUpdateView.as_view(), name='cart-update'),
    path('api/cart/<int:pk>/delete/', CartDeleteView.as_view(), name='cart-delete'),
    #お気に入り
    path('api/favorites/add/', views.add_to_favorite, name='add-to-favorite'),
    path('api/favorites/', FavoriteListView.as_view(), name='favorite-list'),
    path('api/favorites/delete/<int:pk>/', FavoriteDeleteView.as_view(), name='favorite-delete'),
    
    path('api/user/', CurrentUserView.as_view(), name='current-user'),#ログイン中のユーザ情報

    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'), 
    path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    
    #FAQ関連
    path('faq-manager/', views.faq_manager, name='faq_manager'),
    path('api/faqs/', views.faq_list, name='faq_list'),
    path('create-question-category/', views.create_question_category, name='create_question_category'),
    path('create-faq/', views.create_faq, name='create_faq'),
    path('delete-question-category/<int:category_id>/', views.delete_question_category, name='delete_question_category'),
    path('delete-faq/<int:faq_id>/', views.delete_faq, name='delete_faq'),
    path('question-category-list/', views.question_category_list, name='question_category_list'),
    path('faq-list/', views.faq_list_view, name='faq_list_view'),
    path('edit-question-category/<int:category_id>/', views.edit_question_category, name='edit_question_category'),
    path('edit-faq/<int:faq_id>/', views.edit_faq, name='edit_faq'),
    
    #Contact関連
    path('api/', include(router.urls)),
    path('contact-manager/', views.contact_manager, name='contact_manager'),
    path('contacts/', views.contact_list, name='contact_list'),
    path('contacts/<int:contact_id>/', views.contact_detail, name='contact_detail'),
    path('add-contact-category/', views.add_contact_category, name='add_contact_category'),
    path('api/submit-contact-form/', views.submit_contact_form, name='submit_contact_form'),
    
    path('api/user/', UserView.as_view({'get': 'list'}), name='user_view'),
    
    # 配達先関連
    path('api/', include(router.urls)),
    
    # 注文関連
    path('api/complete-payment/', CompletePaymentView.as_view(), name='complete_payment'),
    path('api/', include(router.urls)),
    
    # レビュー関連
    path('api/reviews/', ReviewListCreateView.as_view(), name='review-list'),
    path('api/reviews/write/', ReviewWriteView.as_view(), name='review-list-create'),
    path('reviews/', list_reviewed_products, name='list_reviewed_products'),
    path('reviews/<int:product_id>/', delete_review, name='delete_review'),
    # 商品おすすめ
    path('api/products/<int:product_id>/similar-fit/', check_similar_fit_users, name='similar-fit-users'),
]
