from django.conf import settings
from django.db import models
from django.contrib.auth.models import AbstractUser, AbstractBaseUser, BaseUserManager
from datetime import date
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
import random, string

class CustomUser(AbstractUser):
    name = models.CharField(max_length=255)  # 名前
    password = models.TextField(max_length=128, default='')  # パスワード
    hurigana = models.CharField(max_length=255, default='')  # フリガナ
    
    class SexChoices(models.TextChoices):
        MALE = 'M', '男性'
        FEMALE = 'F', '女性'
        OTHER = 'O', 'その他'
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
    
    @property
    def age(self):
        if self.birth:
            today = date.today()
            return today.year - self.birth.year - ((today.month, today.day) < (self.birth.month, self.birth.day))
        return None

class AdminUserManager(BaseUserManager):
    def create_user(self, name, password=None, **extra_fields):
        if not name:
            raise ValueError('名前を入力してください')
        user = self.model(name=name, **extra_fields)
        user.set_password(password)
        if not user.admin_id:
            user.admin_id = user.generate_admin_id()
        user.save(using=self._db)
        return user

    def create_superuser(self, name, password=None, **extra_fields):
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(name, password, **extra_fields)


class AdminUser(AbstractBaseUser):
    # 管理者ID生成メソッド
    @staticmethod
    def generate_admin_id():
        """8桁のランダムな英数字の管理者IDを生成"""
        chars = string.ascii_uppercase + string.digits
        while True:
            admin_id = ''.join(random.choices(chars, k=8))
            if not AdminUser.objects.filter(admin_id=admin_id).exists():
                return admin_id

    admin_id = models.CharField(
        max_length=8, 
        unique=True, 
        blank=True,
        verbose_name="管理者ID"
    )
    
    name = models.CharField(max_length=255, unique=True)
    is_superuser = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=True)

    objects = AdminUserManager()

    USERNAME_FIELD = 'admin_id'  # 認証に使用するフィールド
    REQUIRED_FIELDS = []  # スーパーユーザー作成時に追加で必要なフィールド

    def __str__(self):
        return self.name

    def has_perm(self, perm, obj=None):
        return self.is_superuser

    def has_module_perms(self, app_label):
        return self.is_superuser
    
    def save(self, *args, **kwargs):
        if not self.admin_id:
            self.admin_id = self.generate_admin_id()
        super().save(*args, **kwargs)
    
    
class Category(models.Model):
    category_name = models.CharField(max_length=255, unique=True)  # カテゴリ名
    
    class positionChoices(models.TextChoices):
        head = 'h', '頭'
        upper_body = 'u', '上半身'
        lower_body = 'l', '下半身'
        foot = 'f', '足'
    category_position = models.CharField(max_length=10, choices=positionChoices.choices, default=positionChoices.head)  # 性別
    
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
    color_code = models.CharField(max_length=7, default='#000000')  # 色コード
    admin_user = models.ForeignKey(AdminUser, on_delete=models.CASCADE)  # 管理者ID（AdminUserモデルへの外部キー）
    created_at = models.DateTimeField(auto_now_add=True)  # 追加日時
    updated_at = models.DateTimeField(auto_now=True)  # 更新日時
    
    def __str__(self):
        return f"{self.color_name} - ({self.color_code})"  # 色名を返す

    
class Size(models.Model):
    SIZE_CHOICES = [
        ('XS', 'XS'),
        ('S', 'S'),
        ('M', 'M'),
        ('L', 'L'),
        ('XL', 'XL'),
    ]

    size_name = models.CharField(max_length=255, unique=True, choices=SIZE_CHOICES)
    height_min_for_men = models.IntegerField()  # サイズごとの男性の適正最小身長
    height_max_for_men = models.IntegerField()  # サイズごとの男性の適正最大身長
    height_min_for_women = models.IntegerField()  # サイズごとの女性の適正最小身長
    height_max_for_women = models.IntegerField()  # サイズごとの女性の適正最大身長
    order = models.IntegerField(unique=True)  # 表示順
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['order']  # orderフィールドで自動的にソート
        
    def __str__(self):
        if self.size_name == 'XS':
            return f"{self.size_name} - 男性: ~{self.height_max_for_men}cm | 女性: ~{self.height_max_for_women}cm"
        elif self.size_name == "XL":
            return f"{self.size_name} - 男性: {self.height_min_for_men}~cm | 女性: {self.height_min_for_women}~cm"
        else:
            return f"{self.size_name} - 男性: {self.height_min_for_men}~{self.height_max_for_men}cm | 女性: {self.height_min_for_women}~{self.height_max_for_women}cm"

    
