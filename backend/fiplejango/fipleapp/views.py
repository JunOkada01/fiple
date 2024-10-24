from django.http import HttpResponse
from django.http import JsonResponse
from django.shortcuts import render
from django.contrib.auth.hashers import check_password
from .models import Admin
import json  # jsonモジュールのインポート
from django.utils import timezone  # timezoneのインポート
from django.http import HttpResponse
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
import json
from rest_framework import generics
from .serializers import UserSerializer
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate, login




def data_view(request):
    return JsonResponse({"message": "Hello from Django!!!!"})


def adminlogin_view(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        name = data.get('name')
        password = data.get('password')

        try:
            admin = Admin.objects.get(name=name)
            if check_password(password, admin.password):
                # ログイン成功
                admin.login_date = timezone.now()
                admin.save()
                return JsonResponse({"success": True, "message": "Login successful"})
            else:
                # パスワードが間違っている
                return JsonResponse({"success": False, "message": "Invalid password"}, status=400)
        except Admin.DoesNotExist:
            # 管理者が存在しない
            return JsonResponse({"success": False, "message": "Admin not found"}, status=404)
    return JsonResponse({"error": "Invalid request method"}, status=405)



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
