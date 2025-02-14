# Python Standard Library
from django.shortcuts import redirect
from django.core.files.base import ContentFile
from rembg import remove
from PIL import Image
from datetime import datetime, timedelta, timezone
from django.db.models import *
import io, os, sys, json, jwt, uuid, csv, base64
from decimal import Decimal
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
from django.core.paginator import Paginator
from django.db import transaction
from django.db.models import (
    Avg,
    Count,
    Prefetch,
)
from django.http import (
    HttpResponse,
    JsonResponse,
)
from django.shortcuts import (
    get_object_or_404,
    render,
    redirect,
)
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
from rest_framework import status, viewsets, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate, login
from django.shortcuts import render, redirect
from django.contrib import messages
from .serializers import ProductListSerializer
from django.views.generic import TemplateView
from django.contrib.auth.decorators import login_required
from django.contrib.auth import logout
from django.utils.decorators import method_decorator
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import ListView, CreateView, UpdateView, DeleteView
from django.db.models import Prefetch
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db import transaction
from rest_framework.permissions import AllowAny
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
from django_filters import rest_framework as filters
from django_filters.rest_framework import DjangoFilterBackend
from django.core.serializers.json import DjangoJSONEncoder
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


def data_view(request):
    return JsonResponse({"message": "Hello from Django!!!!"})

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
            
class APICategoryListView(APIView):
    def get(self, request):
        categories = Category.objects.prefetch_related('subcategories').all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)
    
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
            
# カテゴリで商品をフィルタリング
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
    def create_sales_record(self, order, order_items):
        """
        注文情報から売上の記録を作成
        """
        # 即時決済の支払方法（クレカとPayPay）
        # コンビニ・現金引換えはどうするかは検討しないといけない（仮で時差登録するかなど）
        # とりあえず全部登録
        IMMEDIATE_PSYMENT_METHODS = ['card', 'paypay', 'konbini', 'genkin']
        # 売り上げ記録作成
        if order.payment_method in IMMEDIATE_PSYMENT_METHODS:
            sales_records = []
            for order_item in order_items:
                sales_record = SalesRecord(
                    user=order.user,
                    product=order_item.product,
                    order=order,
                    quantity=order_item.quantity,
                    total_price=order_item.unit_price * order_item.quantity,
                    tax_amount=Decimal('0'),  # save()メソッドで自動計算
                    payment_method=order.payment_method,
                )
                sales_records.append(sales_record)
            # 一括作成
            SalesRecord.objects.bulk_create(sales_records)
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
                
                create_order_items = OrderItem.objects.bulk_create(order_items)
                # 注文情報から売上記録を作成
                self.create_sales_record(order, create_order_items)
                
                # 発送レコードを作成
                # payment_methodによって優先度を変える例
                priority = 3  # デフォルトは通常
                if order.payment_method == 'genkin':  # 代引きの場合は優先度を上げる
                    priority = 2
                
                Shipping.objects.create(
                    order=order,
                    is_shipped=False,
                    priority=priority,
                    admin_user=AdminUser.objects.first()  # システムデフォルトの管理者を設定
                )
                
                self.create_sales_record(order, create_order_items)
                
                # 在庫数の更新
                for cart_item in cart_items:
                    product = cart_item.product
                    product.stock -= cart_item.quantity # 注文数分在庫を減らす
                    if product.stock < 0:
                        raise ValueError(f"在庫が不足しています: {product.product_origin.product_name}")
                    product.save()
                
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

