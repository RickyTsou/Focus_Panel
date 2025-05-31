import webview
import threading
import subprocess
import sys
import time

# 假設您的Django專案與此腳本在同一級目錄的 'my_django_project' 資料夾中
# 或者 manage.py 在當前目錄
DJANGO_MANAGE_PY_PATH = 'manage.py' # 或 'my_django_project/manage.py'
PORT_TO_USE = '8080' # 確保這個埠號是您 Django runserver 設定的埠號

def run_django_server():
    # 啟動Django開發伺服器
    try:
        print(f"嘗試在埠 {PORT_TO_USE} 上啟動 Django 伺服器...")
        proc = subprocess.Popen([sys.executable, DJANGO_MANAGE_PY_PATH, 'runserver', PORT_TO_USE, '--noreload'])
        # proc.wait() # 如果希望阻塞直到Django伺服器關閉
    except FileNotFoundError:
        print(f"錯誤：找不到 Django manage.py。請確保路徑 '{DJANGO_MANAGE_PY_PATH}' 正確。")
    except Exception as e:
        print(f"啟動 Django 伺服器時發生錯誤: {e}")


if __name__ == '__main__':
    django_thread = threading.Thread(target=run_django_server, daemon=True)
    django_thread.start()

    print("等待 Django 伺服器啟動...")
    # 這裡可以加入更可靠的伺服器啟動檢查機制，例如嘗試連接埠號
    time.sleep(1)

    window_title = 'Panel'
    django_app_url = f'http://127.0.0.1:{PORT_TO_USE}/'

    try:
        # 創建一個無邊框且置頂的 PyWebView 視窗
        window = webview.create_window(
            window_title,
            django_app_url,
            width=1080,          # 您可以調整預設寬高
            height=750,
            frameless=False,     # 移除視窗邊框和標題列
            on_top=True,        # 視窗總在最前
            easy_drag=True,    # 如果希望無邊框視窗仍可拖動 (通常拖動標題列，現在沒有了，但easy_drag允許拖動內容)
                                # 注意：easy_drag 可能會影響網頁內容的某些交互，需要測試
            resizable=True     # 您可能希望無邊框懸浮視窗不可調整大小
        )

        # 監聽關閉事件，確保 Django 伺服器也能被妥善處理 (如果需要)
        # def on_closed():
        #     print('PyWebView 視窗已關閉')
        #     # 在這裡可以加入停止 Django 伺服器的邏輯，但比較複雜
        #     # 因為 subprocess.Popen 在不同線程，可能需要 proc.terminate() 或 proc.kill()
        # window.events.closed += on_closed

        webview.start() # 開啟 debug=True 有助於查看更多日誌或錯誤訊息

    except Exception as e:
        print(f"創建 PyWebView 視窗時發生錯誤: {e}")
        print("請確保您的圖形環境已正確設置，並且安裝了 PyWebView 所需的依賴項。")

    print("PyWebView 主循環已結束。")