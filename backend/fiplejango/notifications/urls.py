from django.urls import path
from notifications.views import NotificationListView,notification_detail,notification_form,notification_edit,notification_delete,notifications_list

urlpatterns = [
    path('', NotificationListView.as_view(), name='notification_list'),
    path('<int:id>/', notification_detail, name='notification_detail'),
    path('form/', notification_form, name='notification_form'), 
    path('edit/<int:id>/', notification_edit, name='notification_edit'),
    path('delete/<int:id>/', notification_delete, name='notification_delete'),
    path('list/', notifications_list, name='notifications_list'),
    
]