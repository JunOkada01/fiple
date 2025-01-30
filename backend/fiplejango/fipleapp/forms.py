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
    
    category_position = forms.ChoiceField(
        choices=Category.positionChoices.choices,
        widget=forms.RadioSelect(),
        label='部位'
    )
    
    class Meta:
        model = Category
        fields = ['category_name', 'category_position']
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
        fields = ['color_name', 'color_code', 'color_code']
        labels = {
            'color_name': 'カラー名',
            'color_code': 'カラーコード',
        }
        widgets = {
            'color_name': forms.TextInput(attrs={'class': 'form-control'}),
        }
    color_code = forms.CharField(
        widget=forms.widgets.Input(attrs={
            'type': 'color',
            'class': 'form-control'
            }),
        label='カラーコード',
    )
        
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
        
        def clean(self):
            cleaned_data = super().clean()
            product_origin = cleaned_data.get('product_origin')
            color = cleaned_data.get('color')
            size = cleaned_data.get('size')
            
            if Product.objects.filter(product_origin=product_origin, color=color, size=size).exists():
                raise ValidationError("同じ商品元、色、サイズの組み合わせが既に存在します。")
        
            return cleaned_data
        
class TagForm(forms.ModelForm):
    class Meta:
        model = Tag
        fields = ['tag_name']
        labels = {
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
        
class QuestionCategoryForm(forms.ModelForm):
    class Meta:
        model = QuestionCategory
        fields = ['name']
        labels = {
            'name': 'カテゴリ名'
        }

class FAQForm(forms.ModelForm):
    class Meta:
        model = FAQ
        fields = ['category', 'question', 'answer']
        labels = {
            'category': 'カテゴリ',
            'question': '質問',
            'answer': '回答',
        }

class ContactCategoryForm(forms.ModelForm):
    class Meta:
        model = ContactCategory
        fields = ['name']

class ContactForm(forms.Form):
    name = forms.CharField(max_length=100, required=True)
    category = forms.ChoiceField(
        choices=[('inquiry', 'お問い合わせ'), ('feedback', 'フィードバック')],
        required=True
    )
    message = forms.CharField(widget=forms.Textarea, required=True)


# FAQフォーム
class QuestionCategoryForm(forms.ModelForm):
    class Meta:
        model = QuestionCategory
        fields = ['name']
        labels = {
            'name': 'カテゴリ名'
        }

class FAQForm(forms.ModelForm):
    class Meta:
        model = FAQ
        fields = ['category', 'question', 'answer']
        labels = {
            'category': 'カテゴリ',
            'question': '質問',
            'answer': '回答',
        }

# 問い合わせフォーム
class ContactCategoryForm(forms.ModelForm):
    class Meta:
        model = ContactCategory
        fields = ['name']

class ContactForm(forms.Form):
    name = forms.CharField(max_length=100, required=True)
    category = forms.ChoiceField(
        choices=[('inquiry', 'お問い合わせ'), ('feedback', 'フィードバック')],
        required=True
    )
    message = forms.CharField(widget=forms.Textarea, required=True)

class ShippingUpdateForm(forms.ModelForm):
    class Meta:
        model = Shipping
        fields = ['is_shipped']
        widgets = {
            'is_shipped': forms.CheckboxInput(attrs={'class': 'form-check-input'})
        }

class DeliveryForm(forms.ModelForm):
    class Meta:
        model = Delivery
        fields = ['status', 'delivery_company', 'tracking_number', 
                'scheduled_delivery_date', 'notes']
        widgets = {
            'scheduled_delivery_date': forms.DateInput(attrs={'type': 'date'}),
            'notes': forms.Textarea(attrs={'rows': 4})
        }
        
class BannerForm(forms.ModelForm):
    class Meta:
        model = Banner
        fields = ['image', 'link']
        widgets = {
            'link': forms.URLInput(attrs={'class': 'form-control'}),
            'image': forms.ClearableFileInput(attrs={'class': 'form-control'}),
        }