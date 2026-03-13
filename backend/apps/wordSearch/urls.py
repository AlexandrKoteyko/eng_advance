from django.urls import path
from .views import (
    PuzzleListView, PuzzleDetailView, PuzzleCreateView,
    PuzzleUpdateDeleteView, MarkWordFoundView, MarkDoneView, MyProgressListView,
)
from .page_views import (
    WordSearchListPageView, WordSearchPlayPageView, WordSearchCreatePageView,
)

# HTML page routes — підключити в головному urls.py через page_urlpatterns
page_urlpatterns = [
    path('wordsearch/', WordSearchListPageView.as_view(), name='ws-list-page'),
    path('wordsearch/create/', WordSearchCreatePageView.as_view(), name='ws-create-page'),
    path('wordsearch/<int:pk>/', WordSearchPlayPageView.as_view(), name='ws-play-page'),
]

# DRF API routes
urlpatterns = [
    path("", PuzzleListView.as_view(), name="puzzle-list"),
    path("create/", PuzzleCreateView.as_view(), name="puzzle-create"),
    path("my-progress/", MyProgressListView.as_view(), name="my-progress"),
    path("<int:pk>/", PuzzleDetailView.as_view(), name="puzzle-detail"),
    path("<int:pk>/manage/", PuzzleUpdateDeleteView.as_view(), name="puzzle-manage"),
    path("<int:pk>/found/", MarkWordFoundView.as_view(), name="mark-word-found"),
    path("<int:pk>/done/", MarkDoneView.as_view(), name="mark-done"),
]