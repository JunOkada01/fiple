# Python Standard Library
from datetime import datetime, timedelta, timezone
from django.db.models import *
import json
import jwt
import uuid
# Djangoのインポート
from django.conf import settings
from django.contrib import messages
from django.contrib.auth import (
    authenticate, get_user_model,
    login,
    logout,
)
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.core.mail import EmailMessage, send_mail
from django.db import transaction
from django.db.models import Avg, Count, Prefetch, Q
from django.http import HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404, render, redirect
from django.urls import reverse_lazy
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
import requests
from django.views.generic import (
    TemplateView,
    ListView,
    CreateView,
    UpdateView,
    DeleteView,
)

# DRFインポート
import requests
from rest_framework import generics, status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.exceptions import NotFound
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import *
from .serializers import *
from rest_framework import status, viewsets, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.exceptions import NotFound
from rest_framework.pagination import PageNumberPagination
import time
from django.db.models import OuterRef, Subquery
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import (
    TemplateView, ListView, CreateView, 
    UpdateView, DeleteView, DetailView
)

from rest_framework import (
    generics, status, viewsets, permissions
)
from rest_framework.decorators import (
    api_view, action, permission_classes
)
from rest_framework.exceptions import NotFound
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import (
    AllowAny, IsAuthenticated
)
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken

from .models import *
from .serializers import *
from .forms import *

# ユーザーモデルの取得
User = get_user_model()

from rest_framework_simplejwt.authentication import JWTAuthentication

def data_view(request):
    return JsonResponse({"message": "Hello from Django!!!!"})

# class CustomPageNumberPagination(PageNumberPagination):
#     page_size = 10  # 1ページに10件
#     page_size_query_param = 'page_size'  # クライアントがページサイズを変更できるようにする
#     max_page_size = 100  # ページサイズの最大値

# フロントエンド商品関連------------------------------------------------------------------------------------------------

class APIProductListView(APIView):
    def get(self, request):
        # サブクエリで同じ product_origin 内で最小のサイズIDと最小のカラーIDを取得
        subquery = Product.objects.filter(
            product_origin=OuterRef('product_origin')
        ).order_by('size_id', 'color_id').values('id')[:1]

        products = Product.objects.select_related(
            'product_origin', 'product_origin__category', 'color', 'size'
        ).prefetch_related(
            'productimage_set'
        ).filter(
            id__in=Subquery(subquery)
        )

        serializer = ProductListSerializer(products, many=True)
        return Response(serializer.data)
# class APIProductListView(APIView):
#     def get(self, request):
#         gender = request.query_params.get('gender')  # クエリパラメータを取得
#         products = Product.objects.select_related(
#             'product_origin', 'product_origin__category', 
#             'color', 'size'
#         ).prefetch_related('productimage_set').all()

#         # genderでフィルタリング
#         if gender:
#             products = products.filter(product_origin__gender=gender)

#         serializer = ProductListSerializer(products, many=True)
#         print(products.query)
#         return Response(serializer.data)
    
class APIProductDetailView(generics.RetrieveAPIView):
    serializer_class = ProductDetailSerializer
    queryset = ProductOrigin.objects.all()

    def get(self, request, *args, **kwargs):
        try:
            product = self.get_object()
            serializer = self.get_serializer(product)
            return Response(serializer.data)
        except ProductOrigin.DoesNotExist:
            return Response(
                {"error": "商品が見つかりません"}, 
                status=status.HTTP_404_NOT_FOUND
            )

class ProductByCategoryView(APIView):
    def get(self, request, category_name):
        try:
            # カテゴリ名でフィルタリング
            category = Category.objects.get(category_name=category_name)
            products = Product.objects.filter(product_origin__category=category)

            # 商品が見つからない場合の処理
            if not products.exists():
                return Response(
                    {"message": "このカテゴリには商品がありません"},
                    status=status.HTTP_204_NO_CONTENT
                )

            # シリアライザーを使用してデータを変換
            serializer = ProductListSerializer(products, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Category.DoesNotExist:
            return Response(
                {"error": "カテゴリが見つかりません"},
                status=status.HTTP_404_NOT_FOUND
            )
            
class APICategoryListView(APIView):
    def get(self, request):
        categories = Category.objects.prefetch_related('subcategories').all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)

class APIProductReviewView(generics.RetrieveAPIView):
    serializer_class = ProductListSerializer
    queryset = Product.objects.all()

    def get(self, request, *args, **kwargs):
        try:
            product = self.get_object()
            serializer = self.get_serializer(product)
            return Response(serializer.data)
        except Product.DoesNotExist:
            return Response(
                {"error": "商品が見つかりません"}, 
                status=status.HTTP_404_NOT_FOUND
            )
            
