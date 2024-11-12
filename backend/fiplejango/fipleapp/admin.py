
from django.contrib import admin
from .models import CustomUser
from django.contrib import admin
from.models import *
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


admin.site.register(CustomUser)
admin.site.register(AdminUser)
admin.site.register(Category)
admin.site.register(SubCategory)
admin.site.register(Color)
admin.site.register(Size)
admin.site.register(ProductOrigin)
admin.site.register(Product)
admin.site.register(Tag)
admin.site.register(ProductTag)
admin.site.register(ProductImage)
admin.site.register(Cart)
admin.site.register(Favorite)
admin.site.register(PaymentMethod)
admin.site.register(DeliveryAddress)
admin.site.register(Purchase)
admin.site.register(PurchaseItem)



