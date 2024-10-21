from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
#ユーザーテーブル
class CustomUser(AbstractUser):
    password = models.CharField(max_length=128, default='')