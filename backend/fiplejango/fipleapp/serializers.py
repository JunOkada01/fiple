from rest_framework import serializers
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

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'category_name']

class SubCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SubCategory
        fields = ['id', 'subcategory_name']

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

# class ProductImageSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = ProductImage
#         fields = ['id', 'image', 'image_description']

class ProductImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'image_description']

    def get_image(self, obj):
        if obj.image:
            return f"{obj.image.url}"
        return None

class ProductVariantSerializer(serializers.ModelSerializer):
    color = ColorSerializer()
    size = SizeSerializer()
    images = ProductImageSerializer(many=True, source='productimage_set')

    class Meta:
        model = Product
        fields = [
            'id', 'color', 'size', 'stock', 'price', 
            'status', 'images'
        ]

class ProductDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer()
    subcategory = SubCategorySerializer()
    tags = serializers.SerializerMethodField()
    variants = serializers.SerializerMethodField()
    

    class Meta:
        model = ProductOrigin
        fields = [
            'id', 'product_name', 'category', 'subcategory',
            'gender', 'description', 'tags', 'variants',
            'created_at', 'is_active'
        ]

    def get_tags(self, obj):
        product_tags = ProductTag.objects.filter(product_origin=obj)
        return TagSerializer(
            [pt.tag for pt in product_tags], 
            many=True
        ).data

    def get_variants(self, obj):
        variants = Product.objects.filter(product_origin=obj)
        return ProductVariantSerializer(variants, many=True).data


class ProductListSerializer(serializers.ModelSerializer):
    category = CategorySerializer(source='product_origin.category')
    images = ProductImageSerializer(source='productimage_set', many=True)
    product_name = serializers.CharField(source='product_origin.product_name')
    product_origin_id = serializers.IntegerField(source='product_origin.id')
 
    class Meta:
        model = Product
        fields = ['id', 'product_name', 'category', 'price', 'images', 'product_origin_id']



