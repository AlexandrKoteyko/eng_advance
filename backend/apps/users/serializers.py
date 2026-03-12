from rest_framework import serializers
from django.contrib.auth import authenticate
from django.utils.translation import gettext_lazy as _
from .models import User, Role


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, label=_("Підтвердження паролю"))

    class Meta:
        model = User
        fields = ["id", "email", "username", "password", "password2", "role", "preferred_language"]
        extra_kwargs = {
            "role": {"default": Role.STUDENT},
        }

    def validate(self, attrs):
        if attrs["password"] != attrs.pop("password2"):
            raise serializers.ValidationError({"password": _("Паролі не збігаються.")})
        # Заборона реєстрації як адмін через API
        if attrs.get("role") == Role.ADMIN:
            raise serializers.ValidationError({"role": _("Роль адміна не можна обрати при реєстрації.")})
        return attrs

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data["email"],
            username=validated_data["username"],
            password=validated_data["password"],
            role=validated_data.get("role", Role.STUDENT),
            preferred_language=validated_data.get("preferred_language", "uk"),
        )
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = authenticate(
            request=self.context.get("request"),
            username=attrs["email"],
            password=attrs["password"],
        )
        if not user:
            raise serializers.ValidationError(_("Неправильний email або пароль."))
        if not user.is_active:
            raise serializers.ValidationError(_("Акаунт деактивовано."))
        attrs["user"] = user
        return attrs


class UserProfileSerializer(serializers.ModelSerializer):
    role_display = serializers.CharField(source="get_role_display", read_only=True)

    class Meta:
        model = User
        fields = [
            "id", "email", "username", "role", "role_display",
            "preferred_language", "avatar", "date_joined",
        ]
        read_only_fields = ["id", "email", "role", "date_joined"]


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)
    new_password2 = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs["new_password"] != attrs["new_password2"]:
            raise serializers.ValidationError({"new_password": _("Паролі не збігаються.")})
        return attrs

    def validate_old_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError(_("Старий пароль невірний."))
        return value

    def save(self):
        user = self.context["request"].user
        user.set_password(self.validated_data["new_password"])
        user.save()
        return user