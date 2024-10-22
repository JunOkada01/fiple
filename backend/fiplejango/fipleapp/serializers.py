from rest_framework import serializers
from .models import CustomUser

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
