// LifeLine — Mobile Phone App Controller (Vertical, S-Curve Wiggly & Horizontal)
(function () {
  'use strict';

  // Master PIN Hash (SHA-256 of '2019', identical to Freya App)
  const MASTER_PIN_HASH = '023e33504ab909cf87a6f4e4e545090e40bdc0a2153e5b68b19f7fad2b737904';
  const PIN_SESSION_KEY = 'lifeline_master_unlocked_v1';

  // Layout Direction Mode: 'vertical', 'wiggly', 'horizontal' (Default: vertical)
  let currentLayout = localStorage.getItem('lifeline_layout_mode') || 'vertical';
  let isFullscreen = localStorage.getItem('lifeline_fullscreen') === 'true';
  let horizontalZoom = 1.6; // Scale for horizontal view

  // Web Audio Context for Mobile Audio-Haptics
  let audioCtx = null;
  function getAudioCtx() {
    if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playTickSound() {
    try {
      const ctx = getAudioCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(650, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.025);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.025);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.025);
    } catch (e) {}
  }

  function playUnlockSound() {
    try {
      const ctx = getAudioCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      [520, 780].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.08, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.12);
      });
    } catch (e) {}
  }

  function haptic(ms = 10) {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(ms); } catch (e) {}
    }
    playTickSound();
  }

  // Register Service Worker for PWA installation
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    });
  }

  // Pure JavaScript SHA-256 Hash Implementation
  function sha256(ascii) {
    function rightRotate(value, amount) {
      return (value >>> amount) | (value << (32 - amount));
    }
    const words = [];
    const asciiBitLength = ascii.length * 8;
    let hash = [
      0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
      0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
    ];
    const k = [
      0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
      0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
      0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
      0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
      0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
      0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
      0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
      0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
    ];

    let i = 0;
    for (i = 0; i < ascii.length; i++) {
      words[i >> 2] |= (ascii.charCodeAt(i) & 0xff) << ((3 - (i & 3)) * 8);
    }
    words[i >> 2] |= 0x80 << ((3 - (i & 3)) * 8);
    words[(((asciiBitLength + 64) >> 9) << 4) + 15] = asciiBitLength;

    const w = new Uint32Array(64);
    for (i = 0; i < words.length; i += 16) {
      let [a, b, c, d, e, f, g, h] = hash;
      for (let j = 0; j < 64; j++) {
        if (j < 16) {
          w[j] = words[i + j] | 0;
        } else {
          const s0 = rightRotate(w[j - 15], 7) ^ rightRotate(w[j - 15], 18) ^ (w[j - 15] >>> 3);
          const s1 = rightRotate(w[j - 2], 17) ^ rightRotate(w[j - 2], 19) ^ (w[j - 2] >>> 10);
          w[j] = (w[j - 16] + s0 + w[j - 7] + s1) >>> 0;
        }
        const ch = (e & f) ^ (~e & g);
        const temp1 = (h + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) + ch + k[j] + w[j]) >>> 0;
        const maj = (a & b) ^ (a & c) ^ (b & c);
        const temp2 = ((rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) + maj) >>> 0;

        h = g; g = f; f = e; e = (d + temp1) >>> 0;
        d = c; c = b; b = a; a = (temp1 + temp2) >>> 0;
      }
      hash[0] = (hash[0] + a) >>> 0;
      hash[1] = (hash[1] + b) >>> 0;
      hash[2] = (hash[2] + c) >>> 0;
      hash[3] = (hash[3] + d) >>> 0;
      hash[4] = (hash[4] + e) >>> 0;
      hash[5] = (hash[5] + f) >>> 0;
      hash[6] = (hash[6] + g) >>> 0;
      hash[7] = (hash[7] + h) >>> 0;
    }

    const rawBytes = new Uint8Array(32);
    for (let idx = 0; idx < 8; idx++) {
      rawBytes[idx * 4] = (hash[idx] >>> 24) & 0xff;
      rawBytes[idx * 4 + 1] = (hash[idx] >>> 16) & 0xff;
      rawBytes[idx * 4 + 2] = (hash[idx] >>> 8) & 0xff;
      rawBytes[idx * 4 + 3] = hash[idx] & 0xff;
    }
    return Array.from(rawBytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // =========================================================================
  // Master PIN Security Controller (Master PIN: 2019)
  // =========================================================================
  const pinState = {
    buffer: '',
    error: false,
    unlocked: sessionStorage.getItem(PIN_SESSION_KEY) === 'true'
  };

  const lockEl = {
    screen: document.getElementById('pin-lock-screen'),
    dotsContainer: document.getElementById('pin-dots-container'),
    dots: [
      document.getElementById('pdot-0'),
      document.getElementById('pdot-1'),
      document.getElementById('pdot-2'),
      document.getElementById('pdot-3')
    ],
    errorText: document.getElementById('pin-error-text'),
    keypad: document.getElementById('pin-keypad'),
    lockBtn: document.getElementById('lock-app-btn')
  };

  function updatePinDotsUI() {
    for (let i = 0; i < 4; i++) {
      if (lockEl.dots[i]) {
        if (pinState.error) {
          lockEl.dots[i].className = 'pin-dot error';
        } else if (i < pinState.buffer.length) {
          lockEl.dots[i].className = 'pin-dot filled';
        } else {
          lockEl.dots[i].className = 'pin-dot';
        }
      }
    }
  }

  function handlePinInput(key) {
    if (pinState.error) return;
    haptic(14);

    if (key === 'clear') {
      pinState.buffer = '';
      updatePinDotsUI();
      return;
    }
    if (key === 'back') {
      pinState.buffer = pinState.buffer.slice(0, -1);
      updatePinDotsUI();
      return;
    }
    if (/^[0-9]$/.test(key) && pinState.buffer.length < 4) {
      pinState.buffer += key;
      updatePinDotsUI();
      if (pinState.buffer.length === 4) {
        verifyMasterPin();
      }
    }
  }

  function verifyMasterPin() {
    const enteredHash = sha256(pinState.buffer);
    if (enteredHash === MASTER_PIN_HASH) {
      playUnlockSound();
      pinState.unlocked = true;
      sessionStorage.setItem(PIN_SESSION_KEY, 'true');
      if (lockEl.screen) lockEl.screen.classList.add('unlocked');
      if (lockEl.errorText) lockEl.errorText.textContent = '';
      pinState.buffer = '';
      updatePinDotsUI();

      // Default landing: auto-scroll to Today on unlock!
      setTimeout(() => {
        scrollToToday(true);
      }, 400);
    } else {
      pinState.error = true;
      updatePinDotsUI();
      if (lockEl.dotsContainer) lockEl.dotsContainer.classList.add('pin-shake');
      if (lockEl.errorText) lockEl.errorText.textContent = 'Incorrect PIN. Please try again.';

      setTimeout(() => {
        pinState.buffer = '';
        pinState.error = false;
        if (lockEl.dotsContainer) lockEl.dotsContainer.classList.remove('pin-shake');
        updatePinDotsUI();
      }, 500);
    }
  }

  function lockApp() {
    haptic(15);
    pinState.unlocked = false;
    sessionStorage.removeItem(PIN_SESSION_KEY);
    pinState.buffer = '';
    updatePinDotsUI();
    if (lockEl.errorText) lockEl.errorText.textContent = '';
    if (lockEl.screen) lockEl.screen.classList.remove('unlocked');
  }

  function setupPinSecurity() {
    if (pinState.unlocked && lockEl.screen) {
      lockEl.screen.classList.add('unlocked');
    }

    if (lockEl.keypad) {
      lockEl.keypad.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;
        const key = btn.dataset?.key;
        if (key) handlePinInput(key);
      });
    }

    window.addEventListener('keydown', (e) => {
      if (!pinState.unlocked) {
        if (/^[0-9]$/.test(e.key)) {
          handlePinInput(e.key);
        } else if (e.key === 'Backspace') {
          handlePinInput('back');
        } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
          handlePinInput('clear');
        }
      }
    });

    if (lockEl.lockBtn) {
      lockEl.lockBtn.addEventListener('click', lockApp);
    }
  }

  // =========================================================================
  // DOM References
  // =========================================================================
  const dom = {
    mount: document.getElementById('timeline-container-mount'),
    btnVertical: document.getElementById('btn-layout-vertical'),
    btnWiggly: document.getElementById('btn-layout-wiggly'),
    btnHorizontal: document.getElementById('btn-layout-horizontal'),
    jumpTodayBtn: document.getElementById('jump-today-btn'),
    islandLabel: document.getElementById('island-mode-label'),
    phoneClock: document.getElementById('phone-clock'),
    fullscreenBtn: document.getElementById('fullscreen-toggle-btn'),

    // Demographics Drawer
    openDemoBtn: document.getElementById('open-demographics-btn'),
    demoSummaryLabel: document.getElementById('demo-summary-label'),
    demoDrawer: document.getElementById('demographics-drawer-overlay'),
    closeDemoBtn: document.getElementById('close-demo-drawer-btn'),
    applyDemoBtn: document.getElementById('apply-demographics-btn'),
    heritageChips: document.getElementById('heritage-chip-group'),
    regionChips: document.getElementById('region-chip-group'),
    genderChips: document.getElementById('gender-chip-group'),
    birthYearInput: document.getElementById('drawer-birth-year-input'),

    // Detail Modal Sheet
    modalOverlay: document.getElementById('modal-overlay'),
    modalSheet: document.getElementById('modal-sheet'),
    sheetDragHandle: document.getElementById('sheet-drag-handle'),
    sheetBadge: document.getElementById('sheet-badge'),
    sheetYearBadge: document.getElementById('sheet-year-badge'),
    sheetHeaderTitle: document.getElementById('sheet-header-title'),
    sheetWhatHappens: document.getElementById('sheet-what-happens'),
    sheetWhatPeersDo: document.getElementById('sheet-what-peers-do'),
    sheetActionsList: document.getElementById('sheet-actions-list'),
    closeSheetBtn: document.getElementById('close-sheet-btn')
  };

  // Helper: Format Summary Label for Top Nav
  function updateDemoSummaryLabel() {
    if (!dom.demoSummaryLabel) return;
    const heritageMap = {
      indian: "🇮🇳 Indian",
      american: "🇺🇸 American",
      jewish: "🕎 Jewish",
      east_asian: "🏮 East Asian",
      hispanic: "🇲🇽 Hispanic",
      all: "🌐 All"
    };
    const regionMap = {
      bay_area: "Bay Area",
      socal: "SoCal",
      nyc: "NYC",
      texas: "Texas",
      seattle: "Seattle",
      us_general: "USA"
    };
    const hText = heritageMap[userDemographics.heritage] || "🌐 All";
    const rText = regionMap[userDemographics.region] || "USA";
    dom.demoSummaryLabel.textContent = `${hText} · ${rText}`;
  }

  // =========================================================================
  // DETAIL MODAL SHEET CONTROLLER
  // =========================================================================
  function openDetailSheet(evt) {
    if (!dom.modalOverlay) return;
    const calYear = getYearForAge(evt.age);

    if (dom.sheetBadge) {
      dom.sheetBadge.textContent = evt.isCultural ? (evt.timing || `Age ${evt.age} · Tradition`) : `Age ${evt.age} · ${evt.category}`;
    }
    if (dom.sheetYearBadge) {
      dom.sheetYearBadge.textContent = `Year ${calYear}`;
    }
    if (dom.sheetHeaderTitle) {
      dom.sheetHeaderTitle.textContent = evt.title;
    }
    if (dom.sheetWhatHappens) {
      dom.sheetWhatHappens.textContent = evt.whatHappens;
    }
    if (dom.sheetWhatPeersDo) {
      dom.sheetWhatPeersDo.textContent = `“${evt.whatPeersDo}”`;
    }

    if (dom.sheetActionsList) {
      const items = evt.actions || [];
      dom.sheetActionsList.innerHTML = items.map(action => `
        <li class="action-row">
          <span class="action-dot"></span>
          <span>${action}</span>
        </li>
      `).join('');
    }

    dom.modalOverlay.classList.add('open');
  }

  function closeDetailSheet() {
    haptic(10);
    if (dom.modalOverlay) {
      dom.modalOverlay.classList.remove('open');
    }
  }

  function setupDragToDismissSheet() {
    const sheet = dom.modalSheet;
    const handle = dom.sheetDragHandle;
    if (!sheet || !handle) return;

    let startY = 0;
    let currentY = 0;
    let isDragging = false;

    function onTouchStart(e) {
      startY = e.touches ? e.touches[0].pageY : e.pageY;
      isDragging = true;
      sheet.style.transition = 'none';
    }

    function onTouchMove(e) {
      if (!isDragging) return;
      currentY = e.touches ? e.touches[0].pageY : e.pageY;
      const deltaY = currentY - startY;
      if (deltaY > 0) {
        sheet.style.transform = `translateY(${deltaY}px)`;
      }
    }

    function onTouchEnd() {
      if (!isDragging) return;
      isDragging = false;
      sheet.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
      const deltaY = currentY - startY;
      if (deltaY > 90) {
        closeDetailSheet();
        sheet.style.transform = '';
      } else {
        sheet.style.transform = 'translateY(0)';
      }
    }

    handle.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    handle.addEventListener('mousedown', onTouchStart);
    window.addEventListener('mousemove', onTouchMove);
    window.addEventListener('mouseup', onTouchEnd);
  }

  // =========================================================================
  // LAYOUT 1: VERTICAL TIMELINE (Full Phone Screen Utilization)
  // =========================================================================
  function renderVerticalLayout(events) {
    dom.mount.innerHTML = '';

    const viewport = document.createElement('div');
    viewport.className = 'timeline-viewport-vertical';
    viewport.id = 'active-timeline-viewport';

    const track = document.createElement('div');
    track.className = 'vertical-track';
    
    // Total track height: spaced gracefully
    const rowHeight = 125;
    const totalHeight = events.length * rowHeight + 200;
    track.style.minHeight = `${totalHeight}px`;

    // Central Luminous Beam
    const beam = document.createElement('div');
    beam.className = 'vertical-axis-beam';
    track.appendChild(beam);

    events.forEach((evt, idx) => {
      const isLeft = (idx % 2 === 0);
      const isToday = (evt.id === 'core-32');
      const calYear = getYearForAge(evt.age);
      const y = idx * rowHeight + 90;

      const row = document.createElement('div');
      row.className = `vertical-item-row ${isLeft ? 'align-left' : 'align-right'}`;
      row.style.top = `${y}px`;
      if (isToday) row.id = 'today-anchor-row';

      // Horizontal connecting stem line
      const stem = document.createElement('div');
      stem.className = 'vertical-stem-line';
      row.appendChild(stem);

      // Center Node on the Beam
      const dot = document.createElement('div');
      dot.className = `vertical-dot-node ${isToday ? 'today-node' : ''}`;
      dot.title = `Age ${evt.age} (${calYear}) · ${evt.title}`;

      // Today Animated Radar Ping Rings
      if (isToday) {
        const beacon = document.createElement('div');
        beacon.className = 'today-beacon';
        beacon.style.top = '50%';
        beacon.style.left = '50%';
        beacon.innerHTML = `
          <div class="today-beacon-ring"></div>
          <div class="today-beacon-ring"></div>
        `;
        dot.appendChild(beacon);
      }

      // Card Content
      const card = document.createElement('div');
      card.className = `vertical-card ${evt.isCultural ? 'cultural' : ''} ${isToday ? 'today-highlight' : ''}`;
      
      const badgeText = isToday ? 'TODAY · OCT 2026' : (evt.isCultural ? (evt.timing || 'Tradition') : `Age ${evt.age}`);
      const tagColor = isToday ? '#34d399' : (evt.isCultural ? '#f59e0b' : '#38bdf8');

      card.innerHTML = `
        <div class="card-badge-row">
          <span class="card-age-tag" style="color: ${tagColor};">${badgeText}</span>
          <span class="card-year-tag">${calYear}</span>
        </div>
        <div class="card-title">${evt.title}</div>
        <div class="card-category">${evt.category || 'Lifecycle Stage'}</div>
      `;

      // Tactile Tap Handlers
      function handleItemTap(e) {
        e.stopPropagation();
        haptic(18);

        // Tactile ripple shockwave
        const ripple = document.createElement('div');
        ripple.className = 'dot-ripple';
        dot.appendChild(ripple);
        setTimeout(() => ripple.remove(), 550);

        openDetailSheet(evt);
      }

      dot.addEventListener('click', handleItemTap);
      card.addEventListener('click', handleItemTap);

      row.appendChild(card);
      row.appendChild(dot);
      track.appendChild(row);
    });

    viewport.appendChild(track);
    dom.mount.appendChild(viewport);
  }

  // =========================================================================
  // LAYOUT 2: S-CURVE WIGGLY RIVER PATH (Live Liquid Life Path)
  // =========================================================================
  function renderWigglyLayout(events) {
    dom.mount.innerHTML = '';

    const viewport = document.createElement('div');
    viewport.className = 'timeline-viewport-wiggly';
    viewport.id = 'active-timeline-viewport';

    const track = document.createElement('div');
    track.className = 'wiggly-track';

    const rowHeight = 135;
    const totalHeight = events.length * rowHeight + 220;
    track.style.minHeight = `${totalHeight}px`;

    // Calculate curve points
    const phoneWidth = Math.min(dom.mount.clientWidth || 390, 420);
    const leftX = phoneWidth * 0.28;
    const rightX = phoneWidth * 0.72;

    const points = events.map((evt, idx) => {
      const isLeft = (idx % 2 === 0);
      return {
        x: isLeft ? leftX : rightX,
        y: idx * rowHeight + 90,
        isLeft,
        evt,
        isToday: (evt.id === 'core-32')
      };
    });

    // Build SVG Bézier River Path
    let pathD = '';
    if (points.length > 0) {
      pathD = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const cpY = (prev.y + curr.y) / 2;
        pathD += ` C ${prev.x} ${cpY}, ${curr.x} ${cpY}, ${curr.x} ${curr.y}`;
      }
    }

    const svgNs = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNs, "svg");
    svg.setAttribute("class", "wiggly-svg-canvas");
    svg.setAttribute("viewBox", `0 0 ${phoneWidth} ${totalHeight}`);
    svg.setAttribute("preserveAspectRatio", "none");

    svg.innerHTML = `
      <defs>
        <linearGradient id="riverGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.8" />
          <stop offset="30%" stop-color="#06b6d4" stop-opacity="0.95" />
          <stop offset="70%" stop-color="#3b82f6" stop-opacity="0.9" />
          <stop offset="100%" stop-color="#60a5fa" stop-opacity="0.8" />
        </linearGradient>
      </defs>
      <path class="wiggly-river-path" d="${pathD}" />
      <path class="wiggly-energy-pulse" d="${pathD}" />
    `;
    track.appendChild(svg);

    // Place Nodes along the River Path
    points.forEach(pt => {
      const calYear = getYearForAge(pt.evt.age);

      const anchor = document.createElement('div');
      anchor.className = 'wiggly-node-anchor';
      anchor.style.left = `${pt.x}px`;
      anchor.style.top = `${pt.y}px`;
      if (pt.isToday) anchor.id = 'today-anchor-row';

      const dot = document.createElement('div');
      dot.className = `wiggly-dot-node ${pt.isToday ? 'today-node' : ''}`;
      dot.title = `Age ${pt.evt.age} (${calYear}) · ${pt.evt.title}`;

      // Today Radar Beacon
      if (pt.isToday) {
        const beacon = document.createElement('div');
        beacon.className = 'today-beacon';
        beacon.style.top = '50%';
        beacon.style.left = '50%';
        beacon.innerHTML = `
          <div class="today-beacon-ring"></div>
          <div class="today-beacon-ring"></div>
        `;
        dot.appendChild(beacon);
      }

      // Card sits on roomy side of river meander
      const card = document.createElement('div');
      card.className = `wiggly-card ${pt.isLeft ? 'card-on-right' : 'card-on-left'} ${pt.evt.isCultural ? 'cultural' : ''} ${pt.isToday ? 'today-highlight' : ''}`;

      const badgeText = pt.isToday ? 'TODAY · OCT 2026' : (pt.evt.isCultural ? (pt.evt.timing || 'Tradition') : `Age ${pt.evt.age}`);
      const tagColor = pt.isToday ? '#34d399' : (pt.evt.isCultural ? '#f59e0b' : '#38bdf8');

      card.innerHTML = `
        <div class="card-badge-row">
          <span class="card-age-tag" style="color: ${tagColor};">${badgeText}</span>
          <span class="card-year-tag">${calYear}</span>
        </div>
        <div class="card-title">${pt.evt.title}</div>
        <div class="card-category">${pt.evt.category || 'Lifecycle Stage'}</div>
      `;

      function handleItemTap(e) {
        e.stopPropagation();
        haptic(18);

        const ripple = document.createElement('div');
        ripple.className = 'dot-ripple';
        dot.appendChild(ripple);
        setTimeout(() => ripple.remove(), 550);

        openDetailSheet(pt.evt);
      }

      dot.addEventListener('click', handleItemTap);
      card.addEventListener('click', handleItemTap);

      anchor.appendChild(dot);
      anchor.appendChild(card);
      track.appendChild(anchor);
    });

    viewport.appendChild(track);
    dom.mount.appendChild(viewport);
  }

  // =========================================================================
  // LAYOUT 3: HORIZONTAL SCRUBBER (With Zoom & Staggered Cards)
  // =========================================================================
  function renderHorizontalLayout(events) {
    dom.mount.innerHTML = '';

    const viewport = document.createElement('div');
    viewport.className = 'timeline-viewport-horizontal';
    viewport.id = 'active-timeline-viewport';

    const track = document.createElement('div');
    track.className = 'horizontal-track';

    const minAge = 18;
    const maxAge = 72;
    const pxPerYear = 48 * horizontalZoom;
    const padding = 180;
    const totalWidth = padding * 2 + (maxAge - minAge) * pxPerYear;
    track.style.width = `${totalWidth}px`;

    // Horizontal Glowing Axis Line
    const axis = document.createElement('div');
    axis.className = 'horizontal-axis';
    track.appendChild(axis);

    // Year Ticks & Labels
    for (let age = minAge; age <= maxAge; age++) {
      const x = padding + (age - minAge) * pxPerYear;
      const isMajor = (age % 5 === 0);

      const tick = document.createElement('div');
      tick.className = `year-tick ${isMajor ? 'major' : ''}`;
      tick.style.left = `${x}px`;
      track.appendChild(tick);

      if (isMajor) {
        const calYear = getYearForAge(age);
        const label = document.createElement('span');
        label.className = 'year-tick-label';
        label.style.left = `${x}px`;
        label.textContent = `${age} ('${calYear.toString().slice(-2)})`;
        track.appendChild(label);
      }
    }

    // Nodes and Alternating Top / Bottom Cards
    let ageClusterCounts = {};
    events.forEach((evt, idx) => {
      const isToday = (evt.id === 'core-32');
      const calYear = getYearForAge(evt.age);

      // Stagger multiple events sharing the same age
      if (!ageClusterCounts[evt.age]) ageClusterCounts[evt.age] = 0;
      const subIndex = ageClusterCounts[evt.age]++;
      const clusterOffset = subIndex * 62; // 62px spacing between items of same age

      const x = padding + (evt.age - minAge) * pxPerYear + clusterOffset;
      const isTop = (idx % 2 === 1);

      const wrapper = document.createElement('div');
      wrapper.className = 'horizontal-node-wrapper';
      wrapper.style.left = `${x}px`;
      if (isToday) wrapper.id = 'today-anchor-row';

      // Dot Node
      const dot = document.createElement('div');
      dot.className = `horizontal-dot ${isToday ? 'today-node' : ''}`;
      dot.title = `Age ${evt.age} (${calYear}) · ${evt.title}`;

      if (isToday) {
        const beacon = document.createElement('div');
        beacon.className = 'today-beacon';
        beacon.style.top = '50%';
        beacon.style.left = '50%';
        beacon.innerHTML = `
          <div class="today-beacon-ring"></div>
          <div class="today-beacon-ring"></div>
        `;
        dot.appendChild(beacon);
      }

      // Vertical connecting stem
      const stem = document.createElement('div');
      stem.className = `horizontal-stem ${isTop ? 'stem-top' : 'stem-bottom'}`;

      // Card
      const card = document.createElement('div');
      card.className = `horizontal-card ${isTop ? 'position-top' : 'position-bottom'} ${evt.isCultural ? 'cultural' : ''} ${isToday ? 'today-highlight' : ''}`;

      const badgeText = isToday ? 'TODAY · OCT 2026' : (evt.isCultural ? (evt.timing || 'Tradition') : `Age ${evt.age}`);
      const tagColor = isToday ? '#34d399' : (evt.isCultural ? '#f59e0b' : '#38bdf8');

      card.innerHTML = `
        <div class="card-badge-row">
          <span class="card-age-tag" style="color: ${tagColor};">${badgeText}</span>
          <span class="card-year-tag">${calYear}</span>
        </div>
        <div class="card-title">${evt.title}</div>
        <div class="card-category">${evt.category || 'Lifecycle Stage'}</div>
      `;

      function handleItemTap(e) {
        e.stopPropagation();
        haptic(18);

        const ripple = document.createElement('div');
        ripple.className = 'dot-ripple';
        dot.appendChild(ripple);
        setTimeout(() => ripple.remove(), 550);

        openDetailSheet(evt);
      }

      dot.addEventListener('click', handleItemTap);
      card.addEventListener('click', handleItemTap);

      wrapper.appendChild(stem);
      wrapper.appendChild(card);
      wrapper.appendChild(dot);
      track.appendChild(wrapper);
    });

    viewport.appendChild(track);
    dom.mount.appendChild(viewport);

    // Horizontal Drag Panning
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    viewport.addEventListener('mousedown', (e) => {
      isDown = true;
      startX = e.pageX - viewport.offsetLeft;
      scrollLeft = viewport.scrollLeft;
    });
    window.addEventListener('mouseup', () => { isDown = false; });
    viewport.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - viewport.offsetLeft;
      viewport.scrollLeft = scrollLeft - (x - startX) * 1.5;
    });
  }

  // =========================================================================
  // RENDER MASTER & DEFAULT LANDING ON TODAY
  // =========================================================================
  function renderActiveLayout() {
    const events = getActiveTimelineEvents();

    if (currentLayout === 'vertical') {
      renderVerticalLayout(events);
      if (dom.islandLabel) dom.islandLabel.textContent = 'VERTICAL';
    } else if (currentLayout === 'wiggly') {
      renderWigglyLayout(events);
      if (dom.islandLabel) dom.islandLabel.textContent = 'S-CURVE';
    } else {
      renderHorizontalLayout(events);
      if (dom.islandLabel) dom.islandLabel.textContent = 'HORIZ';
    }

    updateLayoutSwitcherUI();
  }

  function updateLayoutSwitcherUI() {
    [dom.btnVertical, dom.btnWiggly, dom.btnHorizontal].forEach(btn => {
      if (btn && btn.dataset) {
        if (btn.dataset.layout === currentLayout) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      }
    });
  }

  // DEFAULT LANDING: Focus directly on Today (Age 32 · Oct 2026)
  function scrollToToday(animate = true) {
    const viewport = document.getElementById('active-timeline-viewport');
    const todayEl = document.getElementById('today-anchor-row');
    if (!viewport || !todayEl) return;

    if (currentLayout === 'horizontal') {
      const targetLeft = todayEl.offsetLeft - (viewport.clientWidth / 2);
      viewport.scrollTo({
        left: targetLeft,
        behavior: animate ? 'smooth' : 'auto'
      });
    } else {
      const targetTop = todayEl.offsetTop - (viewport.clientHeight / 2);
      viewport.scrollTo({
        top: Math.max(0, targetTop),
        behavior: animate ? 'smooth' : 'auto'
      });
    }

    // Trigger subtle beacon pulse highlight
    const node = todayEl.querySelector('.vertical-dot-node, .wiggly-dot-node, .horizontal-dot');
    if (node) {
      node.style.transform = 'scale(1.4)';
      setTimeout(() => {
        node.style.transform = '';
      }, 400);
    }
  }

  // Switch Layout Direction
  function setLayoutMode(mode) {
    if (currentLayout === mode) return;
    haptic(12);
    currentLayout = mode;
    localStorage.setItem('lifeline_layout_mode', mode);
    renderActiveLayout();
    setTimeout(() => {
      scrollToToday(true);
    }, 150);
  }

  // =========================================================================
  // DEMOGRAPHICS & CULTURAL FILTER DRAWER
  // =========================================================================
  function setupDemographicsDrawer() {
    updateDemoSummaryLabel();

    if (dom.openDemoBtn && dom.demoDrawer) {
      dom.openDemoBtn.addEventListener('click', () => {
        haptic(10);
        // Sync active state of chips in drawer
        syncDrawerForm();
        dom.demoDrawer.classList.add('open');
      });
    }

    if (dom.closeDemoBtn && dom.demoDrawer) {
      dom.closeDemoBtn.addEventListener('click', () => {
        haptic(10);
        dom.demoDrawer.classList.remove('open');
      });
    }

    // Heritage Chips
    if (dom.heritageChips) {
      dom.heritageChips.addEventListener('click', (e) => {
        const chip = e.target.closest('.filter-choice-chip');
        if (!chip) return;
        haptic(8);
        dom.heritageChips.querySelectorAll('.filter-choice-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
      });
    }

    // Region Chips
    if (dom.regionChips) {
      dom.regionChips.addEventListener('click', (e) => {
        const chip = e.target.closest('.filter-choice-chip');
        if (!chip) return;
        haptic(8);
        dom.regionChips.querySelectorAll('.filter-choice-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
      });
    }

    // Gender Chips
    if (dom.genderChips) {
      dom.genderChips.addEventListener('click', (e) => {
        const chip = e.target.closest('.filter-choice-chip');
        if (!chip) return;
        haptic(8);
        dom.genderChips.querySelectorAll('.filter-choice-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
      });
    }

    // Apply Settings
    if (dom.applyDemoBtn) {
      dom.applyDemoBtn.addEventListener('click', () => {
        haptic(20);

        const activeHeritage = dom.heritageChips ? dom.heritageChips.querySelector('.active')?.dataset.heritage || 'indian' : 'indian';
        const activeRegion = dom.regionChips ? dom.regionChips.querySelector('.active')?.dataset.region || 'bay_area' : 'bay_area';
        const activeGender = dom.genderChips ? dom.genderChips.querySelector('.active')?.dataset.gender || 'all' : 'all';
        const birthYear = parseInt(dom.birthYearInput?.value || '1994', 10);

        userDemographics.heritage = activeHeritage;
        userDemographics.region = activeRegion;
        userDemographics.gender = activeGender;
        userBirthYear = (birthYear >= 1940 && birthYear <= 2026) ? birthYear : 1994;

        localStorage.setItem('lifeline_user_demographics', JSON.stringify(userDemographics));
        localStorage.setItem('lifeline_birth_year', userBirthYear);

        updateDemoSummaryLabel();
        dom.demoDrawer.classList.remove('open');

        // Re-render and scroll to Today
        renderActiveLayout();
        setTimeout(() => {
          scrollToToday(true);
        }, 150);
      });
    }
  }

  function syncDrawerForm() {
    if (dom.heritageChips) {
      dom.heritageChips.querySelectorAll('.filter-choice-chip').forEach(c => {
        c.classList.toggle('active', c.dataset.heritage === userDemographics.heritage);
      });
    }
    if (dom.regionChips) {
      dom.regionChips.querySelectorAll('.filter-choice-chip').forEach(c => {
        c.classList.toggle('active', c.dataset.region === userDemographics.region);
      });
    }
    if (dom.genderChips) {
      dom.genderChips.querySelectorAll('.filter-choice-chip').forEach(c => {
        c.classList.toggle('active', c.dataset.gender === (userDemographics.gender || 'all'));
      });
    }
    if (dom.birthYearInput) {
      dom.birthYearInput.value = userBirthYear;
    }
  }

  // =========================================================================
  // CONTROLS & EVENT LISTENERS
  // =========================================================================
  function setupControls() {
    // Layout switcher buttons
    if (dom.btnVertical) dom.btnVertical.addEventListener('click', () => setLayoutMode('vertical'));
    if (dom.btnWiggly) dom.btnWiggly.addEventListener('click', () => setLayoutMode('wiggly'));
    if (dom.btnHorizontal) dom.btnHorizontal.addEventListener('click', () => setLayoutMode('horizontal'));

    // Jump to Today button
    if (dom.jumpTodayBtn) {
      dom.jumpTodayBtn.addEventListener('click', () => {
        haptic(15);
        scrollToToday(true);
      });
    }

    // Fullscreen / Phone Frame Toggle
    function updateFullscreenUI() {
      if (isFullscreen) {
        document.body.classList.add('fullscreen-active');
        if (dom.fullscreenBtn) dom.fullscreenBtn.textContent = '📱';
      } else {
        document.body.classList.remove('fullscreen-active');
        if (dom.fullscreenBtn) dom.fullscreenBtn.textContent = '🖥️';
      }
    }
    updateFullscreenUI();

    if (dom.fullscreenBtn) {
      dom.fullscreenBtn.addEventListener('click', () => {
        haptic(10);
        isFullscreen = !isFullscreen;
        localStorage.setItem('lifeline_fullscreen', isFullscreen);
        updateFullscreenUI();
        renderActiveLayout();
        setTimeout(() => scrollToToday(false), 100);
      });
    }

    // Detail Sheet Close
    if (dom.closeSheetBtn) {
      dom.closeSheetBtn.addEventListener('click', closeDetailSheet);
    }
    if (dom.modalOverlay) {
      dom.modalOverlay.addEventListener('click', (e) => {
        if (e.target === dom.modalOverlay) {
          closeDetailSheet();
        }
      });
    }

    window.addEventListener('keydown', (e) => {
      if (pinState.unlocked) {
        if (e.key === 'Escape') closeDetailSheet();
      }
    });

    window.addEventListener('resize', () => {
      renderActiveLayout();
    });
  }

  // Live Phone Clock
  function startLiveClock() {
    function updateClock() {
      if (!dom.phoneClock) return;
      const d = new Date();
      let h = d.getHours();
      const m = d.getMinutes().toString().padStart(2, '0');
      h = h % 12 || 12;
      dom.phoneClock.textContent = `${h}:${m}`;
    }
    updateClock();
    setInterval(updateClock, 15000);
  }

  // =========================================================================
  // APP INITIALIZATION
  // =========================================================================
  function init() {
    startLiveClock();
    setupPinSecurity();
    setupDragToDismissSheet();
    setupDemographicsDrawer();
    setupControls();

    // Render active layout
    renderActiveLayout();

    // Default landing: scroll directly to Today if unlocked
    if (pinState.unlocked) {
      setTimeout(() => {
        scrollToToday(false);
      }, 250);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
