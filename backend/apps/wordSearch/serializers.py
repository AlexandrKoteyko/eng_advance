from rest_framework import serializers
from .models import WordSearchPuzzle, WordSearchWord, UserPuzzleProgress
from .generator import parse_words


class WordSearchWordSerializer(serializers.ModelSerializer):
    class Meta:
        model = WordSearchWord
        fields = ["id", "word", "hint"]


class PuzzleListSerializer(serializers.ModelSerializer):
    language_display = serializers.CharField(source="get_language_display", read_only=True)
    category_display = serializers.CharField(source="get_category_display", read_only=True)
    author           = serializers.CharField(source="created_by.username", read_only=True)
    word_count       = serializers.IntegerField(source="words.count", read_only=True)

    class Meta:
        model  = WordSearchPuzzle
        fields = ["id", "title", "language", "language_display", "category", "category_display",
                  "author", "word_count", "is_public", "created_at"]


class PuzzleDetailSerializer(serializers.ModelSerializer):
    language_display = serializers.CharField(source="get_language_display", read_only=True)
    author           = serializers.CharField(source="created_by.username", read_only=True)
    words            = WordSearchWordSerializer(many=True, read_only=True)

    class Meta:
        model  = WordSearchPuzzle
        fields = ["id", "title", "language", "language_display", "category",
                  "author", "is_public", "grid_data", "words", "created_at"]


class PuzzleCreateSerializer(serializers.ModelSerializer):
    """
    words може бути:
      - список об'єктів: [{"word": "CAT", "hint": ""}, ...]
      - рядок через кому: "CAT, DOG, BIRD"
    """
    words = serializers.JSONField(write_only=True)

    class Meta:
        model  = WordSearchPuzzle
        fields = ["id", "title", "language", "is_public", "grid_size", "words"]

    def validate_words(self, value):
        # Підтримуємо рядок через кому
        if isinstance(value, str):
            words_list = parse_words(value)
            value = [{"word": w, "hint": ""} for w in words_list]

        if not isinstance(value, list) or len(value) < 2:
            raise serializers.ValidationError("Додайте хоча б 2 слова.")

        for item in value:
            if isinstance(item, str):
                item = {"word": item, "hint": ""}
            if not item.get("word", "").strip():
                raise serializers.ValidationError("Кожне слово має бути непорожнім.")
        return value

    def create(self, validated_data):
        from .generator import generate_grid

        words_data  = validated_data.pop("words")
        # Нормалізуємо — підтримуємо і рядки, і dict
        word_items  = [
            item if isinstance(item, dict) else {"word": item, "hint": ""}
            for item in words_data
        ]
        word_strings = [i["word"] for i in word_items]

        grid_result = generate_grid(word_strings, validated_data.get("grid_size", 15))

        puzzle = WordSearchPuzzle.objects.create(
            **validated_data,
            created_by=self.context["request"].user,
            grid_data=grid_result,
        )

        WordSearchWord.objects.bulk_create([
            WordSearchWord(
                puzzle=puzzle,
                word=item["word"].strip().upper(),
                hint=item.get("hint", ""),
            )
            for item in word_items
        ])
        return puzzle


class MarkWordFoundSerializer(serializers.Serializer):
    word = serializers.CharField()


class MarkDoneSerializer(serializers.Serializer):
    is_done = serializers.BooleanField()