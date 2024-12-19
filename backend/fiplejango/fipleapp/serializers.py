from rest_framework import serializers
from .models import Product
from .models import *

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = [
            'id', 'username', 'email', 'password', 'hurigana', 'sex', 'phone',
            'postal_code', 'birth', 'address', 'height', 'weight'
        ]
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
            address=validated_data['address'],
            height=validated_data['height'],  # 身長
            weight=validated_data['weight'],  # 体重
        )
        user.set_password(validated_data['password'])  # パスワードをハッシュ化して保存
        user.save()
        
        return user

class SubCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SubCategory
        fields = ['id', 'subcategory_name']

class CategorySerializer(serializers.ModelSerializer):
    subcategories = SubCategorySerializer(many=True)

    class Meta:
        model = Category
        fields = ['id', 'category_name', 'subcategories']

class ColorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Color
        fields = ['id', 'color_name', 'color_code']

class SizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Size
        fields = ['id', 'size_name', 'order']

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'tag_name']

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
    
# 商品の基本的な情報のシリアライズ
class ProductOriginSerializer(serializers.ModelSerializer):
    category = CategorySerializer()
    subcategory = SubCategorySerializer()

    class Meta:
        model = ProductOrigin
        fields = ['id', 'product_name', 'category', 'subcategory', 'gender', 'description']

# 商品リスト向けに簡略化された情報のシリアライズ
class ProductListSerializer(serializers.ModelSerializer):
    product_origin = ProductOriginSerializer()  # 商品元の詳細情報を含める
    
    category = CategorySerializer(source='product_origin.category')
    subcategory = SubCategorySerializer(source='product_origin.subcategory')
    images = ProductImageSerializer(source='productimage_set', many=True)
    product_name = serializers.CharField(source='product_origin.product_name')
    product_origin_id = serializers.IntegerField(source='product_origin.id')
    class Meta:
        model = Product
        fields = ['id', 'product_name', 'category', 'subcategory', 'price', 'images', 'product_origin_id', 'product_origin']

# 商品の基本情報を含む商品全体の情報のシリアライズ
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

class ContactCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactCategory
        fields = ['id', 'name']

class ContactSerializer(serializers.ModelSerializer):
    category = serializers.StringRelatedField()

    class Meta:
        model = Contact
        fields = ['id', 'name', 'category', 'message', 'created_at']

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'product_name']  # 必要なフィールドを指定


class SubCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SubCategory
        fields = ['id', 'subcategory_name']
        
class CategorySerializer(serializers.ModelSerializer):
    subcategories = SubCategorySerializer(many=True)

    class Meta:
        model = Category
        fields = ['id', 'category_name', 'subcategories']

class ColorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Color
        fields = ['id', 'color_name', 'color_code']

class SizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Size
        fields = ['id', 'size_name', 'order']
        
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
    product_origin = ProductOriginSerializer()
    category = CategorySerializer(source='product_origin.category')
    subcategory = SubCategorySerializer(source='product_origin.subcategory')
    images = ProductImageSerializer(source='productimage_set', many=True)
    product_name = serializers.CharField(source='product_origin.product_name')
    product_origin_id = serializers.IntegerField(source='product_origin.id')

    class Meta:
        model = Product
        fields = ['id', 'product_name', 'category', 'subcategory', 'price', 'images', 'product_origin_id', 'product_origin']

# 商品の基本情報を含む商品全体の情報のシリアライズ
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

class ContactCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactCategory
        fields = ['id', 'name']

class ContactSerializer(serializers.ModelSerializer):
    category = serializers.StringRelatedField()

    class Meta:
        model = Contact
        fields = ['id', 'name', 'category', 'message', 'created_at']
        

class DeliveryAddressSerializer(serializers.ModelSerializer):
    postal_code = serializers.CharField(write_only=True)
    prefecture = serializers.CharField(write_only=True)
    city = serializers.CharField(write_only=True)
    street = serializers.CharField(write_only=True)
    
    class Meta:
        model = DeliveryAddress
        fields = ['id', 'address', 'postal_code', 'prefecture', 'city', 'street']
        read_only_fields = ['address']

    def create(self, validated_data):
        # 住所フィールドを結合
        address = f"{validated_data.pop('prefecture')} {validated_data.pop('city')} {validated_data.pop('street')}"
        postal_code = validated_data.pop('postal_code')
        
        return DeliveryAddress.objects.create(
            user=self.context['request'].user,
            postal_code=postal_code,
            address=address
        )
        
    def update(self, instance, validated_data):
        instance.address = f"{validated_data.get('prefecture')} {validated_data.get('city')} {validated_data.get('street')}"
        instance.postal_code = validated_data.get('postal_code', instance.postal_code)
        instance.save()
        return instance
        
    def to_representation(self, instance):
        # DBから読み取った住所を分解して返す
        # 簡易的な実装なので、実際の要件に応じて調整が必要かもしれません
        parts = instance.address.split(' ', 2)
        prefecture = parts[0] if len(parts) > 0 else ''
        city = parts[1] if len(parts) > 1 else ''
        street = parts[2] if len(parts) > 2 else ''
        
        return {
            'id': instance.id,
            'postal_code': instance.postal_code, 
            'prefecture': prefecture,
            'city': city,
            'street': street,
        }
        

class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer()
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_image = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = OrderItem
        fields = ['product', 'product_name', 'quantity', 'unit_price', 'product_image']
        
    def get_product_image(self, obj):
        
        # まず、productが存在するかチェック
        if obj.product is None:
            return None
        
        # 画像を取得
        product_images = obj.product.productimage_set.all()
        if product_images.exists():
            return product_images.first().image.url
        return None

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'total_amount', 'tax_amount', 'order_date', 
            'status', 'payment_method', 'delivery_address', 
            'items'
        ]

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'product_name']  # 必要なフィールドを指定

class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['id', 'product', 'user', 'subject', 'review_detail', 'rating', 'datetime', 'fit']
        read_only_fields = ['user', 'datetime']  # userとdatetimeは読み取り専用