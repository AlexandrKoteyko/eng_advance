from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings


class Language(models.TextChoices):
    ENGLISH = "en", "English"
    FINNISH = "fi", "Suomi"
    UKRAINIAN = "uk", "Українська"


class WordSearchPuzzle(models.Model):
    """Філворд — набір слів + згенерована сітка."""
    title = models.CharField(_("назва"), max_length=200)
    language = models.CharField(
        _("мова завдання"),
        max_length=5,
        choices=Language.choices,
        default=Language.ENGLISH,
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="puzzles",
        verbose_name=_("автор"),
    )
    is_public = models.BooleanField(_("публічний"), default=False)
    grid_size = models.PositiveSmallIntegerField(_("розмір сітки"), default=15)
    # {"grid": [["A","B",...], ...], "placements": [{"word": "CAT", "row": 0, "col": 2, "direction": "H"}, ...]}
    grid_data = models.JSONField(_("дані сітки"), default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("філворд")
        verbose_name_plural = _("філворди")
        ordering = ["-created_at"]

    def __str__(self):
        status = "публічний" if self.is_public else "приватний"
        return f"{self.title} ({self.get_language_display()}) — {status}"


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


class UserPuzzleProgress(models.Model):
    """
    Прогрес залогіненого користувача по конкретному філворду.
    Для гостей — localStorage на фронтенді.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="puzzle_progress",
    )
    puzzle = models.ForeignKey(
        WordSearchPuzzle,
        on_delete=models.CASCADE,
        related_name="progress",
    )
    found_words = models.JSONField(_("знайдені слова"), default=list)
    is_done = models.BooleanField(_("позначено як виконане"), default=False)
    started_at = models.DateTimeField(auto_now_add=True)
    finished_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = _("прогрес")
        verbose_name_plural = _("прогрес користувачів")
        unique_together = ("user", "puzzle")

    def __str__(self):
        return f"{self.user} — {self.puzzle.title}"