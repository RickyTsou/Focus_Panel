from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt # 為了簡化，暫時禁用CSRF，生產環境需謹慎
from .models import Memo
import json

# 為了簡化，我們假設系統中只有一個全局備忘錄，或者始終操作 ID 為 1 的備忘錄。
# 更完善的系統會基於用戶或其他標識來區分不同的備忘錄。

def get_memo(request):
    """
    獲取備忘錄內容的 API 視圖。
    """
    # 嘗試獲取 ID 為 1 的備忘錄，如果不存在，則 content 為空
    memo, created = Memo.objects.get_or_create(pk=1, defaults={'content': ''})
    return JsonResponse({'content': memo.content})

@csrf_exempt
def save_memo(request):
    """
    儲存備忘錄內容的 API 視圖。
    """
    if request.method == 'POST':
        try:
            data = json.loads(request.body) # 從請求體中獲取 JSON 數據
            content = data.get('content', '')

            # 獲取或創建 ID 為 1 的備忘錄，並更新其內容
            memo, created = Memo.objects.get_or_create(pk=1)
            memo.content = content
            memo.save()

            return JsonResponse({'status': 'success', 'message': '備忘已儲存到伺服器！'})
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': '無效的請求數據 (非JSON)'}, status=400)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': f'儲存失敗: {str(e)}'}, status=500)
    return JsonResponse({'status': 'error', 'message': '僅支援 POST 方法'}, status=405)