# フロントエンドカート関連--------------------------------------------------------------------------------------------------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_cart(request):
    serializer = AddToCartSerializer(data=request.data)
    
    if serializer.is_valid():
        product = serializer.validated_data['product']
        quantity = serializer.validated_data['quantity']
        
        with transaction.atomic():
            # 同じ商品がカートに既に存在するかチェック
            cart_item = Cart.objects.filter(
                user=request.user,
                product=product
            ).first()
            
            if cart_item:
                # 既存のカートアイテムの数量を更新
                new_quantity = cart_item.quantity + quantity
                if new_quantity > product.stock:
                    return Response(
                        {"error": "在庫が不足しています"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                cart_item.quantity = new_quantity
                cart_item.product_status = product.status
                cart_item.save()
            else:
                # 新しいカートアイテムを作成
                cart_item = Cart.objects.create(
                    user=request.user,
                    product=product,
                    quantity=quantity,
                    product_status=product.status
                )
            
            response_serializer = CartItemSerializer(cart_item)
            return Response(
                {
                    "message": "商品をカートに追加しました",
                    "cart_item": response_serializer.data
                },
                status=status.HTTP_201_CREATED
            )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CartListView(generics.ListAPIView):
    serializer_class = CartListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        username = self.request.user.username  
        email = self.request.user.email  
        return Cart.objects.filter(
            user=self.request.user,
        ).order_by('-created_at').select_related(
            'product',
            'product__product_origin',
            'product__product_origin__category',
            'product__product_origin__subcategory',
            'product__color',
            'product__size'
        )

class CartUpdateView(generics.UpdateAPIView):
    serializer_class = CartListSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Cart.objects.filter(user=self.request.user)
    
    def patch(self, request, *args, **kwargs):
        cart_item = self.get_object()
        quantity = request.data.get('quantity', 1)
        
        if quantity <= 0:
            return Response(
                {"error": "数量は1以上である必要があります"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        if quantity > cart_item.product.stock:
            return Response(
                {"error": "在庫が足りません"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        cart_item.quantity = quantity
        cart_item.save()
        
        serializer = self.get_serializer(cart_item)
        return Response(serializer.data)

class CartDeleteView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Cart.objects.filter(user=self.request.user)
    
# フロントエンドお気に入り機能関連----------------------------------------------------------------------------------------------
@api_view(['POST'])
def add_to_favorite(request):
    # ユーザーが認証されているか確認
    if not request.user.is_authenticated:
        return Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)
    
    # 商品IDをリクエストデータから取得
    product_id = request.data.get('product_id')
    if not product_id:
        return Response({"detail": "Product ID is required."}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # 商品を取得
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return Response({"detail": "Product not found."}, status=status.HTTP_404_NOT_FOUND)
    
    # すでにお気に入りに追加されている場合はエラー
    if Favorite.objects.filter(user=request.user, product=product).exists():
        return Response({"detail": "Product is already in your favorites."}, status=status.HTTP_400_BAD_REQUEST)

    # 新しいお気に入りを作成
    favorite = Favorite.objects.create(user=request.user, product=product)

    # 成功したらシリアライズして返す
    serializer = FavoriteSerializer(favorite)
    return Response(serializer.data, status=status.HTTP_201_CREATED)

class FavoriteListView(generics.ListAPIView):
    queryset = Favorite.objects.all()
    serializer_class = FavoriteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # 現在認証されているユーザーのお気に入りを取得
        return Favorite.objects.filter(user=self.request.user)
    
class FavoriteDeleteView(generics.DestroyAPIView):
    queryset = Favorite.objects.all()
    permission_classes = [IsAuthenticated]

    def get_object(self):
        # ユーザーが削除するお気に入りを取得
        favorite = Favorite.objects.filter(id=self.kwargs['pk'], user=self.request.user).first()
        if not favorite:
            raise NotFound(detail="お気に入りが見つかりません")
        return favorite

    def delete(self, request, *args, **kwargs):
        # 削除する
        favorite = self.get_object()
        favorite.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# フロントエンドユーザ情報取得--------------------------------------------------------------------------------
class UserView(viewsets.ViewSet):  
    permission_classes = [IsAuthenticated]  

    def list(self, request):  
        user = request.user  
        return Response({  
            'username': user.username,  
            'email': user.email  
        })

class DeliveryAddressViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = DeliveryAddressSerializer
    
    def get_queryset(self):
        return DeliveryAddress.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        
    def perform_update(self, serializer):
        serializer.save(user=self.request.user)
    
    def list(self, request):
        # まずユーザーの主住所を取得
        main_address = {
            'id': 'main',
            'postal_code': request.user.postal_code,
            'prefecture': '',
            'city': '',
            'street': request.user.address,
            'is_main': True
        }
        
        # 配送先住所を取得
        delivery_addresses = self.get_queryset()
        serializer = self.get_serializer(delivery_addresses, many=True)
        
        # 結合して返す
        return Response([main_address] + serializer.data)

    @action(detail=False, methods=['POST'])
    def lookup_address(self, request):
        postal_code = request.data.get('postal_code', '')
        # ハイフンを削除
        postal_code = postal_code.replace('-', '')
        
        try:
            # Zipcloud APIを呼び出し
            response = requests.get(f'https://zipcloud.ibsnet.co.jp/api/search?zipcode={postal_code}')
            data = response.json()
            
            if data['status'] == 200 and data['results']:
                result = data['results'][0]
                return Response({
                    'prefecture': result['address1'],
                    'city': result['address2'],
                    'street': result['address3']
                })
            return Response({'error': '住所が見つかりませんでした'}, status=status.HTTP_404_NOT_FOUND)
        except:
            return Response({'error': '住所検索に失敗しました'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# 注文関連---------------------------------------------------------------------------------------------------------------
class CompletePaymentView(APIView):
    def post(self, request):
        try:
            with transaction.atomic():
                
                # カート内の商品を取得
                cart_items = Cart.objects.filter(user=request.user)
                
                if not cart_items:
                    return Response({"error": "カートが空です"}, status=status.HTTP_400_BAD_REQUEST)
                
                # 注文情報を作成
                order = Order.objects.create(
                    user=request.user,
                    total_amount=request.data.get('total_amount'),
                    tax_amount=request.data.get('tax_amount'),
                    payment_method=request.data.get('payment_method'),
                    delivery_address=request.data.get('delivery_address'),
                )
                
                # 注文アイテムを作成
                order_items = []
                for cart_item in cart_items:
                    order_item = OrderItem(
                        order=order,
                        product=cart_item.product,
                        quantity=cart_item.quantity,
                        unit_price=cart_item.product.price
                    )
                    order_items.append(order_item)
                
                OrderItem.objects.bulk_create(order_items)
                
                # カートをクリア
                cart_items.delete()
                
                return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)        
        
class OrderViewSet(viewsets.ReadOnlyModelViewSet):
    """
    注文履歴を取得するためのViewSet
    """
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]


    def get_queryset(self):
        # ログインユーザーの注文のみ取得
        return Order.objects.filter(user=self.request.user).order_by('-order_date')
    
class ProductByCategoryView(APIView):
    def get(self, request, category_name):
        try:
            # カテゴリ名でフィルタリング
            category = Category.objects.get(category_name=category_name)
            # サブクエリで同じ product_origin 内で最小の size_id を持つ商品のみを取得
            subquery = Product.objects.filter(
                product_origin=OuterRef('product_origin')
            ).order_by('size_id').values('id')[:1]

            products = Product.objects.filter(
                product_origin__category=category,
                id__in=Subquery(subquery)  # サブクエリで絞り込む
            ).select_related(
                'product_origin', 'product_origin__category', 'color', 'size'
            ).prefetch_related('productimage_set')
            
            # 商品が見つからない場合の処理
            if not products.exists():
                return Response(
                    {"message": "このカテゴリには商品がありません"},
                    status=status.HTTP_204_NO_CONTENT
                )

            # シリアライザーを使用してデータを変換
            serializer = ProductListSerializer(products, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Category.DoesNotExist:
            return Response(
                {"error": "カテゴリが見つかりません"},
                status=status.HTTP_404_NOT_FOUND
            )

class APICategoryListView(APIView):
    def get(self, request):
        categories = Category.objects.prefetch_related('subcategories').all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)

# アカウント関連-----------------------------------------------------------------------------------------

def user_list(request):
    users = CustomUser.objects.all().values('id', 'username', 'email')  # 必要なフィールドだけを取得
    return JsonResponse(list(users), safe=False)

class UserListView(LoginRequiredMixin, ListView):
    """
    ユーザー一覧ビュー
    管理者のみアクセス可能
    """
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    template_name = 'user_list.html'
    context_object_name = 'users'
    paginate_by = 20
    model = CustomUser

    def get_queryset(self):
        """
        検索機能の実装
        """
        queryset = super().get_queryset()
        search_query = self.request.GET.get('search', '')
        
        if search_query:
            queryset = queryset.filter(
                Q(username__icontains=search_query) | 
                Q(email__icontains=search_query) | 
                Q(hurigana__icontains=search_query)
            )
        
        return queryset

    def get_context_data(self, **kwargs):
        """
        検索クエリをコンテキストに追加
        """
        context = super().get_context_data(**kwargs)
        context['search_query'] = self.request.GET.get('search', '')
        return context

class UserDetailView(LoginRequiredMixin, DetailView):
    """
    ユーザー詳細ビュー
    管理者のみアクセス可能
    """
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = CustomUser
    template_name = 'user_detail.html'
    context_object_name = 'user'
    pk_url_kwarg = 'user_id'
    paginate_by = 10

    def get_context_data(self, **kwargs):
        """
        ユーザーの注文履歴を追加
        """
        context = super().get_context_data(**kwargs)
        orders = Order.objects.filter(user=self.object).order_by('-order_date')
        
        # ページネーションの追加
        paginator = Paginator(orders, 10)  # 1ページあたり10件
        page_number = self.request.GET.get('page')
        page_obj = paginator.get_page(page_number)

        context['orders'] = page_obj
        context['order_items'] = OrderItem.objects.filter(order__in=page_obj).select_related('product')
        context['page_obj'] = page_obj  # ページオブジェクトをコンテキストに追加
        
        return context
    

class RegisterView(APIView):
    def post(self, request):
        # まず、メールアドレスの重複をチェック
        email = request.data.get('email')
        if email and CustomUser.objects.filter(email=email).exists():
            return Response(
                {"error": "このメールアドレスは既に登録されています。"},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class LoginView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = UserSerializer

    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        password = request.data.get('password')
        user = authenticate(email=email, password=password)
        if user is not None:
            print("- - - - - ユーザー情報 - - - - -")
            print(vars(user))

            # JWTトークンを生成
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            # ユーザー情報をシリアライズ
            serializer = UserSerializer(user)
            # レスポンスにトークンとユーザー情報を含めて返す
            return Response({
                "message": "Login successful",
                "user": serializer.data,
                "access": access_token,
                "refresh": str(refresh)
            })
        return Response({"error": "Invalid credentials"}, status=400)

class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]  # 認証されたユーザーのみアクセス可能
    authentication_classes = [JWTAuthentication]  # JWT認証を使用
    serializer_class = UserSerializer

    def get(self, request, *args, **kwargs):
        # 認証されたユーザーを取得
        user = request.user
        print(user)
        # シリアライザを使用してユーザー情報をシリアライズ
        serializer = UserSerializer(user)
        # シリアライズしたデータを返す
        return Response(serializer.data)

class LogoutView(APIView):
    def post(self, request):
        logout(request)  # ユーザーをログアウトさせる
        return Response({"message": "Logout successful!"}, status=status.HTTP_200_OK)


def admin_create(request):
    if request.method == 'POST':
        form = AdminCreationForm(request.POST)
        if form.is_valid():
            admin = form.save(commit=False)
            admin.set_password(form.cleaned_data['password'])
            admin.save()
            messages.success(request, '管理者アカウントが作成されました')
            return redirect('fipleapp:admin_login')
    else:
        form = AdminCreationForm()
    return render(request, 'admin2/admin_create.html', {'form': form, 'current_path': request.path})

def admin_login(request):
    if request.method == 'POST':
        form = AdminLoginForm(request.POST)
        if form.is_valid():
            name = form.cleaned_data['name']
            password = form.cleaned_data['password']
            try:
                admin = AdminUser.objects.get(name=name)
                if admin.check_password(password):
                    # ログイン成功
                    backend = 'fipleapp.backends.AdminBackend'
                    login(request, admin, backend=backend)
                    admin.save()  # login_dateを更新
                    messages.success(request, 'ログインしました')
                    return redirect('fipleapp:admin_top')  # ダッシュボードページへリダイレクト
                else:
                    messages.error(request, 'パスワードが間違っています')
            except AdminUser.DoesNotExist:
                messages.error(request, '管理者が見つかりません')
    else:
        form = AdminLoginForm()
    return render(request, 'admin2/admin_login.html', {'form': form, 'current_path': request.path})


class AdminTop(LoginRequiredMixin, TemplateView):
    template_name = 'admin_top.html'
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        if self.request.user.is_authenticated:
            context['user'] = self.request.user.name
            print(self.request.user.name)
        else:
            print('ユーザーが見つかりません')
        return context

def admin_logout(request):
    if request.method == 'GET':
        logout(request)
        messages.success(request, 'ログアウトしました')
        return redirect('fipleapp:admin_login')
    
class BaseSettingView(LoginRequiredMixin, TemplateView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    template_name = 'base_settings/top.html'

class BaseSettingView(LoginRequiredMixin, TemplateView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    template_name = 'base_settings/top.html'

# カテゴリ関連-----------------------------------------------------------------------------------------
class CategoryTopView(LoginRequiredMixin, TemplateView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    template_name = 'base_settings/category/top.html'

class CategoryListView(LoginRequiredMixin, ListView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = Category
    template_name = 'base_settings/category/category_list.html'
    context_object_name = 'categories'
    paginate_by = 20

class CategoryCreateView(LoginRequiredMixin, CreateView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = Category
    form_class = CategoryForm
    template_name = 'base_settings/category/category_form.html'
    success_url = reverse_lazy('fipleapp:category_list')

    def form_valid(self, form):
        form.instance.admin_user = self.request.user  # ログイン中の管理者を設定
        return super().form_valid(form)
    
class CategoryUpdateView(LoginRequiredMixin, UpdateView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = Category
    form_class = CategoryForm
    template_name = 'base_settings/category/category_form.html'
    success_url = reverse_lazy('fipleapp:category_list')
    
    def get_queryset(self):
        return Category.objects.filter(admin_user=self.request.user)  # ログイン中の管理者が作成した商品元のみ

class CategoryDeleteView(LoginRequiredMixin, DeleteView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = Category
    template_name = 'base_settings/category/category_confirm_delete.html'
    success_url = reverse_lazy('fipleapp:category_list')

    def get_queryset(self):
        return Category.objects.filter(admin_user=self.request.user)  # ログイン中の管理者が作成したカテゴリのみ
    
# サブカテゴリ関連-----------------------------------------------------------------------------------------

class SubCategoryListView(LoginRequiredMixin, ListView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = SubCategory
    template_name = 'base_settings/category/subcategory_list.html'
    context_object_name = 'subcategories'
    paginate_by = 20
    
class SubCategoryCreateView(LoginRequiredMixin, CreateView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = SubCategory
    form_class = SubCategoryForm
    template_name = 'base_settings/category/subcategory_form.html'
    success_url = reverse_lazy('fipleapp:subcategory_list')

    def form_valid(self, form):
        form.instance.admin_user = self.request.user  # ログイン中の管理者を設定
        return super().form_valid(form)
    
class SubCategoryUpdateView(LoginRequiredMixin, UpdateView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = SubCategory
    form_class = SubCategoryForm
    template_name = 'base_settings/category/subcategory_form.html'
    success_url = reverse_lazy('fipleapp:subcategory_list')
    
    def get_queryset(self):
        return SubCategory.objects.filter(admin_user=self.request.user)  # ログイン中の管理者が作成した商品元のみ
    
class SubCategoryDeleteView(LoginRequiredMixin, DeleteView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = SubCategory
    template_name = 'base_settings/category/subcategory_confirm_delete.html'
    success_url = reverse_lazy('fipleapp:subcategory_list')

    def get_queryset(self):
        return SubCategory.objects.filter(admin_user=self.request.user)  # ログイン中の管理者が作成したカテゴリのみ
    
# 色関連-----------------------------------------------------------------------------------------

class ColorListView(LoginRequiredMixin, ListView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = Color
    template_name = 'base_settings/color/color_list.html'
    context_object_name = 'colors'
    paginate_by = 20
    
class ColorCreateView(LoginRequiredMixin, CreateView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = Color
    form_class = ColorForm
    template_name = 'base_settings/color/color_form.html'
    success_url = reverse_lazy('fipleapp:color_list')

    def form_valid(self, form):
        form.instance.admin_user = self.request.user  # ログイン中の管理者を設定
        return super().form_valid(form)
    
class ColorUpdateView(LoginRequiredMixin, UpdateView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = Color
    form_class = ColorForm
    template_name = 'base_settings/color/color_form.html'
    success_url = reverse_lazy('fipleapp:color_list')
    
    def get_queryset(self):
        return Color.objects.filter(admin_user=self.request.user)  # ログイン中の管理者が作成した商品元のみ
    
class ColorDeleteView(LoginRequiredMixin, DeleteView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = Color
    template_name = 'base_settings/color/color_confirm_delete.html'
    success_url = reverse_lazy('fipleapp:color_list')

    def get_queryset(self):
        return Color.objects.filter(admin_user=self.request.user)  # ログイン中の管理者が作成したカテゴリのみ
    
# サイズ関連-----------------------------------------------------------------------------------------

class SizeListView(LoginRequiredMixin, ListView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = Size
    template_name = 'base_settings/size/size_list.html'
    context_object_name = 'sizes'
    paginate_by = 20
    
class SizeCreateView(LoginRequiredMixin, CreateView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = Size
    form_class = SizeForm
    template_name = 'base_settings/size/size_form.html'
    success_url = reverse_lazy('fipleapp:size_list')

    def form_valid(self, form):
        form.instance.admin_user = self.request.user  # ログイン中の管理者を設定
        return super().form_valid(form)
    
class SizeUpdateView(LoginRequiredMixin, UpdateView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = Size
    form_class = SizeForm
    template_name = 'base_settings/size/size_form.html'
    success_url = reverse_lazy('fipleapp:size_list')
    
    def get_queryset(self):
        return Size.objects.filter(admin_user=self.request.user)  # ログイン中の管理者が作成した商品元のみ
    
class SizeDeleteView(LoginRequiredMixin, DeleteView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = Size
    template_name = 'base_settings/size/size_confirm_delete.html'
    success_url = reverse_lazy('fipleapp:size_list')

    def get_queryset(self):
        return Size.objects.filter(admin_user=self.request.user)  # ログイン中の管理者が作成したカテゴリのみ
    
# タグ関連------------------------------------------------------------------------------------------------------

class TagListView(LoginRequiredMixin, ListView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = Tag
    template_name = 'base_settings/tag/tag_list.html'
    context_object_name = 'tags'
    paginate_by = 20
    
class TagCreateView(LoginRequiredMixin, CreateView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = Tag
    form_class = TagForm
    template_name = 'base_settings/tag/tag_form.html'
    success_url = reverse_lazy('fipleapp:tag_list')

    def form_valid(self, form):
        form.instance.admin_user = self.request.user  # ログイン中の管理者を設定
        return super().form_valid(form)

class TagUpdateView(LoginRequiredMixin, UpdateView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = Tag
    form_class = TagForm
    template_name = 'base_settings/tag/tag_form.html'
    success_url = reverse_lazy('fipleapp:tag_list')
    
    def get_queryset(self):
        return Tag.objects.filter(admin_user=self.request.user)  # ログイン中の管理者が作成した商品元のみ
    
class TagDeleteView(LoginRequiredMixin, DeleteView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = Tag
    template_name = 'base_settings/tag/tag_confirm_delete.html'
    success_url = reverse_lazy('fipleapp:tag_list')

    def get_queryset(self):
        return Tag.objects.filter(admin_user=self.request.user)  # ログイン中の管理者が作成した商品元のみ
    
# 商品管理----------------------------------------------------------------------------------------

class ProductManagementView(LoginRequiredMixin, TemplateView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    template_name = 'product_management/top.html'

# 商品元関連----------------------------------------------------------------------------------------
class ProductManagementView(LoginRequiredMixin, TemplateView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    template_name = 'product_management/top.html'


class ProductOriginListView(LoginRequiredMixin, ListView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = ProductOrigin
    template_name = 'product_management/product_origin_list.html'
    context_object_name = 'products_origin'
    paginate_by = 10
    
class ProductOriginCreateView(LoginRequiredMixin, CreateView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = ProductOrigin
    form_class = ProductOriginForm
    template_name = 'product_management/product_origin_form.html'
    success_url = reverse_lazy('fipleapp:product_origin_list')

    def form_valid(self, form):
        form.instance.admin_user = self.request.user  # ログイン中の管理者を設定
        return super().form_valid(form)

class ProductOriginUpdateView(LoginRequiredMixin, UpdateView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = ProductOrigin
    form_class = ProductOriginForm
    template_name = 'product_management/product_origin_form.html'
    success_url = reverse_lazy('fipleapp:product_origin_list')
    
    def get_queryset(self):
        return ProductOrigin.objects.filter(admin_user=self.request.user)  # ログイン中の管理者が作成した商品元のみ
    
class ProductOriginDeleteView(LoginRequiredMixin, DeleteView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = ProductOrigin
    template_name = 'product_management/product_origin_confirm_delete.html'
    success_url = reverse_lazy('fipleapp:product_origin_list')

    def get_queryset(self):
        return ProductOrigin.objects.filter(admin_user=self.request.user)  # ログイン中の管理者が作成した商品元のみ
    
def get_subcategories(request):
    category_id = request.GET.get('category_id')
    subcategories = SubCategory.objects.filter(category_id=category_id).values('id', 'subcategory_name')
    return JsonResponse(list(subcategories), safe=False)
    
# 商品関連----------------------------------------------------------------------------------------------------------

class ProductListView(LoginRequiredMixin, ListView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = Product
    template_name = 'product_management/product_list.html'
    context_object_name = 'products'
    paginate_by = 10
    
class ProductCreateView(LoginRequiredMixin, CreateView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = Product
    form_class = ProductForm
    template_name = 'product_management/product_form.html'
    success_url = reverse_lazy('fipleapp:product_list')
    
    def form_valid(self, form):
        with transaction.atomic():  # トランザクションを開始
            # 商品を保存してから価格履歴を登録
            form.instance.admin_user = self.request.user  # ログイン中の管理者を設定
            response = super().form_valid(form)  # 商品を保存

            # PriceHistory に登録
            PriceHistory.objects.create(
                product=form.instance,
                price=form.cleaned_data['price']  # フォームから取得した価格を利用
            )
            
        return response

class ProductUpdateView(LoginRequiredMixin, UpdateView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = Product
    form_class = ProductForm
    template_name = 'product_management/product_form.html'
    success_url = reverse_lazy('fipleapp:product_list')
    
    def get_queryset(self):
        return Product.objects.filter(admin_user=self.request.user)  # ログイン中の管理者が作成した商品元のみ
    
    def form_valid(self, form):
        with transaction.atomic():  # トランザクションを開始
            # 商品情報を更新
            response = super().form_valid(form)

            # PriceHistory に新しい価格を登録
            PriceHistory.objects.create(
                product=self.object,  # 更新された Product インスタンス
                price=form.cleaned_data['price']  # フォームの価格フィールドを利用
            )

        return response
    
class ProductDeleteView(LoginRequiredMixin, DeleteView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = Product
    template_name = 'product_management/product_confirm_delete.html'
    success_url = reverse_lazy('fipleapp:product_list')

    def get_queryset(self):
        return Product.objects.filter(admin_user=self.request.user)  # ログイン中の管理者が作成した商品元のみ
    

# 商品タグ関連------------------------------------------------------------------------------------------------------------------------

class ProductTagListView(LoginRequiredMixin, ListView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = ProductTag
    template_name = 'product_management/product_tag_list.html'
    context_object_name = 'product_tags'
    paginate_by = 20
    
class ProductTagCreateView(LoginRequiredMixin, CreateView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = ProductTag
    form_class = ProductTagForm
    template_name = 'product_management/product_tag_form.html'
    success_url = reverse_lazy('fipleapp:product_tag_list')

    def form_valid(self, form):
        form.instance.admin_user = self.request.user  # ログイン中の管理者を設定
        return super().form_valid(form)

class ProductTagUpdateView(LoginRequiredMixin, UpdateView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = ProductTag
    form_class = ProductTagForm
    template_name = 'product_management/product_tag_form.html'
    success_url = reverse_lazy('fipleapp:product_tag_list')
    
    def get_queryset(self):
        return ProductTag.objects.filter(admin_user=self.request.user)  # ログイン中の管理者が作成した商品元のみ
    
class ProductTagDeleteView(LoginRequiredMixin, DeleteView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = ProductTag
    template_name = 'product_management/product_tag_confirm_delete.html'
    success_url = reverse_lazy('fipleapp:product_tag_list')

    def get_queryset(self):
        return ProductTag.objects.filter(admin_user=self.request.user)  # ログイン中の管理者が作成した商品元のみ
    
# 商品画像関連----------------------------------------------------------------------------------------------------------

class ProductImageListView(LoginRequiredMixin, ListView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = ProductImage
    template_name = 'product_management/product_image_list.html'
    context_object_name = 'product_images'
    paginate_by = 20
    
class ProductImageCreateView(LoginRequiredMixin, CreateView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = ProductImage
    form_class = ProductImageForm
    template_name = 'product_management/product_image_form.html'
    success_url = reverse_lazy('fipleapp:product_image_list')

    def form_valid(self, form):
        form.instance.admin_user = self.request.user  # ログイン中の管理者を設定
        return super().form_valid(form)

class ProductImageUpdateView(LoginRequiredMixin, UpdateView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = ProductImage
    form_class = ProductImageForm
    template_name = 'product_management/product_image_form.html'
    success_url = reverse_lazy('fipleapp:product_image_list')
    
    def get_queryset(self):
        return ProductImage.objects.filter(admin_user=self.request.user)  # ログイン中の管理者が作成した商品元のみ
    
class ProductImageDeleteView(LoginRequiredMixin, DeleteView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = ProductImage
    template_name = 'product_management/product_image_confirm_delete.html'
    success_url = reverse_lazy('fipleapp:product_image_list')

    def get_queryset(self):
        return ProductImage.objects.filter(admin_user=self.request.user)  # ログイン中の管理者が作成した商品元のみ

class PasswordResetRequestView(APIView):
    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response(
                {'error': 'メールアドレスは必須です。'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = User.objects.filter(email=email).first()
        if user:
            # トークンの生成
            token = jwt.encode({
                'user_id': user.id,
                'exp': datetime.utcnow() + timedelta(hours=24)
            }, settings.SECRET_KEY, algorithm='HS256')

            # リセットリンクの作成
            reset_link = f'http://localhost:3000/accounts/password/reset/{token}'

            # メール送信
            send_mail(
                '【サイト名】パスワードリセット',
                f'以下のリンクからパスワードをリセットしてください：\n\n{reset_link}\n\nこのリンクは24時間有効です。',
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )

        # セキュリティのため、ユーザーが存在しない場合でも同じレスポンスを返す
        return Response({'message': 'パスワードリセット手順をメールで送信しました。'})

class PasswordResetConfirmView(APIView):
    def post(self, request):
        token = request.data.get('token')
        password = request.data.get('password')

        if not token or not password:
            return Response(
                {'error': '無効なリクエストです。'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # トークンの検証
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            user = User.objects.get(id=payload['user_id'])

            # パスワードの更新
            user.set_password(password)
            user.save()

            return Response({'message': 'パスワードが正常に更新されました。'})

        except (jwt.ExpiredSignatureError, jwt.DecodeError, User.DoesNotExist):
            return Response(
                {'error': '無効または期限切れのトークンです。'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
def faq_list(request):
    faqs = FAQ.objects.select_related('category').all()
    data = [
        {
            'question': faq.question,
            'answer': faq.answer,
            'category': faq.category.name,
        }
        for faq in faqs
    ]
    return JsonResponse(data, safe=False)

def create_question_category(request):
    if request.method == 'POST':
        form = QuestionCategoryForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'カテゴリが登録されました。')
            return redirect('fipleapp:create_question_category')
    else:
        form = QuestionCategoryForm()
    return render(request, 'faq/create_question_category.html', {'form': form})

def create_faq(request):
    if request.method == 'POST':
        form = FAQForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'FAQが登録されました。')
            return redirect('fipleapp:create_faq')
    else:
        form = FAQForm()
    return render(request, 'faq/create_faq.html', {'form': form})

# FAQカテゴリ削除ビュー
def delete_question_category(request, category_id):
    category = get_object_or_404(QuestionCategory, id=category_id)
    if request.method == 'POST':
        category.delete()
        messages.success(request, 'カテゴリが削除されました。')
        return redirect('fipleapp:create_question_category')  # カテゴリ一覧ページにリダイレクト
    return render(request, 'faq/delete_question_category.html', {'category': category})

# FAQ削除ビュー
def delete_faq(request, faq_id):
    faq = get_object_or_404(FAQ, id=faq_id)
    if request.method == 'POST':
        faq.delete()
        messages.success(request, 'FAQが削除されました。')
        return redirect('fipleapp:create_faq')  # FAQ一覧ページにリダイレクト
    return render(request, 'faq/delete_faq.html', {'faq': faq})

# カテゴリ一覧表示ビュー
def question_category_list(request):
    categories = QuestionCategory.objects.all()
    return render(request, 'faq/question_category_list.html', {'categories': categories})

# FAQ一覧表示ビュー
def faq_list_view(request):
    faqs = FAQ.objects.all()
    return render(request, 'faq/faq_list.html', {'faqs': faqs})

#FAQカテゴリ編集ビュー
def edit_question_category(request, category_id):
    category = get_object_or_404(QuestionCategory, id=category_id)
    if request.method == 'POST':
        category.name = request.POST.get('name')
        category.save()
        messages.success(request, 'カテゴリが更新されました。')
        return redirect('fipleapp:question_category_list')
    return render(request, 'faq/edit_question_category.html', {'category': category})

# FAQ編集ビュー
def edit_faq(request, faq_id):
    faq = get_object_or_404(FAQ, id=faq_id)
    if request.method == 'POST':
        faq.question = request.POST.get('question')
        faq.answer = request.POST.get('answer')
        faq.category_id = request.POST.get('category_id')
        faq.save()
        messages.success(request, 'FAQが更新されました。')
        return redirect('fipleapp:faq_list')
    categories = QuestionCategory.objects.all()
    return render(request, 'faq/edit_faq.html', {'faq': faq, 'categories': categories})

def faq_manager(request):
    return render(request, 'faq/faq_manager.html')

# views.py
class ContactCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ContactCategory.objects.all()
    serializer_class = ContactCategorySerializer

class ContactViewSet(viewsets.ModelViewSet):
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer

#問い合わせ一覧表示

def contact_list(request):
    contacts = Contact.objects.all().order_by('-created_at')
    return render(request, 'contact/contact_list.html', {'contacts': contacts})

def contact_detail(request, contact_id):
    contact = get_object_or_404(Contact, id=contact_id)
    return render(request, 'contact/contact_detail.html', {'contact': contact})

# backend/app/views.py

def add_contact_category(request):
    if request.method == 'POST':
        form = ContactCategoryForm(request.POST)
        if form.is_valid():
            form.save()
            return render(request, 'contact/contact_manager.html')  # 管理画面にリダイレクト
    else:
        form = ContactCategoryForm()
    
    return render(request, 'contact/add_contact_category.html', {'form': form})
    
def contact_manager(request):
    return render(request, 'contact/contact_manager.html')
@csrf_exempt  # 開発環境用、CSRFトークンを無効にする場合
def submit_contact_form(request):
    if request.method == 'POST':
        try:
            # FormDataは request.POST で受け取ることができます
            name = request.POST.get('name')
            category_name = request.POST.get('category')
            message = request.POST.get('message')

            # category_name でカテゴリを検索
            category = ContactCategory.objects.filter(name=category_name).first()

            # カテゴリが見つからない場合
            if not category:
                return JsonResponse({"error": "Invalid category"}, status=400)

            # Contactモデルにデータを保存
            contact = Contact.objects.create(
                name=name,
                category=category,
                message=message
            )

            # 保存後、成功レスポンスを返す
            return JsonResponse({"message": "Form submitted successfully", "id": contact.id}, status=201)

        except Exception as e:
            # 予期しないエラーが発生した場合
            return JsonResponse({"error": str(e)}, status=500)

    # POST以外のリクエストメソッドの場合
    return JsonResponse({"error": "Invalid request method"}, status=405)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_cart(request):
    serializer = AddToCartSerializer(data=request.data)
    
    if serializer.is_valid():
        product = serializer.validated_data['product']
        quantity = serializer.validated_data['quantity']
        
        with transaction.atomic():
            # 同じ商品がカートに既に存在するかチェック
            cart_item = Cart.objects.filter(
                user=request.user,
                product=product
            ).first()
            
            if cart_item:
                # 既存のカートアイテムの数量を更新
                new_quantity = cart_item.quantity + quantity
                if new_quantity > product.stock:
                    return Response(
                        {"error": "在庫が不足しています"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                cart_item.quantity = new_quantity
                cart_item.product_status = product.status
                cart_item.save()
            else:
                # 新しいカートアイテムを作成
                cart_item = Cart.objects.create(
                    user=request.user,
                    product=product,
                    quantity=quantity,
                    product_status=product.status
                )
            
            response_serializer = CartItemSerializer(cart_item)
            return Response(
                {
                    "message": "商品をカートに追加しました",
                    "cart_item": response_serializer.data
                },
                status=status.HTTP_201_CREATED
            )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CartListView(generics.ListAPIView):
    serializer_class = CartListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Cart.objects.filter(
            user=self.request.user,
        ).select_related(
            'product',
            'product__product_origin',
            'product__product_origin__category',
            'product__product_origin__subcategory',
            'product__color',
            'product__size'
        )

class CartUpdateView(generics.UpdateAPIView):
    serializer_class = CartListSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Cart.objects.filter(user=self.request.user)
    
    def patch(self, request, *args, **kwargs):
        cart_item = self.get_object()
        quantity = request.data.get('quantity', 1)
        
        if quantity <= 0:
            return Response(
                {"error": "数量は1以上である必要があります"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        if quantity > cart_item.product.stock:
            return Response(
                {"error": "在庫が足りません"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        cart_item.quantity = quantity
        cart_item.save()
        
        serializer = self.get_serializer(cart_item)
        return Response(serializer.data)

class CartDeleteView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Cart.objects.filter(user=self.request.user)
    
@api_view(['POST'])
def add_to_favorite(request):
    # ユーザーが認証されているか確認
    if not request.user.is_authenticated:
        return Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)
    
    # 商品IDをリクエストデータから取得
    product_id = request.data.get('product_id')
    if not product_id:
        return Response({"detail": "Product ID is required."}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # 商品を取得
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return Response({"detail": "Product not found."}, status=status.HTTP_404_NOT_FOUND)
    
    # すでにお気に入りに追加されている場合はエラー
    if Favorite.objects.filter(user=request.user, product=product).exists():
        return Response({"detail": "Product is already in your favorites."}, status=status.HTTP_400_BAD_REQUEST)

    # 新しいお気に入りを作成
    favorite = Favorite.objects.create(user=request.user, product=product)

    # 成功したらシリアライズして返す
    serializer = FavoriteSerializer(favorite)
    return Response(serializer.data, status=status.HTTP_201_CREATED)

class FavoriteListView(generics.ListAPIView):
    queryset = Favorite.objects.all()
    serializer_class = FavoriteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # 現在認証されているユーザーのお気に入りを取得
        return Favorite.objects.filter(user=self.request.user)

class FavoriteDeleteView(generics.DestroyAPIView):
    queryset = Favorite.objects.all()
    permission_classes = [IsAuthenticated]

    def get_object(self):
        # ユーザーが削除するお気に入りを取得
        favorite = Favorite.objects.filter(id=self.kwargs['pk'], user=self.request.user).first()
        if not favorite:
            raise NotFound(detail="お気に入りが見つかりません")
        return favorite

    def delete(self, request, *args, **kwargs):
        # 削除する
        favorite = self.get_object()
        favorite.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    

class PasswordChangeView(APIView):
    permission_classes = [IsAuthenticated]  # ログイン中のユーザーのみ許可
    authentication_classes = [JWTAuthentication]  # JWT認証

    def post(self, request):
        # リクエストデータを取得
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        confirm_password = request.data.get('confirm_password')

        # バリデーション: 全てのフィールドが入力されているか確認
        if not current_password or not new_password or not confirm_password:
            return Response(
                {"error": "全てのフィールドを入力してください。"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # バリデーション: 新しいパスワードと確認用パスワードが一致しているか確認
        if new_password != confirm_password:
            return Response(
                {"error": "新しいパスワードが一致しません。"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 現在のパスワードが正しいか確認
        user = request.user
        if not user.check_password(current_password):
            return Response(
                {"error": "現在のパスワードが正しくありません。"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 新しいパスワードを設定
        user.set_password(new_password)
        user.save()

        return Response(
            {"message": "パスワードが正常に変更されました。"},
            status=status.HTTP_200_OK
        )

class PasswordResetRequestView(APIView):
    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response(
                {'error': 'メールアドレスは必須です。'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = User.objects.filter(email=email).first()
        if user:
            # トークンの生成
            token = jwt.encode({
                'user_id': user.id,
                'exp': datetime.utcnow() + timedelta(hours=24)
            }, settings.SECRET_KEY, algorithm='HS256')

            # リセットリンクの作成
            reset_link = f'http://localhost:3000/accounts/password/reset/{token}'

            # ユーザー名取得（ディフォルト空）
            user_name = user.get_full_name() or "お客様"

            # HTMLメール内容
            html_content = f'''
                <html>
                    <body style=" margin: 0; padding: 0;">
                        <div style="max-width: 600px; margin: 20px auto; background: #fff; border-radius: 8px;">
                            <div style="text-align: center; padding: 20px;">
                                <h1 style="font-size: 1rem;">パスワードリセットのご案内</h1>
                                <hr>
                            </div>
                            <div style="text-align: center; padding: 20px;">
                                <p>{user_name} 様</p>
                                <p>いつも【サイト名】をご利用いただきありがとうございます!</p>
                                <p>パスワードリセットのリクエストを承りました。以下のリンクをクリックして、パスワードを再設定してください。</p>
                                <button style="">
                                    <p><a href="{reset_link}">▶ パスワードの再設定はこちら</a></p>
                                </button>
                                <p>※このリンクは、発行から24時間のみ有効です。<br>
                                    ※もし本メールに心当たりがない場合は、お手数ですが本メールを破棄してください。</p>
                            </div>
                            <div style="text-align: center; padding: 20px;">
                                <p>━━━━━━━━━━━━━━━<br>
                                【サイト名】サポートチーム<br>
                                URL: <a href="https://www.example.com" style="color: #007bff; text-decoration: none;">https://www.example.com</a><br>
                                メール: support@example.com<br>
                                ━━━━━━━━━━━━━━━</p>
                            </div>
                        </div>
                    </body>
                </html>
            '''

            # メール送信
            email_message = EmailMessage(
                subject='【サイト名】パスワードリセットのご案内',
                body=html_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[email],
            )
            email_message.content_subtype = "html"  # HTML形式で送信
            email_message.send(fail_silently=False)
        # セキュリティのため、ユーザーが存在しない場合でも同じレスポンスを返す
        return Response({'message': 'パスワードリセット手順をメールで送信しました。'})
    

class PasswordResetConfirmView(APIView):
    def post(self, request):
        token = request.data.get('token')
        password = request.data.get('password')

        if not token or not password:
            return Response(
                {'error': '無効なリクエストです。'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # トークンの検証
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            user = User.objects.get(id=payload['user_id'])

            # パスワードの更新
            user.set_password(password)
            user.save()

            return Response({'message': 'パスワードが正常に更新されました。'})

        except (jwt.ExpiredSignatureError, jwt.DecodeError, User.DoesNotExist):
            return Response(
                {"error": "この商品には既にレビューを投稿しています"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
def faq_list(request):
    faqs = FAQ.objects.select_related('category').all()
    data = [
        {
            'question': faq.question,
            'answer': faq.answer,
            'category': faq.category.name,
        }
        for faq in faqs
    ]
    return JsonResponse(data, safe=False)

def create_question_category(request):
    if request.method == 'POST':
        form = QuestionCategoryForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'カテゴリが登録されました。')
            return redirect('fipleapp:create_question_category')
    else:
        form = QuestionCategoryForm()
    return render(request, 'faq/create_question_category.html', {'form': form})

def create_faq(request):
    if request.method == 'POST':
        form = FAQForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'FAQが登録されました。')
            return redirect('fipleapp:create_faq')
    else:
        form = FAQForm()
    return render(request, 'faq/create_faq.html', {'form': form})

# FAQカテゴリ削除ビュー
def delete_question_category(request, category_id):
    category = get_object_or_404(QuestionCategory, id=category_id)
    if request.method == 'POST':
        category.delete()
        messages.success(request, 'カテゴリが削除されました。')
        return redirect('fipleapp:create_question_category')  # カテゴリ一覧ページにリダイレクト
    return render(request, 'faq/delete_question_category.html', {'category': category})

# FAQ削除ビュー
def delete_faq(request, faq_id):
    faq = get_object_or_404(FAQ, id=faq_id)
    if request.method == 'POST':
        faq.delete()
        messages.success(request, 'FAQが削除されました。')
        return redirect('fipleapp:create_faq')  # FAQ一覧ページにリダイレクト
    return render(request, 'faq/delete_faq.html', {'faq': faq})

# カテゴリ一覧表示ビュー
def question_category_list(request):
    categories = QuestionCategory.objects.all()
    return render(request, 'faq/question_category_list.html', {'categories': categories})

# FAQ一覧表示ビュー
def faq_list_view(request):
    faqs = FAQ.objects.all()
    return render(request, 'faq/faq_list.html', {'faqs': faqs})

#FAQカテゴリ編集ビュー
def edit_question_category(request, category_id):
    category = get_object_or_404(QuestionCategory, id=category_id)
    if request.method == 'POST':
        category.name = request.POST.get('name')
        category.save()
        messages.success(request, 'カテゴリが更新されました。')
        return redirect('fipleapp:question_category_list')
    return render(request, 'faq/edit_question_category.html', {'category': category})

# FAQ編集ビュー
def edit_faq(request, faq_id):
    faq = get_object_or_404(FAQ, id=faq_id)
    if request.method == 'POST':
        faq.question = request.POST.get('question')
        faq.answer = request.POST.get('answer')
        faq.category_id = request.POST.get('category_id')
        faq.save()
        messages.success(request, 'FAQが更新されました。')
        return redirect('fipleapp:faq_list')
    categories = QuestionCategory.objects.all()
    return render(request, 'faq/edit_faq.html', {'faq': faq, 'categories': categories})

def faq_manager(request):
    return render(request, 'faq/faq_manager.html')

class ContactCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ContactCategory.objects.all()
    serializer_class = ContactCategorySerializer

class ContactViewSet(viewsets.ModelViewSet):
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer

#問い合わせ一覧表示ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from .models import Contact

def contact_list(request):
    contacts = Contact.objects.all().order_by('-created_at')
    return render(request, 'contact/contact_list.html', {'contacts': contacts})

def contact_detail(request, contact_id):
    contact = get_object_or_404(Contact, id=contact_id)
    return render(request, 'contact/contact_detail.html', {'contact': contact})

def add_contact_category(request):
    if request.method == 'POST':
        form = ContactCategoryForm(request.POST)
        if form.is_valid():
            form.save()
            return render(request, 'contact/contact_manager.html')  # 管理画面にリダイレクト
    else:
        form = ContactCategoryForm()
    
    return render(request, 'contact/add_contact_category.html', {'form': form})
    
def contact_manager(request):
    return render(request, 'contact/contact_manager.html')

@csrf_exempt  # 開発環境用、CSRFトークンを無効にする場合
def submit_contact_form(request):
    if request.method == 'POST':
        try:
            # FormDataは request.POST で受け取ることができます
            name = request.POST.get('name')
            category_name = request.POST.get('category')
            message = request.POST.get('message')

            # category_name でカテゴリを検索
            category = ContactCategory.objects.filter(name=category_name).first()

            # カテゴリが見つからない場合
            if not category:
                return JsonResponse({"error": "Invalid category"}, status=400)

            # Contactモデルにデータを保存
            contact = Contact.objects.create(
                name=name,
                category=category,
                message=message
            )

            # 保存後、成功レスポンスを返す
            return JsonResponse({"message": "Form submitted successfully", "id": contact.id}, status=201)

        except Exception as e:
            # 予期しないエラーが発生した場合
            return JsonResponse({"error": str(e)}, status=500)

    # POST以外のリクエストメソッドの場合
    return JsonResponse({"error": "Invalid request method"}, status=405)


# 検索機能

class ProductSearchView(generics.ListAPIView):
    serializer_class = ProductSerializer

    def get_queryset(self):
        query = self.request.query_params.get('q', '')
        if not query:
            return Product.objects.none()

        # ProductOriginに関連する検索条件
        origin_conditions = Q(product_origin__product_name__icontains=query) | \
                            Q(product_origin__gender__icontains=query) | \
                            Q(product_origin__description__icontains=query) | \
                            Q(product_origin__category__category_name__icontains=query) | \
                            Q(product_origin__subcategory__subcategory_name__icontains=query)

        # Product自体の属性に関する検索条件
        product_conditions = Q(color__color_name__icontains=query) | \
                             Q(size__size_name__icontains=query) | \
                             Q(status__icontains=query)

        # タグ関連の検索条件
        tag_conditions = Q(product_tag__tag__tag_name__icontains=query)

        # 価格での検索（数値の場合）
        try:
            price = int(query)
            product_conditions |= Q(price=price)
        except ValueError:
            pass

        # 条件をまとめて検索
        return Product.objects.filter(
            origin_conditions | product_conditions | tag_conditions
        ).select_related(
            'product_origin',
            'color',
            'size'
        ).prefetch_related(
            'product_tag__tag'
        ).distinct()
    

# -----------------------------Review表示です-------------------------
class ReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer
    
    def get_queryset(self):
        queryset = Review.objects.all()
        product_id = self.request.query_params.get('productId', None)
        if product_id:
            # 修正: productId ではなく product_id を使用する
            queryset = queryset.filter(product_id=product_id)  # 修正部分
        return queryset
    
    def list(self, request, *args, **kwargs):
      queryset = self.get_queryset()
      product_id = self.request.query_params.get('productId', None)
      
      if product_id:
          # 評価ごとのカウントを取得
          rating_counts = (
              queryset
              .values('rating')
              .annotate(count=Count('rating'))
              .order_by('-rating')
          )
          
          # 評価カウントを辞書形式に変換
          rating_distribution = {
              item['rating']: item['count'] 
              for item in rating_counts
          }
          
          # 平均評価を計算
          average_rating = queryset.aggregate(Avg('rating'))['rating__avg']
          if average_rating is not None:
              average_rating = round(average_rating, 1)
          
          serializer = self.get_serializer(queryset, many=True)
          
          response_data = {
              "average_rating": average_rating if average_rating is not None else 0,
              "rating_distribution": rating_distribution,
              "reviews": serializer.data
          }
          return Response(response_data, status=status.HTTP_200_OK)
# -----------------------------Review投稿です-------------------------
class ReviewWriteView(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]  # 認証済みユーザーのみアクセス可能

    def get_queryset(self):
        queryset = Review.objects.all()
        product_id = self.request.query_params.get('productId', None)
        
        if product_id:
            queryset = queryset.filter(product_id=product_id)
        return queryset

    def create(self, request, *args, **kwargs):
        # リクエストからproduct_idを取得
        product_id = request.data.get("product")
        print("Received product_id:", product_id)
        
        # ユーザー取得 - IsAuthenticatedにより、この時点で必ずユーザーは存在する
        user = request.user
        
        # 商品が存在するかを確認
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response(
                {"error": "指定された商品が見つかりません"},
                status=status.HTTP_404_NOT_FOUND
            )

        # 既にユーザーがレビューしているか確認
        if Review.objects.filter(product=product, user=user).exists():
            return Response(
                {"error": "この商品には既にレビューを投稿しています"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # リクエストデータにユーザーIDを追加
        request_data = request.data.copy()
        request_data['user'] = user.id

        # バリデーションとレビュー作成
        serializer = self.get_serializer(data=request_data)
        if not serializer.is_valid():
            print("Serializer errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # レビューを保存
        serializer.save(user=user, product=product)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
User = get_user_model()

# ----------------------レビュー全取得-------------------------

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_reviewed_products(request):
    user = request.user
    reviewed_product_ids = Review.objects.filter(user=user).values_list('product_id', flat=True)
    return Response(list(reviewed_product_ids))

# --------------------レビュー消去---------------------------------


from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Review

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_review(request, product_id):
    user = request.user
    try:
        review = Review.objects.get(product_id=product_id, user=user)
        review.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except Review.DoesNotExist:
        return Response({'error': 'レビューが見つかりません'}, status=status.HTTP_404_NOT_FOUND)



from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

class UserReviewedProductsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # ログインユーザーがレビューした商品のIDリストを返す
        reviewed_product_ids = Review.objects.filter(user=request.user).values_list('product_id', flat=True)
        return Response(reviewed_product_ids)


# パスワード変更ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー

class PasswordChangeView(APIView):
    permission_classes = [IsAuthenticated]  # ログイン中のユーザーのみ許可
    authentication_classes = [JWTAuthentication]  # JWT認証

    def post(self, request):
        # リクエストデータを取得
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        confirm_password = request.data.get('confirm_password')

        # バリデーション: 全てのフィールドが入力されているか確認
        if not current_password or not new_password or not confirm_password:
            return Response(
                {"error": "全てのフィールドを入力してください。"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # バリデーション: 新しいパスワードと確認用パスワードが一致しているか確認
        if new_password != confirm_password:
            return Response(
                {"error": "新しいパスワードが一致しません。"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 現在のパスワードが正しいか確認
        user = request.user
        if not user.check_password(current_password):
            return Response(
                {"error": "現在のパスワードが正しくありません。"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 新しいパスワードを設定
        user.set_password(new_password)
        user.save()

        return Response(
            {"message": "パスワードが正常に変更されました。"},
            status=status.HTTP_200_OK
        )
    
# -------------------商品のおすすめ-------------------

from django.http import JsonResponse
from django.db.models import Count
from .models import Review, Product

def check_similar_fit_users(request, product_id):
    user = request.user
    if not user.is_authenticated:
        return JsonResponse({'error': 'Unauthorized'}, status=401)
    
    # ログイン中のユーザの身長・体重を取得
    user_height = user.height
    user_weight = user.weight

    # 商品の「ちょうどいい」レビューを持つユーザの数をカウント
    similar_users_count = Review.objects.filter(
        product_id=product_id,
        fit='ちょうどいい',
        user__height=user_height,
        user__weight=user_weight
    ).values('user').distinct().count()

    return JsonResponse({'similar_users_count': similar_users_count})
