from django.urls import path
from . import views

app_name = 'audio_player_app' # Django 內部使用的應用程式命名空間
urlpatterns = [
    path('list_files/', views.list_audio_files, name='list_files_api'), # API 端點名稱
]