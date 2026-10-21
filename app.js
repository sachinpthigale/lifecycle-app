// LifeLine — Semantic Multi-Level Zoom Timeline Controller
(function () {
  'use strict';

  // ===========================================================================
  // SECURITY & MASTER PIN GATE (Default PIN: 2019)
  // ===========================================================================

  const DEFAULT_PIN_HASH = '023e33504ab909cf87a6f4e4e545090e40bdc0a2153e5b68b19f7fad2b737904';

  function sha256(ascii) {
    function rightRotate(value, amount) {
      return (value >>> amount) | (value << (32 - amount));
    }
    const words = [];
    const asciiBitLength = ascii.length * 8;
    const hash = [
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
    const hex = Array.from(rawBytes).map(b => b.toString(16).padStart(2, '0')).join('');
    return { hex, bytes: rawBytes };
  }

  class SecurityManager {
    constructor() {
      this.PIN_HASH_KEY = 'lifeline_pin_hash_v1';
      this.UNLOCKED_KEY = 'lifeline_session_unlocked';
      this.TRUSTED_KEY = 'lifeline_trusted_device';
    }

    getPinHash() {
      if (typeof localStorage === 'undefined') return DEFAULT_PIN_HASH;
      return localStorage.getItem(this.PIN_HASH_KEY) || DEFAULT_PIN_HASH;
    }

    isUnlocked() {
      try {
        const isTrusted = localStorage.getItem(this.TRUSTED_KEY) === 'true';
        const isSessionUnlocked = sessionStorage.getItem(this.UNLOCKED_KEY) === 'true';
        return isTrusted || isSessionUnlocked;
      } catch (e) {
        return false;
      }
    }

    verifyPin(enteredPin, trustDevice = true) {
      const hash = sha256(enteredPin).hex;
      if (hash === this.getPinHash()) {
        try {
          sessionStorage.setItem(this.UNLOCKED_KEY, 'true');
          if (trustDevice) {
            localStorage.setItem(this.TRUSTED_KEY, 'true');
          } else {
            localStorage.removeItem(this.TRUSTED_KEY);
          }
        } catch (e) {}
        return true;
      }
      return false;
    }

    lock() {
      try {
        sessionStorage.removeItem(this.UNLOCKED_KEY);
        localStorage.removeItem(this.TRUSTED_KEY);
      } catch (e) {}
    }
  }

  const security = new SecurityManager();
  let pinBuffer = '';
  let pinErrorTimeout = null;

  const MIN_AGE = 18;
  const MAX_AGE = 72;
  const PADDING = 140;

  // Configuration for the 3 Semantic Zoom Levels
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

  // State
  let currentZoomLevel = 2; // Default to Decade view

  // DOM Elements
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
    closeSheetBtn: document.getElementById('close-sheet-btn'),
    // PIN Lock Elements
    pinOverlay: document.getElementById('pin-overlay'),
    pinDots: document.querySelectorAll('.pin-dot'),
    pinDotsRow: document.getElementById('pin-dots-row'),
    pinErrorText: document.getElementById('pin-error-text'),
    trustCheckbox: document.getElementById('chk-trust-device'),
    keypadBtns: document.querySelectorAll('.pin-keypad .keypad-btn'),
    lockBtn: document.getElementById('btn-lock-app')
  };

  // PIN Gate UI Controller
  function updatePinUI(error = false) {
    if (!el.pinDots) return;
    el.pinDots.forEach((dot, idx) => {
      dot.classList.remove('filled', 'error');
      if (error) {
        dot.classList.add('error');
      } else if (idx < pinBuffer.length) {
        dot.classList.add('filled');
      }
    });
  }

  function handlePinInput(key) {
    if (pinErrorTimeout) {
      clearTimeout(pinErrorTimeout);
      pinErrorTimeout = null;
      if (el.pinDotsRow) el.pinDotsRow.classList.remove('shake');
      if (el.pinErrorText) el.pinErrorText.textContent = '';
      updatePinUI();
    }

    if (key === 'clear') {
      pinBuffer = '';
      updatePinUI();
      return;
    }

    if (key === 'back') {
      pinBuffer = pinBuffer.slice(0, -1);
      updatePinUI();
      return;
    }

    if (/^[0-9]$/.test(key) && pinBuffer.length < 4) {
      pinBuffer += key;
      updatePinUI();

      if (pinBuffer.length === 4) {
        const trust = el.trustCheckbox ? el.trustCheckbox.checked : true;
        const valid = security.verifyPin(pinBuffer, trust);

        if (valid) {
          setTimeout(() => {
            pinBuffer = '';
            updatePinUI();
            if (el.pinOverlay) el.pinOverlay.classList.add('hidden');
          }, 140);
        } else {
          setTimeout(() => {
            updatePinUI(true);
            if (el.pinDotsRow) el.pinDotsRow.classList.add('shake');
            if (el.pinErrorText) el.pinErrorText.textContent = 'Incorrect PIN. Try again.';
            pinErrorTimeout = setTimeout(() => {
              pinBuffer = '';
              if (el.pinDotsRow) el.pinDotsRow.classList.remove('shake');
              if (el.pinErrorText) el.pinErrorText.textContent = '';
              updatePinUI();
            }, 700);
          }, 100);
        }
      }
    }
  }

  function lockApp() {
    security.lock();
    pinBuffer = '';
    updatePinUI();
    if (el.pinErrorText) el.pinErrorText.textContent = '';
    if (el.pinDotsRow) el.pinDotsRow.classList.remove('shake');
    if (el.pinOverlay) el.pinOverlay.classList.remove('hidden');
  }

  function checkSecurityGate() {
    if (security.isUnlocked()) {
      if (el.pinOverlay) el.pinOverlay.classList.add('hidden');
    } else {
      if (el.pinOverlay) el.pinOverlay.classList.remove('hidden');
      updatePinUI();
    }
  }

  function getXForAge(age, pxPerYear) {
    return PADDING + (age - MIN_AGE) * pxPerYear;
  }

  // Get Currently Centered Age in Viewport to Anchor Zooming
  function getCenterAge(pxPerYear) {
    if (!el.viewport) return 32;
    const centerPx = el.viewport.scrollLeft + (el.viewport.clientWidth / 2);
    const age = MIN_AGE + (centerPx - PADDING) / pxPerYear;
    return Math.max(MIN_AGE, Math.min(MAX_AGE, age));
  }

  // Render Timeline based on Current Zoom Level
  function renderTimeline(anchorAge = 32) {
    if (!el.track || !el.viewport) return;

    const config = ZOOM_LEVELS[currentZoomLevel];
    const pxPerYear = config.pxPerYear;
    const totalWidth = PADDING * 2 + (MAX_AGE - MIN_AGE) * pxPerYear;
    el.track.style.width = `${totalWidth}px`;

    // Clear track elements except axis
    const axis = el.track.querySelector('.timeline-axis');
    el.track.innerHTML = '';
    if (axis) el.track.appendChild(axis);

    // 1. Render Year Ticks & Numbers
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

    // 2. Filter Milestones by Zoom Level Tier (LOD)
    const visibleEvents = LIFE_EVENTS.filter(evt => evt.tier <= config.maxTier);

    // 3. Render Big Dots & Alternating Staggered Labels (Eliminating All Overlap!)
    visibleEvents.forEach((evt, index) => {
      const x = getXForAge(evt.age, pxPerYear);

      // The Big Tactile Dot
      const dot = document.createElement('div');
      dot.className = `timeline-dot ${evt.tier === 1 ? 'tier-1' : ''}`;
      dot.style.left = `${x}px`;
      dot.title = `Age ${evt.age} · ${evt.title}`;

      // Alternating Stagger: Even index on bottom, Odd index on top
      // This doubles available horizontal space between nearby years!
      const isTop = (index % 2 === 1);
      const labelContainer = document.createElement('div');
      labelContainer.className = `dot-label-container ${isTop ? 'position-top' : 'position-bottom'}`;
      labelContainer.style.left = `${x}px`;

      labelContainer.innerHTML = `
        <span class="label-age">Age ${evt.age}</span>
        <span class="label-title">${evt.title}</span>
        <div class="label-stem"></div>
      `;

      // Tap Dot -> Open Crisp Detail Sheet
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        openDetailSheet(evt);
      });

      el.track.appendChild(labelContainer);
      el.track.appendChild(dot);
    });

    // 4. Update Zoom Indicator Text & Active Buttons
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

    // 5. Restore Viewport Centering to Anchor Age
    const targetX = getXForAge(anchorAge, pxPerYear);
    const scrollTarget = targetX - (el.viewport.clientWidth / 2);
    el.viewport.scrollLeft = scrollTarget;
  }

  // Set Zoom Level with Smooth Center Anchoring
  function setZoom(newLevel) {
    if (newLevel < 1 || newLevel > 3 || newLevel === currentZoomLevel) return;
    const currentConfig = ZOOM_LEVELS[currentZoomLevel];
    const anchorAge = getCenterAge(currentConfig.pxPerYear);
    currentZoomLevel = newLevel;
    renderTimeline(anchorAge);
  }

  // Open Detail Modal Sheet
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
    if (el.modalOverlay) {
      el.modalOverlay.classList.remove('open');
    }
  }

  // Setup Mouse Drag & Touch Gestures (Pinch-to-Zoom & Pan)
  function setupGestures() {
    const v = el.viewport;
    if (!v) return;

    // 1. Mouse Drag
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

    // 2. Touch Pinch-to-Zoom
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

    // 3. Trackpad Pinch / Ctrl-Wheel Zoom
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

  // Event Listeners for Zoom Buttons & Modal
  function setupEvents() {
    // Top zoom level pills
    el.zoomBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const level = parseInt(btn.dataset.level, 10);
        setZoom(level);
      });
    });

    // Bottom +/- buttons
    if (el.zoomOutBtn) {
      el.zoomOutBtn.addEventListener('click', () => setZoom(currentZoomLevel - 1));
    }
    if (el.zoomInBtn) {
      el.zoomInBtn.addEventListener('click', () => setZoom(currentZoomLevel + 1));
    }

    // Modal Sheet close events
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

    // Keypad button clicks for PIN unlock
    if (el.keypadBtns) {
      el.keypadBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const key = btn.dataset.key;
          handlePinInput(key);
        });
      });
    }

    // Lock App Button
    if (el.lockBtn) {
      el.lockBtn.addEventListener('click', (e) => {
        e.preventDefault();
        lockApp();
      });
    }

    // Checkbox state sync
    if (el.trustCheckbox) {
      el.trustCheckbox.addEventListener('change', (e) => {
        if (!e.target.checked) {
          try { localStorage.removeItem(security.TRUSTED_KEY); } catch (err) {}
        }
      });
    }

    window.addEventListener('keydown', (e) => {
      // If PIN lock overlay is active, route keypresses to PIN input
      if (el.pinOverlay && !el.pinOverlay.classList.contains('hidden')) {
        if (/^[0-9]$/.test(e.key)) {
          handlePinInput(e.key);
          return;
        } else if (e.key === 'Backspace') {
          handlePinInput('back');
          return;
        } else if (e.key === 'Escape') {
          handlePinInput('clear');
          return;
        }
      }

      if (e.key === 'Escape') closeDetailSheet();
      if (e.key === '+' || e.key === '=') setZoom(currentZoomLevel + 1);
      if (e.key === '-' || e.key === '_') setZoom(currentZoomLevel - 1);
    });

    window.addEventListener('resize', () => {
      const currentConfig = ZOOM_LEVELS[currentZoomLevel];
      const anchor = getCenterAge(currentConfig.pxPerYear);
      renderTimeline(anchor);
    });
  }

  function init() {
    setupGestures();
    setupEvents();
    renderTimeline(32); // Center at Age 32 initially
    checkSecurityGate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
