from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _


class Role(models.TextChoices):
    ADMIN = "admin", _("Адмін")
    TEACHER = "teacher", _("Учитель")
    STUDENT = "student", _("Учень")


class User(AbstractUser):
    """
    Кастомна модель користувача.
    Додає поле role до стандартного AbstractUser.
    """
    email = models.EmailField(_("email address"), unique=True)
    role = models.CharField(
        _("роль"),
        max_length=10,
        choices=Role.choices,
        default=Role.STUDENT,
    )
    avatar = models.ImageField(
        _("аватар"),
        upload_to="avatars/",
        null=True,
        blank=True,
    )
    # Мова інтерфейсу яку вибрав користувач
    preferred_language = models.CharField(
        _("мова інтерфейсу"),
        max_length=5,
        choices=[("uk", "Українська"), ("en", "English"), ("fi", "Suomi")],
        default="uk",
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    class Meta:
        verbose_name = _("користувач")
        verbose_name_plural = _("користувачі")

    def __str__(self):
        return f"{self.email} ({self.get_role_display()})"

    @property
    def is_admin(self):
        return self.role == Role.ADMIN or self.is_superuser

    @property
    def is_teacher(self):
        return self.role == Role.TEACHER

    @property
    def is_student(self):
        return self.role == Role.STUDENT