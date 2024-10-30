from django.http import HttpResponse
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
import json
from rest_framework import generics
from .models import CustomUser
from .serializers import UserSerializer
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate, login





def data_view(request):
    return JsonResponse({"message": "Hello from Django!!!!"})

def user_list(request):
    users = CustomUser.objects.all().values('id', 'username', 'email')  # 必要なフィールドだけを取得
    return JsonResponse(list(users), safe=False)

class RegisterView(APIView):
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)  # ユーザーをログインさせる
            return Response({"message": "Login successful!"}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)




from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.conf import settings
import jwt
from datetime import datetime, timedelta

User = get_user_model()

class PasswordResetRequestView(APIView):
    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response(
                {'error': 'メールアドレスは必須です。'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = User.objects.filter(email=email).first()
        if user:
            # トークンの生成
            token = jwt.encode({
                'user_id': user.id,
                'exp': datetime.utcnow() + timedelta(hours=24)
            }, settings.SECRET_KEY, algorithm='HS256')

            # リセットリンクの作成
            reset_link = f'http://localhost:3000/accounts/password/reset/{token}'

            # メール送信
            send_mail(
                '【サイト名】パスワードリセット',
                f'以下のリンクからパスワードをリセットしてください：\n\n{reset_link}\n\nこのリンクは24時間有効です。',
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )

        # セキュリティのため、ユーザーが存在しない場合でも同じレスポンスを返す
        return Response({'message': 'パスワードリセット手順をメールで送信しました。'})

class PasswordResetConfirmView(APIView):
    def post(self, request):
        token = request.data.get('token')
        password = request.data.get('password')

        if not token or not password:
            return Response(
                {'error': '無効なリクエストです。'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # トークンの検証
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            user = User.objects.get(id=payload['user_id'])

            # パスワードの更新
            user.set_password(password)
            user.save()

            return Response({'message': 'パスワードが正常に更新されました。'})

        except (jwt.ExpiredSignatureError, jwt.DecodeError, User.DoesNotExist):
            return Response(
                {'error': '無効または期限切れのトークンです。'},
                status=status.HTTP_400_BAD_REQUEST
            )