# 注文関連---------------------------------------------------------------------------------------------------------------
class OrderListView(LoginRequiredMixin, ListView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = Order
    template_name = 'order/order_list.html'
    context_object_name = 'orders'
    paginate_by = 20

    def get_queryset(self):
        queryset = Order.objects.select_related(
            'user', 'shipping'
        ).prefetch_related('items')

        # 検索フィルター
        status = self.request.GET.get('status')
        payment_method = self.request.GET.get('payment_method')
        is_shipped = self.request.GET.get('is_shipped')
        date_from = self.request.GET.get('date_from')
        date_to = self.request.GET.get('date_to')

        if status:
            queryset = queryset.filter(status=status)
        if payment_method:
            queryset = queryset.filter(payment_method=payment_method)
        if is_shipped:
            queryset = queryset.filter(shipping__is_shipped=is_shipped)
        if date_from:
            queryset = queryset.filter(order_date__gte=date_from)
        if date_to:
            queryset = queryset.filter(order_date__lte=date_to)

        return queryset.order_by('-order_date')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context.update({
            'status_choices': Order.STATUS_CHOICES,
            'payment_method_choices': Order.PAYMENT_METHODS,
        })
        return context
    
class OrderDetailView(LoginRequiredMixin, DetailView):
    model = Order
    template_name = 'order/order_detail.html'
    context_object_name = 'order'
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # 注文アイテムの取得
        context['order_items'] = self.object.items.select_related(
            'product',
            'product__product_origin'
        ).all()
        return context

class ShippingUpdateView(LoginRequiredMixin, UpdateView):
    model = Shipping
    form_class = ShippingUpdateForm
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'

    def post(self, request, *args, **kwargs):
        with transaction.atomic():  # トランザクションを使用して一連の処理を保証
            order = get_object_or_404(Order, id=self.kwargs['order_id'])
            shipping = order.shipping

            if shipping:
                form = self.form_class(request.POST, instance=shipping)
            else:
                form = self.form_class(request.POST)

            if form.is_valid():
                shipping = form.save(commit=False)
                if not hasattr(order, 'shipping'):
                    shipping.order = order
                shipping.admin_user = request.user
                shipping.save()

                if shipping.is_shipped:
                    # 注文ステータスを更新
                    order.status = '発送済み'
                    order.save()

                    # 配送データを作成
                    Delivery.objects.create(
                        order=order,
                        shipping=shipping,
                        status='配送中',
                        admin_user=request.user,
                        scheduled_delivery_date=datetime.now().date() + timedelta(days=3)  # 3日後を予定日とする
                    )

                return JsonResponse({'status': 'success'})
            
            return JsonResponse({
                'status': 'error',
                'errors': form.errors,
                'received_data': request.POST
            }, status=400)

class DeliveryListView(LoginRequiredMixin, ListView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = Delivery
    template_name = 'delivery/delivery_list.html'
    context_object_name = 'deliveries'
    paginate_by = 20

    def get_queryset(self):
        return Delivery.objects.select_related(
            'order', 'shipping', 'admin_user'
        ).filter(
            shipping__is_shipped=True
        ).order_by('-created_at')

class DeliveryUpdateView(LoginRequiredMixin, UpdateView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = Delivery
    form_class = DeliveryForm
    template_name = 'delivery/delivery_form.html'
    success_url = reverse_lazy('fipleapp:delivery-list')

    def form_valid(self, form):
        with transaction.atomic():
            delivery = form.save(commit=False)
            delivery.admin_user = self.request.user
            delivery.save()

            # ステータス変更をログに記録
            if 'status' in form.changed_data:
                DeliveryStatusLog.objects.create(
                    delivery=delivery,
                    status=delivery.status,
                    admin_user=self.request.user,
                    reason=form.cleaned_data.get('notes', '')
                )

            return super().form_valid(form)


# アカウント関連-----------------------------------------------------------------------------------------

def user_list(request):
    users = CustomUser.objects.all().values('id', 'username', 'email')  # 必要なフィールドだけを取得
    return JsonResponse(list(users), safe=False)

class UserSettingView(LoginRequiredMixin, TemplateView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    template_name = 'users/top.html'

class UserListView(LoginRequiredMixin, ListView):
    """
    ユーザー一覧ビュー
    管理者のみアクセス可能
    """
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    template_name = 'users/user_list.html'
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
    template_name = 'users/user_detail.html'
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
            
            # 自動ログイン処理
            backend = 'fipleapp.backends.AdminBackend'
            login(request, admin, backend=backend)
            
            messages.success(request, '管理者アカウントが作成され、ログインしました')
            return redirect('fipleapp:admin_top')
    else:
        form = AdminCreationForm()
    return render(request, 'fiple_admin/admin_create.html', 
                {'form': form, 'current_path': request.path})

def admin_login(request):
    if request.method == 'POST':
        form = AdminLoginForm(request.POST)
        if form.is_valid():
            admin_id = form.cleaned_data['admin_id']
            password = form.cleaned_data['password']
            try:
                admin = AdminUser.objects.get(admin_id=admin_id)
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
    return render(request, 'fiple_admin/admin_login.html', {'form': form, 'current_path': request.path})


class AdminTop(LoginRequiredMixin, TemplateView):
    template_name = 'admin_top.html'
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        if self.request.user.is_authenticated:
            context['user'] = self.request.user.name
            context['admin_id'] = self.request.user.admin_id
        
        # 現在の日付を取得
        today = datetime.now().date()
        
        # 月次データの計算
        current_month = today.replace(day=1)
        previous_month = (current_month - timedelta(days=1)).replace(day=1)
        
        # 週次データの計算（月曜日開始）
        current_week_start = today - timedelta(days=today.weekday())
        previous_week_start = current_week_start - timedelta(days=7)
        
        # 月間売上データ
        current_month_sales = SalesRecord.objects.filter(
            sale_date__year=current_month.year,
            sale_date__month=current_month.month
        ).aggregate(
            total_quantity=Count('id'),
            total_amount=Sum('total_price')
        )
        
        previous_month_sales = SalesRecord.objects.filter(
            sale_date__year=previous_month.year,
            sale_date__month=previous_month.month
        ).aggregate(
            total_quantity=Count('id'),
            total_amount=Sum('total_price')
        )
        
        # 週間売上データ
        current_week_sales = SalesRecord.objects.filter(
            sale_date__range=[current_week_start, today]
        ).aggregate(
            total_quantity=Count('id'),
            total_amount=Sum('total_price')
        )
        
        previous_week_sales = SalesRecord.objects.filter(
            sale_date__range=[previous_week_start, current_week_start - timedelta(days=1)]
        ).aggregate(
            total_quantity=Count('id'),
            total_amount=Sum('total_price')
        )
        
        # 前月比・前週比の計算
        def calculate_percentage_change(current, previous):
            if not previous or previous == 0:
                return 0
            return ((current - previous) / previous) * 100

        # 売上件数の集計データ
        context['order_stats'] = {
            'monthly': {
                'total': current_month_sales['total_quantity'] or 0,
                'change': calculate_percentage_change(
                    current_month_sales['total_quantity'] or 0,
                    previous_month_sales['total_quantity'] or 0
                )
            },
            'weekly': {
                'total': current_week_sales['total_quantity'] or 0,
                'average': (current_week_sales['total_quantity'] or 0) / 7,
                'change': calculate_percentage_change(
                    current_week_sales['total_quantity'] or 0,
                    previous_week_sales['total_quantity'] or 0
                )
            }
        }
        
        # 売上額の集計データ
        context['amount_stats'] = {
            'monthly': {
                'total': current_month_sales['total_amount'] or 0,
                'change': calculate_percentage_change(
                    current_month_sales['total_amount'] or 0,
                    previous_month_sales['total_amount'] or 0
                )
            },
            'weekly': {
                'total': current_week_sales['total_amount'] or 0,
                'average': (current_week_sales['total_amount'] or 0) / 7,
                'change': calculate_percentage_change(
                    current_week_sales['total_amount'] or 0,
                    previous_week_sales['total_amount'] or 0
                )
            }
        }
        
        # チャート用のデータ取得（既存のコード）
        sales_data = (
            SalesRecord.objects
            .values('sale_date')
            .annotate(
                total_quantity=Sum('quantity'),
                total_price=Sum('total_price'),
                order_count=Count('id')
            )
            .order_by('sale_date')
        )
        
        formatted_sales_data = [
            {
                'sale_date': record['sale_date'].strftime('%Y-%m-%d'),
                'quantity': record['total_quantity'],
                'total_price': float(record['total_price']),
                'order_count': record['order_count']
            }
            for record in sales_data
        ]
        
        context['sales_data'] = json.dumps(formatted_sales_data, cls=DjangoJSONEncoder)
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
    
class SalesManegementView(LoginRequiredMixin, ListView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    template_name = 'sales_management/top.html'
    model = SalesRecord

# カテゴリ関連-----------------------------------------------------------------------------------------
class CategoryTopView(LoginRequiredMixin, TemplateView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    template_name = 'base_settings/category/top.html'
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # ログイン中の管理者が作成したメインカテゴリをすべて取得（サブカテゴリもまとめて）
        context['categories'] = Category.objects.filter(
            admin_user=self.request.user
        ).prefetch_related('subcategories')
        return context

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
    
# class SizeCreateView(LoginRequiredMixin, CreateView):
#     login_url = 'fipleapp:admin_login'
#     redirect_field_name = 'redirect_to'
#     model = Size
#     form_class = SizeForm
#     template_name = 'base_settings/size/size_form.html'
#     success_url = reverse_lazy('fipleapp:size_list')

#     def form_valid(self, form):
#         form.instance.admin_user = self.request.user  # ログイン中の管理者を設定
#         return super().form_valid(form)
    
# class SizeUpdateView(LoginRequiredMixin, UpdateView):
#     login_url = 'fipleapp:admin_login'
#     redirect_field_name = 'redirect_to'
#     model = Size
#     form_class = SizeForm
#     template_name = 'base_settings/size/size_form.html'
#     success_url = reverse_lazy('fipleapp:size_list')
    
#     def get_queryset(self):
#         return Size.objects.filter(admin_user=self.request.user)  # ログイン中の管理者が作成した商品元のみ
    
# class SizeDeleteView(LoginRequiredMixin, DeleteView):
#     login_url = 'fipleapp:admin_login'
#     redirect_field_name = 'redirect_to'
#     model = Size
#     template_name = 'base_settings/size/size_confirm_delete.html'
#     success_url = reverse_lazy('fipleapp:size_list')

#     def get_queryset(self):
#         return Size.objects.filter(admin_user=self.request.user)  # ログイン中の管理者が作成したカテゴリのみ
    
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

def get_category_position(request, product_origin_id):
    try:
        product_origin = ProductOrigin.objects.get(id=product_origin_id)
        return JsonResponse({
            'category_position': product_origin.category.category_position
        })
    except ProductOrigin.DoesNotExist:
        return JsonResponse({'error': '商品元が見つかりません'}, status=404)
    
# 商品関連----------------------------------------------------------------------------------------------------------

class ProductPriceHistoryListView(LoginRequiredMixin, ListView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = PriceHistory
    template_name = 'price_history_list.html'
    context_object_name = 'price_histories'
    paginate_by = 20
    
    def get_queryset(self):
        queryset = super().get_queryset()
        search_query = self.request.GET.get('search', '')
        if search_query:
            queryset = queryset.filter(
                product__product_origin__product_name__icontains=search_query
            )
        return queryset.order_by('-created_at')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['search_query'] = self.request.GET.get('search', '')
        return context

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
    
    # カテゴリに応じた画像サイズの定義
    CATEGORY_SIZES = {
        'h': (100, 100),
        'u': (170, 170),
        'l': (170, 170),
        'f': (100, 80),
    }
    
    def get_category_size(self, product_origin):
        """商品元のカテゴリから適切な画像サイズを取得"""
        category = product_origin.category.category_position
        print(f'選択した部位：{category}')
        return self.CATEGORY_SIZES.get(category)

    def maintain_aspect_ratio_resize(self, image, target_size):
        """アスペクト比を維持しながら、指定サイズに収まるようにリサイズ"""
        target_width, target_height = target_size
        orig_width, orig_height = image.size
        
        # 元画像のアスペクト比を計算
        orig_aspect = orig_width / orig_height
        # 目標のアスペクト比を計算
        target_aspect = target_width / target_height
        
        if orig_aspect > target_aspect:
            # 元画像の方が横長の場合
            new_width = target_width
            new_height = int(target_width / orig_aspect)
        else:
            # 元画像の方が縦長の場合
            new_height = target_height
            new_width = int(target_height * orig_aspect)
            
        # 新しいサイズでリサイズ
        resized_image = image.resize((new_width, new_height), Image.LANCZOS)
        
        # 目標サイズの新しい画像を作成（背景透明）
        final_image = Image.new('RGBA', target_size, (0, 0, 0, 0))
        
        # リサイズした画像を中央に配置
        paste_x = (target_width - new_width) // 2
        paste_y = (target_height - new_height) // 2
        final_image.paste(resized_image, (paste_x, paste_y))
        
        return final_image
    
    def process_image_data(self, base64_data, target_size):
        """画像データを処理し、アスペクト比を維持しながら指定サイズに収める"""
        if not base64_data:
            return None, None

        # Base64データからプレフィックスを削除
        format, imgstr = base64_data.split(';base64,')
        
        # Base64をデコード
        image_data = base64.b64decode(imgstr)
        
        # 背景除去処理
        image_result = remove(image_data)
        
        # PILで画像を開く
        img = Image.open(io.BytesIO(image_result))
        
        # アスペクト比を維持しながらリサイズ
        final_img = self.maintain_aspect_ratio_resize(img, target_size)
        
        # PNG形式で保存（透明度を保持）
        img_byte_arr = io.BytesIO()
        final_img.save(img_byte_arr, format='PNG')
        img_byte_arr = img_byte_arr.getvalue()
        
        return ContentFile(img_byte_arr), 'png'
    
    def form_valid(self, form):
        with transaction.atomic():
            form.instance.admin_user = self.request.user
            
            # 商品元から適切な画像サイズを取得
            target_size = self.get_category_size(form.instance.product_origin)
            
            if target_size:
                # 表画像の処理
                front_image_data = self.request.POST.get('front_image')
                if front_image_data:
                    image_content, ext = self.process_image_data(front_image_data, target_size)
                    if image_content:
                        form.instance.front_image.save(
                            f"front_image.{ext}",
                            image_content,
                            save=False
                        )

                # 裏画像の処理
                back_image_data = self.request.POST.get('back_image')
                if back_image_data:
                    image_content, ext = self.process_image_data(back_image_data, target_size)
                    if image_content:
                        form.instance.back_image.save(
                            f"back_image.{ext}",
                            image_content,
                            save=False
                        )

            response = super().form_valid(form)

            # PriceHistory に登録
            PriceHistory.objects.create(
                product=form.instance,
                price=form.cleaned_data['price']
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
    
    # カテゴリに応じた画像サイズの定義
    CATEGORY_SIZES = {
        'h': (100, 100),
        'u': (170, 170),
        'l': (170, 170),
        'f': (100, 80),
    }
    
    def get_category_size(self, product_origin):
        """商品元のカテゴリから適切な画像サイズを取得"""
        category = product_origin.category.category_position
        print(f'選択した部位：{category}')
        return self.CATEGORY_SIZES.get(category)

    def maintain_aspect_ratio_resize(self, image, target_size):
        """アスペクト比を維持しながら、指定サイズに収まるようにリサイズ"""
        target_width, target_height = target_size
        orig_width, orig_height = image.size
        
        # 元画像のアスペクト比を計算
        orig_aspect = orig_width / orig_height
        # 目標のアスペクト比を計算
        target_aspect = target_width / target_height
        
        if orig_aspect > target_aspect:
            # 元画像の方が横長の場合
            new_width = target_width
            new_height = int(target_width / orig_aspect)
        else:
            # 元画像の方が縦長の場合
            new_height = target_height
            new_width = int(target_height * orig_aspect)
            
        # 新しいサイズでリサイズ
        resized_image = image.resize((new_width, new_height), Image.LANCZOS)
        
        # 目標サイズの新しい画像を作成（背景透明）
        final_image = Image.new('RGBA', target_size, (0, 0, 0, 0))
        
        # リサイズした画像を中央に配置
        paste_x = (target_width - new_width) // 2
        paste_y = (target_height - new_height) // 2
        final_image.paste(resized_image, (paste_x, paste_y))
        
        return final_image
    
    def process_image_data(self, base64_data, target_size):
        """画像データを処理し、アスペクト比を維持しながら指定サイズに収める"""
        if not base64_data:
            return None, None

        # Base64データからプレフィックスを削除
        format, imgstr = base64_data.split(';base64,')
        
        # Base64をデコード
        image_data = base64.b64decode(imgstr)
        
        # 背景除去処理
        image_result = remove(image_data)
        
        # PILで画像を開く
        img = Image.open(io.BytesIO(image_result))
        
        # アスペクト比を維持しながらリサイズ
        final_img = self.maintain_aspect_ratio_resize(img, target_size)
        
        # PNG形式で保存（透明度を保持）
        img_byte_arr = io.BytesIO()
        final_img.save(img_byte_arr, format='PNG')
        img_byte_arr = img_byte_arr.getvalue()
        
        return ContentFile(img_byte_arr), 'png'
    
    def form_valid(self, form):
        with transaction.atomic():
            form.instance.admin_user = self.request.user
            
            # 商品元から適切な画像サイズを取得
            target_size = self.get_category_size(form.instance.product_origin)
            
            if target_size:
                # 表画像の処理
                front_image_data = self.request.POST.get('front_image')
                if front_image_data:
                    image_content, ext = self.process_image_data(front_image_data, target_size)
                    if image_content:
                        form.instance.front_image.save(
                            f"front_image.{ext}",
                            image_content,
                            save=False
                        )

                # 裏画像の処理
                back_image_data = self.request.POST.get('back_image')
                if back_image_data:
                    image_content, ext = self.process_image_data(back_image_data, target_size)
                    if image_content:
                        form.instance.back_image.save(
                            f"back_image.{ext}",
                            image_content,
                            save=False
                        )

            response = super().form_valid(form)

            # PriceHistory に登録
            PriceHistory.objects.create(
                product=form.instance,
                price=form.cleaned_data['price']
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

class ContactCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ContactCategory.objects.all()
    serializer_class = ContactCategorySerializer

class ContactViewSet(viewsets.ModelViewSet):
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer

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

# 検索機能------------------------------------------------------------------------------------------------------------------------

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

        # 価格での検索（数値の場合）
        try:
            price = int(query)
            product_conditions |= Q(price=price)
        except ValueError:
            pass

        return Product.objects.filter(
            origin_conditions | product_conditions
        ).select_related(
            'product_origin',
            'color',
            'size'
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

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_size_recommendation(request, product_id):
    try:
        # 現在のユーザーの身長と体重を取得
        user = request.user
        user_height = user.height
        user_weight = user.weight

        # 身長と体重の許容範囲を設定（例：±5cm, ±3kg）
        height_range = 5
        weight_range = 3

        # 同じような体格のユーザーのレビューを取得
        similar_reviews = Review.objects.filter(
            product__product_origin_id=product_id,
            fit='ちょうどいい',
            user__height__range=(user_height - height_range, user_height + height_range),
            user__weight__range=(user_weight - weight_range, user_weight + weight_range)
        )

        # サイズごとのレビュー数をカウント
        size_counts = {}
        for review in similar_reviews:
            size_name = review.product.size.size_name
            size_counts[size_name] = size_counts.get(size_name, 0) + 1

        # 1件以上のレビューがあるサイズを見つける
        recommended_size = None
        for size, count in size_counts.items():
            if count >= 1:
                recommended_size = size
                break

        return Response({
            'recommended_size': recommended_size
        })

    except Exception as e:
        return Response({
            'error': str(e)
        }, status=400)

# -------------------売上管理画面-------------------
class SalesView(LoginRequiredMixin, ListView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    template_name = 'sales/sales.html'
    context_object_name = 'sales'
    paginate_by = 20
    model = SalesRecord
    """
    検索機能等の関数を追加予定
    """
    def get_queryset(self):
        queryset = super().get_queryset()
        # フィルターパラメータの取得
        start_date = self.request.GET.get('start_date') # 売上日の開始日
        end_date = self.request.GET.get('end_date') # 売上日の終了日
        payment_method = self.request.GET.get('payment_method') # 支払方法
        sort_by = self.request.GET.get('sort_by', 'sale_date')  # デフォルトは売上日
        order = self.request.GET.get('order', 'desc')  # デフォルトは降順
        # フィルター適用 (売上日・支払方法によるフィルター)
        if start_date:
            queryset = queryset.filter(sale_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(sale_date__lte=end_date)
        if payment_method:
            queryset = queryset.filter(payment_method=payment_method)
        # ソート適用
        if order == 'asc':
            queryset = queryset.order_by(sort_by) # 昇順ソート
        else:
            queryset = queryset.order_by(f'-{sort_by}') # 降順ソート
        return queryset
    def calculate_comparison(self, current_data, previous_data):
        """
        前期比を計算するヘルパーメソッド
        ・current_data: 現在のデータ値
        ・previous_data: 前期のデータ値
        """
        if not previous_data or previous_data == 0:
            return 0 # 前期データが0の場合は0を返す
        # 増減率の計算
        difference = ((current_data - previous_data) / previous_data) * 100
        return round(difference, 1)

    def get_period_summary(self, queryset, period_start, period_end, previous_start, previous_end):
        """
        期間ごとの集計を行うヘルパーメソッド
        ・現在と前期の売上データを集計し、比較結果を返す
        """
        # 現在の期間で売上データを集計
        current_period = queryset.filter(
            sale_date__gte=period_start,
            sale_date__lte=period_end
        ).aggregate(
            total_amount=Sum('total_price'),
            total_count=models.Count('id'),
            average_amount=Avg('total_price')
        )
        # 前期の期間で売上データを集計
        previous_period = queryset.filter(
            sale_date__gte=previous_start,
            sale_date__lte=previous_end
        ).aggregate(
            total_amount=Sum('total_price'),
            total_count=models.Count('id'),
            average_amount=Avg('total_price')
        )
        # 集計結果の取得
        current_amount = current_period['total_amount'] or 0
        previous_amount = previous_period['total_amount'] or 0
        current_count = current_period['total_count'] or 0
        previous_count = previous_period['total_count'] or 0
        current_average = current_period['average_amount'] or 0
        previous_average = previous_period['average_amount'] or 0

        return {
            'total_amount': current_amount, # 現在の売上金額
            'total_count': current_count, # 現在の売上件数
            'average_amount': current_average, # 現在の平均売上金額
            'amount_comparison': self.calculate_comparison(current_amount, previous_amount), # 売上金額比較
            'count_comparison': self.calculate_comparison(current_count, previous_count), # 売上件数比較
            'average_comparison': self.calculate_comparison(current_average, previous_average) # 平均売上金額比較
        }

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        today = date.today()
        queryset = SalesRecord.objects.all()

        # 日次データ（本日と前日の比較）
        yesterday = today - timedelta(days=1)
        context['daily_summary'] = self.get_period_summary(
            queryset, today, today, yesterday, yesterday
        )

        # 週次データ（今週と前週の比較）
        week_start = today - timedelta(days=today.weekday())
        previous_week_start = week_start - timedelta(days=7)
        context['weekly_summary'] = self.get_period_summary(
            queryset, 
            week_start, week_start + timedelta(days=6),
            previous_week_start, previous_week_start + timedelta(days=6)
        )

        # 月次データ（今月と前月の比較）
        month_start = today.replace(day=1)
        previous_month_end = month_start - timedelta(days=1)
        previous_month_start = previous_month_end.replace(day=1)
        month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
        context['monthly_summary'] = self.get_period_summary(
            queryset,
            month_start, month_end,
            previous_month_start, previous_month_end
        )

        # 年次データ（今年と前年の比較）
        year_start = today.replace(month=1, day=1)
        previous_year_start = year_start.replace(year=year_start.year-1)
        previous_year_end = year_start - timedelta(days=1)
        context['yearly_summary'] = self.get_period_summary(
            queryset,
            year_start, today,
            previous_year_start, previous_year_end
        )

        # 既存のコンテキストデータ
        context['payment_methods'] = SalesRecord.PAYMENT_METHODS

        return context

    def export_csv(self):
        response = HttpResponse(content_type='text/csv; charset=utf-8-sig')
        response['Content-Disposition'] = f'attachment; filename="sales_report_{datetime.now().strftime("%Y%m%d")}.csv"'
        writer = csv.writer(response)
        writer.writerow(['売上日', '商品名', '数量', '売上金額', '支払方法', '税額'])
        # フィルター適用済みのクエリセットを使用
        queryset = self.get_queryset()
        for sale in queryset:
            writer.writerow([
                sale.sale_date,
                sale.product.product_origin.product_name,
                sale.quantity,
                sale.total_price,
                dict(SalesRecord.PAYMENT_METHODS)[sale.payment_method],
                sale.tax_amount
            ])
        return response
    def get(self, request, *args, **kwargs):
        if 'export_csv' in request.GET:
            return self.export_csv()
        return super().get(request, *args, **kwargs)

class SalesDetailView(LoginRequiredMixin, DetailView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = SalesRecord
    template_name = 'sales/sales_detail.html'
    context_object_name = 'sales'
    pk_url_kwarg = 'sales_id'
    paginate_by = 10
    """
    他モデルからのデータ取得等の関数を追加予定
    売上詳細に必要なものを検討
    """
    
# バナー管理----------------------------------------------------------------------------------------------------------
class BannerListAPIView(generics.ListAPIView):
    queryset = Banner.objects.all()
    serializer_class = BannerSerializer

class BannerListView(LoginRequiredMixin, ListView):
    model = Banner
    template_name = 'banners/banner_list.html'
    context_object_name = 'banners'
    paginate_by = 10

class BannerCreateView(LoginRequiredMixin, CreateView):
    model = Banner
    form_class = BannerForm
    template_name = 'banners/banner_form.html'
    success_url = reverse_lazy('fipleapp:banner_list')

    def form_valid(self, form):
        form.instance.admin_user = self.request.user
        return super().form_valid(form)

class BannerUpdateView(LoginRequiredMixin, UpdateView):
    model = Banner
    form_class = BannerForm
    template_name = 'banners/banner_form.html'
    success_url = reverse_lazy('fipleapp:banner_list')

class BannerDeleteView(LoginRequiredMixin, DeleteView):
    model = Banner
    template_name = 'banners/banner_confirm_delete.html'
    success_url = reverse_lazy('fipleapp:banner_list')
    
# 通知--------------------------------------------------------------------------------------------------------------
class NotificationList(generics.ListAPIView):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    
# 在庫管理------------------------------------------------------------------------------------------------------
class StockView(LoginRequiredMixin, ListView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    template_name = 'stock/stock_list.html'
    context_object_name = 'stocks'
    paginate_by = 20
    model = Product
    def get_queryset(self):
        return Product.objects.all().select_related('product_origin', 'color', 'size')
    
# -------------------管理画面ガイド関連-------------------
class GuideTopView(LoginRequiredMixin, TemplateView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    template_name = 'guide/guide_top.html'

class ProductGuideView(LoginRequiredMixin, TemplateView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    template_name = 'guide/product_guide.html'
# ------------------------------------------------------
