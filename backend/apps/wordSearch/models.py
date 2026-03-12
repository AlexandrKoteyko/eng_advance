from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.users.models import User


class Language(models.TextChoices):
    ENGLISH = "en", "English"
    FINNISH = "fi", "Suomi"
    UKRAINIAN = "uk", "Українська"


class WordSearchPuzzle(models.Model):
    """
    Філворд — набір слів + згенерована сітка.
    """
    title = models.CharField(_("назва"), max_length=200)
    language = models.CharField(
        _("мова завдання"),
        max_length=5,
        choices=Language.choices,
        default=Language.ENGLISH,
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="puzzles",
        verbose_name=_("автор"),
    )
    is_public = models.BooleanField(_("публічний"), default=False)
    grid_size = models.PositiveSmallIntegerField(_("розмір сітки"), default=15)
    # JSON: {"grid": [[...]], "words": [...], "placements": [...]}
    grid_data = models.JSONField(_("дані сітки"), default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("філворд")
        verbose_name_plural = _("філворди")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} ({self.get_language_display()}) — {'публічний' if self.is_public else 'приватний'}"


class WordSearchWord(models.Model):
    """Слова які учитель додає до філворда."""
    puzzle = models.ForeignKey(
        WordSearchPuzzle,
        on_delete=models.CASCADE,
        related_name="words",
    )
    word = models.CharField(_("слово"), max_length=50)
    hint = models.CharField(_("підказка"), max_length=200, blank=True)

    class Meta:
        verbose_name = _("слово")
        verbose_name_plural = _("слова")

    def __str__(self):
        return self.word


class WordSearchAttempt(models.Model):
    """Результат проходження філворда учнем."""
    puzzle = models.ForeignKey(WordSearchPuzzle, on_delete=models.CASCADE, related_name="attempts")
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)  # null = гість
    found_words = models.JSONField(default=list)  # список знайдених слів
    completed = models.BooleanField(default=False)
    started_at = models.DateTimeField(auto_now_add=True)
    finished_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = _("спроба")
        verbose_name_plural = _("спроби")