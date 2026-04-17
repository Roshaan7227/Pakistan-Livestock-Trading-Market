from django.contrib import admin
from django.utils.html import format_html
from .models import Contact, Livestock, Favorite, LivestockGallery

admin.site.site_header = "Smart Livestock Admin"
admin.site.site_title = "Smart Livestock Admin Portal"
admin.site.index_title = "Welcome to Smart Livestock Admin Portal"

@admin.register(Livestock)
class LivestockAdmin(admin.ModelAdmin):
    list_display = ('image_preview', 'breed', 'species', 'health', 'location', 'price', 'phone', 'created_at')
    list_filter = ('species', 'health', 'created_at')
    search_fields = ('breed', 'location', 'description')
    readonly_fields = ('created_at', 'updated_at')


    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="max-height: 50px; max-width: 50px;" />', obj.image.url)
        return "No Image"
    image_preview.short_description = 'Image'

@admin.register(LivestockGallery)
class LivestockGalleryAdmin(admin.ModelAdmin):
    list_display = ('livestock', 'image_preview')
    search_fields = ('livestock__breed', 'livestock__species')

    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="max-height: 100px; max-width: 100px;" />', obj.image.url)
        return "No Image"
    image_preview.short_description = 'Image Preview'

@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ('livestock', 'user', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__username', 'livestock__breed', 'livestock__species')

@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'phone', 'user', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('name', 'email', 'phone', 'user__username')
    readonly_fields = ('created_at',)
