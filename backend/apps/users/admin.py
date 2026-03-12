from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ["email", "username", "role", "preferred_language", "is_active", "date_joined"]
    list_filter = ["role", "is_active", "preferred_language"]
    search_fields = ["email", "username"]
    ordering = ["-date_joined"]

    fieldsets = BaseUserAdmin.fieldsets + (
        (_("Додаткові поля"), {"fields": ("role", "avatar", "preferred_language")}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        (_("Додаткові поля"), {"fields": ("email", "role", "preferred_language")}),
    )