'use strict';

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const chatHistory = document.getElementById('chat-history');
  const langSelect = document.getElementById('lang-select');
  const themeToggle = document.getElementById('theme-toggle');
  const ttsToggle = document.getElementById('tts-toggle');

  // Dashboard Elements
  const crowdContainer = document.getElementById('crowd-data-container');
  const refreshCrowdBtn = document.getElementById('refresh-crowd');
  const ecoContainer = document.getElementById('eco-data-container');
  const refreshEcoBtn = document.getElementById('refresh-eco');

  // Wayfinding Elements
  const wayfindingForm = document.getElementById('wayfinding-form');
  const seatInput = document.getElementById('seat-input');
  const wayfindingResult = document.getElementById('wayfinding-result');

  const submitBtn = document.querySelector('.btn-submit');

  // State
  let isTtsEnabled = false;

  // ----- ACCESSIBILITY & THEME -----

  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('high-contrast');
    const isHC = document.body.classList.contains('high-contrast');
    themeToggle.setAttribute(
      'aria-label',
      isHC ? 'Disable High Contrast Mode' : 'Enable High Contrast Mode'
    );
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

  /**
   * Uses the Web Speech API to read text aloud if TTS is enabled.
   * @param {string} text - The text to speak.
   */
  function speakText(text) {
    if (!isTtsEnabled || !('speechSynthesis' in window)) return;

    // Basic sanitization for TTS
    const cleanText = text.replace(/[*_#]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);

    const lang = langSelect.value;
    const langMap = {
      English: 'en-US',
      Spanish: 'es-ES',
      French: 'fr-FR',
      Arabic: 'ar-SA',
      Portuguese: 'pt-BR'
    };
    utterance.lang = langMap[lang] || 'en-US';

    window.speechSynthesis.speak(utterance);
  }

  // ----- DASHBOARDS -----

  /**
   * Fetches and renders crowd density data.
   */
  async function fetchCrowdData() {
    try {
      refreshCrowdBtn.disabled = true;
      refreshCrowdBtn.style.opacity = '0.5';

      const res = await fetch('/api/crowd-data');
      const result = await res.json();

      if (result.success) {
        renderCrowdData(result.data);
      }
    } catch (error) {
      console.error('Error fetching crowd data:', error);
      crowdContainer.innerHTML =
        '<div class="loading-state" style="color:var(--error)">Failed to load data.</div>';
    } finally {
      refreshCrowdBtn.disabled = false;
      refreshCrowdBtn.style.opacity = '1';
    }
  }

  /**
   * Renders crowd data cards.
   * @param {Array} data - Array of gate data objects.
   */
  function renderCrowdData(data) {
    crowdContainer.innerHTML = '';
    data.forEach((gate) => {
      const levelClass =
        gate.crowdLevel < 30 ? 'level-low' : gate.crowdLevel < 70 ? 'level-medium' : 'level-high';
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

  /**
   * Fetches and renders eco-transit data (Sustainability).
   */
  async function fetchEcoData() {
    try {
      refreshEcoBtn.disabled = true;
      refreshEcoBtn.style.opacity = '0.5';

      const res = await fetch('/api/eco-transit');
      const result = await res.json();

      if (result.success) {
        renderEcoData(result.data);
      }
    } catch (error) {
      console.error('Error fetching eco data:', error);
      ecoContainer.innerHTML =
        '<div class="loading-state" style="color:var(--error)">Failed to load transit data.</div>';
    } finally {
      refreshEcoBtn.disabled = false;
      refreshEcoBtn.style.opacity = '1';
    }
  }

  /**
   * Renders eco-transit data cards.
   * @param {Array} data - Array of transit objects.
   */
  function renderEcoData(data) {
    ecoContainer.innerHTML = '';
    data.forEach((transit) => {
      const card = document.createElement('div');
      card.className = 'gate-card';
      card.setAttribute('role', 'region');
      card.setAttribute('aria-label', `${transit.type} status`);

      card.innerHTML = `
                <h3 style="color: var(--secondary)">${transit.type}</h3>
                <div style="font-weight: 600; margin-bottom: 0.25rem;">${transit.status}</div>
                <div class="wait-time">Co2 Saved: ${transit.co2Saved}</div>
            `;
      ecoContainer.appendChild(card);
    });
  }

  refreshCrowdBtn.addEventListener('click', fetchCrowdData);
  refreshEcoBtn.addEventListener('click', fetchEcoData);

  // ----- WAYFINDING -----

  /**
   * Handles the "Find My Seat" wayfinding form submission.
   */
  wayfindingForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const section = seatInput.value.trim().toUpperCase();
    if (!section) return;

    wayfindingResult.style.display = 'block';
    wayfindingResult.innerHTML = '<p style="opacity:0.6">Looking up route...</p>';

    try {
      const res = await fetch(`/api/wayfinding/${encodeURIComponent(section)}`);
      const data = await res.json();

      if (res.ok && data.success) {
        const { description, accessible } = data.data;
        wayfindingResult.innerHTML = `
                    <div class="gate-card" style="background:var(--surface); border:1px solid var(--border)">
                        <h3 style="color:var(--primary)">Section ${section}</h3>
                        <p style="margin:0.5rem 0">${description}</p>
                        <span class="wait-time" style="color:${accessible ? 'var(--secondary)' : 'var(--text-muted)'}">
                            ${accessible ? '♿ Wheelchair accessible route' : 'ℹ️ Standard route'}
                        </span>
                    </div>`;
      } else {
        wayfindingResult.innerHTML = '<p style="color:var(--error)">Could not find route info.</p>';
      }
    } catch {
      wayfindingResult.innerHTML =
        '<p style="color:var(--error)">Network error. Please try again.</p>';
    }
  });

  // ----- CHAT INTERFACE -----

  /**
   * Appends a message to the chat history.
   * @param {string} text - The message body.
   * @param {boolean} isUser - Whether the message is from the user.
   */
  function appendMessage(text, isUser = false) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${isUser ? 'user-msg' : 'system-msg'}`;
    // Using textContent for XSS protection
    const p = document.createElement('p');
    p.textContent = text;
    msgDiv.appendChild(p);

    chatHistory.appendChild(msgDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;

    if (!isUser) {
      speakText(text);
    }
  }

  /**
   * Shows a typing indicator.
   */
  function showLoading() {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message system-msg loading-msg';
    loadingDiv.id = 'loading-indicator';
    loadingDiv.innerHTML = '<div class="dot"></div><div class="dot"></div><div class="dot"></div>';
    chatHistory.appendChild(loadingDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
  }

  /**
   * Removes the typing indicator.
   */
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

      if (res.ok && data.success) {
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

  // Initialize Dashboards
  fetchCrowdData();
  fetchEcoData();

  // Efficiency Fix: Pause polling when tab isn't visible
  let pollInterval;

  function startPolling() {
    pollInterval = setInterval(() => {
      fetchCrowdData();
      fetchEcoData();
    }, 30000);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      clearInterval(pollInterval);
    } else {
      fetchCrowdData();
      fetchEcoData();
      startPolling();
    }
  });

  startPolling();
});
