from rest_framework import serializers
from .models import WordSearchPuzzle, WordSearchWord, UserPuzzleProgress


class WordSearchWordSerializer(serializers.ModelSerializer):
    class Meta:
        model = WordSearchWord
        fields = ["id", "word", "hint"]


class PuzzleListSerializer(serializers.ModelSerializer):
    """Коротка версія для списку завдань."""
    language_display = serializers.CharField(source="get_language_display", read_only=True)
    author = serializers.CharField(source="created_by.username", read_only=True)
    word_count = serializers.IntegerField(source="words.count", read_only=True)

    class Meta:
        model = WordSearchPuzzle
        fields = [
            "id", "title", "language", "language_display",
            "author", "word_count", "is_public", "created_at",
        ]


class PuzzleDetailSerializer(serializers.ModelSerializer):
    """Повна версія для гри — включає сітку та слова."""
    language_display = serializers.CharField(source="get_language_display", read_only=True)
    author = serializers.CharField(source="created_by.username", read_only=True)
    words = WordSearchWordSerializer(many=True, read_only=True)

    class Meta:
        model = WordSearchPuzzle
        fields = [
            "id", "title", "language", "language_display",
            "author", "is_public", "grid_data", "words", "created_at",
        ]


class PuzzleCreateSerializer(serializers.ModelSerializer):
    """Для створення філворду вчителем/адміном."""
    words = serializers.ListField(
        child=serializers.DictField(),  # [{word, hint?}]
        write_only=True,
        min_length=2,
    )

    class Meta:
        model = WordSearchPuzzle
        fields = ["id", "title", "language", "is_public", "grid_size", "words"]

    def validate_words(self, value):
        for item in value:
            if not item.get("word", "").strip():
                raise serializers.ValidationError("Кожне слово має бути непорожнім.")
        return value

    def create(self, validated_data):
        from .generator import generate_grid

        words_data = validated_data.pop("words")
        word_strings = [item["word"] for item in words_data]

        # Генеруємо сітку
        grid_result = generate_grid(word_strings, validated_data.get("grid_size", 15))

        puzzle = WordSearchPuzzle.objects.create(
            **validated_data,
            created_by=self.context["request"].user,
            grid_data=grid_result,
        )

        # Зберігаємо слова
        WordSearchWord.objects.bulk_create([
            WordSearchWord(
                puzzle=puzzle,
                word=item["word"].strip().upper(),
                hint=item.get("hint", ""),
            )
            for item in words_data
        ])

        return puzzle


class ProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPuzzleProgress
        fields = ["id", "puzzle", "found_words", "is_done", "started_at", "finished_at"]
        read_only_fields = ["id", "started_at"]


class MarkWordFoundSerializer(serializers.Serializer):
    word = serializers.CharField()


class MarkDoneSerializer(serializers.Serializer):
    is_done = serializers.BooleanField()