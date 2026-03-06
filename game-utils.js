/**
 * NXS ARCADE — Game Utilities
 * Drop this script into any game page and it auto-injects:
 *   • Floating toolbar (pause, open in about:blank, download)
 *   • Full-screen pause menu overlay (ESC or pause button)
 *
 * Usage: <script src="game-utils.js"></script>
 * Optional meta tags on the page:
 *   <meta name="game-title" content="R6 SIEGE">
 *   <meta name="game-file" content="r6siege.html">
 */

(function () {
  'use strict';

  // ── Config ────────────────────────────────────────────────────────────────
  const gameTitleMeta = document.querySelector('meta[name="game-title"]');
  const gameFileMeta  = document.querySelector('meta[name="game-file"]');
  const GAME_TITLE    = gameTitleMeta ? gameTitleMeta.content : document.title || 'GAME';
  const GAME_FILE     = gameFileMeta  ? gameFileMeta.content  : location.pathname.split('/').pop();

  // ── Styles ────────────────────────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Share+Tech+Mono&display=swap');

    /* ── TOOLBAR ── */
    #nxs-toolbar {
      position: fixed;
      top: 14px;
      right: 14px;
      z-index: 8999;
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .nxs-tbtn {
      font-family: 'Share Tech Mono', monospace;
      font-size: 10px;
      letter-spacing: 2px;
      text-transform: uppercase;
      padding: 8px 14px;
      background: rgba(7, 9, 26, 0.88);
      border: 1px solid rgba(26, 31, 58, 0.9);
      color: #4a5270;
      cursor: pointer;
      backdrop-filter: blur(12px);
      clip-path: polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%);
      transition: all 0.18s ease;
      display: flex;
      align-items: center;
      gap: 6px;
      text-decoration: none;
      white-space: nowrap;
    }
    .nxs-tbtn:hover { color: #00e5ff; border-color: rgba(0, 229, 255, 0.45); background: rgba(0, 229, 255, 0.05); }
    .nxs-tbtn.pause-btn:hover { color: #f0a500; border-color: rgba(240, 165, 0, 0.45); background: rgba(240, 165, 0, 0.05); }
    .nxs-tbtn-icon { font-size: 13px; }

    /* ── PAUSE OVERLAY ── */
    #nxs-pause {
      position: fixed;
      inset: 0;
      z-index: 9100;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.25s ease;
    }
    #nxs-pause.open {
      opacity: 1;
      pointer-events: all;
    }
    #nxs-pause-bg {
      position: absolute;
      inset: 0;
      background: rgba(3, 4, 10, 0.88);
      backdrop-filter: blur(10px);
    }
    #nxs-pause-bg::after {
      content: '';
      position: absolute;
      inset: 0;
      background: repeating-linear-gradient(
        0deg, transparent, transparent 3px,
        rgba(0,0,0,0.06) 3px, rgba(0,0,0,0.06) 4px
      );
    }
    #nxs-pause-panel {
      position: relative;
      z-index: 1;
      background: #0b0e1f;
      border: 1px solid #252c50;
      padding: 48px 56px;
      min-width: 340px;
      max-width: 460px;
      width: 90%;
      text-align: center;
      transform: translateY(20px) scale(0.97);
      transition: transform 0.28s cubic-bezier(.2,.8,.2,1);
    }
    #nxs-pause.open #nxs-pause-panel {
      transform: translateY(0) scale(1);
    }
    #nxs-pause-panel::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, #f0a500, #00e5ff, transparent);
    }
    .pause-eyebrow {
      font-family: 'Share Tech Mono', monospace;
      font-size: 9px;
      letter-spacing: 5px;
      color: #f0a500;
      text-transform: uppercase;
      margin-bottom: 6px;
    }
    .pause-title {
      font-family: 'Orbitron', monospace;
      font-size: 28px;
      font-weight: 900;
      letter-spacing: 6px;
      color: #e8eeff;
      margin-bottom: 6px;
    }
    .pause-subtitle {
      font-family: 'Share Tech Mono', monospace;
      font-size: 10px;
      letter-spacing: 3px;
      color: #4a5270;
      margin-bottom: 36px;
      text-transform: uppercase;
    }
    .pause-divider {
      width: 100%;
      height: 1px;
      background: linear-gradient(90deg, transparent, #1a1f3a, transparent);
      margin: 28px 0;
    }
    .pause-menu {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .pmenu-btn {
      font-family: 'Orbitron', monospace;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 3px;
      padding: 14px 24px;
      background: transparent;
      border: 1px solid #1a1f3a;
      color: #c8d0f0;
      cursor: pointer;
      clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
      transition: all 0.18s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      text-decoration: none;
      width: 100%;
    }
    .pmenu-btn:hover {
      border-color: #00e5ff;
      color: #00e5ff;
      background: rgba(0, 229, 255, 0.05);
      transform: translateX(4px);
    }
    .pmenu-btn.resume {
      border-color: #f0a500;
      color: #f0a500;
      background: rgba(240, 165, 0, 0.06);
    }
    .pmenu-btn.resume:hover {
      background: rgba(240, 165, 0, 0.14);
      border-color: #ffc845;
      color: #ffc845;
    }
    .pmenu-btn.danger {
      border-color: #ff2d55;
      color: #ff2d55;
    }
    .pmenu-btn.danger:hover {
      background: rgba(255, 45, 85, 0.08);
      border-color: #ff2d55;
      color: #ff2d55;
    }
    .pmenu-btn-icon { font-size: 15px; }
    .pause-hint {
      font-family: 'Share Tech Mono', monospace;
      font-size: 9px;
      letter-spacing: 3px;
      color: #252c50;
      margin-top: 24px;
      text-transform: uppercase;
    }

    /* ── DOWNLOAD TOAST ── */
    #nxs-dl-toast {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%) translateY(80px);
      z-index: 9200;
      background: #0b0e1f;
      border: 1px solid rgba(0, 255, 136, 0.3);
      padding: 13px 24px;
      font-family: 'Share Tech Mono', monospace;
      font-size: 10px;
      letter-spacing: 2px;
      color: #00ff88;
      white-space: nowrap;
      clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
      transition: transform 0.35s cubic-bezier(.2,.8,.2,1), opacity 0.35s;
      opacity: 0;
      backdrop-filter: blur(10px);
    }
    #nxs-dl-toast.show {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }
  `;
  document.head.appendChild(style);

  // ── Toolbar HTML ─────────────────────────────────────────────────────────
  const toolbar = document.createElement('div');
  toolbar.id = 'nxs-toolbar';
  toolbar.innerHTML = `
    <button class="nxs-tbtn pause-btn" id="nxs-pause-btn" title="Pause (ESC)">
      <span class="nxs-tbtn-icon">⏸</span><span>PAUSE</span>
    </button>
    <button class="nxs-tbtn" id="nxs-blank-btn" title="Open in about:blank tab">
      <span class="nxs-tbtn-icon">🔲</span><span>BLANK TAB</span>
    </button>
    <button class="nxs-tbtn" id="nxs-dl-btn" title="Download game file">
      <span class="nxs-tbtn-icon">⬇</span><span>DOWNLOAD</span>
    </button>
  `;
  document.body.appendChild(toolbar);

  // ── Pause Overlay HTML ────────────────────────────────────────────────────
  const pauseOverlay = document.createElement('div');
  pauseOverlay.id = 'nxs-pause';
  pauseOverlay.innerHTML = `
    <div id="nxs-pause-bg"></div>
    <div id="nxs-pause-panel">
      <div class="pause-eyebrow">NXS Arcade</div>
      <div class="pause-title">PAUSED</div>
      <div class="pause-subtitle" id="nxs-pause-gametitle">${GAME_TITLE}</div>
      <div class="pause-menu">
        <button class="pmenu-btn resume" id="nxs-resume-btn">
          <span class="pmenu-btn-icon">▶</span> RESUME GAME
        </button>
        <div class="pause-divider"></div>
        <button class="pmenu-btn" id="nxs-blank-btn2">
          <span class="pmenu-btn-icon">🔲</span> OPEN IN BLANK TAB
        </button>
        <button class="pmenu-btn" id="nxs-dl-btn2">
          <span class="pmenu-btn-icon">⬇</span> DOWNLOAD GAME FILE
        </button>
        <div class="pause-divider"></div>
        <a class="pmenu-btn danger" href="index.html">
          <span class="pmenu-btn-icon">🏠</span> BACK TO ARCADE
        </a>
      </div>
      <div class="pause-hint">Press ESC to resume</div>
    </div>
  `;
  document.body.appendChild(pauseOverlay);

  // ── Download Toast ────────────────────────────────────────────────────────
  const dlToast = document.createElement('div');
  dlToast.id = 'nxs-dl-toast';
  dlToast.textContent = '✓  Download started';
  document.body.appendChild(dlToast);

  // ── State ─────────────────────────────────────────────────────────────────
  let isPaused = false;

  // ── Functions ─────────────────────────────────────────────────────────────
  function openPause() {
    isPaused = true;
    pauseOverlay.classList.add('open');
    // Dispatch custom event so game code can react
    document.dispatchEvent(new CustomEvent('nxs-pause'));
  }

  function closePause() {
    isPaused = false;
    pauseOverlay.classList.remove('open');
    document.dispatchEvent(new CustomEvent('nxs-resume'));
  }

  function togglePause() {
    isPaused ? closePause() : openPause();
  }

  function openBlankTab() {
    // Grab the full HTML of the current page and open it in about:blank
    const html = document.documentElement.outerHTML;
    const win = window.open('about:blank', '_blank');
    if (win) {
      win.document.open();
      win.document.write(html);
      win.document.close();
    }
  }

  function downloadGame() {
    const html = document.documentElement.outerHTML;
    const blob = new Blob([html], { type: 'text/html' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = GAME_FILE || 'game.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    // Show toast
    dlToast.classList.add('show');
    setTimeout(() => dlToast.classList.remove('show'), 3000);
  }

  // ── Event Listeners ───────────────────────────────────────────────────────
  document.getElementById('nxs-pause-btn').addEventListener('click', togglePause);
  document.getElementById('nxs-resume-btn').addEventListener('click', closePause);

  document.getElementById('nxs-blank-btn').addEventListener('click', openBlankTab);
  document.getElementById('nxs-blank-btn2').addEventListener('click', () => { closePause(); openBlankTab(); });

  document.getElementById('nxs-dl-btn').addEventListener('click', downloadGame);
  document.getElementById('nxs-dl-btn2').addEventListener('click', () => { closePause(); downloadGame(); });

  // Click backdrop to resume
  document.getElementById('nxs-pause-bg').addEventListener('click', closePause);

  // ESC key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') togglePause();
  });

  // ── Expose API ────────────────────────────────────────────────────────────
  window.NXSUtils = { openPause, closePause, togglePause, openBlankTab, downloadGame };

})();
