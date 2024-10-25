from django.contrib.auth.backends import BaseBackend
from .models import AdminUser, CustomUser  # 管理者モデルと一般ユーザーモデルをインポート

class AdminBackend(BaseBackend):
    def authenticate(self, request, username=None, password=None):
        try:
            admin_user = AdminUser.objects.get(name=username)
            if admin_user.check_password(password):
                return admin_user
        except AdminUser.DoesNotExist:
            return None

    def get_user(self, user_id):
        try:
            return AdminUser.objects.get(pk=user_id)
        except AdminUser.DoesNotExist:
            return None


class UserBackend(BaseBackend):
    def authenticate(self, request, email=None, password=None):
        try:
            user = CustomUser.objects.get(email=email)
            if user.check_password(password):
                return user
        except CustomUser.DoesNotExist:
            return None

    def get_user(self, user_id):
        try:
            return CustomUser.objects.get(pk=user_id)
        except CustomUser.DoesNotExist:
            return None
