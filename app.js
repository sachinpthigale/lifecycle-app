// LifeLine — Production Phone App Controller (Master PIN, Haptics & Service Worker)
(function () {
  'use strict';

  // Master PIN Hash (SHA-256 of '2019', identical to Freya App)
  const MASTER_PIN_HASH = '023e33504ab909cf87a6f4e4e545090e40bdc0a2153e5b68b19f7fad2b737904';
  const PIN_SESSION_KEY = 'lifeline_master_unlocked_v1';

  // Register Phone App Service Worker for Offline & Fast App Launch
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch((err) => {
        console.warn('SW registration failed:', err);
      });
    });
  }

  // Native Mobile Haptic Feedback Helper
  function haptic(ms = 10) {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(ms); } catch (e) {}
    }
  }

  // Pure JavaScript SHA-256 Hash Implementation
  function sha256(ascii) {
    function rightRotate(value, amount) {
      return (value >>> amount) | (value << (32 - amount));
    }

    const mathPow = Math.pow;
    const maxWord = mathPow(2, 32);
    let result = '';

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
  // PIN Security Controller
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
    haptic(12);

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
      // Success! Unlock app
      haptic(25);
      pinState.unlocked = true;
      sessionStorage.setItem(PIN_SESSION_KEY, 'true');
      if (lockEl.screen) lockEl.screen.classList.add('unlocked');
      if (lockEl.errorText) lockEl.errorText.textContent = '';
      pinState.buffer = '';
      updatePinDotsUI();
    } else {
      // Failed PIN: shake animation and clear
      haptic([30, 50, 30]);
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
        const key = btn.dataset.key;
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
  // Timeline Scrubber & Semantic Zoom Engine
  // =========================================================================
  const MIN_AGE = 18;
  const MAX_AGE = 72;
  const PADDING = 140;

  const ZOOM_LEVELS = {
    1: {
      name: "Macro View",
      indicator: "Macro View · 4 Life Epochs",
      pxPerYear: 24,
      maxTier: 1,
      tickStep: 10,
      showMinorTicks: false
    },
    2: {
      name: "Decade View",
      indicator: "Decade View · 11 Milestones",
      pxPerYear: 48,
      maxTier: 2,
      tickStep: 5,
      showMinorTicks: true
    },
    3: {
      name: "Detailed View",
      indicator: "Detailed View · 21 Milestones",
      pxPerYear: 92,
      maxTier: 3,
      tickStep: 1,
      showMinorTicks: true
    }
  };

  let currentZoomLevel = 2; // Default to Decade view

  const el = {
    viewport: document.getElementById('timeline-viewport'),
    track: document.getElementById('timeline-track'),
    zoomBtns: document.querySelectorAll('.zoom-btn'),
    zoomOutBtn: document.getElementById('zoom-out-btn'),
    zoomInBtn: document.getElementById('zoom-in-btn'),
    zoomIndicatorText: document.getElementById('zoom-indicator-text'),
    modalOverlay: document.getElementById('modal-overlay'),
    sheetBadge: document.getElementById('sheet-badge'),
    sheetHeaderTitle: document.getElementById('sheet-header-title'),
    sheetWhatHappens: document.getElementById('sheet-what-happens'),
    sheetWhatPeersDo: document.getElementById('sheet-what-peers-do'),
    sheetActionsList: document.getElementById('sheet-actions-list'),
    closeSheetBtn: document.getElementById('close-sheet-btn')
  };

  function getXForAge(age, pxPerYear) {
    return PADDING + (age - MIN_AGE) * pxPerYear;
  }

  function getCenterAge(pxPerYear) {
    if (!el.viewport) return 32;
    const centerPx = el.viewport.scrollLeft + (el.viewport.clientWidth / 2);
    const age = MIN_AGE + (centerPx - PADDING) / pxPerYear;
    return Math.max(MIN_AGE, Math.min(MAX_AGE, age));
  }

  function renderTimeline(anchorAge = 32) {
    if (!el.track || !el.viewport) return;

    const config = ZOOM_LEVELS[currentZoomLevel];
    const pxPerYear = config.pxPerYear;
    const totalWidth = PADDING * 2 + (MAX_AGE - MIN_AGE) * pxPerYear;
    el.track.style.width = `${totalWidth}px`;

    const axis = el.track.querySelector('.timeline-axis');
    el.track.innerHTML = '';
    if (axis) el.track.appendChild(axis);

    // Ticks & Labels
    for (let age = MIN_AGE; age <= MAX_AGE; age++) {
      const x = getXForAge(age, pxPerYear);
      const isMajor = (age % config.tickStep === 0);

      if (isMajor || config.showMinorTicks) {
        const tick = document.createElement('div');
        tick.className = `year-tick ${isMajor ? 'major' : ''}`;
        tick.style.left = `${x}px`;
        el.track.appendChild(tick);
      }

      if (isMajor) {
        const tickLabel = document.createElement('span');
        tickLabel.className = 'year-tick-label';
        tickLabel.style.left = `${x}px`;
        tickLabel.textContent = age;
        el.track.appendChild(tickLabel);
      }
    }

    // Visible Milestones for Current LOD
    const visibleEvents = LIFE_EVENTS.filter(evt => evt.tier <= config.maxTier);

    // Alternating Staggered Labels (Eliminates All Overlaps!)
    visibleEvents.forEach((evt, index) => {
      const x = getXForAge(evt.age, pxPerYear);

      const dot = document.createElement('div');
      dot.className = `timeline-dot ${evt.tier === 1 ? 'tier-1' : ''}`;
      dot.style.left = `${x}px`;
      dot.title = `Age ${evt.age} · ${evt.title}`;

      const isTop = (index % 2 === 1);
      const labelContainer = document.createElement('div');
      labelContainer.className = `dot-label-container ${isTop ? 'position-top' : 'position-bottom'}`;
      labelContainer.style.left = `${x}px`;

      labelContainer.innerHTML = `
        <span class="label-age">Age ${evt.age}</span>
        <span class="label-title">${evt.title}</span>
        <div class="label-stem"></div>
      `;

      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        haptic(15);
        openDetailSheet(evt);
      });

      el.track.appendChild(labelContainer);
      el.track.appendChild(dot);
    });

    if (el.zoomIndicatorText) {
      el.zoomIndicatorText.textContent = config.indicator;
    }

    el.zoomBtns.forEach(btn => {
      const lvl = parseInt(btn.dataset.level, 10);
      if (lvl === currentZoomLevel) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    if (el.zoomOutBtn) el.zoomOutBtn.style.opacity = currentZoomLevel === 1 ? '0.3' : '1';
    if (el.zoomInBtn) el.zoomInBtn.style.opacity = currentZoomLevel === 3 ? '0.3' : '1';

    // Center to Anchor
    const targetX = getXForAge(anchorAge, pxPerYear);
    const scrollTarget = targetX - (el.viewport.clientWidth / 2);
    el.viewport.scrollLeft = scrollTarget;
  }

  function setZoom(newLevel) {
    if (newLevel < 1 || newLevel > 3 || newLevel === currentZoomLevel) return;
    haptic(12);
    const currentConfig = ZOOM_LEVELS[currentZoomLevel];
    const anchorAge = getCenterAge(currentConfig.pxPerYear);
    currentZoomLevel = newLevel;
    renderTimeline(anchorAge);
  }

  function openDetailSheet(evt) {
    if (!el.modalOverlay) return;

    if (el.sheetBadge) el.sheetBadge.textContent = `Age ${evt.age} · ${evt.category}`;
    if (el.sheetHeaderTitle) el.sheetHeaderTitle.textContent = evt.title;
    if (el.sheetWhatHappens) el.sheetWhatHappens.textContent = evt.whatHappens;
    if (el.sheetWhatPeersDo) el.sheetWhatPeersDo.textContent = `“${evt.whatPeersDo}”`;

    if (el.sheetActionsList) {
      el.sheetActionsList.innerHTML = evt.actions.map(action => `
        <li class="action-row">
          <span class="action-dot"></span>
          <span>${action}</span>
        </li>
      `).join('');
    }

    el.modalOverlay.classList.add('open');
  }

  function closeDetailSheet() {
    haptic(10);
    if (el.modalOverlay) {
      el.modalOverlay.classList.remove('open');
    }
  }

  function setupGestures() {
    const v = el.viewport;
    if (!v) return;

    let isDown = false;
    let startX;
    let scrollLeft;

    v.addEventListener('mousedown', (e) => {
      isDown = true;
      startX = e.pageX - v.offsetLeft;
      scrollLeft = v.scrollLeft;
    });

    v.addEventListener('mouseleave', () => { isDown = false; });
    v.addEventListener('mouseup', () => { isDown = false; });

    v.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - v.offsetLeft;
      const walk = (x - startX) * 1.6;
      v.scrollLeft = scrollLeft - walk;
    });

    // Touch Pinch-to-Zoom
    let initialPinchDistance = null;
    v.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) {
        initialPinchDistance = Math.hypot(
          e.touches[0].pageX - e.touches[1].pageX,
          e.touches[0].pageY - e.touches[1].pageY
        );
      }
    }, { passive: true });

    v.addEventListener('touchmove', (e) => {
      if (e.touches.length === 2 && initialPinchDistance !== null) {
        const currentDistance = Math.hypot(
          e.touches[0].pageX - e.touches[1].pageX,
          e.touches[0].pageY - e.touches[1].pageY
        );
        const diff = currentDistance - initialPinchDistance;

        if (diff > 45 && currentZoomLevel < 3) {
          setZoom(currentZoomLevel + 1);
          initialPinchDistance = currentDistance;
        } else if (diff < -45 && currentZoomLevel > 1) {
          setZoom(currentZoomLevel - 1);
          initialPinchDistance = currentDistance;
        }
      }
    }, { passive: true });

    v.addEventListener('touchend', () => {
      initialPinchDistance = null;
    });

    // Wheel zoom with Ctrl/Cmd
    v.addEventListener('wheel', (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        if (e.deltaY < 0 && currentZoomLevel < 3) {
          setZoom(currentZoomLevel + 1);
        } else if (e.deltaY > 0 && currentZoomLevel > 1) {
          setZoom(currentZoomLevel - 1);
        }
      }
    }, { passive: false });
  }

  function setupEvents() {
    el.zoomBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const level = parseInt(btn.dataset.level, 10);
        setZoom(level);
      });
    });

    if (el.zoomOutBtn) {
      el.zoomOutBtn.addEventListener('click', () => setZoom(currentZoomLevel - 1));
    }
    if (el.zoomInBtn) {
      el.zoomInBtn.addEventListener('click', () => setZoom(currentZoomLevel + 1));
    }

    if (el.closeSheetBtn) {
      el.closeSheetBtn.addEventListener('click', closeDetailSheet);
    }

    if (el.modalOverlay) {
      el.modalOverlay.addEventListener('click', (e) => {
        if (e.target === el.modalOverlay) {
          closeDetailSheet();
        }
      });
    }

    window.addEventListener('keydown', (e) => {
      if (pinState.unlocked) {
        if (e.key === 'Escape') closeDetailSheet();
        if (e.key === '+' || e.key === '=') setZoom(currentZoomLevel + 1);
        if (e.key === '-' || e.key === '_') setZoom(currentZoomLevel - 1);
      }
    });

    window.addEventListener('resize', () => {
      const currentConfig = ZOOM_LEVELS[currentZoomLevel];
      const anchor = getCenterAge(currentConfig.pxPerYear);
      renderTimeline(anchor);
    });
  }

  function init() {
    setupPinSecurity();
    setupGestures();
    setupEvents();
    renderTimeline(32);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
