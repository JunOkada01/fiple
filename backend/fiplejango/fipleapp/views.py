from django.http import HttpResponse
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
import json
from rest_framework import generics
from .models import CustomUser
from .serializers import UserSerializer

def data_view(request):
    return JsonResponse({"message": "Hello from Django!!!!"})

def user_list(request):
    users = CustomUser.objects.all().values('id', 'username', 'email')  # 必要なフィールドだけを取得
    return JsonResponse(list(users), safe=False)

class UserCreate(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer