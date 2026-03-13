from django.contrib import admin
from .models import WordSearchPuzzle, WordSearchWord, UserPuzzleProgress


class WordSearchWordInline(admin.TabularInline):
    model = WordSearchWord
    extra = 3


@admin.register(WordSearchPuzzle)
class WordSearchPuzzleAdmin(admin.ModelAdmin):
    list_display = ["title", "language", "created_by", "is_public", "created_at"]
    list_filter = ["language", "is_public"]
    search_fields = ["title", "created_by__email"]
    inlines = [WordSearchWordInline]
    readonly_fields = ["grid_data", "created_at", "updated_at"]


@admin.register(UserPuzzleProgress)
class UserPuzzleProgressAdmin(admin.ModelAdmin):
    list_display = ["user", "puzzle", "is_done", "started_at"]
    list_filter = ["is_done"]