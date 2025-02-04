from django.contrib import admin
from .models import *

# Register your models here.

@admin.register(QuestionCategory)
class QuestionCategoryAdmin(admin.ModelAdmin):
    list_display = ('name',)

@admin.register(FAQ)
class FAQAdmin(admin.ModelAdmin):
    list_display = ('question', 'category')
    list_filter = ('category',)
    search_fields = ('question', 'answer')

@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'created_at')
    search_fields = ('name', 'message')

@admin.register(ContactCategory)
class ContactCategoryAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('product', 'rating', 'user', 'subject', 'review_detail')

@admin.register(Size)
class SizeAdmin(admin.ModelAdmin):
    list_display = ('size_name', 'order', 'created_at', 'updated_at', 'admin_user')
    ordering = ('order',)
    list_editable = ('order',)  # リスト画面で「order」を直接編集可能にする

"""
売上管理
"""
@admin.register(SalesRecord)
class SalesRecordAdmin(admin.ModelAdmin):
    list_display = ('user', 'product', 'quantity', 'total_price', 'tax_amount', 'sale_date')
    list_filter = ('sale_date', 'payment_method')
    search_fields = ('product__product_origin__product_name', 'user__username')
    
@admin.register(Banner)
class BannerAdmin(admin.ModelAdmin):
    list_display = ('id', 'link', 'created_at', 'updated_at', 'admin_user')
    search_fields = ('link',)

admin.site.register(CustomUser)
admin.site.register(AdminUser)
admin.site.register(Category)
admin.site.register(SubCategory)
admin.site.register(Color)
admin.site.register(ProductOrigin)
admin.site.register(Product)
admin.site.register(Tag)
admin.site.register(ProductTag)
admin.site.register(ProductImage)
admin.site.register(Cart)
admin.site.register(Favorite)
admin.site.register(DeliveryAddress)
admin.site.register(Order)
admin.site.register(OrderItem)
admin.site.register(Shipping)
admin.site.register(Delivery)
admin.site.register(DeliveryStatusLog)
