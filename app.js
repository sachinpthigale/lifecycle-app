// LifeLine — Mobile Phone App Controller (Fluid Zoom, Dual Age+Year, Haptic Audio & Gestures)
(function () {
  'use strict';

  // Master PIN Hash (SHA-256 of '2019', identical to Freya App)
  const MASTER_PIN_HASH = '023e33504ab909cf87a6f4e4e545090e40bdc0a2153e5b68b19f7fad2b737904';
  const PIN_SESSION_KEY = 'lifeline_master_unlocked_v1';

  // Base Timeline Dimensions
  const MIN_AGE = 18;
  const MAX_AGE = 72;
  const BASE_PX_PER_YEAR = 36;
  const PADDING = 160;

  // State
  let currentZoomScale = 1.8; // Default 1.8x
  let isFullscreen = localStorage.getItem('lifeline_fullscreen') === 'true';

  // Web Audio Context for Native Mobile Audio-Haptics
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
    const mathPow = Math.pow;
    const maxWord = mathPow(2, 32);
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
  // Timeline Scrubber & Continuous Zoom Engine
  // =========================================================================
  const el = {
    viewport: document.getElementById('timeline-viewport'),
    track: document.getElementById('timeline-track'),
    zoomSlider: document.getElementById('continuous-zoom-slider'),
    zoomMultiplier: document.getElementById('zoom-multiplier-readout'),
    zoomPills: document.querySelectorAll('.zoom-pill'),
    centerReadout: document.getElementById('center-readout'),
    birthYearBtn: document.getElementById('birth-year-btn'),
    birthYearLabel: document.getElementById('birth-year-label'),
    birthYearModal: document.getElementById('settings-modal-overlay'),
    birthYearInput: document.getElementById('birth-year-input'),
    cancelBirthYearBtn: document.getElementById('cancel-birth-year-btn'),
    saveBirthYearBtn: document.getElementById('save-birth-year-btn'),
    fullscreenBtn: document.getElementById('fullscreen-toggle-btn'),
    phoneShell: document.getElementById('phone-device-shell'),
    phoneClock: document.getElementById('phone-clock'),
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

  function getEffectivePxPerYear() {
    return BASE_PX_PER_YEAR * currentZoomScale;
  }

  function getXForAge(age) {
    return PADDING + (age - MIN_AGE) * getEffectivePxPerYear();
  }

  function getCenterAge() {
    if (!el.viewport) return 32;
    const centerPx = el.viewport.scrollLeft + (el.viewport.clientWidth / 2);
    const age = MIN_AGE + (centerPx - PADDING) / getEffectivePxPerYear();
    return Math.max(MIN_AGE, Math.min(MAX_AGE, age));
  }

  // Determine active LOD tier based on continuous zoom scale
  function getMaxTierForScale() {
    if (currentZoomScale < 1.25) return 1; // Macro: Tier 1 only
    if (currentZoomScale < 2.3) return 2;  // Decade: Tier 1 + 2
    return 3;                              // Detailed: All Tiers 1, 2, 3
  }

  function renderTimeline(anchorAge = 32) {
    if (!el.track || !el.viewport) return;

    const pxPerYear = getEffectivePxPerYear();
    const totalWidth = PADDING * 2 + (MAX_AGE - MIN_AGE) * pxPerYear;
    el.track.style.width = `${totalWidth}px`;

    const axis = el.track.querySelector('.timeline-axis');
    el.track.innerHTML = '';
    if (axis) el.track.appendChild(axis);

    // Determine tick interval
    let tickStep = 5;
    if (currentZoomScale < 1.2) tickStep = 10;
    else if (currentZoomScale > 2.4) tickStep = 1;

    // 1. Render Year Ticks with Dual Age + Calendar Year
    for (let age = MIN_AGE; age <= MAX_AGE; age++) {
      const x = getXForAge(age);
      const isMajor = (age % tickStep === 0);

      const tick = document.createElement('div');
      tick.className = `year-tick ${isMajor ? 'major' : ''}`;
      tick.style.left = `${x}px`;
      el.track.appendChild(tick);

      if (isMajor) {
        const calYear = getYearForAge(age);
        const tickLabel = document.createElement('span');
        tickLabel.className = 'year-tick-label';
        tickLabel.style.left = `${x}px`;
        // Dual readout on ticks: e.g. 30 ('24) or 35 ('29)
        const shortYear = `'${calYear.toString().slice(-2)}`;
        tickLabel.textContent = `${age} (${shortYear})`;
        el.track.appendChild(tickLabel);
      }
    }

    // 2. Filter Milestones by current Semantic Zoom Scale
    const maxTier = getMaxTierForScale();
    const visibleEvents = LIFE_EVENTS.filter(evt => evt.tier <= maxTier);

    // 3. Render Big Dots & Staggered Cards (Shows both Age and Calendar Year!)
    visibleEvents.forEach((evt, index) => {
      const x = getXForAge(evt.age);
      const calYear = getYearForAge(evt.age);

      // Big Glowing Dot
      const dot = document.createElement('div');
      dot.className = `timeline-dot ${evt.tier === 1 ? 'tier-1' : ''}`;
      dot.style.left = `${x}px`;
      dot.title = `Age ${evt.age} (${calYear}) · ${evt.title}`;

      // Stagger Top & Bottom Alternating
      const isTop = (index % 2 === 1);
      const labelContainer = document.createElement('div');
      labelContainer.className = `dot-label-container ${isTop ? 'position-top' : 'position-bottom'}`;
      labelContainer.style.left = `${x}px`;

      labelContainer.innerHTML = `
        <div class="label-card">
          <div class="label-timing-row">
            <span class="label-age">Age ${evt.age}</span>
            <span class="label-year">· ${calYear}</span>
          </div>
          <span class="label-title">${evt.title}</span>
        </div>
        <div class="label-stem"></div>
      `;

      // Tap Dot: Ripple Shockwave Animation & Open Sheet
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        haptic(20);

        // Spawn Expanding Ripple Animation
        const ripple = document.createElement('div');
        ripple.className = 'dot-ripple';
        dot.appendChild(ripple);
        setTimeout(() => ripple.remove(), 500);

        openDetailSheet(evt);
      });

      el.track.appendChild(labelContainer);
      el.track.appendChild(dot);
    });

    // Update Zoom readouts
    if (el.zoomSlider) el.zoomSlider.value = currentZoomScale;
    if (el.zoomMultiplier) el.zoomMultiplier.textContent = `${currentZoomScale.toFixed(1)}x`;

    // Center on Anchor Age
    const targetX = getXForAge(anchorAge);
    const scrollTarget = targetX - (el.viewport.clientWidth / 2);
    el.viewport.scrollLeft = scrollTarget;

    updateCenterReadout();
  }

  function setContinuousZoom(newScale) {
    const clamped = Math.max(0.6, Math.min(3.5, newScale));
    if (Math.abs(clamped - currentZoomScale) < 0.01) return;

    const anchorAge = getCenterAge();
    currentZoomScale = clamped;

    // Update active mode chip
    el.zoomPills.forEach(pill => {
      const scale = parseFloat(pill.dataset.scale);
      if (Math.abs(scale - currentZoomScale) < 0.3) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });

    renderTimeline(anchorAge);
  }

  function updateCenterReadout() {
    if (!el.centerReadout) return;
    const centerAge = Math.round(getCenterAge());
    const calYear = getYearForAge(centerAge);
    el.centerReadout.textContent = `Age ${centerAge} · ${calYear}`;
  }

  function openDetailSheet(evt) {
    if (!el.modalOverlay) return;
    const calYear = getYearForAge(evt.age);

    if (el.sheetBadge) el.sheetBadge.textContent = `Age ${evt.age} · ${evt.category}`;
    if (el.sheetYearBadge) el.sheetYearBadge.textContent = `Year ${calYear}`;
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

  // Interactive Drag-to-Dismiss Bottom Sheet
  function setupDragToDismissSheet() {
    const sheet = el.modalSheet;
    const handle = el.sheetDragHandle;
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

  // Double Tap to Zoom into Specific Age
  function setupDoubleTapZoom() {
    let lastTap = 0;
    const v = el.viewport;
    if (!v) return;

    v.addEventListener('click', (e) => {
      const now = Date.now();
      if (now - lastTap < 300) {
        // Double tap!
        haptic(15);
        if (currentZoomScale < 2.5) {
          setContinuousZoom(currentZoomScale * 1.5);
        } else {
          setContinuousZoom(1.0); // Reset
        }
      }
      lastTap = now;
    });
  }

  // Touch Pinch-to-Zoom & Pan Gestures
  function setupGestures() {
    const v = el.viewport;
    if (!v) return;

    // Mouse drag
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
      updateCenterReadout();
    });

    v.addEventListener('scroll', () => {
      updateCenterReadout();
    }, { passive: true });

    // Touch Pinch-to-Zoom
    let initialPinchDistance = null;
    let startScale = currentZoomScale;

    v.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) {
        initialPinchDistance = Math.hypot(
          e.touches[0].pageX - e.touches[1].pageX,
          e.touches[0].pageY - e.touches[1].pageY
        );
        startScale = currentZoomScale;
      }
    }, { passive: true });

    v.addEventListener('touchmove', (e) => {
      if (e.touches.length === 2 && initialPinchDistance !== null) {
        const currentDistance = Math.hypot(
          e.touches[0].pageX - e.touches[1].pageX,
          e.touches[0].pageY - e.touches[1].pageY
        );
        const ratio = currentDistance / initialPinchDistance;
        const targetScale = startScale * ratio;
        setContinuousZoom(targetScale);
      }
    }, { passive: true });

    v.addEventListener('touchend', () => {
      initialPinchDistance = null;
    });

    // Trackpad Pinch / Ctrl-Wheel Zoom
    v.addEventListener('wheel', (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY * -0.01;
        setContinuousZoom(currentZoomScale + delta);
      }
    }, { passive: false });
  }

  // Live Phone Clock (9:41 or real device time)
  function startLiveClock() {
    function updateClock() {
      if (!el.phoneClock) return;
      const d = new Date();
      let h = d.getHours();
      const m = d.getMinutes().toString().padStart(2, '0');
      h = h % 12 || 12;
      el.phoneClock.textContent = `${h}:${m}`;
    }
    updateClock();
    setInterval(updateClock, 15000);
  }

  function setupControls() {
    // Zoom Slider
    if (el.zoomSlider) {
      el.zoomSlider.addEventListener('input', (e) => {
        setContinuousZoom(parseFloat(e.target.value));
      });
    }

    // Quick Zoom Mode Chips
    el.zoomPills.forEach(pill => {
      pill.addEventListener('click', () => {
        haptic(10);
        const scale = parseFloat(pill.dataset.scale);
        setContinuousZoom(scale);
      });
    });

    // Birth Year Settings Modal
    if (el.birthYearBtn && el.birthYearModal) {
      el.birthYearBtn.addEventListener('click', () => {
        haptic(10);
        if (el.birthYearInput) el.birthYearInput.value = userBirthYear;
        el.birthYearModal.classList.add('open');
      });
    }

    if (el.cancelBirthYearBtn && el.birthYearModal) {
      el.cancelBirthYearBtn.addEventListener('click', () => {
        el.birthYearModal.classList.remove('open');
      });
    }

    if (el.saveBirthYearBtn && el.birthYearModal) {
      el.saveBirthYearBtn.addEventListener('click', () => {
        haptic(20);
        const val = parseInt(el.birthYearInput.value, 10);
        if (val >= 1940 && val <= 2026) {
          userBirthYear = val;
          localStorage.setItem('lifeline_birth_year', val);
          if (el.birthYearLabel) el.birthYearLabel.textContent = `Born ${val}`;
          el.birthYearModal.classList.remove('open');
          renderTimeline(32);
        }
      });
    }

    // Fullscreen / Phone Frame Toggle
    function updateFullscreenUI() {
      if (isFullscreen) {
        document.body.classList.add('fullscreen-active');
        if (el.fullscreenBtn) el.fullscreenBtn.textContent = '📱';
      } else {
        document.body.classList.remove('fullscreen-active');
        if (el.fullscreenBtn) el.fullscreenBtn.textContent = '🖥️';
      }
    }
    updateFullscreenUI();

    if (el.fullscreenBtn) {
      el.fullscreenBtn.addEventListener('click', () => {
        haptic(10);
        isFullscreen = !isFullscreen;
        localStorage.setItem('lifeline_fullscreen', isFullscreen);
        updateFullscreenUI();
        renderTimeline(getCenterAge());
      });
    }

    // Detail Sheet Close
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
        if (e.key === '+' || e.key === '=') setContinuousZoom(currentZoomScale + 0.2);
        if (e.key === '-' || e.key === '_') setContinuousZoom(currentZoomScale - 0.2);
      }
    });

    window.addEventListener('resize', () => {
      renderTimeline(getCenterAge());
    });
  }

  function init() {
    if (el.birthYearLabel) el.birthYearLabel.textContent = `Born ${userBirthYear}`;
    startLiveClock();
    setupPinSecurity();
    setupGestures();
    setupDoubleTapZoom();
    setupDragToDismissSheet();
    setupControls();
    renderTimeline(32);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
