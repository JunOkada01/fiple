from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    password = models.CharField(max_length=128, default='')# パスワード
    hurigana = models.CharField(max_length=255)#フリガナ
    class SexChoices(models.TextChoices):
        MALE = 'M', 'Male'
        FEMALE = 'F', 'Female'
        OTHER = 'O', 'Other'
    sex = models.CharField(max_length=1, choices=SexChoices.choices)#性別
    phone = models.CharField(max_length=15)  #電話番号
    postal_code = models.CharField(max_length=10)  # 郵便番号
    birth = models.DateField() # 生年月日
    address = models.CharField(max_length=255)# 住所
    height = models.FloatField()# 身長
    weight = models.FloatField()# 体重
    cancellation_day = models.DateField(null=True, blank=True)# 退会日
    accounts_valid = models.BooleanField(default=True)# アカウント有効
    accountscreation_day = models.DateField(auto_now_add=True)# アカウント作成日
    first_delivery_address = models.CharField(max_length=255, null=True, blank=True)# 配達先
    secound_delivery_address = models.CharField(max_length=255, null=True, blank=True)# 配達先
    third_delivery_address = models.CharField(max_length=255, null=True, blank=True)# 配達先
    last_login = models.DateField(null=True, blank=True)# 最終ログイン日
    

