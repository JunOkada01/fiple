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
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.conf import settings
import jwt
from datetime import datetime, timedelta


class LoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        try:
            # まずメールアドレスからユーザーを取得
            user = CustomUser.objects.get(email=email)
            # そのユーザーの認証を試みる
            auth_user = authenticate(request, username=user.username, password=password)
            
            if auth_user is not None:
                login(request, auth_user)
                return Response({
                    "message": "Login successful!",
                    "user": {
                        "email": auth_user.email,
                        "username": auth_user.username
                    }
                }, status=status.HTTP_200_OK)
            else:
                return Response({"error": "パスワードが正しくありません。"}, status=status.HTTP_400_BAD_REQUEST)
                
        except CustomUser.DoesNotExist:
            return Response({"error": "このメールアドレスは登録されていません。"}, status=status.HTTP_400_BAD_REQUEST)




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