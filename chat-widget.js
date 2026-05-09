(function () {
  // ── Inject styles ─────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    #ff-chat-btn {
      position: fixed; bottom: 24px; right: 24px; z-index: 9999;
      width: 52px; height: 52px; border-radius: 50%;
      background: #2F6BFF; border: none; cursor: pointer;
      box-shadow: 0 4px 20px rgba(47,107,255,0.45), 0 2px 8px rgba(11,18,32,0.2);
      display: flex; align-items: center; justify-content: center;
      transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease;
    }
    #ff-chat-btn:hover {
      transform: scale(1.08);
      box-shadow: 0 6px 28px rgba(47,107,255,0.55), 0 2px 8px rgba(11,18,32,0.2);
    }
    #ff-chat-btn svg { pointer-events: none; }

    #ff-chat-panel {
      position: fixed; bottom: 88px; right: 24px; z-index: 9998;
      width: 360px; max-height: 520px;
      background: #fff; border-radius: 16px;
      box-shadow: 0 12px 48px rgba(11,18,32,0.14), 0 2px 12px rgba(11,18,32,0.08);
      display: flex; flex-direction: column; overflow: hidden;
      transform: translateY(12px) scale(0.97); opacity: 0;
      pointer-events: none;
      transition: transform 0.25s cubic-bezier(0.34,1.4,0.64,1), opacity 0.2s ease;
    }
    #ff-chat-panel.open {
      transform: translateY(0) scale(1); opacity: 1;
      pointer-events: all;
    }

    #ff-chat-header {
      background: #0B1220; padding: 14px 16px;
      display: flex; align-items: center; gap: 10px;
    }
    .ff-chat-avatar {
      width: 30px; height: 30px; border-radius: 50%;
      background: linear-gradient(135deg, #2F6BFF 0%, #1a4fd6 100%);
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    #ff-chat-header-text { flex: 1; }
    #ff-chat-header-text strong {
      display: block; font-size: 13px; font-weight: 600;
      color: #fff; font-family: Inter, sans-serif;
    }
    #ff-chat-header-text span {
      font-size: 11px; color: rgba(255,255,255,0.45);
      font-family: Inter, sans-serif;
    }
    #ff-chat-close {
      background: none; border: none; cursor: pointer;
      color: rgba(255,255,255,0.4); padding: 4px;
      display: flex; align-items: center; border-radius: 4px;
      transition: color 0.15s;
    }
    #ff-chat-close:hover { color: rgba(255,255,255,0.8); }

    #ff-chat-messages {
      flex: 1; overflow-y: auto; padding: 14px 14px 8px;
      display: flex; flex-direction: column; gap: 10px;
      min-height: 0; scroll-behavior: smooth;
    }
    #ff-chat-messages::-webkit-scrollbar { width: 4px; }
    #ff-chat-messages::-webkit-scrollbar-track { background: transparent; }
    #ff-chat-messages::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 4px; }

    .ff-msg {
      max-width: 88%; font-size: 13px; line-height: 1.55;
      font-family: Inter, sans-serif; animation: ffMsgIn 0.2s ease;
    }
    @keyframes ffMsgIn { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:none; } }
    .ff-msg-user {
      align-self: flex-end;
      background: #2F6BFF; color: #fff;
      padding: 9px 13px; border-radius: 14px 14px 3px 14px;
    }
    .ff-msg-bot {
      align-self: flex-start;
      background: #F3F4F6; color: #111827;
      padding: 9px 13px; border-radius: 14px 14px 14px 3px;
    }
    .ff-msg-bot.streaming { opacity: 0.85; }
    .ff-cursor {
      display: inline-block; width: 2px; height: 13px;
      background: #6B7280; margin-left: 1px; vertical-align: middle;
      animation: ffBlink 0.7s step-end infinite;
    }
    @keyframes ffBlink { 0%,100%{opacity:1} 50%{opacity:0} }

    .ff-nav-chip {
      display: inline-flex; align-items: center; gap: 5px;
      margin-top: 7px; padding: 6px 11px;
      background: #EFF4FF; border: 1px solid #C7D9FF;
      border-radius: 999px; font-size: 12px; font-weight: 500;
      color: #2F6BFF; cursor: pointer; text-decoration: none;
      font-family: Inter, sans-serif;
      transition: background 0.15s;
    }
    .ff-nav-chip:hover { background: #DDE8FF; }

    #ff-chat-footer {
      padding: 10px 12px 12px;
      border-top: 1px solid #F3F4F6;
      display: flex; gap: 8px; align-items: flex-end;
    }
    #ff-chat-input {
      flex: 1; border: 1px solid #E5E7EB; border-radius: 10px;
      padding: 9px 12px; font-size: 13px; font-family: Inter, sans-serif;
      resize: none; outline: none; line-height: 1.4; max-height: 100px;
      transition: border-color 0.15s;
      background: #FAFAFA; color: #111827;
    }
    #ff-chat-input:focus { border-color: #2F6BFF; background: #fff; }
    #ff-chat-input::placeholder { color: #9CA3AF; }
    #ff-chat-send {
      width: 36px; height: 36px; border-radius: 10px;
      background: #2F6BFF; border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      transition: background 0.15s, transform 0.15s;
    }
    #ff-chat-send:hover { background: #1a4fd6; }
    #ff-chat-send:active { transform: scale(0.93); }
    #ff-chat-send:disabled { background: #D1D5DB; cursor: default; transform: none; }
  `;
  document.head.appendChild(style);

  // ── Build DOM ─────────────────────────────────────────────────
  document.body.insertAdjacentHTML('beforeend', `
    <button id="ff-chat-btn" aria-label="Open AI assistant">
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M11 2C6.03 2 2 5.8 2 10.5c0 1.82.6 3.5 1.6 4.88L2.5 19l4.1-1.1A9.3 9.3 0 0011 19c4.97 0 9-3.8 9-8.5S15.97 2 11 2z" fill="white"/>
      </svg>
    </button>
    <div id="ff-chat-panel" role="dialog" aria-label="FundFndr AI assistant">
      <div id="ff-chat-header">
        <div class="ff-chat-avatar">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 1.5C4.96 1.5 2.5 3.8 2.5 6.6c0 1.1.38 2.15 1.03 3.01L2.5 12.5l2.6-.7A6.4 6.4 0 008 12.7c3.04 0 5.5-2.3 5.5-5.1S11.04 1.5 8 1.5z" fill="white"/>
          </svg>
        </div>
        <div id="ff-chat-header-text">
          <strong>FundFndr AI</strong>
          <span>Ask me anything about funds</span>
        </div>
        <button id="ff-chat-close" aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
      <div id="ff-chat-messages">
        <div class="ff-msg ff-msg-bot">Hi! I can help you compare funds, explain metrics, or find what you're looking for on FundFndr. What are you trying to do?</div>
      </div>
      <div id="ff-chat-footer">
        <textarea id="ff-chat-input" rows="1" placeholder="Ask about funds or get help navigating…"></textarea>
        <button id="ff-chat-send" aria-label="Send">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 8h12M8 2l6 6-6 6" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  `);

  // ── State & elements ──────────────────────────────────────────
  const btn      = document.getElementById('ff-chat-btn');
  const panel    = document.getElementById('ff-chat-panel');
  const messages = document.getElementById('ff-chat-messages');
  const input    = document.getElementById('ff-chat-input');
  const sendBtn  = document.getElementById('ff-chat-send');
  const closeBtn = document.getElementById('ff-chat-close');

  let isOpen    = false;
  let isBusy    = false;
  const history = []; // { role, content }

  // ── Toggle ────────────────────────────────────────────────────
  function togglePanel() {
    isOpen = !isOpen;
    panel.classList.toggle('open', isOpen);
    if (isOpen) { setTimeout(() => input.focus(), 250); }
  }
  btn.addEventListener('click', togglePanel);
  closeBtn.addEventListener('click', togglePanel);

  // ── Auto-resize textarea ──────────────────────────────────────
  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 100) + 'px';
  });

  // ── Send on Enter (Shift+Enter = newline) ─────────────────────
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  });
  sendBtn.addEventListener('click', send);

  // ── Helpers ───────────────────────────────────────────────────
  function scrollBottom() {
    messages.scrollTop = messages.scrollHeight;
  }

  function appendMessage(role, text) {
    const div = document.createElement('div');
    div.className = `ff-msg ff-msg-${role}`;
    div.textContent = text;
    messages.appendChild(div);
    scrollBottom();
    return div;
  }

  function parseNavTag(text) {
    const match = text.match(/<nav>(\{.*?\})<\/nav>/s);
    if (!match) return { clean: text, nav: null };
    try {
      return { clean: text.replace(/<nav>.*?<\/nav>/s, '').trimEnd(), nav: JSON.parse(match[1]) };
    } catch { return { clean: text, nav: null }; }
  }

  // ── Send message ──────────────────────────────────────────────
  async function send() {
    const text = input.value.trim();
    if (!text || isBusy) return;

    isBusy = true;
    sendBtn.disabled = true;
    input.value = '';
    input.style.height = 'auto';

    appendMessage('user', text);
    history.push({ role: 'user', content: text });

    // Bot bubble with streaming cursor
    const botDiv = document.createElement('div');
    botDiv.className = 'ff-msg ff-msg-bot streaming';
    const cursor = document.createElement('span');
    cursor.className = 'ff-cursor';
    botDiv.appendChild(cursor);
    messages.appendChild(botDiv);
    scrollBottom();

    let fullText = '';

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });

      if (!res.ok) throw new Error(`Server error ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop();
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const payload = line.slice(6);
          if (payload === '[DONE]') break;
          try {
            const { text: chunk, error } = JSON.parse(payload);
            if (error) throw new Error(error);
            if (chunk) {
              fullText += chunk;
              botDiv.textContent = fullText;
              botDiv.appendChild(cursor);
              scrollBottom();
            }
          } catch {}
        }
      }
    } catch (e) {
      fullText = `Sorry, something went wrong. ${e.message}`;
    }

    // Finalize: strip cursor, parse nav, render chip
    const { clean, nav } = parseNavTag(fullText);
    botDiv.classList.remove('streaming');
    botDiv.textContent = clean || '…';

    if (nav) {
      const chip = document.createElement('a');
      chip.className = 'ff-nav-chip';
      chip.href = nav.url;
      chip.innerHTML = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>${nav.label}`;
      botDiv.appendChild(document.createElement('br'));
      botDiv.appendChild(chip);
    }

    history.push({ role: 'assistant', content: clean });
    scrollBottom();
    isBusy = false;
    sendBtn.disabled = false;
    input.focus();
  }
})();
