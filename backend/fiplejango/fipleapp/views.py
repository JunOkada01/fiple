from django.http import HttpResponse
from django.http import JsonResponse
from django.shortcuts import render

def data_view(request):
    return JsonResponse({"message": "Hello from Django!!!!"})

