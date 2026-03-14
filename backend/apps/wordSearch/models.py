from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings


class Language(models.TextChoices):
    ENGLISH  = "en", "English"
    FINNISH  = "fi", "Suomi"
    UKRAINIAN = "uk", "Українська"


class TaskCategory(models.TextChoices):
    """Категорії завдань — для майбутнього розширення."""
    WORDSEARCH = "wordsearch", _("Філворд")
    


class WordSearchPuzzle(models.Model):
    title      = models.CharField(_("назва"), max_length=200)
    language   = models.CharField(_("мова"), max_length=5, choices=Language.choices, default=Language.ENGLISH)
    category   = models.CharField(
        _("категорія"), max_length=20,
        choices=TaskCategory.choices, default=TaskCategory.WORDSEARCH
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name="puzzles", verbose_name=_("автор"),
    )
    is_public  = models.BooleanField(_("публічний"), default=False)
    grid_size  = models.PositiveSmallIntegerField(_("розмір сітки"), default=15)
    grid_data  = models.JSONField(_("дані сітки"), default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("філворд")
        verbose_name_plural = _("філворди")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} ({self.get_language_display()})"


class WordSearchWord(models.Model):
    puzzle = models.ForeignKey(WordSearchPuzzle, on_delete=models.CASCADE, related_name="words")
    word   = models.CharField(_("слово"), max_length=50)
    hint   = models.CharField(_("підказка"), max_length=200, blank=True)

    class Meta:
        verbose_name = _("слово")
        verbose_name_plural = _("слова")

    def __str__(self):
        return self.word


class UserPuzzleProgress(models.Model):
    user        = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="puzzle_progress")
    puzzle      = models.ForeignKey(WordSearchPuzzle, on_delete=models.CASCADE, related_name="progress")
    found_words = models.JSONField(_("знайдені слова"), default=list)
    is_done     = models.BooleanField(_("виконано"), default=False)
    started_at  = models.DateTimeField(auto_now_add=True)
    finished_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = _("прогрес")
        verbose_name_plural = _("прогрес користувачів")
        unique_together = ("user", "puzzle")

    def __str__(self):
        return f"{self.user} — {self.puzzle.title}"