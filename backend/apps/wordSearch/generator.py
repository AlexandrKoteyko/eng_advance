"""
Генератор сітки для філворду.
Горизонтально (H) та вертикально (V) — рівномірний розподіл.
"""
import random
import string

FILL_LETTERS = string.ascii_uppercase


def parse_words(raw: str | list) -> list[str]:
    """
    Приймає або список, або рядок з комами/крапками з комою/пробілами.
    Повертає список слів у верхньому регістрі.
    """
    if isinstance(raw, list):
        words = raw
    else:
        # Замінюємо крапку з комою та пробіл на кому і сплітимо
        raw = raw.replace(';', ',').replace('\n', ',')
        words = [w.strip() for w in raw.split(',')]
    return [w.strip().upper() for w in words if w.strip()]


def generate_grid(words: list | str, grid_size: int = 15) -> dict:
    """
    Генерує сітку філворду.
    words може бути списком або рядком через кому.
    """
    words_list = parse_words(words)

    max_len = max((len(w) for w in words_list), default=5)
    size = max(grid_size, max_len + 3)
    size = min(size, 20)  # не більше 20x20

    grid = [["" for _ in range(size)] for _ in range(size)]
    placements = []
    placed_words = []
    skipped_words = []

    # Сортуємо — спочатку довгі
    sorted_words = sorted(words_list, key=len, reverse=True)

    for word in sorted_words:
        placed = _try_place(grid, word, size)
        if placed:
            placements.append(placed)
            placed_words.append(word)
        else:
            skipped_words.append(word)

    # Заповнюємо порожні клітинки
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


def _try_place(grid: list, word: str, size: int, attempts: int = 150) -> dict | None:
    """
    Намагається розмістити слово. Строго чергує H/V для рівномірного розподілу.
    """
    directions = [("H", 0, 1), ("V", 1, 0)]

    for attempt in range(attempts):
        # Суворо чергуємо напрямок по номеру спроби → 50/50
        direction_name, dr, dc = directions[attempt % 2]

        max_row = size - len(word) * dr if dr > 0 else size - 1
        max_col = size - len(word) * dc if dc > 0 else size - 1

        if max_row < 0 or max_col < 0:
            continue

        row = random.randint(0, max_row)
        col = random.randint(0, max_col)

        if _can_place(grid, word, row, col, dr, dc):
            _do_place(grid, word, row, col, dr, dc)
            return {"word": word, "row": row, "col": col, "direction": direction_name}

    return None


def _can_place(grid, word, row, col, dr, dc) -> bool:
    for i, letter in enumerate(word):
        r, c = row + i * dr, col + i * dc
        cell = grid[r][c]
        if cell != "" and cell != letter:
            return False
    return True


def _do_place(grid, word, row, col, dr, dc):
    for i, letter in enumerate(word):
        grid[row + i * dr][col + i * dc] = letter