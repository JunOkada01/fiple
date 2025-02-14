from rest_framework import generics
from .models import Notification
from .serializers import NotificationSerializer

class NotificationListView(generics.ListAPIView):
    queryset = Notification.objects.all().order_by('-created_at')
    serializer_class = NotificationSerializer

from django.shortcuts import render, redirect,get_object_or_404
from .models import Notification
from .forms import NotificationForm
from django.http import JsonResponse

def notifications_list(request):
    notifications = Notification.objects.all().order_by('-created_at')
    if request.method == 'POST':
        form = NotificationForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('notifications_list')
    else:
        form = NotificationForm()
    return render(request, 'notifications/notification_list.html', {'notifications': notifications, 'form': form})

def notification_detail(request, id):
    try:
        notification = get_object_or_404(Notification, id=id)
        return JsonResponse({
            'id': notification.id,
            'title': notification.title,
            'message': notification.message,
            'created_at': notification.created_at,
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    
def notification_form(request):
    if request.method == 'POST':
        form = NotificationForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('notifications_list')
    else:
        form = NotificationForm()
    return render(request, 'notifications/notification_form.html', {'form': form})

def notification_edit(request, id):
    notification = get_object_or_404(Notification, id=id)
    if request.method == 'POST':
        form = NotificationForm(request.POST, instance=notification)
        if form.is_valid():
            form.save()
            return redirect('notifications_list')
    else:
        form = NotificationForm(instance=notification)
    return render(request, 'notifications/notification_form.html', {'form': form})

def notification_delete(request, id):
    notification = get_object_or_404(Notification, id=id)
    if request.method == 'POST':
        notification.delete()
        return redirect('notifications_list')
    return render(request, 'notifications/notification_confirm_delete.html', {'notification': notification})