class ParticleField {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: true });
    this.stars = [];
    this.meteors = [];
    this.lastMeteor = 0;
    this.lastTime = 0;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.running = !this.reduced;
    this.resize();
    this.init();
    window.addEventListener('resize', () => { this.resize(); this.init(); }, { passive: true });
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.running) requestAnimationFrame((t) => this.tick(t));
    });
    if (this.running) requestAnimationFrame((t) => this.tick(t));
  }

  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.canvas.width = w * this.dpr;
    this.canvas.height = h * this.dpr;
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.w = w;
    this.h = h;
  }

  init() {
    this.stars = [];
    const density = Math.min(150, Math.floor((this.w * this.h) / 11000));
    for (let i = 0; i < density; i++) {
      this.stars.push({
        x: Math.random() * this.w,
        y: Math.random() * this.h,
        r: Math.random() * 1.2 + 0.25,
        vx: (Math.random() - 0.5) * 0.04,
        vy: (Math.random() - 0.5) * 0.04,
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.004 + Math.random() * 0.012,
        tint: Math.random() < 0.18
      });
    }
  }

  spawnMeteor() {
    const fromSide = Math.random() < 0.3;
    const startX = fromSide ? -80 : Math.random() * this.w;
    const startY = fromSide ? Math.random() * this.h * 0.4 : -80;
    const angle = (Math.PI / 4) + (Math.random() - 0.5) * 0.5;
    const speed = 7 + Math.random() * 7;
    this.meteors.push({
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      length: 90 + Math.random() * 160,
      life: 1,
      decay: 0.004 + Math.random() * 0.005,
      tint: Math.random() < 0.45,
      width: 1.4 + Math.random() * 0.8
    });
  }

  tick(now) {
    if (!this.running || document.hidden) return;
    this.lastTime = now;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.w, this.h);

    // Stars
    for (const s of this.stars) {
      s.x += s.vx;
      s.y += s.vy;
      if (s.x < -10) s.x = this.w + 10;
      else if (s.x > this.w + 10) s.x = -10;
      if (s.y < -10) s.y = this.h + 10;
      else if (s.y > this.h + 10) s.y = -10;

      s.twinkle += s.twinkleSpeed;
      const alpha = 0.25 + (Math.sin(s.twinkle) + 1) * 0.18;

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.tint
        ? `rgba(200, 255, 0, ${alpha * 0.85})`
        : `rgba(245, 240, 225, ${alpha})`;
      ctx.fill();

      if (s.r > 1) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 3, 0, Math.PI * 2);
        ctx.fillStyle = s.tint
          ? `rgba(200, 255, 0, ${alpha * 0.06})`
          : `rgba(245, 240, 225, ${alpha * 0.07})`;
        ctx.fill();
      }
    }

    // Spawn meteors
    if (now - this.lastMeteor > 1800 + Math.random() * 3500) {
      this.spawnMeteor();
      this.lastMeteor = now;
    }

    // Meteors
    this.meteors = this.meteors.filter((m) => {
      m.x += m.vx;
      m.y += m.vy;
      m.life -= m.decay;

      if (m.life <= 0 || m.x > this.w + 250 || m.y > this.h + 250) return false;

      const speed = Math.hypot(m.vx, m.vy);
      const tailX = m.x - (m.vx / speed) * m.length;
      const tailY = m.y - (m.vy / speed) * m.length;

      const grad = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
      const base = m.tint ? '200, 255, 0' : '245, 240, 225';
      grad.addColorStop(0, `rgba(${base}, ${m.life * 0.95})`);
      grad.addColorStop(0.4, `rgba(${base}, ${m.life * 0.35})`);
      grad.addColorStop(1, `rgba(${base}, 0)`);

      ctx.beginPath();
      ctx.strokeStyle = grad;
      ctx.lineWidth = m.width;
      ctx.lineCap = 'round';
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(m.x, m.y);
      ctx.stroke();

      // Bright head
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.width * 1.6, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${base}, ${m.life})`;
      ctx.fill();

      // Soft halo
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.width * 4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${base}, ${m.life * 0.1})`;
      ctx.fill();

      return true;
    });

    requestAnimationFrame((t) => this.tick(t));
  }
}

const particleCanvas = document.getElementById('particles');
if (particleCanvas) new ParticleField(particleCanvas);

/* ============================================================
   CURSOR GLOW (desktop only)
   ============================================================ */
const cursorGlow = document.getElementById('cursorGlow');
const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
if (cursorGlow && isFinePointer) {
  let tx = 0, ty = 0, x = 0, y = 0;
  document.addEventListener('mousemove', (e) => {
    tx = e.clientX; ty = e.clientY;
    cursorGlow.style.opacity = '1';
  }, { passive: true });
  document.addEventListener('mouseleave', () => { cursorGlow.style.opacity = '0'; });
  const animateGlow = () => {
    x += (tx - x) * 0.12;
    y += (ty - y) * 0.12;
    cursorGlow.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    requestAnimationFrame(animateGlow);
  };
  animateGlow();
}

