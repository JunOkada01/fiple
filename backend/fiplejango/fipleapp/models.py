from django.db import models
from django.contrib.auth.models import AbstractUser, AbstractBaseUser, BaseUserManager
from datetime import date

class CustomUser(AbstractUser):
    password = models.TextField(max_length=128, default='')  # パスワード
    hurigana = models.CharField(max_length=255, default='')  # フリガナ
    
    class SexChoices(models.TextChoices):
        MALE = 'M', 'Male'
        FEMALE = 'F', 'Female'
        OTHER = 'O', 'Other'
    sex = models.CharField(max_length=1, choices=SexChoices.choices, default=SexChoices.OTHER)  # 性別
    
    phone = models.CharField(max_length=15, default='')  # 電話番号
    postal_code = models.CharField(max_length=10, default='')  # 郵便番号
    birth = models.DateField(default=date(2000, 1, 1))  # 生年月日
    address = models.CharField(max_length=255, default='')  # 住所
    height = models.FloatField(default=0.0)  # 身長
    weight = models.FloatField(default=0.0)  # 体重
    cancellation_day = models.DateField(null=True, blank=True, default=None)  # 退会日
    accounts_valid = models.BooleanField(default=True)  # アカウント有効
    
    last_login = models.DateField(null=True, blank=True, default=None)  # 最終ログイン日

class AdminUserManager(BaseUserManager):
    def create_user(self, name, password=None, **extra_fields):
        if not name:
            raise ValueError('名前を入力してください')
        user = self.model(name=name, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, name, password=None, **extra_fields):
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(name, password, **extra_fields)


class AdminUser(AbstractBaseUser):
    name = models.CharField(max_length=255, unique=True)
    is_superuser = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=True)

    objects = AdminUserManager()

    USERNAME_FIELD = 'name'  # 認証に使用するフィールド
    REQUIRED_FIELDS = []  # スーパーユーザー作成時に追加で必要なフィールド

    def __str__(self):
        return self.name

    def has_perm(self, perm, obj=None):
        return self.is_superuser

    def has_module_perms(self, app_label):
        return self.is_superuser
    
    
class Category(models.Model):
    category_name = models.CharField(max_length=255, unique=True)  # カテゴリ名
    admin_user = models.ForeignKey(AdminUser, on_delete=models.CASCADE)  # 管理者ID（AdminUserモデルへの外部キー）
    created_at = models.DateTimeField(auto_now_add=True)  # 追加日時
    updated_at = models.DateTimeField(auto_now=True)  # 更新日時

    def __str__(self):
        return self.category_name
    
class SubCategory(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='subcategories')  # カテゴリID（Categoryモデルへの外部キー）
    subcategory_name = models.CharField(max_length=255, unique=True)  # サブカテゴリ名
    admin_user = models.ForeignKey(AdminUser, on_delete=models.CASCADE)  # 管理者ID（AdminUserモデルへの外部キー）
    created_at = models.DateTimeField(auto_now_add=True)  # 追加日時
    updated_at = models.DateTimeField(auto_now=True)  # 更新日時

    def __str__(self):
        return self.subcategory_name
    
class Color(models.Model):
    color_name = models.CharField(max_length=255, unique=True)  # 色名
    admin_user = models.ForeignKey(AdminUser, on_delete=models.CASCADE)  # 管理者ID（AdminUserモデルへの外部キー）
    created_at = models.DateTimeField(auto_now_add=True)  # 追加日時
    updated_at = models.DateTimeField(auto_now=True)  # 更新日時
    
    def __str__(self):
        return self.color_name  # 色名を返す

    
class Size(models.Model):
    size_name = models.CharField(max_length=255, unique=True)  # サイズ名
    admin_user = models.ForeignKey(AdminUser, on_delete=models.CASCADE)  # 管理者ID（AdminUserモデルへの外部キー）
    created_at = models.DateTimeField(auto_now_add=True)  # 追加日時
    updated_at = models.DateTimeField(auto_now=True)  # 更新日時
    
    def __str__(self):
        return self.size_name  # サイズ名を返す

    
class ProductOrigin(models.Model):
    GENDER_CHOICES = [
        ('男性', '男性'),
        ('女性', '女性'),
        ('その他', 'その他'),
    ]

    admin_user = models.ForeignKey(AdminUser, on_delete=models.CASCADE)  # 管理者ID（AdminUserモデルへの外部キー）
    product_name = models.CharField(max_length=255)  # 商品名
    category = models.ForeignKey(Category, on_delete=models.CASCADE)  # カテゴリID（Categoryモデルへの外部キー
    subcategory = models.ForeignKey(SubCategory, on_delete=models.CASCADE)  # サブカテゴリID（SubCategoryモデルへの外部キー
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)  # 性別（ラジオボタン）
    description = models.TextField()  # 詳細
    created_at = models.DateTimeField(auto_now_add=True)  # 商品追加日時
    updated_at = models.DateTimeField(auto_now=True)  # 商品更新日時
    is_active = models.BooleanField(default=True)  # 販売ステータス

    def __str__(self):
        return self.product_name
    
