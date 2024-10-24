from django.db import models
from django.contrib.auth.models import AbstractUser
from datetime import date

class Admin(models.Model):
    admin_id = models.AutoField(primary_key=True)  # 自動インクリメントのプライマリーキー
    name = models.CharField(max_length=256, unique=True)  # 名前（ユニーク制約付き）
    password = models.CharField(max_length=256)  # パスワード（ハッシュ化されることを想定）
    login_date = models.DateTimeField(null=True, blank=True)  # ログイン日付（NULL許可）

    def __str__(self):
        return self.name  # 管理者名を表示するためのメソッド
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
