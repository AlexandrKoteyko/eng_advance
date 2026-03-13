from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from .page_views import HomeView, LoginPageView, RegisterPageView, AccountPageView
from apps.wordSearch.urls import page_urlpatterns as ws_pages

urlpatterns = [
    path('i18n/', include('django.conf.urls.i18n')),
    path('admin/', admin.site.urls),

    # HTML Pages
    path('', HomeView.as_view(), name='home'),
    path('login/', LoginPageView.as_view(), name='login'),
    path('register/', RegisterPageView.as_view(), name='register'),
    path('account/', AccountPageView.as_view(), name='account'),
    *ws_pages,

    # API
    path('api/users/', include('apps.users.urls')),
    path('api/wordsearch/', include('apps.wordSearch.urls')),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)