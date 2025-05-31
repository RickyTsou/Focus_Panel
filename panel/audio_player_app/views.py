from django.http import JsonResponse
from django.conf import settings
import os

def list_audio_files(request):
    """
    掃描 settings 中 AUDIO_PLAYER_MUSIC_DIR 指定的目錄，
    並回傳 .mp3 檔案的列表。
    """
    music_dir = settings.AUDIO_PLAYER_MUSIC_DIR
    audio_files = []
    if not os.path.exists(music_dir):
        return JsonResponse({'error': f'音樂目錄找不到： {music_dir}'}, status=500)
    if not os.path.isdir(music_dir):
        return JsonResponse({'error': f'指定的路徑不是一個目錄： {music_dir}'}, status=500)

    for filename in os.listdir(music_dir):
        if filename.lower().endswith('.mp3'):
            audio_files.append(filename)
    
    audio_files.sort() # 可選：按字母順序排序檔案
    return JsonResponse({'files': audio_files})