from django import forms
from .models import *

class AdminCreationForm(forms.ModelForm):
    password = forms.CharField(widget=forms.PasswordInput)
    confirm_password = forms.CharField(widget=forms.PasswordInput)

    class Meta:
        model = AdminUser
        fields = ['name', 'password']
        labels = {
            'name': '管理者名',
            'password': 'パスワード',
            'confirm_password': 'パスワード（確認）'
        }

    def clean(self):
        cleaned_data = super().clean()
        password = cleaned_data.get("password")
        confirm_password = cleaned_data.get("confirm_password")
        if password != confirm_password:
            raise forms.ValidationError("パスワードが一致しません")
        return cleaned_data

class AdminLoginForm(forms.Form):
    name = forms.CharField(max_length=256)
    password = forms.CharField(widget=forms.PasswordInput)
    
    
class CategoryForm(forms.ModelForm):
    class Meta:
        model = Category
        fields = ['category_name']
        labels = {
            'category_name': 'カテゴリ名',
        }
        
class SubCategoryForm(forms.ModelForm):
    class Meta:
        model = SubCategory
        fields = ['category', 'subcategory_name']
        labels = {
            'category': '主カテゴリ',
            'subcategory_name': 'サブカテゴリ名',
        }
        
class ColorForm(forms.ModelForm):
    class Meta:
        model = Color
        fields = ['color_name']
        labels = {
            'color_name': '色名',
        }
        
class SizeForm(forms.ModelForm):
    class Meta:
        model = Size
        fields = ['size_name']
        labels = {
            'size_name': 'サイズ名',
        }
        
class ProductOriginForm(forms.ModelForm):
    class Meta:
        model = ProductOrigin
        fields = ['product_name', 'category', 'subcategory', 'gender', 'description']
        labels = {
            'product_name': '商品名',
            'category': '主カテゴリ',
            'subcategory': 'サブカテゴリ',
            'gender': '性別',
            'description': '商品説明',
        }
        
class ProductForm(forms.ModelForm):
    class Meta:
        model = Product
        fields = ['product_origin', 'color', 'size', 'stock', 'price', 'status']
        labels = {
            'product_origin': '商品元',
            'color': '色',
            'size': 'サイズ',
            'stock': '在庫数',
            'price': '価格',
            'status': '販売ステータス',
        }
        
class TagForm(forms.ModelForm):
    class Meta:
        model = Tag
        fields = ['tag_name']
        lables = {
            'tag_name': 'タグ名',
        }
        
class ProductTagForm(forms.ModelForm):
    class Meta:
        model = ProductTag
        fields = ['product_origin', 'tag']
        labels = {
            'product_origin': '商品元',
            'tag': 'タグ',
        }
        
class ProductImageForm(forms.ModelForm):
    class Meta:
        model = ProductImage
        fields = ['product', 'image', 'image_description']
        labels = {
            'product': '商品',
            'image': '画像',
            'image_description': '画像説明',
        }