class ProductOrigin(models.Model):
    GENDER_CHOICES = [
        ('M', '男性'),
        ('F', '女性'),
        ('O', 'その他'),
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
    front_image = models.ImageField(upload_to='product_images/front/', null=True, blank=True, verbose_name="表画像")
    back_image = models.ImageField(upload_to='product_images/back/', null=True, blank=True, verbose_name="裏画像")
    
    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['product_origin', 'color', 'size'],
                name='unique_product_combination'
            )
        ]

    def __str__(self):
        return f"{self.product_origin.product_name} - {self.color.color_name} - {self.size.size_name}"
    
class PriceHistory(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)  # 商品ID（Productモデルへの外部キー）
    price = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.product.product_origin.product_name} - {self.price}"
    
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
    
class Cart(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    product_status = models.CharField(max_length=255)
    
    def __str__(self):
        return f"{self.user.username} - {self.product.product_origin.product_name}"
    
class Favorite(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.product.product_origin.product_name}"
    
class QuestionCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class FAQ(models.Model):
    question = models.CharField(max_length=255)
    answer = models.TextField()
    category = models.ForeignKey(QuestionCategory, on_delete=models.CASCADE, related_name="faqs")

    def __str__(self):
        return self.question

class ContactCategory(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Contact(models.Model):
    name = models.CharField(max_length=100)
    category = models.ForeignKey(ContactCategory, on_delete=models.CASCADE)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class DeliveryAddress(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)  # ユーザーID
    postal_code = models.CharField(max_length=10, default='')  # 郵便番号
    address = models.CharField(max_length=255)  # 配達先

    def __str__(self):
        return f"{self.user.username} - {self.address}"

    def save(self, *args, **kwargs):
        # ユーザーがすでに3つの住所を持っているかをチェック
        if DeliveryAddress.objects.filter(user=self.user).count() >= 3:
            raise ValidationError("ユーザーは最大3つの住所しか登録できません。")
        super().save(*args, **kwargs)
    

    """
    注文情報を管理するモデル
    """
class Order(models.Model):
    STATUS_CHOICES = [
        ('注文受付', '注文受付'),
        ('支払い完了', '支払い完了'),
        ('発送済み', '発送済み'),
        ('配達完了', '配達完了'),
        ('キャンセル', 'キャンセル')
    ]

    PAYMENT_METHODS = [
        ('card', 'クレジットカード'),
        ('paypay', 'PayPay'),
        ('konbini', 'コンビニ決済'),
        ('genkin', '現金引換え')
    ]

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='orders')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2)
    order_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='支払い完了')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS)
    delivery_address = models.TextField()
    
    def __str__(self):
        return f"Order {self.id} - {self.user.username}"

    """
    注文された個別の商品情報を管理するモデル
    """
class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    quantity = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    
    def get_total_price(self):
        return self.quantity * self.unit_price

    def __str__(self):
        return f"{self.product.product_origin.product_name} - {self.quantity} 個"
    
class Shipping(models.Model):
    PRIORITY_CHOICES = [
        (1, '最優先'),
        (2, '優先'),
        (3, '通常'),
    ]

    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='shipping')
    is_shipped = models.BooleanField(default=False)
    admin_user = models.ForeignKey(AdminUser, on_delete=models.CASCADE)
    priority = models.IntegerField(choices=PRIORITY_CHOICES, default=3)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"発送 #{self.id} - 注文 #{self.order.id}"
    
