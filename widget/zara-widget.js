(function () {
  const API  = document.currentScript?.dataset.api || 'http://localhost:3001';
  const ICON = 'https://slkkbt56njcjju1f.public.blob.vercel-storage.com/Icon%20only.jpg';

  // ── Inject styles ──────────────────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    #zara-widget-btn {
      position: fixed; bottom: 24px; right: 24px; z-index: 99998;
      width: 58px; height: 58px; border-radius: 50%;
      background: linear-gradient(135deg, #1E1B4B 0%, #4C1D95 100%);
      border: none; cursor: pointer;
      padding: 0; box-shadow: 0 4px 16px rgba(0,0,0,0.28);
      display: flex; align-items: center; justify-content: center;
      transition: transform 0.2s, box-shadow 0.2s;
      transform: translateZ(0);
      will-change: transform;
      -webkit-backface-visibility: hidden;
      backface-visibility: hidden;
    }
    #zara-widget-btn:hover { transform: translateZ(0) scale(1.08); box-shadow: 0 6px 24px rgba(76,29,149,0.45); }
    #zara-widget-btn .zara-close-ico { display: none; font-size: 20px; color: #fff; }
    #zara-widget-btn.open .zara-chat-ico { display: none; }
    #zara-widget-btn.open .zara-close-ico { display: flex; }

    #zara-widget-panel {
      position: fixed; bottom: 96px; right: 24px; z-index: 99997;
      width: 370px; height: 560px;
      background: #1E1B4B; border-radius: 20px;
      box-shadow: 0 12px 48px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08);
      display: flex; flex-direction: column; overflow: hidden;
      transform: scale(0.92) translateY(16px); opacity: 0;
      pointer-events: none;
      transition: transform 0.22s cubic-bezier(.34,1.56,.64,1), opacity 0.18s ease;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    }
    #zara-widget-panel.open {
      transform: scale(1) translateY(0); opacity: 1; pointer-events: all;
    }

    /* Header */
    .zw-header {
      background: #252525;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      padding: 14px 16px; display: flex; align-items: center; gap: 10px; flex-shrink: 0;
    }
    .zw-avatar {
      width: 36px; height: 36px; border-radius: 50%;
      background: #fff;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; overflow: hidden;
      border: 1.5px solid rgba(255,255,255,0.3);
    }
    .zw-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .zw-header-info { flex: 1; }
    .zw-name { font-size: 14px; font-weight: 700; color: #fff; }
    .zw-status { font-size: 11px; color: rgba(255,255,255,0.8); display: flex; align-items: center; gap: 5px; margin-top: 1px; }
    .zw-dot { width: 6px; height: 6px; border-radius: 50%; background: #25D366; flex-shrink: 0; animation: zw-glow 2s ease-in-out infinite; }
    @keyframes zw-glow { 0%,100%{opacity:1} 50%{opacity:0.4} }
    .zw-new-btn {
      background: rgba(255,255,255,0.2); border: none; color: #fff;
      border-radius: 8px; padding: 5px 10px; font-size: 11.5px;
      cursor: pointer; font-family: inherit; transition: background 0.15s;
    }
    .zw-new-btn:hover { background: rgba(255,255,255,0.3); }

    /* Messages */
    .zw-messages {
      flex: 1; overflow-y: auto; padding: 14px 14px 8px;
      display: flex; flex-direction: column; gap: 12px;
      scroll-behavior: smooth;
      background: #fff;
    }
    .zw-messages::-webkit-scrollbar { width: 4px; }
    .zw-messages::-webkit-scrollbar-thumb { background: #e0e0e0; border-radius: 10px; }

    /* Welcome */
    .zw-welcome {
      display: flex; flex-direction: column; align-items: center;
      text-align: center; padding: 16px 8px 8px; gap: 8px;
      position: relative; overflow: hidden;
      flex: 1; min-height: 100%;
    }
    /* Decorative grid — matches CommunityTracker.ai website background */
    .zw-welcome::before {
      content: '';
      position: absolute; inset: 0; pointer-events: none; z-index: 0;
      background-image:
        linear-gradient(rgba(30,27,75,0.06) 1px, transparent 1px),
        linear-gradient(90deg, rgba(30,27,75,0.06) 1px, transparent 1px);
      background-size: 28px 28px;
    }
    .zw-welcome > * { position: relative; z-index: 1; }
    .zw-box-dec {
      position: absolute; border-radius: 6px; z-index: 0;
      background: rgba(30,27,75,0.05); border: 1px solid rgba(30,27,75,0.09);
    }
    .zw-welcome-avatar {
      width: 60px; height: 60px; border-radius: 50%;
      background: #fff;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 4px; overflow: hidden;
      box-shadow: 0 6px 20px rgba(0,0,0,0.12);
      border: 2px solid #E5E7EB;
    }
    .zw-welcome-avatar img { width: 80%; height: 80%; object-fit: contain; }
    .zw-welcome h3 {
      font-size: 16px; font-weight: 800; margin: 0; color: #1E1B4B;
    }
    .zw-welcome p { font-size: 12px; color: #6B7280; line-height: 1.55; margin: 0; }
    .zw-chips { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; margin-top: 4px; }
    .zw-chip {
      background: #fff; color: #111827; border: 1px solid #E5E7EB;
      border-radius: 9999px; padding: 5px 12px; font-size: 11.5px;
      cursor: pointer; transition: background 0.15s, border-color 0.15s; white-space: nowrap;
      font-family: inherit;
    }
    .zw-chip:hover { background: #F9FAFB; border-color: #111827; }

    /* Message rows */
    .zw-row { display: flex; gap: 8px; align-items: flex-start; }
    .zw-row.user { flex-direction: row-reverse; }
    .zw-msg-avatar {
      width: 28px; height: 28px; border-radius: 8px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center; font-size: 14px;
    }
    .zw-row.bot .zw-msg-avatar { background: #fff; border: 1px solid #E5E7EB; overflow: hidden; }
    .zw-row.bot .zw-msg-avatar img { width: 75%; height: 75%; object-fit: contain; }
    .zw-row.user .zw-msg-avatar { background: #F3F4F6; border: 1px solid #E5E7EB; font-size: 10px; font-weight: 700; color: #6B7280; }
    .zw-bubble {
      max-width: 82%; font-size: 13px; line-height: 1.6;
      padding: 9px 13px; border-radius: 16px;
    }
    .zw-row.bot .zw-bubble {
      background: #F9FAFB; color: #111827;
      border-radius: 4px 16px 16px 16px;
    }
    .zw-row.user .zw-bubble {
      background: #000; color: #fff;
      border-radius: 16px 4px 16px 16px;
    }
    .zw-bubble strong { font-weight: 650; }
    .zw-bubble ul { padding-left: 16px; margin: 6px 0; }
    .zw-bubble li { margin-bottom: 3px; }

    /* Typing dots */
    .zw-typing { display: flex; gap: 4px; align-items: center; padding: 4px 2px; }
    .zw-typing span {
      width: 7px; height: 7px; border-radius: 50%; background: #C4B5FD; opacity: 0.7;
      animation: zw-bounce 1.3s ease-in-out infinite;
    }
    .zw-typing span:nth-child(2) { animation-delay: 0.16s; }
    .zw-typing span:nth-child(3) { animation-delay: 0.32s; }
    @keyframes zw-bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }

    /* Input */
    .zw-input-wrap {
      padding: 10px 12px 14px; border-top: 1px solid #F3F4F6; flex-shrink: 0;
      background: #fff;
    }
    .zw-input-box {
      display: flex; align-items: flex-end; gap: 8px;
      background: #F9FAFB; border: 1.5px solid #E5E7EB;
      border-radius: 14px; padding: 8px 10px 8px 14px;
      transition: border-color 0.18s;
    }
    .zw-input-box:focus-within { border-color: #000; background: #fff; }
    #zw-input {
      flex: 1; border: none; outline: none; background: transparent;
      font-size: 13px; line-height: 1.5; resize: none;
      min-height: 22px; max-height: 100px; font-family: inherit; color: #111827;
    }
    #zw-input::placeholder { color: #9CA3AF; }
    .zw-send {
      width: 32px; height: 32px; border-radius: 9999px; flex-shrink: 0;
      background: #000; color: #fff; border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: background 0.15s, transform 0.1s, opacity 0.15s;
    }
    .zw-send:disabled { background: #E5E7EB; cursor: not-allowed; }
    .zw-send:not(:disabled):hover { background: #1a1a1a; transform: scale(1.06); }
    .zw-footer {
      text-align: center; font-size: 10px; color: #D1D5DB; margin-top: 6px;
    }

    @media (max-width: 480px) {
      #zara-widget-panel { width: calc(100vw - 20px); right: 10px; bottom: 88px; height: 70vh; }
      #zara-widget-btn { right: 16px; bottom: 16px; }
    }
  `;
  document.head.appendChild(style);

  // ── HTML ───────────────────────────────────────────────────────────────────
  const panel = document.createElement('div');
  panel.id = 'zara-widget-panel';
  panel.innerHTML = `
    <div class="zw-header">
      <div class="zw-avatar"><img src="${ICON}" alt="Zara"></div>
      <div class="zw-header-info">
        <div class="zw-name">Zara</div>
        <div class="zw-status"><span class="zw-dot"></span>Online · CommunityTracker.ai</div>
      </div>
      <button class="zw-new-btn" id="zw-new">+ New chat</button>
    </div>
    <div class="zw-messages" id="zw-messages">
      <div class="zw-welcome" id="zw-welcome">
        <div class="zw-box-dec" style="width:44px;height:44px;top:10px;left:14px;transform:rotate(8deg)"></div>
        <div class="zw-box-dec" style="width:28px;height:28px;top:22px;right:20px;transform:rotate(-6deg)"></div>
        <div class="zw-box-dec" style="width:32px;height:32px;top:25%;left:8px;transform:rotate(14deg)"></div>
        <div class="zw-box-dec" style="width:20px;height:20px;top:30%;right:12px;transform:rotate(-8deg)"></div>
        <div class="zw-box-dec" style="width:38px;height:38px;top:52%;left:18px;transform:rotate(-12deg)"></div>
        <div class="zw-box-dec" style="width:24px;height:24px;top:55%;right:22px;transform:rotate(10deg)"></div>
        <div class="zw-box-dec" style="width:30px;height:30px;bottom:18px;left:10px;transform:rotate(6deg)"></div>
        <div class="zw-box-dec" style="width:22px;height:22px;bottom:14px;right:14px;transform:rotate(-14deg)"></div>
        <div class="zw-welcome-avatar"><img src="${ICON}" alt="Zara"></div>
        <h3>Hi, I'm Zara!</h3>
        <p>Ask me anything about CommunityTracker — features, pricing, or which plan fits your team.</p>
        <div class="zw-chips">
          <button class="zw-chip" data-q="What is CommunityTracker.ai?">What is it?</button>
          <button class="zw-chip" data-q="What are the pricing plans?">Pricing</button>
          <button class="zw-chip" data-q="Which platforms do you monitor?">Platforms</button>
          <button class="zw-chip" data-q="Which plan is right for a startup founder?">Which plan?</button>
        </div>
      </div>
    </div>
    <div class="zw-input-wrap">
      <div class="zw-input-box">
        <textarea id="zw-input" rows="1" placeholder="Ask me anything…"></textarea>
        <button class="zw-send" id="zw-send" disabled>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
      <div class="zw-footer">Powered by CommunityTracker.ai</div>
    </div>
  `;

  const btn = document.createElement('button');
  btn.id = 'zara-widget-btn';
  btn.innerHTML = `
    <span class="zara-chat-ico">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C12 2 12.6 6.4 14.4 8.8C16.2 11.2 22 12 22 12C22 12 16.2 12.8 14.4 15.2C12.6 17.6 12 22 12 22C12 22 11.4 17.6 9.6 15.2C7.8 12.8 2 12 2 12C2 12 7.8 11.2 9.6 8.8C11.4 6.4 12 2 12 2Z"/>
      </svg>
    </span>
    <span class="zara-close-ico">✕</span>
  `;

  document.body.appendChild(panel);
  document.body.appendChild(btn);

  // ── State ──────────────────────────────────────────────────────────────────
  let sessionId = null;
  let busy = false;
  const messagesEl = document.getElementById('zw-messages');
  const inputEl    = document.getElementById('zw-input');
  const sendEl     = document.getElementById('zw-send');

  // ── Session ────────────────────────────────────────────────────────────────
  async function initSession() {
    try {
      const r = await fetch(`${API}/api/session`, { method: 'POST' });
      const d = await r.json();
      sessionId = d.sessionId;
    } catch { sessionId = null; }
  }
  initSession();

  // ── Toggle ─────────────────────────────────────────────────────────────────
  btn.addEventListener('click', () => {
    const open = panel.classList.toggle('open');
    btn.classList.toggle('open', open);
    if (open) setTimeout(() => inputEl.focus(), 250);
  });

  // ── New chat ───────────────────────────────────────────────────────────────
  document.getElementById('zw-new').addEventListener('click', async () => {
    messagesEl.innerHTML = `
      <div class="zw-welcome" id="zw-welcome">
        <div class="zw-box-dec" style="width:44px;height:44px;top:10px;left:14px;transform:rotate(8deg)"></div>
        <div class="zw-box-dec" style="width:28px;height:28px;top:22px;right:20px;transform:rotate(-6deg)"></div>
        <div class="zw-box-dec" style="width:32px;height:32px;top:25%;left:8px;transform:rotate(14deg)"></div>
        <div class="zw-box-dec" style="width:20px;height:20px;top:30%;right:12px;transform:rotate(-8deg)"></div>
        <div class="zw-box-dec" style="width:38px;height:38px;top:52%;left:18px;transform:rotate(-12deg)"></div>
        <div class="zw-box-dec" style="width:24px;height:24px;top:55%;right:22px;transform:rotate(10deg)"></div>
        <div class="zw-box-dec" style="width:30px;height:30px;bottom:18px;left:10px;transform:rotate(6deg)"></div>
        <div class="zw-box-dec" style="width:22px;height:22px;bottom:14px;right:14px;transform:rotate(-14deg)"></div>
        <div class="zw-welcome-avatar"><img src="${ICON}" alt="Zara"></div>
        <h3>Hi, I'm Zara!</h3>
        <p>Ask me anything about CommunityTracker — features, pricing, or which plan fits your team.</p>
        <div class="zw-chips">
          <button class="zw-chip" data-q="What is CommunityTracker.ai?">What is it?</button>
          <button class="zw-chip" data-q="What are the pricing plans?">Pricing</button>
          <button class="zw-chip" data-q="Which platforms do you monitor?">Platforms</button>
          <button class="zw-chip" data-q="Which plan is right for a startup founder?">Which plan?</button>
        </div>
      </div>`;
    bindChips();
    await initSession();
  });

  // ── Chips ──────────────────────────────────────────────────────────────────
  function bindChips() {
    messagesEl.querySelectorAll('.zw-chip').forEach(c =>
      c.addEventListener('click', () => send(c.dataset.q))
    );
  }
  bindChips();

  // ── Input auto-resize ──────────────────────────────────────────────────────
  inputEl.addEventListener('input', () => {
    inputEl.style.height = 'auto';
    inputEl.style.height = inputEl.scrollHeight + 'px';
    sendEl.disabled = !inputEl.value.trim();
  });
  inputEl.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (!sendEl.disabled) send(); }
  });
  sendEl.addEventListener('click', () => send());

  // ── Add message bubble ─────────────────────────────────────────────────────
  function addBubble(role, text) {
    const welcome = document.getElementById('zw-welcome');
    if (welcome) welcome.remove();

    const initials = 'You';
    const row = document.createElement('div');
    row.className = `zw-row ${role}`;
    row.innerHTML = `
      <div class="zw-msg-avatar">${role === 'bot' ? `<img src="${ICON}" alt="Zara">` : initials}</div>
      <div class="zw-bubble">${text}</div>`;
    messagesEl.appendChild(row);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return row.querySelector('.zw-bubble');
  }

  function addTyping() {
    const welcome = document.getElementById('zw-welcome');
    if (welcome) welcome.remove();

    const row = document.createElement('div');
    row.className = 'zw-row bot';
    row.id = 'zw-typing-row';
    row.innerHTML = `
      <div class="zw-msg-avatar"><img src="${ICON}" alt="Zara"></div>
      <div class="zw-bubble" style="background:#F9FAFB;padding:10px 14px">
        <div class="zw-typing"><span></span><span></span><span></span></div>
      </div>`;
    messagesEl.appendChild(row);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return row;
  }

  // ── Simple markdown ────────────────────────────────────────────────────────
  function md(text) {
    return text
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^### (.+)$/gm,'<strong>$1</strong>')
      .replace(/^## (.+)$/gm,'<strong>$1</strong>')
      .replace(/^- (.+)$/gm,'<li>$1</li>')
      .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
      .replace(/\n{2,}/g,'<br><br>')
      .replace(/\n/g,'<br>');
  }

  // ── Send ───────────────────────────────────────────────────────────────────
  async function send(text) {
    const msg = (text || inputEl.value).trim();
    if (!msg || busy) return;

    if (!sessionId) {
      await initSession();
      if (!sessionId) { addBubble('bot', 'Unable to connect to the server. Please try again shortly.'); return; }
    }

    busy = true;
    sendEl.disabled = true;
    inputEl.value = '';
    inputEl.style.height = 'auto';

    addBubble('user', msg.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'));
    const typingRow = addTyping();

    try {
      const res = await fetch(`${API}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, sessionId }),
      });

      typingRow.remove();
      const bubble = addBubble('bot', '');
      let raw = '';

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
          const payload = line.slice(6).trim();
          if (payload === '[DONE]') break;
          try {
            const { text, error } = JSON.parse(payload);
            if (error) { bubble.innerHTML = error; break; }
            if (text) { raw += text; bubble.innerHTML = md(raw); messagesEl.scrollTop = messagesEl.scrollHeight; }
          } catch {}
        }
      }
    } catch {
      typingRow?.remove();
      addBubble('bot', 'Connection lost. Please check your internet and try again.');
    }

    busy = false;
    sendEl.disabled = false;
    inputEl.focus();
  }
})();
