from django.contrib import admin
from .models import Admin

@admin.register(Admin)
class AdminAdmin(admin.ModelAdmin):
    list_display = ('admin_id', 'name', 'login_date')  # 一覧表示するフィールド
    search_fields = ('name',)  # 検索可能なフィールド
    ordering = ('login_date',)  # ソート順

    # 詳細表示をカスタマイズするためのメソッド
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        # ここに追加のフィルタリングを行うロジックを追加することも可能
        return qs
