from django.contrib import admin
from .models import CustomUser, QuestionCategory, FAQ, Contact, ContactCategory, Review, AdminUser, Category, SubCategory, Color, Size, ProductOrigin, Product, Tag, ProductTag, ProductImage, Cart, Favorite, DeliveryAddress, Order, OrderItem

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
    list_display = ('product', 'rating', 'user', 'subject', 'review_detail',)

# Registering other models
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
# admin.site.register(PaymentMethod)
admin.site.register(DeliveryAddress)
admin.site.register(Order)
admin.site.register(OrderItem)



admin.site.register(Cart)
admin.site.register(Favorite)