class Delivery(models.Model):
    DELIVERY_STATUS_CHOICES = [
        ('配送中', '配送中'),
        ('配送済み', '配送済み'),
        ('配送遅延', '配送遅延'),
        ('配送エラー', '配送エラー'),
        ('キャンセル', 'キャンセル')
    ]
    
    @staticmethod
    def generate_tracking_number():
        """ランダムな12桁の追跡番号を生成"""
        chars = string.ascii_uppercase + string.digits  # 大文字アルファベットと数字
        return ''.join(random.choices(chars, k=12))
    
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='delivery')
    shipping = models.OneToOneField(Shipping, on_delete=models.CASCADE, related_name='delivery')
    status = models.CharField(max_length=20, choices=DELIVERY_STATUS_CHOICES, default='配送中')
    
    # 配送業者情報
    delivery_company = models.CharField(max_length=100)
    tracking_number = models.CharField(max_length=12, blank=True, null=True)
    scheduled_delivery_date = models.DateField()
    
    # 作業者情報
    admin_user = models.ForeignKey(
        AdminUser,
        on_delete=models.CASCADE,
        related_name='deliveries'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # 配送に関する備考
    notes = models.TextField(blank=True)
    
    def save(self, *args, **kwargs):
        if not self.tracking_number:
            # 追跡番号が未設定の場合、ユニークな番号を生成
            while True:
                tracking_number = self.generate_tracking_number()
                if not Delivery.objects.filter(tracking_number=tracking_number).exists():
                    self.tracking_number = tracking_number
                    break
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"配送 #{self.id} - 注文 #{self.order.id}"

class DeliveryStatusLog(models.Model):
    delivery = models.ForeignKey(Delivery, on_delete=models.CASCADE, related_name='status_logs')
    status = models.CharField(max_length=20, choices=Delivery.DELIVERY_STATUS_CHOICES)
    admin_user = models.ForeignKey(AdminUser, on_delete=models.CASCADE)
    changed_at = models.DateTimeField(auto_now_add=True)
    reason = models.TextField(blank=True)
    
    def __str__(self):
        return f"{self.delivery} - {self.status} ({self.changed_at})"
    
class SalesRecord(models.Model):
    PAYMENT_METHODS = [
        ('card', 'クレジットカード'),
        ('paypay', 'PayPay'),
        ('konbini', 'コンビニ決済'),
        ('genkin', '現金引換え')
    ]

    user = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True)  # ユーザー情報
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)  # 商品情報
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='sales_records')  # 注文情報
    quantity = models.PositiveIntegerField(validators=[MinValueValidator(1)])  # 販売数量
    total_price = models.DecimalField(max_digits=10, decimal_places=2)  # 総額（商品単価×数量）
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2)  # 税額
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS)  # 支払い方法
    sale_date = models.DateField(default=date.today)  # 売上発生日
    created_at = models.DateTimeField(auto_now_add=True)  # 作成日時
    updated_at = models.DateTimeField(auto_now=True)  # 更新日時

    def __str__(self):
        return f"売上: {self.product.product_origin.product_name} ({self.quantity}個)"

    class Meta:
        verbose_name = "Sales Record"
        verbose_name_plural = "Sales Records"


class Review(models.Model):
    fit_CHOICES = [
        ('大きすぎた', '大きすぎた'),
        ('ちょうどいい', 'ちょうどいい'),
        ('ぱつぱつ', 'ぱつぱつ'),
    ]

    product = models.ForeignKey('Product', on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    subject = models.CharField(max_length=254)
    review_detail = models.CharField(max_length=255)
    RATING_CHOICES = [(i, f'{i}☆') for i in range(1, 6)]
    rating = models.IntegerField(choices=RATING_CHOICES, default=5)
    datetime = models.DateTimeField(auto_now_add=True)
    fit = models.CharField(max_length=30, choices=fit_CHOICES)

    class Meta:
        unique_together = ('product', 'user')  # 同じユーザーが同じ商品に複数レビューできないように

    def __str__(self):
        return f"{self.user}さんが{self.product}を評価しました。"
    
class Banner(models.Model):
    image = models.ImageField(upload_to='banners/')
    link = models.URLField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    admin_user = models.ForeignKey(AdminUser, on_delete=models.CASCADE)

    def __str__(self):
        return f"Banner {self.id} - {self.link}"