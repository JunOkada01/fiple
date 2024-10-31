from datetime import timezone
from django.http import HttpResponse
from django.http import JsonResponse
from django.urls import reverse_lazy
from django.views.decorators.csrf import csrf_exempt
import json
from rest_framework import generics
from .models import *
from .serializers import *
from rest_framework import status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate, login
from django.shortcuts import render, redirect
from django.contrib import messages
from .forms import *
from django.views.generic import TemplateView
from django.contrib.auth.decorators import login_required
from django.contrib.auth import logout
from django.utils.decorators import method_decorator
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import ListView, CreateView, UpdateView, DeleteView
from django.db.models import Prefetch
from rest_framework.decorators import action


def data_view(request):
    return JsonResponse({"message": "Hello from Django!!!!"})

class APIProductListView(APIView):
    def get(self, request):
        products = Product.objects.select_related('product_origin', 'product_origin__category', 'color', 'size').prefetch_related('productimage_set').all()
        serializer = ProductListSerializer(products, many=True)
        return Response(serializer.data)


# アカウント関連-----------------------------------------------------------------------------------------

def user_list(request):
    users = CustomUser.objects.all().values('id', 'username', 'email')  # 必要なフィールドだけを取得
    return JsonResponse(list(users), safe=False)

class RegisterView(APIView):
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(request, username=username, password=password)

        if user is not None:
            backend = 'fipleapp.backends.UserBackend'
            login(request, user, backend=backend)  # ユーザーをログインさせる
            return Response({"message": "Login successful!"}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)
        


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