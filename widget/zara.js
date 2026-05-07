(function () {
  'use strict';

  const CFG = {
    api:     window.ZARA_API_BASE || 'http://localhost:3001',
    name:    'Zara',
    tagline: 'CommunityTracker.ai',
    color:   '#6C47FF',
    colorHov:'#5535E8',
    colorLt: 'rgba(108,71,255,0.08)',
  };

  // ── Styles ───────────────────────────────────────────────
  const CSS = `
  #zw *{box-sizing:border-box;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif}

  #zw-btn{
    position:fixed;bottom:24px;right:24px;z-index:999997;
    width:58px;height:58px;border-radius:50%;border:none;cursor:pointer;
    background:linear-gradient(135deg,${CFG.color},#9C7BFF);
    box-shadow:0 6px 24px rgba(108,71,255,.45);
    display:flex;align-items:center;justify-content:center;
    transition:transform .2s ease,box-shadow .2s ease;
  }
  #zw-btn:hover{transform:scale(1.09);box-shadow:0 8px 32px rgba(108,71,255,.55)}
  #zw-btn svg{position:absolute;transition:opacity .2s,transform .2s}
  #zw-btn .ico-chat{opacity:1;transform:scale(1) rotate(0)}
  #zw-btn .ico-close{opacity:0;transform:scale(.4) rotate(90deg)}
  #zw-btn.open .ico-chat{opacity:0;transform:scale(.4) rotate(-90deg)}
  #zw-btn.open .ico-close{opacity:1;transform:scale(1) rotate(0)}

  #zw-badge{
    position:absolute;top:-3px;right:-3px;
    width:19px;height:19px;border-radius:50%;
    background:#EF4444;border:2px solid #fff;
    display:none;align-items:center;justify-content:center;
    font-size:10px;font-weight:700;color:#fff;
  }
  #zw-badge.on{display:flex}

  #zw-win{
    position:fixed;bottom:94px;right:24px;z-index:999998;
    width:384px;height:580px;max-height:calc(100vh - 112px);
    background:#fff;border-radius:22px;
    box-shadow:0 12px 60px rgba(0,0,0,.18),0 2px 8px rgba(0,0,0,.07);
    display:flex;flex-direction:column;overflow:hidden;
    transform:scale(.88) translateY(20px);opacity:0;pointer-events:none;
    transition:transform .28s cubic-bezier(.34,1.56,.64,1),opacity .2s ease;
    transform-origin:bottom right;
  }
  #zw-win.open{transform:scale(1) translateY(0);opacity:1;pointer-events:all}

  @media(max-width:440px){
    #zw-win{width:calc(100vw - 16px);right:8px;bottom:84px;border-radius:18px}
    #zw-btn{bottom:16px;right:16px}
  }

  /* Header */
  .zw-hdr{
    background:linear-gradient(135deg,${CFG.color},#9C7BFF);
    padding:15px 16px;display:flex;align-items:center;gap:11px;flex-shrink:0;
  }
  .zw-hdr-av{
    width:40px;height:40px;border-radius:12px;
    background:rgba(255,255,255,.22);border:1.5px solid rgba(255,255,255,.35);
    display:flex;align-items:center;justify-content:center;
    font-size:20px;flex-shrink:0;
  }
  .zw-hdr-info{flex:1;min-width:0}
  .zw-hdr-name{color:#fff;font-size:15px;font-weight:700;letter-spacing:-.01em}
  .zw-hdr-tag{color:rgba(255,255,255,.8);font-size:11.5px;display:flex;align-items:center;gap:5px;margin-top:2px}
  .zw-dot{width:6px;height:6px;border-radius:50%;background:#4ADE80;animation:zwpulse 2s infinite}
  @keyframes zwpulse{0%,100%{opacity:1}50%{opacity:.4}}
  .zw-hdr-close{
    width:28px;height:28px;border-radius:50%;border:none;cursor:pointer;
    background:rgba(255,255,255,.2);color:#fff;
    display:flex;align-items:center;justify-content:center;
    transition:background .15s;flex-shrink:0;
  }
  .zw-hdr-close:hover{background:rgba(255,255,255,.35)}

  /* Messages */
  .zw-msgs{
    flex:1;overflow-y:auto;padding:16px 14px;
    display:flex;flex-direction:column;gap:14px;
    scroll-behavior:smooth;
  }
  .zw-msgs::-webkit-scrollbar{width:4px}
  .zw-msgs::-webkit-scrollbar-thumb{background:#E0E0E0;border-radius:4px}

  /* Rows */
  .zw-row{display:flex;gap:9px;animation:zwfade .2s ease;max-width:100%}
  @keyframes zwfade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
  .zw-row.user{flex-direction:row-reverse}
  .zw-av{
    width:28px;height:28px;border-radius:8px;flex-shrink:0;
    display:flex;align-items:center;justify-content:center;margin-top:2px;
  }
  .zw-row.bot .zw-av{background:linear-gradient(135deg,${CFG.color},#9C7BFF);color:#fff;font-size:13px}
  .zw-row.user .zw-av{background:#F3F4F6;border:1px solid #E5E7EB;color:#9CA3AF;font-size:10px;font-weight:700}

  /* Bot: no bubble, clean text */
  .zw-bot-txt{
    font-size:13.5px;line-height:1.65;color:#111827;
    flex:1;min-width:0;padding-top:3px;
  }
  .zw-bot-txt p{margin:0 0 8px}.zw-bot-txt p:last-child{margin:0}
  .zw-bot-txt strong{font-weight:700}
  .zw-bot-txt ul,.zw-bot-txt ol{padding-left:16px;margin:6px 0}
  .zw-bot-txt li{margin-bottom:3px}
  .zw-bot-txt code{background:${CFG.colorLt};color:${CFG.color};padding:1px 5px;border-radius:4px;font-size:12px;font-family:monospace}
  .zw-bot-txt h3{font-size:13.5px;font-weight:700;margin:8px 0 4px}

  /* Code block */
  .zw-code{background:#1a1b2e;border-radius:9px;margin:8px 0;overflow:hidden}
  .zw-code-h{padding:7px 12px;background:#24253e;display:flex;justify-content:space-between;align-items:center}
  .zw-code-h span{font-size:10.5px;color:#7C7FA6;font-family:monospace}
  .zw-code-h button{font-size:10.5px;color:#7C7FA6;background:none;border:1px solid rgba(255,255,255,.1);padding:2px 8px;border-radius:4px;cursor:pointer;font-family:inherit;transition:all .15s}
  .zw-code-h button:hover{background:rgba(255,255,255,.08);color:#fff}
  .zw-code pre{padding:12px;overflow-x:auto;font-family:monospace;font-size:12px;line-height:1.6;color:#CDD6F4}

  /* User bubble */
  .zw-user-bbl{
    background:linear-gradient(135deg,${CFG.color},#7C5CFF);color:#fff;
    padding:10px 14px;border-radius:16px 16px 4px 16px;
    font-size:13.5px;line-height:1.55;
    max-width:80%;word-break:break-word;
  }

  /* Typing cursor */
  .zw-cursor{display:inline-block;width:2px;height:14px;background:${CFG.color};margin-left:2px;vertical-align:middle;border-radius:1px;animation:zwblink .75s step-end infinite}
  @keyframes zwblink{0%,100%{opacity:1}50%{opacity:0}}

  /* Typing dots */
  .zw-dots{display:flex;gap:4px;align-items:center;padding:4px 0}
  .zw-dots span{width:7px;height:7px;border-radius:50%;background:#C4B5FD;animation:zwbounce 1.3s ease-in-out infinite}
  .zw-dots span:nth-child(2){animation-delay:.15s}
  .zw-dots span:nth-child(3){animation-delay:.3s}
  @keyframes zwbounce{0%,60%,100%{transform:translateY(0);opacity:.5}30%{transform:translateY(-6px);opacity:1}}

  /* Suggestions */
  .zw-chips{padding:0 14px 10px;display:flex;flex-wrap:wrap;gap:6px}
  .zw-chip{
    background:#F5F3FF;border:1px solid #DDD6FE;color:${CFG.color};
    border-radius:20px;padding:5px 12px;font-size:12px;cursor:pointer;
    transition:all .15s;font-weight:500;
    border:none;font-family:inherit;
  }
  .zw-chip:hover{background:${CFG.color};color:#fff}

  /* Input */
  .zw-input-area{
    padding:10px 12px 14px;border-top:1px solid #F0EDF8;flex-shrink:0;
    display:flex;gap:8px;align-items:flex-end;
  }
  .zw-textarea{
    flex:1;border:1.5px solid #E5E7EB;border-radius:12px;
    padding:9px 12px;font-size:13.5px;resize:none;outline:none;
    min-height:38px;max-height:100px;line-height:1.45;
    transition:border-color .18s;font-family:inherit;color:#111827;
    background:#FAFAFE;
  }
  .zw-textarea:focus{border-color:${CFG.color};background:#fff}
  .zw-textarea::placeholder{color:#9CA3AF}

  .zw-send{
    width:38px;height:38px;border-radius:10px;flex-shrink:0;
    background:linear-gradient(135deg,${CFG.color},#9C7BFF);
    border:none;cursor:pointer;color:#fff;
    display:flex;align-items:center;justify-content:center;
    transition:opacity .15s,transform .1s;
  }
  .zw-send:disabled{background:#E5E7EB;cursor:not-allowed}
  .zw-send:not(:disabled):hover{transform:scale(1.06)}

  .zw-foot{
    text-align:center;padding:4px 0 10px;
    font-size:10.5px;color:#9CA3AF;flex-shrink:0;
  }
  .zw-foot a{color:${CFG.color};text-decoration:none}
  `;

  const CHIPS = [
    'What is CommunityTracker?',
    'Show me pricing',
    'Free trial available?',
    'Which plan for founders?',
  ];

  // ── State ───────────────────────────────────────────────
  let sessionId = null, open = false, busy = false, badged = false;

  // ── Markdown (lightweight) ──────────────────────────────
  function md(raw) {
    const blocks = [];
    let out = raw.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
      const safe = code.trim().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      blocks.push(
        `<div class="zw-code"><div class="zw-code-h"><span>${lang||'code'}</span>` +
        `<button onclick="(function(b){navigator.clipboard.writeText(b.closest('.zw-code').querySelector('code').textContent).then(()=>{b.textContent='Copied!';setTimeout(()=>b.textContent='Copy',1500)})})(this)">Copy</button></div>` +
        `<pre><code>${safe}</code></pre></div>`
      );
      return `\x02B${blocks.length-1}\x03`;
    });
    out = out.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
      .replace(/\*(.+?)\*/g,'<em>$1</em>')
      .replace(/`([^`]+)`/g,'<code>$1</code>')
      .replace(/^###\s+(.+)$/gm,'<h3>$1</h3>')
      .replace(/^[-*]\s+(.+)$/gm,'<li>$1</li>')
      .replace(/^\d+\.\s+(.+)$/gm,'<li>$1</li>');

    out = out.split(/\n{2,}/).map(b => {
      b = b.trim();
      if (!b) return '';
      if (/^<(h[23]|ul|li)/.test(b)) return b.startsWith('<li>') ? `<ul>${b}</ul>` : b;
      return `<p>${b.replace(/\n/g,'<br>')}</p>`;
    }).join('');

    // wrap consecutive <li> properly
    out = out.replace(/(<li>[\s\S]*?<\/li>(?=\s*<li>|$))+/g, m => `<ul>${m}</ul>`);

    blocks.forEach((cb,i) => { out = out.replace(`\x02B${i}\x03`, cb); });
    return out;
  }

  // ── Build UI ─────────────────────────────────────────────
  function injectCSS() {
    const s = document.createElement('style');
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  let msgsEl, inputEl, sendEl, chipsEl;

  function buildUI() {
    const root = document.createElement('div');
    root.id = 'zw';

    // Launcher button
    const btn = document.createElement('button');
    btn.id = 'zw-btn';
    btn.setAttribute('aria-label', 'Open Zara chat');
    btn.innerHTML = `
      <svg class="ico-chat" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
      <svg class="ico-close" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
      <div id="zw-badge">1</div>`;
    btn.addEventListener('click', toggle);

    // Chat window
    const win = document.createElement('div');
    win.id = 'zw-win';
    win.setAttribute('role', 'dialog');
    win.setAttribute('aria-label', 'Zara chat');

    // Header
    const hdr = document.createElement('div');
    hdr.className = 'zw-hdr';
    hdr.innerHTML = `
      <div class="zw-hdr-av">✦</div>
      <div class="zw-hdr-info">
        <div class="zw-hdr-name">${CFG.name}</div>
        <div class="zw-hdr-tag">
          <span class="zw-dot"></span>${CFG.tagline}
        </div>
      </div>
      <button class="zw-hdr-close" aria-label="Close">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>`;
    hdr.querySelector('.zw-hdr-close').addEventListener('click', toggle);

    // Messages
    msgsEl = document.createElement('div');
    msgsEl.className = 'zw-msgs';
    msgsEl.setAttribute('role', 'log');

    // Chips
    chipsEl = document.createElement('div');
    chipsEl.className = 'zw-chips';
    CHIPS.forEach(t => {
      const c = document.createElement('button');
      c.className = 'zw-chip';
      c.textContent = t;
      c.addEventListener('click', () => { hideChips(); doSend(t); });
      chipsEl.appendChild(c);
    });

    // Input area
    const inputArea = document.createElement('div');
    inputArea.className = 'zw-input-area';

    inputEl = document.createElement('textarea');
    inputEl.className = 'zw-textarea';
    inputEl.placeholder = 'Ask anything…';
    inputEl.rows = 1;
    inputEl.setAttribute('aria-label', 'Message input');
    inputEl.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); doSend(inputEl.value); }
    });
    inputEl.addEventListener('input', () => {
      inputEl.style.height = 'auto';
      inputEl.style.height = Math.min(inputEl.scrollHeight, 100) + 'px';
      sendEl.disabled = !inputEl.value.trim() || busy;
    });

    sendEl = document.createElement('button');
    sendEl.className = 'zw-send';
    sendEl.disabled = true;
    sendEl.setAttribute('aria-label', 'Send');
    sendEl.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`;
    sendEl.addEventListener('click', () => doSend(inputEl.value));

    inputArea.append(inputEl, sendEl);

    // Footer
    const foot = document.createElement('div');
    foot.className = 'zw-foot';
    foot.innerHTML = `Powered by <a href="https://communitytracker.ai" target="_blank" rel="noopener">CommunityTracker.ai</a>`;

    win.append(hdr, msgsEl, chipsEl, inputArea, foot);
    root.append(btn, win);
    document.body.appendChild(root);

    // Welcome message
    appendBot(`Hi! I'm **Zara**, your guide to **CommunityTracker.ai** 👋\n\nI can answer questions about our features, pricing, supported platforms, and more. What would you like to know?`);
  }

  // ── Messages ─────────────────────────────────────────────
  function scroll() { msgsEl.scrollTop = msgsEl.scrollHeight; }

  function appendUser(text) {
    const row = document.createElement('div');
    row.className = 'zw-row user';
    row.innerHTML = `<div class="zw-av">You</div><div class="zw-user-bbl"></div>`;
    row.querySelector('.zw-user-bbl').textContent = text;
    msgsEl.appendChild(row);
    scroll();
  }

  function appendBot(text) {
    const row = document.createElement('div');
    row.className = 'zw-row bot';
    row.innerHTML = `<div class="zw-av">✦</div><div class="zw-bot-txt"></div>`;
    row.querySelector('.zw-bot-txt').innerHTML = md(text);
    msgsEl.appendChild(row);
    scroll();
    return row.querySelector('.zw-bot-txt');
  }

  function addTyping() {
    const row = document.createElement('div');
    row.className = 'zw-row bot'; row.id = 'zw-typing';
    row.innerHTML = `<div class="zw-av">✦</div><div class="zw-bot-txt"><div class="zw-dots"><span></span><span></span><span></span></div></div>`;
    msgsEl.appendChild(row); scroll();
  }

  function removeTyping() { document.getElementById('zw-typing')?.remove(); }

  function hideChips() { if (chipsEl) chipsEl.style.display = 'none'; }

  // ── Send ─────────────────────────────────────────────────
  async function doSend(text) {
    text = (text || '').trim();
    if (!text || busy) return;

    if (!sessionId) {
      try {
        const r = await fetch(`${CFG.api}/api/session`, { method: 'POST' });
        sessionId = (await r.json()).sessionId;
      } catch {
        appendBot('⚠️ Cannot reach the server. Make sure the backend is running.');
        return;
      }
    }

    hideChips();
    busy = true;
    inputEl.value = '';
    inputEl.style.height = 'auto';
    sendEl.disabled = true;

    appendUser(text);
    addTyping();

    try {
      const res = await fetch(`${CFG.api}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, sessionId }),
      });

      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || `HTTP ${res.status}`);
      }

      removeTyping();

      // Streaming bot row
      const row = document.createElement('div');
      row.className = 'zw-row bot';
      row.innerHTML = `<div class="zw-av">✦</div><div class="zw-bot-txt" id="zw-stream"></div>`;
      msgsEl.appendChild(row);
      const out = document.getElementById('zw-stream');
      out.innerHTML = '<span class="zw-cursor"></span>';

      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = '', raw = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split('\n'); buf = lines.pop();
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const p = line.slice(6).trim();
          if (p === '[DONE]') break;
          try {
            const j = JSON.parse(p);
            if (j.error) throw new Error(j.error);
            if (j.text) { raw += j.text; out.innerHTML = md(raw) + '<span class="zw-cursor"></span>'; scroll(); }
          } catch {}
        }
      }

      out.innerHTML = md(raw);
      scroll();
    } catch (err) {
      removeTyping();
      appendBot(`⚠️ ${err.message || 'Something went wrong. Please try again.'}`);
    } finally {
      busy = false;
      inputEl.focus();
    }
  }

  // ── Toggle ───────────────────────────────────────────────
  function toggle() {
    open = !open;
    document.getElementById('zw-win').classList.toggle('open', open);
    document.getElementById('zw-btn').classList.toggle('open', open);
    if (open) {
      document.getElementById('zw-badge').classList.remove('on');
      setTimeout(() => inputEl.focus(), 300);
    }
  }

  // ── Init ─────────────────────────────────────────────────
  async function init() {
    injectCSS();
    buildUI();
    try {
      const r = await fetch(`${CFG.api}/api/session`, { method: 'POST' });
      sessionId = (await r.json()).sessionId;
    } catch {}
    setTimeout(() => {
      if (!open && !badged) {
        badged = true;
        document.getElementById('zw-badge').classList.add('on');
      }
    }, 4500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
