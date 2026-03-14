"""
Django template views для HTML сторінок філворду.
API views (DRF) — в окремому файлі views.py
"""
from django.shortcuts import render
from django.views import View


class WordSearchListPageView(View):
    """GET /wordsearch/"""
    def get(self, request):
        return render(request, 'wordsearch/list.html')


class WordSearchPlayPageView(View):
    """GET /wordsearch/<id>/"""
    def get(self, request, pk):
        return render(request, 'wordsearch/play.html', {'puzzle_id': pk})


class WordSearchCreatePageView(View):
    """GET /wordsearch/create/"""
    def get(self, request):
        return render(request, 'wordsearch/create.html')