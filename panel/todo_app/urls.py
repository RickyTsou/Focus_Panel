from django.urls import path
from . import views

app_name = 'todo_app'
urlpatterns = [
    path('get_slots/', views.get_todo_slots, name='get_todo_slots_api'),
    path('save_slots/', views.save_todo_slots, name='save_todo_slots_api'),
]