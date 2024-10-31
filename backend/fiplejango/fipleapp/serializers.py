from rest_framework import serializers
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

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'category_name']

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'image_description']

class ProductListSerializer(serializers.ModelSerializer):
    category = CategorySerializer(source='product_origin.category')
    images = ProductImageSerializer(source='productimage_set', many=True)
    product_name = serializers.CharField(source='product_origin.product_name')

    class Meta:
        model = Product
        fields = ['id', 'product_name', 'category', 'price', 'images']
        
class ColorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Color
        fields = ['id', 'color_name']

class SizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Size
        fields = ['id', 'size_name']

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'tag_name']

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'image_description']

class ProductDetailSerializer(serializers.ModelSerializer):
    color = ColorSerializer()
    size = SizeSerializer()
    stock_status = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'color', 'size', 'stock', 'price', 'status', 'stock_status']

    def get_stock_status(self, obj):
        if obj.stock > 0:
            return "在庫あり"
        return "在庫なし"

class ProductOriginDetailSerializer(serializers.ModelSerializer):
    products = serializers.SerializerMethodField()
    tags = serializers.SerializerMethodField()
    images = serializers.SerializerMethodField()

    class Meta:
        model = ProductOrigin
        fields = ['id', 'product_name', 'description', 'gender', 'products', 'tags', 'images']

    def get_products(self, obj):
        products = Product.objects.filter(product_origin=obj)
        return ProductDetailSerializer(products, many=True).data

    def get_tags(self, obj):
        product_tags = ProductTag.objects.filter(product_origin=obj)
        return TagSerializer([pt.tag for pt in product_tags], many=True).data

    def get_images(self, obj):
        # 関連する全ての製品のIDを取得
        product_ids = Product.objects.filter(product_origin=obj).values_list('id', flat=True)
        images = ProductImage.objects.filter(product_id__in=product_ids)
        return ProductImageSerializer(images, many=True).data