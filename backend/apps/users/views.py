from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from django.contrib.auth import login, logout
from django.utils.translation import gettext_lazy as _

from .models import User
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    UserProfileSerializer,
    ChangePasswordSerializer,
)
from .permissions import IsAdminRole


# ──────────────────────────────────────────────
# Реєстрація
# ──────────────────────────────────────────────
class RegisterView(generics.CreateAPIView):
    """POST /api/users/register/"""
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        # Видаємо JWT одразу після реєстрації
        refresh = RefreshToken.for_user(user)
        return Response({
            "user": UserProfileSerializer(user).data,
            "tokens": {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            },
        }, status=status.HTTP_201_CREATED)


# ──────────────────────────────────────────────
# Логін — JWT + Session одночасно
# ──────────────────────────────────────────────
class LoginView(APIView):
    """POST /api/users/login/"""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]

        # JWT токени
        refresh = RefreshToken.for_user(user)

        # Сесія (для Django templates / SSR)
        login(request, user)

        return Response({
            "user": UserProfileSerializer(user).data,
            "tokens": {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            },
        })


# ──────────────────────────────────────────────
# Логаут
# ──────────────────────────────────────────────
class LogoutView(APIView):
    """POST /api/users/logout/  — надсилай refresh token у body"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        # Інвалідуємо JWT refresh token
        refresh_token = request.data.get("refresh")
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except Exception:
                pass  # вже інвалідований або невірний

        # Завершуємо сесію
        logout(request)

        return Response({"detail": _("Успішно вийшли.")}, status=status.HTTP_200_OK)


# ──────────────────────────────────────────────
# Профіль поточного користувача
# ──────────────────────────────────────────────
class MeView(generics.RetrieveUpdateAPIView):
    """GET / PATCH /api/users/me/"""
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


# ──────────────────────────────────────────────
# Зміна паролю
# ──────────────────────────────────────────────
class ChangePasswordView(APIView):
    """POST /api/users/change-password/"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": _("Пароль змінено.")})


# ──────────────────────────────────────────────
# Список користувачів (тільки адмін)
# ──────────────────────────────────────────────
class UserListView(generics.ListAPIView):
    """GET /api/users/  — тільки адмін"""
    queryset = User.objects.all().order_by("-date_joined")
    serializer_class = UserProfileSerializer
    permission_classes = [IsAdminRole]