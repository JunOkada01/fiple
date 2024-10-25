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

    def __str__(self):
        return self.category_name
    
class SubCategory(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='subcategories')  # カテゴリID（Categoryモデルへの外部キー）
    subcategory_name = models.CharField(max_length=255, unique=True)  # サブカテゴリ名
    admin_user = models.ForeignKey(AdminUser, on_delete=models.CASCADE)  # 管理者ID（AdminUserモデルへの外部キー）
    created_at = models.DateTimeField(auto_now_add=True)  # 追加日時

    def __str__(self):
        return self.subcategory_name
    
class Color(models.Model):
    color_name = models.CharField(max_length=255, unique=True)  # 色名
    admin_user = models.ForeignKey(AdminUser, on_delete=models.CASCADE)  # 管理者ID（AdminUserモデルへの外部キー）
    created_at = models.DateTimeField(auto_now_add=True)  # 追加日時
    
class Size(models.Model):
    size_name = models.CharField(max_length=255, unique=True)  # サイズ名
    admin_user = models.ForeignKey(AdminUser, on_delete=models.CASCADE)  # 管理者ID（AdminUserモデルへの外部キー）
    created_at = models.DateTimeField(auto_now_add=True)  # 追加日時