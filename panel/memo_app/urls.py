from django.urls import path
from . import views

app_name = 'memo_app'  # 設定 app 的命名空間，方便在模板中引用
urlpatterns = [
    path('get/', views.get_memo, name='get_memo_api'),      # URL: /api/memo/get/
    path('save/', views.save_memo, name='save_memo_api'),    # URL: /api/memo/save/
]