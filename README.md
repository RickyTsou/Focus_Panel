# Focus_Panel

這是一個測試與 AI 協作的項目，大部分的程式碼都由 Gemini 2.5 Pro 撰寫。說明文章。

Focus_Panel 是一個使用 Django 和 pywebview 技術打造的桌面資訊面板應用程式。它將多個小工具整合在一個可自訂的網格佈局中，旨在提供一個集中化、美觀且實用的資訊中心。應用程式包含備忘錄、計時器、待辦事項列表和本地音樂播放器等功能，並具有動態的背景動畫效果。

## 主要功能

* **備忘錄 (Memo App)**：即時記錄和自動儲存您的筆記和想法。
* **計時器 (Timer App)**：包含開始、停止、重設計時功能。
* **待辦事項 (To-Do List App)**：管理您的任務列表，可標記完成狀態，並自動儲存。
* **音樂播放器 (Audio Player App)**：播放您指定的本機資料夾中的 MP3 音樂檔案。
* **網格佈局介面 (Grid Layout)**：所有小工具均清晰排列在網格中。
* **動態背景 (Animated Background)**：具有平滑的動態背景效果，增添視覺趣味。

## 環境需求

* Python 3.x
* pip (Python 套件安裝器)

## 安裝與設定指南

請依照以下步驟設定並執行 Focus_Panel：

1.  **複製儲存庫**：
    如果您是從 Git 儲存庫取得此專案 (例如 GitHub)，請先複製 (clone) 儲存庫：
    ```bash
    git clone [https://github.com/YOUR_USERNAME/Focus_Panel.git](https://github.com/YOUR_USERNAME/Focus_Panel.git)
    cd Focus_Panel
    ```
    若您是直接下載的原始碼，請解壓縮並進入專案的根目錄 (即包含此 `README.md` 檔案的目錄)。

2.  **建立並啟用虛擬環境** (建議)：
    在專案根目錄下執行：
    ```bash
    python -m venv venv
    ```
    啟用虛擬環境：
    * Windows:
        ```bash
        venv\Scripts\activate
        ```
    * macOS/Linux:
        ```bash
        source venv/bin/activate
        ```

3.  **安裝依賴套件**：
    確保您的虛擬環境已啟用，然後執行：
    ```bash
    pip install -r requirements.txt
    ```

4.  **設定 SECRET_KEY**：
    為了 Django 專案的安全性，您需要設定一個 `SECRET_KEY`。
    * 在 `panel` 資料夾內 (即與 `settings.py` 同層)，手動建立一個名為 `local_settings.py` 的檔案。
    * 開啟 `panel/local_settings.py` 並貼上以下內容，將引號中的值替換成您自己隨機產生的金鑰 (或者，如果您僅在本機使用且了解風險，可以使用專案中原有的金鑰)：
        ```python
        # panel/local_settings.py
        SECRET_KEY = '請在此處填入一個長且隨機的字串作為您的SECRET_KEY'
        ```
        *範例 (不建議直接用於生產或多人環境，但可供本機測試)：*
        `SECRET_KEY = 'django-insecure-y5@l1_*-)0xg4hx+o5(dq*l*86bklf5o@_&k0%0sw9!dpzgbpv'`
5.  **設定音樂資料夾**：
    * 在 `panel` 資料夾內，建立一個名為 `my_music` 的子資料夾 (如果它尚不存在)。
    * 將您想要播放的 `.mp3` 檔案放入 `panel/my_music/` 資料夾中。
6.  **執行 Django 資料庫遷移**：
    在專案的**根目錄** (即包含 `venv` 資料夾和 `panel` 資料夾的那一層) 下執行：
    ```bash
    python panel/manage.py migrate
    ```

## 執行應用程式

一切設定完成後，在專案的**根目錄**下執行以下指令來啟動 Focus_Panel：

```bash
python panel/run_panel.py
```

## 建立 Windows 桌面捷徑

您可以建立一個桌面捷徑，方便快速啟動 Focus_Panel：

1.  **準備路徑**：
    * **Python 執行檔**：指向您虛擬環境中的 `pythonw.exe`。
        * 範例：`D:\Projects\Focus_Panel\venv\Scripts\pythonw.exe`
    * **啟動腳本**：指向專案中 `panel` 資料夾內的 `run_panel.py`。
        * 範例：`D:\Projects\Focus_Panel\panel\run_panel.py`

2.  **建立捷徑**：
    * 在桌面按右鍵 -> 新增 -> 捷徑。
    * **目標(T)**：貼上 `"Python 執行檔路徑" "啟動腳本路徑"` (路徑含空格請用雙引號)。
        * 範例：`"D:\Projects\Focus_Panel\venv\Scripts\pythonw.exe" "D:\Projects\Focus_Panel\panel\run_panel.py"`
    * 下一步，為捷徑命名 (例如：`Focus Panel`)，然後完成。

3.  **設定起始位置 (重要)**：
    * 在捷徑上按右鍵 -> 內容 -> 捷徑 分頁。
    * **起始位置(S)**：填入 `panel` 資料夾的絕對路徑。
        * 範例：`D:\Projects\Focus_Panel\panel\`
    * 套用並確定。

4.  **(選用) 更換圖示**：
    * 在捷徑內容的「捷徑」分頁 -> 變更圖示。

現在您可以雙擊此捷徑啟動應用程式。