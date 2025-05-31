// panel/memo_app/static/memo_app/js/memo_handler.js

function initializeMemoApp(textareaId, getMemoUrl, saveMemoUrl) {
    const memoInput = document.getElementById(textareaId);
    if (!memoInput) {
        console.error('Memo textarea not found with ID:', textareaId);
        return;
    }

    let saveTimer;
    const saveDelay = 1500; // 用戶停止輸入後 1.5 秒觸發保存

    // --- 從伺服器載入備忘錄 ---
    function loadMemoFromServer() {
        fetch(getMemoUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                memoInput.value = data.content || '';
            })
            .catch(error => {
                console.error('載入備忘錄失敗:', error);
            });
    }

    // --- 保存備忘錄到伺服器 ---
    function saveMemoToServer() {
        const contentToSave = memoInput.value;
        // console.log('自動保存中 (memo_handler.js):', contentToSave.substring(0,20) + "..."); // Debug

        fetch(saveMemoUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': typeof CSRF_TOKEN !== 'undefined' ? CSRF_TOKEN : '', // 使用全局 CSRF_TOKEN
            },
            body: JSON.stringify({ content: contentToSave })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(errData => {
                    throw new Error(errData.message || `HTTP error! status: ${response.status}`);
                }).catch(() => { throw new Error(`HTTP error! status: ${response.status}`); });
            }
            return response.json();
        })
        .then(data => {
            if (data.status === 'success') {
                console.log('備忘已自動保存 (來自 memo_handler.js):', data.message);
            } else {
                console.error('自動保存失敗 (memo_handler.js):', data.message || '未知錯誤');
            }
        })
        .catch(error => {
            console.error('自動保存備忘錄時發生錯誤 (memo_handler.js):', error);
        });
    }

    // 頁面載入時（或者說，當此函數被調用時），首先載入備忘錄
    loadMemoFromServer();

    // --- 監聽輸入框的輸入事件 ---
    memoInput.addEventListener('input', function() {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(saveMemoToServer, saveDelay);
    });
}