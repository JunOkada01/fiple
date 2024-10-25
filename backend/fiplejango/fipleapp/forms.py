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