class Product(models.Model):
    STATUS_CHOICES = [
        ('予約販売', '予約販売'),
        ('販売中', '販売中'),
        ('在庫切れ', '在庫切れ'),
    ]
    
    admin_user = models.ForeignKey(AdminUser, on_delete=models.CASCADE)  # 管理者ID（AdminUserモデルへの外部キー）
    product_origin = models.ForeignKey(ProductOrigin, on_delete=models.CASCADE)  # 商品元ID
    color = models.ForeignKey(Color, on_delete=models.CASCADE)  # 色ID
    size = models.ForeignKey(Size, on_delete=models.CASCADE)  # サイズID
    stock = models.PositiveIntegerField()  # 在庫数
    price = models.IntegerField()  # 価格
    status = models.CharField(max_length=30, choices=STATUS_CHOICES) # 販売ステータス
    created_at = models.DateTimeField(auto_now_add=True)  # 商品追加日時
    updated_at = models.DateTimeField(auto_now=True)  # 商品更新日時

    def __str__(self):
        return f"{self.product_origin.product_name} - {self.color.color_name} - {self.size.size_name}"
    
class Tag(models.Model):
    tag_name = models.CharField(max_length=255)
    admin_user = models.ForeignKey(AdminUser, on_delete=models.CASCADE)  # 管理者ID（AdminUserモデルへの外部キー）
    created_at = models.DateTimeField(auto_now_add=True)  # 追加日時
    updated_at = models.DateTimeField(auto_now=True)  # 更新日時
    
    def __str__(self):
        return self.tag_name
    
class ProductTag(models.Model):
    admin_user = models.ForeignKey(AdminUser, on_delete=models.CASCADE)  # 管理者ID（AdminUserモデルへの外部キー）
    product_origin = models.ForeignKey(ProductOrigin, on_delete=models.CASCADE)  # 商品元ID（ProductOriginモデルへの外部キー）
    tag = models.ForeignKey(Tag, on_delete=models.CASCADE)  # タグID（Tagモデルへの外部キー）
    created_at = models.DateTimeField(auto_now_add=True)  # 追加日時
    updated_at = models.DateTimeField(auto_now=True)  # 更新日時

    class Meta:
        unique_together = ('product_origin', 'tag')  # 商品とタグの組み合わせがユニークであることを保証

    def __str__(self):
        return f"{self.product_origin.product_name} - {self.tag.tag_name}"
    
class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)  # 商品ID（Productモデルへの外部キー）
    image = models.ImageField(upload_to='product_images/')  # 画像ファイル
    image_description = models.TextField(blank=True, null=True)  # 画像説明
    admin_user = models.ForeignKey(AdminUser, on_delete=models.CASCADE)  # 管理者ID（AdminUserモデルへの外部キー）
    created_at = models.DateTimeField(auto_now_add=True)  # 追加日時
    updated_at = models.DateTimeField(auto_now=True)  # 更新日時

    def __str__(self):
        return f"{self.product.product_origin.product_name} - {self.id}"  # 商品名と画像IDを表示
    
# class Contact(models.Model):
#     name = models.CharField(max_length=255)
#     email = models.EmailField(max_length=255)
#     phone = models.CharField(max_length=15, default='')
#     details = models.CharField(max_length=1023, default='')
#     def __str__(self):
#         return self.name  # サイズ名を返す


# class Review(models.Model):
#     productId = models.IntegerField(default=0)
#     user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
#     subject_id = models.CharField(max_length=254)#ReviewのID
#     review_detail = models.CharField(max_length=255)
#     RATING_CHOICES = [(i, f'{i}☆') for i in range(1, 6)]  # 1☆〜5☆
#     rating = models.IntegerField(choices=RATING_CHOICES, default=5)
#     datetime = models.DateTimeField(auto_now_add=True)
#     def __str__(self):
#       return f"Review by {self.user} on {self.productId}"
# # <div>
# #     {% for i in range review.rating %}
# #         ★
# #     {% endfor %}
# # </div>

class Review(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)  # productIdの代わりにForeignKeyを使用
    print("ここでproductIdです！！！！！！！！！！！！！！",product)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    subject_id = models.CharField(max_length=254)
    review_detail = models.CharField(max_length=255)
    RATING_CHOICES = [(i, f'{i}☆') for i in range(1, 6)]
    rating = models.IntegerField(choices=RATING_CHOICES, default=5)
    datetime = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review by {self.user} on {self.product}"

# # models.py
# from django.db import models
# from django.core.validators import MinValueValidator, MaxValueValidator
# from django.conf import settings

# class Review(models.Model):
#     product = models.ForeignKey(
#         'Product',  # 既存の商品モデルを参照
#         on_delete=models.CASCADE,
#         related_name='reviews'
#     )
#     user = models.ForeignKey(
#         settings.AUTH_USER_MODEL,
#         on_delete=models.CASCADE,
#         related_name='reviews'
#     )
#     rating = models.DecimalField(
#         max_digits=3,
#         decimal_places=1,
#         validators=[
#             MinValueValidator(0.0),
#             MaxValueValidator(5.0)
#         ]
#     )
#     comment = models.TextField()
#     helpful_count = models.PositiveIntegerField(default=0)
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     class Meta:
#         ordering = ['-created_at']
#         # 1ユーザーにつき1商品に1つのレビューのみ許可
#         constraints = [
#             models.UniqueConstraint(
#                 fields=['user', 'product'],
#                 name='unique_review_per_user_product'
#             )
#         ]

#     def __str__(self):
#         return f"Review by {self.user.username} for {self.product.product_name}"
