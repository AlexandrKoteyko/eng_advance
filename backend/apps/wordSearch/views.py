from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.permissions import IsTeacherOrAdmin, IsTeacherOwnerOrAdmin
from .models import WordSearchPuzzle, UserPuzzleProgress
from .serializers import (
    PuzzleListSerializer, PuzzleDetailSerializer,
    PuzzleCreateSerializer, MarkWordFoundSerializer, MarkDoneSerializer,
)


class PuzzleListView(generics.ListAPIView):
    """GET /api/wordsearch/?language=en&category=wordsearch"""
    serializer_class   = PuzzleListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        user     = self.request.user
        language = self.request.query_params.get("language")
        category = self.request.query_params.get("category")

        if user.is_authenticated and (user.is_teacher or user.is_admin):
            qs = (WordSearchPuzzle.objects.filter(is_public=True) |
                  WordSearchPuzzle.objects.filter(created_by=user)).distinct()
        else:
            qs = WordSearchPuzzle.objects.filter(is_public=True)

        if language:
            qs = qs.filter(language=language)
        if category:
            qs = qs.filter(category=category)

        return qs.order_by("-created_at")


class PuzzleDetailView(generics.RetrieveAPIView):
    """GET /api/wordsearch/<id>/"""
    serializer_class   = PuzzleDetailSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and (user.is_teacher or user.is_admin):
            return (WordSearchPuzzle.objects.filter(is_public=True) |
                    WordSearchPuzzle.objects.filter(created_by=user)).distinct()
        return WordSearchPuzzle.objects.filter(is_public=True)

    def retrieve(self, request, *args, **kwargs):
        instance   = self.get_object()
        serializer = self.get_serializer(instance)
        data       = serializer.data

        if request.user.is_authenticated:
            progress, _ = UserPuzzleProgress.objects.get_or_create(
                user=request.user, puzzle=instance)
            data["progress"] = {
                "found_words": progress.found_words,
                "is_done":     progress.is_done,
            }
        else:
            data["progress"] = None

        return Response(data)


class PuzzleCreateView(generics.CreateAPIView):
    """POST /api/wordsearch/create/ — teacher OR admin"""
    serializer_class   = PuzzleCreateSerializer
    permission_classes = [IsTeacherOrAdmin]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        puzzle = serializer.save()
        return Response(PuzzleDetailSerializer(puzzle).data, status=status.HTTP_201_CREATED)


class PuzzleUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PATCH/DELETE /api/wordsearch/<id>/manage/"""
    serializer_class   = PuzzleCreateSerializer
    permission_classes = [IsTeacherOwnerOrAdmin]
    queryset           = WordSearchPuzzle.objects.all()


class MarkWordFoundView(APIView):
    """POST /api/wordsearch/<id>/found/"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        serializer = MarkWordFoundSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        word = serializer.validated_data["word"].upper()

        try:
            puzzle = WordSearchPuzzle.objects.get(pk=pk, is_public=True)
        except WordSearchPuzzle.DoesNotExist:
            try:
                puzzle = WordSearchPuzzle.objects.get(pk=pk, created_by=request.user)
            except WordSearchPuzzle.DoesNotExist:
                return Response({"detail": "Not found."}, status=404)

        valid_words = list(puzzle.words.values_list("word", flat=True))
        if word not in valid_words:
            return Response({"detail": "Word not in puzzle."}, status=400)

        progress, _ = UserPuzzleProgress.objects.get_or_create(
            user=request.user, puzzle=puzzle)

        if word not in progress.found_words:
            progress.found_words.append(word)

        placed = puzzle.grid_data.get("placed_words", [])
        if set(placed) <= set(progress.found_words):
            progress.is_done     = True
            progress.finished_at = timezone.now()

        progress.save()
        return Response({"found_words": progress.found_words, "is_done": progress.is_done})


class MarkDoneView(APIView):
    """POST /api/wordsearch/<id>/done/"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        serializer = MarkDoneSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        puzzle = WordSearchPuzzle.objects.filter(pk=pk).first()
        if not puzzle:
            return Response({"detail": "Not found."}, status=404)

        progress, _ = UserPuzzleProgress.objects.get_or_create(
            user=request.user, puzzle=puzzle)
        progress.is_done = serializer.validated_data["is_done"]
        if progress.is_done and not progress.finished_at:
            progress.finished_at = timezone.now()
        progress.save()
        return Response({"is_done": progress.is_done})


class ResetProgressView(APIView):
    """POST /api/wordsearch/<id>/reset/ — очистити прогрес"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        puzzle = WordSearchPuzzle.objects.filter(pk=pk).first()
        if not puzzle:
            return Response({"detail": "Not found."}, status=404)

        UserPuzzleProgress.objects.filter(
            user=request.user, puzzle=puzzle
        ).update(found_words=[], is_done=False, finished_at=None)

        return Response({"detail": "Progress reset."})


class MyProgressListView(generics.ListAPIView):
    """GET /api/wordsearch/my-progress/"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class   = PuzzleListSerializer

    def list(self, request, *args, **kwargs):
        progress_qs = UserPuzzleProgress.objects.filter(
            user=request.user).select_related("puzzle")
        result = []
        for p in progress_qs:
            d          = PuzzleListSerializer(p.puzzle).data
            d["is_done"]     = p.is_done
            d["found_words"] = p.found_words
            result.append(d)
        return Response(result)