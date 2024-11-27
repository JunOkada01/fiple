# Python Standard Library
from datetime import timezone
import json

# Djangoインポート
from django.core.mail import EmailMessage
from django.contrib import messages
from django.contrib.auth import (
    authenticate,
    login,
    logout,
)
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
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
from django.views.generic import (
    TemplateView,
    ListView,
    CreateView,
    UpdateView,
    DeleteView,
)

# DRFインポート
from rest_framework import generics, status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import *
from .serializers import *
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate, login
from django.shortcuts import render, redirect
from django.contrib import messages
from .forms import *
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
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Contact, ContactCategory
from rest_framework_simplejwt.authentication import JWTAuthentication

from rest_framework_simplejwt.authentication import JWTAuthentication

def data_view(request):
    return JsonResponse({"message": "Hello from Django!!!!"})

class APIProductListView(APIView):
    def get(self, request):
        products = Product.objects.select_related('product_origin', 'product_origin__category', 'color', 'size').prefetch_related('productimage_set').all()
        serializer = ProductListSerializer(products, many=True)
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



# アカウント関連-----------------------------------------------------------------------------------------

def user_list(request):
    users = CustomUser.objects.all().values('id', 'username', 'email')  # 必要なフィールドだけを取得
    return JsonResponse(list(users), safe=False)

# class RegisterView(APIView):
#     def post(self, request):
#         serializer = UserSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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
    return render(request, 'admin_create.html', {'form': form})

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
    return render(request, 'admin_login.html', {'form': form})


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

# カテゴリ関連-----------------------------------------------------------------------------------------