/* ============================================================
   NAV scroll state
   ============================================================ */
const nav = document.getElementById('nav');
const onScroll = () => {
  if (window.scrollY > 24) nav.classList.add('scrolled');
  else nav.classList.remove('scrolled');
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ============================================================
   Reveal on scroll
   ============================================================ */
const io = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('in'), i * 50);
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

/* ============================================================
   Animated stat counters (top stats bar)
   ============================================================ */
const animateNumber = (el) => {
  const target = parseInt(el.dataset.count, 10);
  const suffix = el.querySelector('.plus')?.outerHTML || '';
  const duration = 1900;
  const start = performance.now();
  const fmt = (n) => target >= 1000 ? n.toLocaleString('en-US') : n.toString();
  const tick = (now) => {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    const val = Math.round(eased * target);
    el.innerHTML = fmt(val) + suffix;
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

const statIo = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) { animateNumber(e.target); statIo.unobserve(e.target); }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-count]').forEach(el => statIo.observe(el));

/* ============================================================
   YouTube lazy embed
   ============================================================ */
const videoThumb = document.getElementById('videoThumb');
const loadVideo = () => {
  const iframe = document.createElement('iframe');
  iframe.src = 'https://www.youtube.com/embed/slv2I4PxpeM?autoplay=1&rel=0';
  iframe.title = 'Project Showcase';
  iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
  iframe.allowFullscreen = true;
  iframe.style.cssText = 'width:100%;height:100%;border:0;position:absolute;inset:0;';
  videoThumb.innerHTML = '';
  videoThumb.style.cursor = 'default';
  videoThumb.appendChild(iframe);
};
if (videoThumb) {
  videoThumb.addEventListener('click', loadVideo);
  videoThumb.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); loadVideo(); }
  });
}

/* ============================================================
   Mod card pointer-following glow
   ============================================================ */
document.querySelectorAll('[data-tilt]').forEach((card) => {
  card.addEventListener('mousemove', (e) => {
    const r = card.getBoundingClientRect();
    const mx = ((e.clientX - r.left) / r.width) * 100;
    const my = ((e.clientY - r.top) / r.height) * 100;
    card.style.setProperty('--mx', mx + '%');
    card.style.setProperty('--my', my + '%');
  });
});

/* ============================================================
   Gentoi video — pause when off-screen for performance
   ============================================================ */
const gentoiVideo = document.getElementById('gentoiVideo');
if (gentoiVideo) {
  // Try to play; some browsers block autoplay even when muted
  const tryPlay = () => gentoiVideo.play().catch(() => {});
  gentoiVideo.addEventListener('loadeddata', tryPlay);
  tryPlay();

  const vidIo = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) tryPlay();
      else gentoiVideo.pause();
    });
  }, { threshold: 0 });
  vidIo.observe(gentoiVideo.closest('.gentoi') || gentoiVideo);
}

/* ============================================================
   gentoi.online iframe — detect if X-Frame-Options blocks it
   If blocked, keep the fallback poster + button visible.
   If it loads, fade out the fallback.
   ============================================================ */
const gentoiIframe = document.querySelector('.gentoi-iframe');
const iframeFallback = document.querySelector('.iframe-fallback');
if (gentoiIframe && iframeFallback) {
  let loaded = false;

  gentoiIframe.addEventListener('load', () => {
    // Try to detect blank/blocked load — same-origin reads will throw, which is fine.
    try {
      // If it loaded a real document, contentDocument should exist (same-origin)
      // For cross-origin (most common), we can't inspect — but if it didn't 'load' it's fine to hide fallback.
      loaded = true;
      iframeFallback.style.opacity = '0';
      setTimeout(() => { iframeFallback.style.pointerEvents = 'none'; }, 400);
    } catch {
      // Cross-origin loaded fine — still hide fallback
      loaded = true;
      iframeFallback.style.opacity = '0';
      setTimeout(() => { iframeFallback.style.pointerEvents = 'none'; }, 400);
    }
  });

  // Failsafe: if 'load' never fires within 5s, leave fallback in place
  setTimeout(() => {
    if (!loaded) {
      // Keep fallback visible — don't try iframe again, just hide it behind the fallback
      gentoiIframe.style.display = 'none';
    }
  }, 5000);
}

/* ============================================================
   TICKET FORM
   ============================================================ */
const genTicketId = () => {
  const hex = 'ABCDEF0123456789';
  let suffix = '';
  for (let i = 0; i < 4; i++) suffix += hex[Math.floor(Math.random() * hex.length)];
  return `#DR-2026-${suffix}`;
};

const ticketIdEl = document.getElementById('ticketId');
const ticketTimeEl = document.getElementById('ticketTime');
const ticketStatusEl = document.getElementById('ticketStatus');
const statusDot = document.getElementById('statusDot');
const successIdEl = document.getElementById('successId');
let currentTicketId = genTicketId();
ticketIdEl.textContent = currentTicketId;

