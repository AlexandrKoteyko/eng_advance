"""
Генератор сітки для філворду.
Підтримує горизонтальне (H) та вертикальне (V) розміщення слів.
Спільні букви між словами дозволені якщо вони збігаються.
"""
import random
import string


DIRECTIONS = [
    ("H", 0, 1),   # горизонтально →
    ("V", 1, 0),   # вертикально ↓
]

FILL_LETTERS = string.ascii_uppercase


def generate_grid(words: list[str], grid_size: int = 15) -> dict:
    """
    Генерує сітку філворду.

    Args:
        words: список слів (будуть приведені до uppercase)
        grid_size: розмір сітки N×N

    Returns:
        {
            "grid": [[char, ...], ...],          # N×N матриця
            "placements": [                       # куди потрапило кожне слово
                {"word": "CAT", "row": 0, "col": 2, "direction": "H"},
                ...
            ],
            "placed_words": ["CAT", ...],         # слова що вдалося розмістити
            "skipped_words": ["TOOLONGWORD"],     # слова що не влізли
        }
    """
    words_upper = [w.strip().upper() for w in words if w.strip()]

    # Авторозмір: мінімум щоб вмістити найдовше слово + запас
    max_word_len = max((len(w) for w in words_upper), default=5)
    size = max(grid_size, max_word_len + 2)

    grid = [["" for _ in range(size)] for _ in range(size)]
    placements = []
    placed_words = []
    skipped_words = []

    # Сортуємо: спочатку довгі — легше розміщувати
    sorted_words = sorted(words_upper, key=len, reverse=True)

    for word in sorted_words:
        placed = _try_place_word(grid, word, size)
        if placed:
            placements.append(placed)
            placed_words.append(word)
        else:
            skipped_words.append(word)

    # Заповнюємо порожні клітинки випадковими буквами
    for r in range(size):
        for c in range(size):
            if grid[r][c] == "":
                grid[r][c] = random.choice(FILL_LETTERS)

    return {
        "grid": grid,
        "placements": placements,
        "placed_words": placed_words,
        "skipped_words": skipped_words,
        "size": size,
    }


def _try_place_word(grid: list, word: str, size: int, attempts: int = 100) -> dict | None:
    """
    Пробує розмістити слово в сітці за attempts спроб.
    Повертає placement dict або None якщо не вийшло.
    """
    for _ in range(attempts):
        direction_name, dr, dc = random.choice(DIRECTIONS)

        # Максимальна стартова позиція щоб слово влізло
        max_row = size - len(word) * dr if dr > 0 else size - 1
        max_col = size - len(word) * dc if dc > 0 else size - 1

        if max_row < 0 or max_col < 0:
            continue

        row = random.randint(0, max_row)
        col = random.randint(0, max_col)

        if _can_place(grid, word, row, col, dr, dc):
            _do_place(grid, word, row, col, dr, dc)
            return {
                "word": word,
                "row": row,
                "col": col,
                "direction": direction_name,
            }

    return None


def _can_place(grid: list, word: str, row: int, col: int, dr: int, dc: int) -> bool:
    """Перевіряє чи можна розмістити слово без конфліктів (спільні букви дозволені)."""
    for i, letter in enumerate(word):
        r = row + i * dr
        c = col + i * dc
        cell = grid[r][c]
        if cell != "" and cell != letter:
            return False
    return True


def _do_place(grid: list, word: str, row: int, col: int, dr: int, dc: int) -> None:
    """Записує слово в сітку."""
    for i, letter in enumerate(word):
        grid[row + i * dr][col + i * dc] = letter