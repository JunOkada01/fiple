from rest_framework import serializers
from .models import Admin

class AdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Admin
        fields = ['admin_id', 'name', 'password', 'login_date']  # シリアライズするフィールドを指定

    def create(self, validated_data):
        admin = Admin(
            admin_id=validated_data['admin_id'],
            name=validated_data['name'],
            login_date=validated_data['login_date'],  # パスワード以外のフィールドをセット
        )
        admin.set_password(validated_data['password'])  # パスワードをハッシュ化して保存
        admin.save()
        return admin
