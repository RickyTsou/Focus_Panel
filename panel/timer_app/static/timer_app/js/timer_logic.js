// panel/timer_app/static/timer_app/js/timer_logic.js

function initializeTimerApp(ids) {
    const hoursDisplay = document.getElementById(ids.hours);
    const minutesDisplay = document.getElementById(ids.minutes);
    const secondsDisplay = document.getElementById(ids.seconds);
    const startBtn = document.getElementById(ids.startBtn);
    const stopBtn = document.getElementById(ids.stopBtn);
    const resetBtn = document.getElementById(ids.resetBtn);

    if (!hoursDisplay || !minutesDisplay || !secondsDisplay || !startBtn || !stopBtn || !resetBtn) {
        console.error("Timer elements not found. Check IDs:", ids);
        return;
    }

    let accumulatedTime = 0; // 累計時間（毫秒）
    let startTime = 0;       // 最近一次開始計時的時間戳
    let animationFrameId = null;
    let isRunning = false;

    function formatTime(num) {
        return String(num).padStart(2, '0');
    }

    function displayTime(totalMilliseconds) {
        const totalSeconds = Math.floor(totalMilliseconds / 1000);
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;

        hoursDisplay.textContent = formatTime(h);
        minutesDisplay.textContent = formatTime(m);
        secondsDisplay.textContent = formatTime(s);
    }

    function timerLoop() {
        if (!isRunning) {
            return; // 如果已停止，則退出循環
        }
        // 計算當前運行段的已過時間 + 之前累計的時間
        const currentTimeElapsed = Date.now() - startTime;
        const totalCurrentMilliseconds = accumulatedTime + currentTimeElapsed;
        displayTime(totalCurrentMilliseconds);

        animationFrameId = requestAnimationFrame(timerLoop); // 請求下一幀動畫
    }

    function startTimer() {
        if (isRunning) {
            return; // 防止重複啟動
        }
        isRunning = true;
        startTime = Date.now(); // 記錄當前段開始的時間戳

        startBtn.disabled = true;
        stopBtn.disabled = false;

        animationFrameId = requestAnimationFrame(timerLoop); // 開始動畫循環
    }

    function stopTimer() {
        if (!isRunning) {
            return;
        }
        isRunning = false;
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId); // 停止動畫循環
            animationFrameId = null;
        }
        // 計算並累加這段運行的時間
        const elapsedTimeInSegment = Date.now() - startTime;
        accumulatedTime += elapsedTimeInSegment;

        displayTime(accumulatedTime); // 確保顯示的是停止時的精確時間

        startBtn.disabled = false;
        stopBtn.disabled = true;
    }

    function resetTimer() {
        isRunning = false;
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        accumulatedTime = 0;
        startTime = 0; // 重置 startTime
        displayTime(0); // 更新顯示為 00:00:00

        startBtn.disabled = false;
        stopBtn.disabled = true;
    }

    // 初始化顯示和按鈕狀態
    displayTime(0); // 確保初始顯示為 00:00:00
    stopBtn.disabled = true;

    // 綁定事件
    startBtn.addEventListener('click', startTimer);
    stopBtn.addEventListener('click', stopTimer);
    resetBtn.addEventListener('click', resetTimer);
}