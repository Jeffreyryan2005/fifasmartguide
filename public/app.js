document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatHistory = document.getElementById('chat-history');
    const langSelect = document.getElementById('lang-select');
    const themeToggle = document.getElementById('theme-toggle');
    const ttsToggle = document.getElementById('tts-toggle');
    const crowdContainer = document.getElementById('crowd-data-container');
    const refreshCrowdBtn = document.getElementById('refresh-crowd');
    const submitBtn = document.querySelector('.btn-submit');

    // State
    let isTtsEnabled = false;

    // ----- ACCESSIBILITY & THEME -----
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('high-contrast');
        const isHC = document.body.classList.contains('high-contrast');
        themeToggle.setAttribute('aria-label', isHC ? 'Disable High Contrast Mode' : 'Enable High Contrast Mode');
    });

    ttsToggle.addEventListener('click', () => {
        isTtsEnabled = !isTtsEnabled;
        ttsToggle.setAttribute('aria-pressed', isTtsEnabled.toString());
        if (isTtsEnabled) {
            speakText('Text to speech enabled');
        } else {
            window.speechSynthesis.cancel();
        }
    });

    function speakText(text) {
        if (!isTtsEnabled || !('speechSynthesis' in window)) return;
        
        // Basic sanitization for TTS (remove markdown-like chars if any)
        const cleanText = text.replace(/[*_#]/g, '');
        const utterance = new SpeechSynthesisUtterance(cleanText);
        
        // Try to match language
        const lang = langSelect.value;
        const langMap = {
            'English': 'en-US',
            'Spanish': 'es-ES',
            'French': 'fr-FR',
            'Arabic': 'ar-SA',
            'Portuguese': 'pt-BR'
        };
        utterance.lang = langMap[lang] || 'en-US';
        
        window.speechSynthesis.speak(utterance);
    }

    // ----- CROWD DASHBOARD -----
    async function fetchCrowdData() {
        try {
            refreshCrowdBtn.disabled = true;
            refreshCrowdBtn.style.opacity = '0.5';
            
            const res = await fetch('/api/crowd-data');
            const { data } = await res.json();
            
            renderCrowdData(data);
        } catch (error) {
            console.error('Error fetching crowd data:', error);
            crowdContainer.innerHTML = '<div class="loading-state" style="color:var(--error)">Failed to load data.</div>';
        } finally {
            refreshCrowdBtn.disabled = false;
            refreshCrowdBtn.style.opacity = '1';
        }
    }

    function renderCrowdData(data) {
        crowdContainer.innerHTML = '';
        data.forEach(gate => {
            const levelClass = gate.crowdLevel < 30 ? 'level-low' : (gate.crowdLevel < 70 ? 'level-medium' : 'level-high');
            const card = document.createElement('div');
            card.className = 'gate-card';
            card.setAttribute('role', 'region');
            card.setAttribute('aria-label', `${gate.gate} status`);
            
            card.innerHTML = `
                <h3>${gate.gate}</h3>
                <div class="crowd-level ${levelClass}" aria-label="Crowd level ${gate.crowdLevel} percent">${gate.crowdLevel}%</div>
                <div class="wait-time">Wait: ~${gate.estimatedWaitTime} min</div>
            `;
            crowdContainer.appendChild(card);
        });
    }

    refreshCrowdBtn.addEventListener('click', fetchCrowdData);

    // ----- CHAT INTERFACE -----
    function appendMessage(text, isUser = false) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${isUser ? 'user-msg' : 'system-msg'}`;
        // Using textContent for security (prevents XSS)
        const p = document.createElement('p');
        p.textContent = text;
        msgDiv.appendChild(p);
        
        chatHistory.appendChild(msgDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;

        if (!isUser) {
            speakText(text);
        }
    }

    function showLoading() {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message system-msg loading-msg';
        loadingDiv.id = 'loading-indicator';
        loadingDiv.innerHTML = '<div class="dot"></div><div class="dot"></div><div class="dot"></div>';
        chatHistory.appendChild(loadingDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    function removeLoading() {
        const indicator = document.getElementById('loading-indicator');
        if (indicator) indicator.remove();
    }

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = chatInput.value.trim();
        if (!message) return;

        // UI Updates
        appendMessage(message, true);
        chatInput.value = '';
        submitBtn.disabled = true;
        showLoading();

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message,
                    language: langSelect.value
                })
            });

            const data = await res.json();
            removeLoading();

            if (res.ok) {
                appendMessage(data.reply);
            } else {
                appendMessage(data.error || 'An error occurred. Please try again.');
            }
        } catch (error) {
            console.error('Chat error:', error);
            removeLoading();
            appendMessage('Network error. Please check your connection and try again.');
        } finally {
            submitBtn.disabled = false;
            chatInput.focus();
        }
    });

    // Initialize Dashboard
    fetchCrowdData();
    // Simulate real-time updates every 30 seconds
    setInterval(fetchCrowdData, 30000);
});
