// panel/todo_app/static/todo_app/js/todo_logic.js

function initializeTodoApp(ids, urls) { // 保持接收 urls 參數
    const todoSlotsContainer = document.getElementById(ids.slotsContainer);
    if (!todoSlotsContainer) {
        console.error("ToDo App slots container not found. Check ID:", ids.slotsContainer);
        return;
    }
    const todoSlotsElements = todoSlotsContainer.querySelectorAll('.todo-slot');

    if (todoSlotsElements.length === 0) {
        console.error("No todo slots found in the container.");
        return;
    }

    const NUMBER_OF_SLOTS = todoSlotsElements.length; // 從實際 HTML 元素獲取格子數量
    let slotsData = Array(NUMBER_OF_SLOTS).fill(null).map((_, index) => ({
        slot_index: index,
        text: "",
        completed: false
    }));

    // --- 從伺服器載入數據 ---
    async function loadSlotsDataFromServer() {
        try {
            const response = await fetch(urls.getSlotsUrl);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const dataFromServer = await response.json();

            if (dataFromServer && Array.isArray(dataFromServer)) {
                // 用伺服器數據更新本地 slotsData
                dataFromServer.forEach(serverSlot => {
                    if (serverSlot.slot_index >= 0 && serverSlot.slot_index < NUMBER_OF_SLOTS) {
                        slotsData[serverSlot.slot_index].text = serverSlot.text || "";
                        slotsData[serverSlot.slot_index].completed = serverSlot.completed || false;
                    }
                });
            }
        } catch (error) {
            console.error("從伺服器載入待辦事項失敗:", error);
            // 如果載入失敗，將使用初始化的空 slotsData
        }
        renderSlots(); // 渲染格子
    }

    // --- 保存數據到伺服器 ---
    let saveTimeout; // 用於 debounce
    const SAVE_DEBOUNCE_DELAY = 1000; // 1秒延遲保存

    async function saveSlotsDataToServer() {
        clearTimeout(saveTimeout); // 清除已有的 debounce 計時器
        saveTimeout = setTimeout(async () => { // 設定新的 debounce 計時器
            try {
                const dataToSave = slotsData.map((slot, index) => ({
                    slot_index: index,
                    text: slot.text,
                    completed: slot.completed
                }));

                const response = await fetch(urls.saveSlotsUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': typeof CSRF_TOKEN !== 'undefined' ? CSRF_TOKEN : '',
                    },
                    body: JSON.stringify(dataToSave)
                });
                if (!response.ok) {
                    const errData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
                    throw new Error(errData.message || `HTTP error! status: ${response.status}`);
                }
                const result = await response.json();
                if (result.status === 'success') {
                    console.log("待辦事項已自動保存到伺服器:", result.message);
                } else {
                    console.error("儲存到伺服器失敗:", result.message || "未知錯誤");
                }
            } catch (error) {
                console.error("保存待辦事項到伺服器時出錯:", error);
            }
        }, SAVE_DEBOUNCE_DELAY);
    }

    // --- 渲染所有格子 ---
    function renderSlots() {
        todoSlotsElements.forEach((slotElement, index) => {
            const textInput = slotElement.querySelector('.todo-text-input');
            const completeBtn = slotElement.querySelector('.todo-complete-btn');

            const data = slotsData[index];
            if (!data) return; // 防禦

            textInput.value = data.text; // 設定 input 的 value
            slotElement.classList.toggle('completed', data.completed);
            // completeBtn.innerHTML = data.completed ? '✓' : '○'; // 可以保持 '✓' 或根據狀態改變
            if (data.completed) {
                completeBtn.style.opacity = '1'; // 已完成，打勾按鈕實心
            } else {
                completeBtn.style.opacity = '0.5'; // 未完成，打勾按鈕半透明
            }
        });
    }

    // --- 為每個格子綁定事件 ---
    todoSlotsElements.forEach((slotElement, index) => {
        const textInput = slotElement.querySelector('.todo-text-input');
        const completeBtn = slotElement.querySelector('.todo-complete-btn');

        // 文字輸入改變時更新 slotsData 並觸發保存 (debounce)
        textInput.addEventListener('input', () => {
            slotsData[index].text = textInput.value;
            saveSlotsDataToServer(); // 輸入時即觸發 debounce 保存
        });

        textInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault(); // 防止 Enter 鍵的預設行為 (例如表單提交)
                textInput.blur(); // 讓輸入框失去焦點，也會觸發一次保存 (如果 blur 事件有保存邏輯)
            }
        });
        
        // 失去焦點時也確保保存 (如果 input 事件的 debounce 未執行完畢)
        textInput.addEventListener('blur', () => {
            slotsData[index].text = textInput.value; // 確保是最新的值
            saveSlotsDataToServer();
        });


        // 打勾按鈕事件
        completeBtn.addEventListener('click', () => {
            slotsData[index].completed = !slotsData[index].completed;
            saveSlotsDataToServer(); // 狀態改變後保存
            renderSlots(); // 重新渲染以更新樣式
        });
    });

    // 初始化
    loadSlotsDataFromServer();
}