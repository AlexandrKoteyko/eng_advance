from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdminRole(BasePermission):
    """Тільки адміни."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_admin)


class IsTeacherOrAdmin(BasePermission):
    """Учителі та адміни."""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.is_teacher or request.user.is_admin)
        )


class IsStudentOrAbove(BasePermission):
    """Будь-який авторизований користувач."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)


class IsOwnerOrAdmin(BasePermission):
    """Власник об'єкту або адмін."""
    def has_object_permission(self, request, view, obj):
        if request.user.is_admin:
            return True
        # obj повинен мати поле user або created_by
        owner = getattr(obj, "user", None) or getattr(obj, "created_by", None)
        return owner == request.user


class IsTeacherOwnerOrAdmin(BasePermission):
    """Учитель-власник або адмін (для редагування завдань)."""
    def has_object_permission(self, request, view, obj):
        if request.user.is_admin:
            return True
        if request.method in SAFE_METHODS:
            return True
        owner = getattr(obj, "created_by", None)
        return request.user.is_teacher and owner == request.user