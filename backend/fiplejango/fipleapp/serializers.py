from rest_framework import serializers
from .models import CustomUser
from .models import Product
from .models import *

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'password', 'hurigana', 'sex', 'phone', 'postal_code', 'birth', 'address']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        user = CustomUser(
            username=validated_data['username'],
            email=validated_data['email'],
            hurigana=validated_data['hurigana'],
            sex=validated_data['sex'],
            phone=validated_data['phone'],
            postal_code=validated_data['postal_code'],
            birth=validated_data['birth'],
            address=validated_data['address']
        )
        user.set_password(validated_data['password'])  # パスワードをハッシュ化して保存
        user.save()
        return user

""" ----- ここから商品表示 ----- """

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'category_name']

class SubCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SubCategory
        fields = ['id', 'subcategory_name']

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'image_description']

class ProductListSerializer(serializers.ModelSerializer):
    category = CategorySerializer(source='product_origin.category')
    subcategory = SubCategorySerializer(source='product_origin.subcategory')
    images = ProductImageSerializer(source='productimage_set', many=True)
    product_name = serializers.CharField(source='product_origin.product_name')

    class Meta:
        model = Product
        fields = ['id', 'product_name', 'category', 'subcategory_name', 'price', 'images']