const updateClock = () => {
  const d = new Date();
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  const s = String(d.getSeconds()).padStart(2, '0');
  ticketTimeEl.textContent = `${h}:${m}:${s}`;
};
updateClock();
setInterval(updateClock, 1000);

const msgField = document.getElementById('msgField');
const charCount = document.getElementById('charCount');
if (msgField && charCount) {
  msgField.addEventListener('input', () => {
    charCount.textContent = `${msgField.value.length} / 2000`;
  });
}

const setStatus = (text, state) => {
  ticketStatusEl.textContent = text;
  // map ticket state → orb color
  const colorByState = {
    sending: 'cyan',
    success: 'green',
    error:   'red',
    '':      'amber'
  };
  statusDot.setAttribute('data-c', colorByState[state || ''] || 'amber');
};

const form = document.getElementById('ticketForm');
const submitBtn = document.getElementById('submitBtn');
const ticketError = document.getElementById('ticketError');
const ticketSuccess = document.getElementById('ticketSuccess');

const showError = (msg) => {
  ticketError.textContent = '⚠ ' + msg;
  ticketError.classList.add('show');
  setStatus('Error', 'error');
};

const buildMailtoUrl = (data) => {
  const subject = `[${data.type}] ${data.subject || 'Contact via portfolio'}`;
  const body = [
    `Ticket ID: ${currentTicketId}`,
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Type: ${data.type}`,
    '',
    '---',
    '',
    data.message || ''
  ].join('\n');
  return `mailto:dyland82@hotmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  ticketError.classList.remove('show');

  const formData = new FormData(form);
  const data = Object.fromEntries(formData);

  // Honeypot
  if (data._honey) return;

  // Validate
  if (!data.name?.trim() || !data.email?.trim() || !data.subject?.trim() || !data.message?.trim()) {
    showError('Please fill all required fields before submitting.');
    return;
  }
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(data.email)) {
    showError("That email address doesn't look right — please double-check it.");
    return;
  }
  if (data.message.trim().length < 10) {
    showError('Your message is a bit short — please add a bit more detail.');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.innerHTML = 'Submitting<svg width="12" height="12" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2.5" stroke-dasharray="20 40" stroke-linecap="round"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/></circle></svg>';
  setStatus('Submitting...', 'sending');

  const payload = {
    _subject: `[Portfolio Ticket ${currentTicketId}] ${data.subject}`,
    _template: 'box',
    _captcha: 'false',
    'Ticket ID': currentTicketId,
    Name: data.name,
    Email: data.email,
    Type: data.type,
    Subject: data.subject,
    Message: data.message
  };

  // ============================================================
  // SUBMISSION ENDPOINT
  //
  // Default: FormSubmit.co (free, no signup needed).
  // The first time someone submits, you'll receive an
  // activation email from FormSubmit. Confirm it, and from
  // then on every ticket lands in your inbox.
  //
  // To switch services, just change FORM_ENDPOINT:
  //   - Formspree:  https://formspree.io/f/YOUR_FORM_ID
  //   - Web3Forms:  https://api.web3forms.com/submit
  //                 (add 'access_key' to payload)
  //   - Your own:   /api/contact
  // ============================================================
  const FORM_ENDPOINT = 'https://formsubmit.co/ajax/dyland82@hotmail.com';

  try {
    const res = await fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    successIdEl.textContent = currentTicketId;
    form.style.display = 'none';
    ticketSuccess.hidden = false;
    setStatus('Resolved', 'success');
  } catch (err) {
    console.warn('Submission failed:', err);
    showError('Submission failed. You can use "Email Directly" below to send via your mail app instead.');
    submitBtn.disabled = false;
    submitBtn.innerHTML = 'Retry Submission <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M7 17L17 7M17 7H8M17 7V16"/></svg>';
  }
});

// Mailto fallback button
document.getElementById('mailtoFallback').addEventListener('click', () => {
  const data = Object.fromEntries(new FormData(form));
  if (!data.name?.trim()) data.name = '(no name provided)';
  if (!data.email?.trim()) data.email = '(no email provided)';
  if (!data.type) data.type = 'Inquiry';
  window.location.href = buildMailtoUrl(data);
});

// "Open Another Ticket" button
document.getElementById('newTicket').addEventListener('click', () => {
  form.reset();
  if (charCount) charCount.textContent = '0 / 2000';
  currentTicketId = genTicketId();
  ticketIdEl.textContent = currentTicketId;
  form.style.display = '';
  ticketSuccess.hidden = true;
  ticketError.classList.remove('show');
  setStatus('Pending Submission', '');
  submitBtn.disabled = false;
  submitBtn.innerHTML = 'Submit Ticket <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M7 17L17 7M17 7H8M17 7V16"/></svg>';
});
