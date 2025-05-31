// panel/audio_player_app/static/audio_player_app/js/audio_player_logic.js

function initializeAudioPlayer(config) {
    const playerContainer = document.getElementById(config.playerContainerId); 
    if (!playerContainer) { 
        console.error('音訊播放器容器未找到：', config.playerContainerId); 
        return; 
    }

    // ... (其他元素獲取，保持不變)
    const audioElement = playerContainer.querySelector('#audioElement');
    const playPauseBtn = playerContainer.querySelector('#playPauseBtn'); 
    const playIcon = playerContainer.querySelector('#playIcon'); 
    const pauseIcon = playerContainer.querySelector('#pauseIcon'); 
    const prevTrackBtn = playerContainer.querySelector('#prevTrackBtn');
    const nextTrackBtn = playerContainer.querySelector('#nextTrackBtn');
    const shuffleBtn = playerContainer.querySelector('#shuffleBtn'); 
    const loopBtn = playerContainer.querySelector('#loopBtn'); 
    
    const trackInfoMarquee = playerContainer.querySelector('.track-info-marquee');
    const currentTrackNameDisplay = playerContainer.querySelector('#currentTrackName');
    
    const progressBarContainer = playerContainer.querySelector('#progressBarContainer');
    const progressBar = playerContainer.querySelector('#progressBar');
    // 新增時間顯示元素
    const currentTimeDisplay = playerContainer.querySelector('#currentTimeDisplay');
    const totalDurationDisplay = playerContainer.querySelector('#totalDurationDisplay');

    const muteBtn = playerContainer.querySelector('#muteBtn'); 
    const volumeIcon = playerContainer.querySelector('#volumeIcon');
    const volumeMuteIcon = playerContainer.querySelector('#volumeMuteIcon');
    const volumeSlider = playerContainer.querySelector('#volumeSlider');

    if (!audioElement || !playPauseBtn || !playIcon || !pauseIcon || !prevTrackBtn || !nextTrackBtn || 
        !shuffleBtn || !loopBtn || !trackInfoMarquee || !currentTrackNameDisplay || 
        !progressBarContainer || !progressBar || 
        !currentTimeDisplay || !totalDurationDisplay || // 檢查新元素
        !muteBtn || !volumeIcon || !volumeMuteIcon || !volumeSlider) {
        console.error('一個或多個音訊播放器 UI 元件缺失。請檢查 HTML 結構與 ID。'); 
        return; 
    }

    let playlist = [];
    let originalPlaylist = [];
    let currentIndex = -1; 
    let isPlaying = false; 
    let isShuffle = false;
    let isLoopSingle = false;
    let previousVolumeBeforeMute = audioElement.volume;
    let isDraggingProgress = false; 

    // --- 時間格式化函數 ---
    function formatTime(seconds) {
        if (isNaN(seconds) || seconds < 0) {
            return "00:00";
        }
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    }

    function loadPlaylistFromServer() {
        // ... (此函數內容保持不變)
        fetch(config.listFilesUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP 錯誤！狀態： ${response.status}`);
                }
                return response.json(); 
            })
            .then(data => {
                if (data.error) {
                    console.error("載入播放列表錯誤：", data.error); 
                    currentTrackNameDisplay.textContent = data.error; 
                    currentTimeDisplay.textContent = "00:00";
                    totalDurationDisplay.textContent = "00:00";
                    return;
                }
                originalPlaylist = data.files.map(file => ({
                    name: file,
                    src: `${config.audioFileBaseUrl}${encodeURIComponent(file)}`
                })); 

                if (originalPlaylist.length === 0) {
                    currentTrackNameDisplay.textContent = "未找到 MP3 檔案。"; 
                    disableControls(true);
                    currentTimeDisplay.textContent = "00:00";
                    totalDurationDisplay.textContent = "00:00";
                    return; 
                }
                
                playlist = [...originalPlaylist]; 
                disableControls(false); 
                loadTrack(0);
                audioElement.volume = 0.75; 
                volumeSlider.value = audioElement.volume * 100;
                updateVolumeIconDisplay(); 
            })
            .catch(error => {
                console.error('載入播放列表失敗：', error); 
                currentTrackNameDisplay.textContent = "載入播放列表失敗。"; 
                disableControls(true);
                currentTimeDisplay.textContent = "00:00";
                totalDurationDisplay.textContent = "00:00";
            });
    }
    
    function disableControls(disable) {
        playPauseBtn.disabled = disable; 
        prevTrackBtn.disabled = disable; 
        nextTrackBtn.disabled = disable; 
        shuffleBtn.disabled = disable; 
        loopBtn.disabled = disable; 
        muteBtn.disabled = disable; 
        volumeSlider.disabled = disable; 
        if (disable) {
            progressBar.style.width = '0%'; 
            if (progressBarContainer) progressBarContainer.style.cursor = 'default'; 
            currentTimeDisplay.textContent = "00:00";
            totalDurationDisplay.textContent = "00:00";
        } else {
            if (progressBarContainer) progressBarContainer.style.cursor = 'pointer'; 
        }
    }

    // --- 修正後的跑馬燈邏輯 ---
    function adjustMarqueeAnimation() {
        // ... (此函數內容保持不變)
        currentTrackNameDisplay.classList.remove('marquee-active'); 
        currentTrackNameDisplay.style.animationName = ''; 
        currentTrackNameDisplay.style.animationDuration = ''; 
        currentTrackNameDisplay.style.setProperty('--marquee-translate-x', '0px'); 

        currentTrackNameDisplay.offsetHeight; 
        const textWidth = currentTrackNameDisplay.scrollWidth; 
        const containerWidth = trackInfoMarquee.clientWidth;

        if (textWidth > containerWidth) {
            const animationDuration = Math.max(5, textWidth / 15); // 調整速度因子 
            
            const startX = `${containerWidth}px`; 
            const endX = `-${textWidth}px`; 

            const styleSheetId = 'marquee-keyframes-style'; 
            let keyframesStyleSheet = document.getElementById(styleSheetId); 
            if (!keyframesStyleSheet) {
                keyframesStyleSheet = document.createElement('style'); 
                keyframesStyleSheet.id = styleSheetId; 
                document.head.appendChild(keyframesStyleSheet); 
            }
            keyframesStyleSheet.innerHTML = `
                @keyframes fixedMarqueeAnimation {
                    0%   { transform: translateX(var(--marquee-start-x));  }
                    100% { transform: translateX(var(--marquee-end-x));  }
                }
            `; 
            currentTrackNameDisplay.style.setProperty('--marquee-start-x', startX); 
            currentTrackNameDisplay.style.setProperty('--marquee-end-x', endX); 
            currentTrackNameDisplay.style.animationName = 'fixedMarqueeAnimation'; 
            currentTrackNameDisplay.style.animationDuration = `${animationDuration}s`; 
            currentTrackNameDisplay.classList.add('marquee-active'); 
        } else {
            currentTrackNameDisplay.classList.remove('marquee-active'); 
            currentTrackNameDisplay.style.animationName = ''; 
            currentTrackNameDisplay.style.transform = 'translateX(0px)'; 
        }
    }


    function loadTrack(index, preservePlayingState = false) {
        if (playlist.length === 0) {
             currentTrackNameDisplay.textContent = "未選擇曲目"; 
             disableControls(true); 
             currentTimeDisplay.textContent = "00:00";
             totalDurationDisplay.textContent = "00:00";
             return; 
        }
        if (index < 0 || index >= playlist.length) {
            console.warn("曲目索引超出範圍：", index); 
            if (!isShuffle && playlist.length > 0) { 
                index = 0; 
            } else {
                if (isPlaying) togglePlayPause(); 
                currentIndex = -1; 
                audioElement.src = ""; 
                currentTrackNameDisplay.textContent = "播放列表結束"; 
                progressBar.style.width = '0%'; 
                currentTimeDisplay.textContent = "00:00";
                totalDurationDisplay.textContent = "00:00";
                adjustMarqueeAnimation(); 
                return; 
            }
        }
        currentIndex = index; 
        audioElement.src = playlist[currentIndex].src; 
        currentTrackNameDisplay.textContent = playlist[currentIndex].name; 
        
        requestAnimationFrame(adjustMarqueeAnimation); 
        if (preservePlayingState && isPlaying) { 
            audioElement.play().catch(e => console.error("播放曲目時發生錯誤：", e)); 
        } else if (!preservePlayingState) {
            if (isPlaying) { 
                 audioElement.pause(); 
            }
        }
        progressBar.style.width = '0%'; 
        currentTimeDisplay.textContent = "00:00"; // 重置目前時間
        // totalDurationDisplay 會在 loadedmetadata 事件中更新
    }
    
    function playAudio() {
        if (currentIndex === -1 && playlist.length > 0) {
            loadTrack(0); 
        }
        if (currentIndex !== -1) {
            audioElement.play()
                .then(() => {
                    isPlaying = true; 
                    playIcon.style.display = 'none'; 
                    pauseIcon.style.display = 'inline'; 
                    playPauseBtn.title = '暫停'; 
                })
                .catch(e => {
                    console.error("嘗試播放音訊時發生錯誤：", e); 
                    isPlaying = false; 
                    playIcon.style.display = 'inline'; 
                    pauseIcon.style.display = 'none'; 
                    playPauseBtn.title = '播放'; 
                }); 
        }
    }

    function pauseAudio() {
        audioElement.pause(); 
        isPlaying = false; 
        playIcon.style.display = 'inline'; 
        pauseIcon.style.display = 'none'; 
        playPauseBtn.title = '播放'; 
    }

    function togglePlayPause() {
        if (currentIndex === -1 && playlist.length > 0) {
            loadTrack(0); 
            playAudio(); 
            return; 
        }
        if (currentIndex === -1 && playlist.length === 0) { 
            return; 
        }

        if (isPlaying) { 
            pauseAudio(); 
        } else {
            playAudio(); 
        }
    }

    function nextTrack() {
        if (playlist.length === 0) return; 
        let newIndex = currentIndex + 1; 
        if (newIndex >= playlist.length) { 
            newIndex = 0; 
        }
        loadTrack(newIndex, isPlaying); 
    }

    function prevTrack() {
        if (playlist.length === 0) return; 
        let newIndex = currentIndex - 1; 
        if (newIndex < 0) { 
            newIndex = playlist.length - 1; 
        }
        loadTrack(newIndex, isPlaying); 
    }

    function toggleShuffle() {
        isShuffle = !isShuffle;
        shuffleBtn.classList.toggle('active', isShuffle); 
        shuffleBtn.title = isShuffle ? '取消隨機播放' : '隨機播放'; 

        let currentTrackObject = null; 
        if (currentIndex !== -1) { 
            currentTrackObject = playlist[currentIndex]; 
        }

        if (isShuffle) {
            playlist = [...originalPlaylist].sort(() => Math.random() - 0.5); 
            if (currentTrackObject) { 
                const newIndexOfCurrentTrack = playlist.findIndex(track => track.src === currentTrackObject.src); 
                currentIndex = (newIndexOfCurrentTrack !== -1) ? newIndexOfCurrentTrack : (playlist.length > 0 ? 0 : -1); 
            } else {
                currentIndex = playlist.length > 0 ? 0 : -1; 
            }
        } else {
            playlist = [...originalPlaylist]; 
            if (currentTrackObject) { 
                const newIndexOfCurrentTrack = playlist.findIndex(track => track.src === currentTrackObject.src); 
                currentIndex = (newIndexOfCurrentTrack !== -1) ? newIndexOfCurrentTrack : (playlist.length > 0 ? 0 : -1); 
            } else {
                currentIndex = playlist.length > 0 ? 0 : -1; 
            }
        }
        
        if (currentIndex !== -1) {
             loadTrack(currentIndex, isPlaying); 
        } else if (playlist.length > 0) {
            loadTrack(0, isPlaying); 
        } else {
             currentTrackNameDisplay.textContent = "未選擇曲目"; 
             progressBar.style.width = '0%'; 
             currentTimeDisplay.textContent = "00:00";
             totalDurationDisplay.textContent = "00:00";
             adjustMarqueeAnimation(); 
             if(isPlaying) togglePlayPause(); 
        }
    }

    function toggleLoopSingle() {
        isLoopSingle = !isLoopSingle; 
        audioElement.loop = isLoopSingle; 
        loopBtn.classList.toggle('active', isLoopSingle); 
        loopBtn.title = isLoopSingle ? '取消單曲循環' : '單曲循環'; 
    }
    
    // --- 進度條與拖動邏輯 ---
    function updateProgressBar() {
        if (audioElement.duration && !isDraggingProgress) { 
            const percentage = (audioElement.currentTime / audioElement.duration) * 100; 
            progressBar.style.width = `${percentage}%`; 
            currentTimeDisplay.textContent = formatTime(audioElement.currentTime); // 更新目前時間
        } else if (!audioElement.duration) {
            currentTimeDisplay.textContent = "00:00";
        }
        // 總時長通常在 loadedmetadata 更新，但如果拖動到結尾或某些情況下可能需要再次確認
        if (audioElement.duration && totalDurationDisplay.textContent === "00:00") {
            totalDurationDisplay.textContent = formatTime(audioElement.duration);
        }
    }

    function calculateSeekPosition(event) {
        if (!audioElement.duration || playlist.length === 0) return null; 
        const progressBarRect = progressBarContainer.getBoundingClientRect(); 
        let clickX = event.pageX - progressBarRect.left - window.scrollX; 
        clickX = Math.max(0, Math.min(clickX, progressBarRect.width)); 
        const percentage = clickX / progressBarRect.width; 
        return percentage * audioElement.duration; 
    }

    function handleProgressInteraction(event) { 
        const newTime = calculateSeekPosition(event); 
        if (newTime !== null) {
            audioElement.currentTime = newTime; 
            progressBar.style.width = `${(newTime / audioElement.duration) * 100}%`; 
            currentTimeDisplay.textContent = formatTime(newTime); // 拖動時也更新目前時間
        }
    }

    function startDrag(event) {
        if (playlist.length === 0) return; 
        isDraggingProgress = true; 
        document.body.style.userSelect = 'none'; 
        handleProgressInteraction(event); 
        
        document.addEventListener('mousemove', dragProgress); 
        document.addEventListener('mouseup', stopDrag); 
    }

    function dragProgress(event) {
        if (isDraggingProgress) {
            handleProgressInteraction(event); 
        }
    }

    function stopDrag() {
        if (isDraggingProgress) {
            isDraggingProgress = false; 
            document.body.style.userSelect = ''; 
            document.removeEventListener('mousemove', dragProgress); 
            document.removeEventListener('mouseup', stopDrag); 
        }
    }


    // --- 音量控制邏輯 (保持不變) ---
    function updateVolumeIconDisplay() {
        if (audioElement.muted || audioElement.volume === 0) { 
            volumeIcon.style.display = 'none'; 
            volumeMuteIcon.style.display = 'inline'; 
            muteBtn.title = '取消靜音'; 
        } else {
            volumeIcon.style.display = 'inline'; 
            volumeMuteIcon.style.display = 'none'; 
            muteBtn.title = '靜音'; 
        }
    }

    function handleVolumeChange() {
        audioElement.muted = false; 
        audioElement.volume = volumeSlider.value / 100; 
    }

    function toggleMute() {
        if(playlist.length === 0) return; 
        audioElement.muted = !audioElement.muted; 
        if (audioElement.muted) {
            if (audioElement.volume > 0) {
                 previousVolumeBeforeMute = audioElement.volume; 
            }
        } else {
            if (audioElement.volume === 0) {
                 audioElement.volume = previousVolumeBeforeMute > 0 ? previousVolumeBeforeMute : 0.5; 
                 volumeSlider.value = audioElement.volume * 100; 
            }
        }
        updateVolumeIconDisplay(); 
    }


    // 事件監聽
    audioElement.addEventListener('timeupdate', updateProgressBar); 
    audioElement.addEventListener('loadedmetadata', () => { 
        updateProgressBar();
        totalDurationDisplay.textContent = formatTime(audioElement.duration); // 更新總時長
        adjustMarqueeAnimation(); 
        volumeSlider.value = audioElement.volume * 100; 
        updateVolumeIconDisplay(); 
    });
    audioElement.addEventListener('ended', () => { 
        progressBar.style.width = '100%'; // 確保進度條顯示為100%
        currentTimeDisplay.textContent = formatTime(audioElement.duration); // 結束時顯示總長
        if (!isLoopSingle) { 
            nextTrack(); 
        } else {
            // 如果是單曲循環，audio 元素會自動重播，timeupdate 會處理時間更新
            // 可能需要重置 currentTimeDisplay 為 00:00 立即，然後 timeupdate 會更新
            currentTimeDisplay.textContent = "00:00";
        }
    });
    audioElement.addEventListener('volumechange', () => { 
        if (!audioElement.muted) {  
            volumeSlider.value = audioElement.volume * 100; 
        }
        updateVolumeIconDisplay(); 
    });
    progressBarContainer.addEventListener('mousedown', startDrag); 

    playPauseBtn.addEventListener('click', togglePlayPause);
    nextTrackBtn.addEventListener('click', nextTrack);
    prevTrackBtn.addEventListener('click', prevTrack);
    shuffleBtn.addEventListener('click', toggleShuffle);
    loopBtn.addEventListener('click', toggleLoopSingle);

    muteBtn.addEventListener('click', toggleMute); 
    volumeSlider.addEventListener('input', handleVolumeChange); 

    // 初始化
    loadPlaylistFromServer();
    disableControls(true);
    currentTimeDisplay.textContent = "00:00"; // 初始化時間顯示
    totalDurationDisplay.textContent = "00:00"; // 初始化時間顯示
}