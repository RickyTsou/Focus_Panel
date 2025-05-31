from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt # 為了簡化，暫時禁用CSRF
from .models import TodoSlot
import json

def get_todo_slots(request):
    """
    獲取所有待辦事項格子數據的 API。
    """
    slots_data = []
    # 假設我們固定有5個格子，如果資料庫中不存在則創建它們
    # 更好的做法是在 app 首次加載時或通過管理命令初始化這些格子
    NUMBER_OF_SLOTS = 5 # 與您模板中預設的格子數量一致
    for i in range(NUMBER_OF_SLOTS):
        slot, created = TodoSlot.objects.get_or_create(slot_index=i, defaults={'text': '', 'completed': False})
        slots_data.append({'slot_index': slot.slot_index, 'text': slot.text, 'completed': slot.completed})

    return JsonResponse(slots_data, safe=False) # safe=False 因為我們返回的是一個列表

@csrf_exempt # 生產環境應使用 CSRF token
def save_todo_slots(request):
    """
    儲存所有待辦事項格子數據的 API。
    前端應發送一個包含所有格子數據的列表。
    """
    if request.method == 'POST':
        try:
            data = json.loads(request.body) # 預期 data 是一個列表，例如 [{slot_index: 0, text: "...", completed: false}, ...]

            if not isinstance(data, list):
                return JsonResponse({'status': 'error', 'message': '請求數據應為列表格式'}, status=400)

            updated_slots = []
            for slot_data in data:
                slot_index = slot_data.get('slot_index')
                text = slot_data.get('text', '')
                completed = slot_data.get('completed', False)

                if slot_index is not None:
                    slot, created = TodoSlot.objects.update_or_create(
                        slot_index=slot_index,
                        defaults={'text': text, 'completed': completed}
                    )
                    updated_slots.append({'slot_index': slot.slot_index, 'text': slot.text, 'completed': slot.completed})

            return JsonResponse({'status': 'success', 'message': '待辦事項已儲存到伺服器！', 'updated_slots': updated_slots})
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': '無效的請求數據 (非JSON)'}, status=400)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': f'儲存失敗: {str(e)}'}, status=500)
    return JsonResponse({'status': 'error', 'message': '僅支援 POST 方法'}, status=405)