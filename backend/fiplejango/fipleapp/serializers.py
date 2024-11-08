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
        
class ProductOriginSerializer(serializers.ModelSerializer):
    category = CategorySerializer()
    subcategory = SubCategorySerializer()

    class Meta:
        model = ProductOrigin
        fields = ['id', 'product_name', 'category', 'subcategory', 'gender', 'description']

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'tag_name']

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'image_description']

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
    subcategory = SubCategorySerializer(source='product_origin.subcategory')
    images = ProductImageSerializer(source='productimage_set', many=True)
    product_name = serializers.CharField(source='product_origin.product_name')
    product_origin_id = serializers.IntegerField(source='product_origin.id')

    class Meta:
        model = Product
        fields = ['id', 'product_name', 'category', 'subcategory', 'price', 'images', 'product_origin_id']
        

class ProductSerializer(serializers.ModelSerializer):
    product_origin = ProductOriginSerializer()
    color = ColorSerializer()
    size = SizeSerializer()
    images = ProductImageSerializer(source='productimage_set', many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            'id',
            'product_origin',
            'color',
            'size',
            'price',
            'stock',
            'status',
            'images'
        ]

class CartListSerializer(serializers.ModelSerializer):
    product = ProductSerializer()
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = [
            'id',
            'product',
            'quantity',
            'product_status',
            'total_price',
            'created_at',
            'updated_at'
        ]

    def get_total_price(self, obj):
        """各カートアイテムの合計金額を計算"""
        return obj.product.price * obj.quantity

class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer()  # 商品の詳細も含める

    class Meta:
        model = Cart
        fields = ['id', 'product', 'quantity', 'product_status', 'created_at', 'updated_at']
        read_only_fields = ['user', 'product_status']

class AddToCartSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)

    def validate(self, data):
        try:
            product = Product.objects.get(id=data['product_id'])
            if product.stock < data['quantity']:
                raise serializers.ValidationError("在庫が不足しています")
            if product.status != '販売中':
                raise serializers.ValidationError("この商品は現在購入できません")
            data['product'] = product
            return data
        except Product.DoesNotExist:
            raise serializers.ValidationError("指定された商品が見つかりません")
        
class FavoriteSerializer(serializers.ModelSerializer):
    product = ProductSerializer()  # 商品情報も返す場合
    images = ProductImageSerializer(source='productimage_set', many=True, read_only=True)
    class Meta:
        model = Favorite
        fields = ['id', 'user', 'product', 'images', 'created_at', 'updated_at']