class CategoryListView(LoginRequiredMixin, ListView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = Category
    template_name = 'category_list.html'
    context_object_name = 'categories'
    paginate_by = 20

class CategoryCreateView(LoginRequiredMixin, CreateView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = Category
    form_class = CategoryForm
    template_name = 'category_form.html'
    success_url = reverse_lazy('fipleapp:category_list')

    def form_valid(self, form):
        form.instance.admin_user = self.request.user  # ログイン中の管理者を設定
        return super().form_valid(form)
    
class CategoryUpdateView(LoginRequiredMixin, UpdateView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = Category
    form_class = CategoryForm
    template_name = 'category_form.html'
    success_url = reverse_lazy('fipleapp:category_list')
    
    def get_queryset(self):
        return Category.objects.filter(admin_user=self.request.user)  # ログイン中の管理者が作成した商品元のみ

class CategoryDeleteView(LoginRequiredMixin, DeleteView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = Category
    template_name = 'category_confirm_delete.html'
    success_url = reverse_lazy('fipleapp:category_list')

    def get_queryset(self):
        return Category.objects.filter(admin_user=self.request.user)  # ログイン中の管理者が作成したカテゴリのみ
    
# サブカテゴリ関連-----------------------------------------------------------------------------------------

class SubCategoryListView(LoginRequiredMixin, ListView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = SubCategory
    template_name = 'subcategory_list.html'
    context_object_name = 'subcategories'
    paginate_by = 20
    
class SubCategoryCreateView(LoginRequiredMixin, CreateView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = SubCategory
    form_class = SubCategoryForm
    template_name = 'subcategory_form.html'
    success_url = reverse_lazy('fipleapp:subcategory_list')

    def form_valid(self, form):
        form.instance.admin_user = self.request.user  # ログイン中の管理者を設定
        return super().form_valid(form)
    
class SubCategoryUpdateView(LoginRequiredMixin, UpdateView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = SubCategory
    form_class = SubCategoryForm
    template_name = 'subcategory_form.html'
    success_url = reverse_lazy('fipleapp:subcategory_list')
    
    def get_queryset(self):
        return SubCategory.objects.filter(admin_user=self.request.user)  # ログイン中の管理者が作成した商品元のみ
    
class SubCategoryDeleteView(LoginRequiredMixin, DeleteView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = SubCategory
    template_name = 'subcategory_confirm_delete.html'
    success_url = reverse_lazy('fipleapp:subcategory_list')

    def get_queryset(self):
        return SubCategory.objects.filter(admin_user=self.request.user)  # ログイン中の管理者が作成したカテゴリのみ
    
# 色関連-----------------------------------------------------------------------------------------

class ColorListView(LoginRequiredMixin, ListView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = Color
    template_name = 'color_list.html'
    context_object_name = 'colors'
    paginate_by = 20
    
class ColorCreateView(LoginRequiredMixin, CreateView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = Color
    form_class = ColorForm
    template_name = 'color_form.html'
    success_url = reverse_lazy('fipleapp:color_list')

    def form_valid(self, form):
        form.instance.admin_user = self.request.user  # ログイン中の管理者を設定
        return super().form_valid(form)
    
class ColorUpdateView(LoginRequiredMixin, UpdateView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = Color
    form_class = ColorForm
    template_name = 'color_form.html'
    success_url = reverse_lazy('fipleapp:color_list')
    
    def get_queryset(self):
        return Color.objects.filter(admin_user=self.request.user)  # ログイン中の管理者が作成した商品元のみ
    
class ColorDeleteView(LoginRequiredMixin, DeleteView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = Color
    template_name = 'color_confirm_delete.html'
    success_url = reverse_lazy('fipleapp:color_list')

    def get_queryset(self):
        return Color.objects.filter(admin_user=self.request.user)  # ログイン中の管理者が作成したカテゴリのみ
    
# サイズ関連-----------------------------------------------------------------------------------------

class SizeListView(LoginRequiredMixin, ListView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = Size
    template_name = 'size_list.html'
    context_object_name = 'sizes'
    paginate_by = 20
    
class SizeCreateView(LoginRequiredMixin, CreateView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = Size
    form_class = SizeForm
    template_name = 'size_form.html'
    success_url = reverse_lazy('fipleapp:size_list')

    def form_valid(self, form):
        form.instance.admin_user = self.request.user  # ログイン中の管理者を設定
        return super().form_valid(form)
    
class SizeUpdateView(LoginRequiredMixin, UpdateView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = Size
    form_class = SizeForm
    template_name = 'size_form.html'
    success_url = reverse_lazy('fipleapp:size_list')
    
    def get_queryset(self):
        return Size.objects.filter(admin_user=self.request.user)  # ログイン中の管理者が作成した商品元のみ
    
class SizeDeleteView(LoginRequiredMixin, DeleteView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = Size
    template_name = 'size_confirm_delete.html'
    success_url = reverse_lazy('fipleapp:size_list')

    def get_queryset(self):
        return Size.objects.filter(admin_user=self.request.user)  # ログイン中の管理者が作成したカテゴリのみ
    
# 商品元関連----------------------------------------------------------------------------------------

class ProductOriginListView(LoginRequiredMixin, ListView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = ProductOrigin
    template_name = 'product_origin_list.html'
    context_object_name = 'products_origin'
    paginate_by = 10
    
class ProductOriginCreateView(LoginRequiredMixin, CreateView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = ProductOrigin
    form_class = ProductOriginForm
    template_name = 'product_origin_form.html'
    success_url = reverse_lazy('fipleapp:product_origin_list')

    def form_valid(self, form):
        form.instance.admin_user = self.request.user  # ログイン中の管理者を設定
        return super().form_valid(form)

class ProductOriginUpdateView(LoginRequiredMixin, UpdateView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = ProductOrigin
    form_class = ProductOriginForm
    template_name = 'product_origin_form.html'
    success_url = reverse_lazy('fipleapp:product_origin_list')
    
    def get_queryset(self):
        return ProductOrigin.objects.filter(admin_user=self.request.user)  # ログイン中の管理者が作成した商品元のみ
    
class ProductOriginDeleteView(LoginRequiredMixin, DeleteView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = ProductOrigin
    template_name = 'product_origin_confirm_delete.html'
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
    template_name = 'product_list.html'
    context_object_name = 'products'
    paginate_by = 10
    
class ProductCreateView(LoginRequiredMixin, CreateView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = Product
    form_class = ProductForm
    template_name = 'product_form.html'
    success_url = reverse_lazy('fipleapp:product_list')

    def form_valid(self, form):
        form.instance.admin_user = self.request.user  # ログイン中の管理者を設定
        return super().form_valid(form)

class ProductUpdateView(LoginRequiredMixin, UpdateView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = Product
    form_class = ProductForm
    template_name = 'product_form.html'
    success_url = reverse_lazy('fipleapp:product_list')
    
    def get_queryset(self):
        return Product.objects.filter(admin_user=self.request.user)  # ログイン中の管理者が作成した商品元のみ
    
class ProductDeleteView(LoginRequiredMixin, DeleteView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = Product
    template_name = 'product_confirm_delete.html'
    success_url = reverse_lazy('fipleapp:product_list')

    def get_queryset(self):
        return Product.objects.filter(admin_user=self.request.user)  # ログイン中の管理者が作成した商品元のみ
    
# タグ関連------------------------------------------------------------------------------------------------------

class TagListView(LoginRequiredMixin, ListView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = Tag
    template_name = 'tag_list.html'
    context_object_name = 'tags'
    paginate_by = 20
    
class TagCreateView(LoginRequiredMixin, CreateView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = Tag
    form_class = TagForm
    template_name = 'tag_form.html'
    success_url = reverse_lazy('fipleapp:tag_list')

    def form_valid(self, form):
        form.instance.admin_user = self.request.user  # ログイン中の管理者を設定
        return super().form_valid(form)

class TagUpdateView(LoginRequiredMixin, UpdateView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = Tag
    form_class = TagForm
    template_name = 'tag_form.html'
    success_url = reverse_lazy('fipleapp:tag_list')
    
    def get_queryset(self):
        return Tag.objects.filter(admin_user=self.request.user)  # ログイン中の管理者が作成した商品元のみ
    
class TagDeleteView(LoginRequiredMixin, DeleteView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = Tag
    template_name = 'tag_confirm_delete.html'
    success_url = reverse_lazy('fipleapp:tag_list')

    def get_queryset(self):
        return Tag.objects.filter(admin_user=self.request.user)  # ログイン中の管理者が作成した商品元のみ
    
# 商品タグ関連------------------------------------------------------------------------------------------------------------------------

class ProductTagListView(LoginRequiredMixin, ListView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = ProductTag
    template_name = 'product_tag_list.html'
    context_object_name = 'product_tags'
    paginate_by = 20
    
class ProductTagCreateView(LoginRequiredMixin, CreateView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = ProductTag
    form_class = ProductTagForm
    template_name = 'product_tag_form.html'
    success_url = reverse_lazy('fipleapp:product_tag_list')

    def form_valid(self, form):
        form.instance.admin_user = self.request.user  # ログイン中の管理者を設定
        return super().form_valid(form)

class ProductTagUpdateView(LoginRequiredMixin, UpdateView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = ProductTag
    form_class = ProductTagForm
    template_name = 'product_tag_form.html'
    success_url = reverse_lazy('fipleapp:product_tag_list')
    
    def get_queryset(self):
        return ProductTag.objects.filter(admin_user=self.request.user)  # ログイン中の管理者が作成した商品元のみ
    
class ProductTagDeleteView(LoginRequiredMixin, DeleteView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = ProductTag
    template_name = 'product_tag_confirm_delete.html'
    success_url = reverse_lazy('fipleapp:product_tag_list')

    def get_queryset(self):
        return ProductTag.objects.filter(admin_user=self.request.user)  # ログイン中の管理者が作成した商品元のみ
    
# 商品画像関連----------------------------------------------------------------------------------------------------------

class ProductImageListView(LoginRequiredMixin, ListView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = ProductImage
    template_name = 'product_image_list.html'
    context_object_name = 'product_images'
    paginate_by = 20
    
class ProductImageCreateView(LoginRequiredMixin, CreateView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = ProductImage
    form_class = ProductImageForm
    template_name = 'product_image_form.html'
    success_url = reverse_lazy('fipleapp:product_image_list')

    def form_valid(self, form):
        form.instance.admin_user = self.request.user  # ログイン中の管理者を設定
        return super().form_valid(form)

class ProductImageUpdateView(LoginRequiredMixin, UpdateView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = ProductImage
    form_class = ProductImageForm
    template_name = 'product_image_form.html'
    success_url = reverse_lazy('fipleapp:product_image_list')
    
    def get_queryset(self):
        return ProductImage.objects.filter(admin_user=self.request.user)  # ログイン中の管理者が作成した商品元のみ
    
class ProductImageDeleteView(LoginRequiredMixin, DeleteView):
    login_url = 'fipleapp:admin_login'
    redirect_field_name = 'redirect_to'
    model = ProductImage
    template_name = 'product_image_confirm_delete.html'
    success_url = reverse_lazy('fipleapp:product_image_list')

    def get_queryset(self):
        return ProductImage.objects.filter(admin_user=self.request.user)  # ログイン中の管理者が作成した商品元のみ
    
    
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.conf import settings
import jwt
from datetime import datetime, timedelta


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
from rest_framework import viewsets
from .models import Contact, ContactCategory
from .serializers import ContactSerializer, ContactCategorySerializer

class ContactCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ContactCategory.objects.all()
    serializer_class = ContactCategorySerializer

class ContactViewSet(viewsets.ModelViewSet):
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer

#問い合わせ一覧表示
from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from .models import Contact

def contact_list(request):
    contacts = Contact.objects.all().order_by('-created_at')
    return render(request, 'contact/contact_list.html', {'contacts': contacts})

def contact_detail(request, contact_id):
    contact = get_object_or_404(Contact, id=contact_id)
    return render(request, 'contact/contact_detail.html', {'contact': contact})

# backend/app/views.py
from django.shortcuts import render, redirect
from .forms import ContactCategoryForm

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
    

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.conf import settings
import jwt
from datetime import datetime, timedelta

User = get_user_model()

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

# views.py
from rest_framework import viewsets
from .models import Contact, ContactCategory
from .serializers import ContactSerializer, ContactCategorySerializer

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

# backend/app/views.py
from django.shortcuts import render, redirect
from .forms import ContactCategoryForm

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


from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Contact, ContactCategory

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
from rest_framework import generics
from rest_framework.response import Response
from django.db.models import Q
from .models import Product, ProductOrigin
from .serializers import ProductSerializer

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