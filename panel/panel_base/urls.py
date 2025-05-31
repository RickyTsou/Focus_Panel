# panel/panel_base/urls.py
from django.urls import path
from . import views

app_name = 'panel_base' # 建議為 app 的 URL 設定命名空間
urlpatterns = [
    path('', views.panel_display_view, name='panel_home'), # 將 app 的根 URL 指向 pannel_display_view
]