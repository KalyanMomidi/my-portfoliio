/* ═══════════════════════════════════════════════════════════
   EDITORIAL BOLD — Purple Edition  Animations
   cursor · reveal · counter · badge stagger · magnetic btns
   tilt cards · section rule draw · typed tagline
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── 1. Custom cursor ──────────────────────────────────── */
  const cur = document.getElementById('cursor');
  if (cur) {
    document.addEventListener('mousemove', e => {
      cur.style.left = e.clientX + 'px';
      cur.style.top  = e.clientY + 'px';
    });
    document.querySelectorAll('a,button,.badge,.project-item,input,textarea').forEach(el => {
      el.addEventListener('mouseenter', () => cur.classList.add('grow'));
      el.addEventListener('mouseleave', () => cur.classList.remove('grow'));
    });
    document.addEventListener('mouseleave', () => { cur.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { cur.style.opacity = '1'; });
  }

  /* ── 2. Scroll reveal ──────────────────────────────────── */
  const io = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    }),
    { threshold: 0.1, rootMargin: '0px 0px -32px 0px' }
  );
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  /* ── 3. Section rule draw animation ───────────────────── */
  const ruleIo = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('drawn'); ruleIo.unobserve(e.target); }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.section-rule').forEach(r => ruleIo.observe(r));

  /* ── 4. Animated number counter ───────────────────────── */
  function animateCounter(el) {
    const target = parseInt(el.textContent, 10);
    if (isNaN(target)) return;
    const duration = 1100;
    const start = performance.now();
    (function step(now) {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 4);
      el.textContent = Math.round(ease * target);
      if (t < 1) requestAnimationFrame(step);
    })(start);
  }
  const cntIo = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { animateCounter(e.target); cntIo.unobserve(e.target); }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.stat-value').forEach(el => cntIo.observe(el));

  /* ── 5. Badge stagger reveal ───────────────────────────── */
  const badgeWrapIo = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.querySelectorAll('.badge').forEach((b, i) => {
        b.style.transition = `opacity .4s ease ${i * 45}ms, transform .4s ease ${i * 45}ms, color .2s, border-color .2s, background .2s, box-shadow .2s`;
        b.classList.add('badge-visible');
      });
      badgeWrapIo.unobserve(e.target);
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.skills-wrap').forEach(w => badgeWrapIo.observe(w));

  /* ── 6. Nav: active page highlight ────────────────────── */
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.getAttribute('href') === page) a.classList.add('active');
  });

  /* ── 7. Hero entrance sequence ─────────────────────────── */
  document.querySelectorAll('.hero-enter > *').forEach((el, i) => {
    el.style.cssText += `opacity:0;transform:translateY(22px);transition:opacity .75s ease,transform .75s ease;transition-delay:${i * 120}ms`;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    }));
  });

  /* ── 8. Typed tagline (hero page only) ─────────────────── */
  const tagline = document.querySelector('.hero-tagline');
  if (tagline) {
    const full = tagline.textContent.trim();
    tagline.textContent = '';
    tagline.style.borderLeft = '2px solid #a855f7';
    let i = 0;
    const TYPE_DELAY = 1200; // ms before typing starts
    setTimeout(() => {
      const timer = setInterval(() => {
        tagline.textContent = full.slice(0, ++i);
        if (i >= full.length) clearInterval(timer);
      }, 28);
    }, TYPE_DELAY);
  }

  /* ── 9. Magnetic hover on buttons ─────────────────────── */
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r  = btn.getBoundingClientRect();
      const x  = e.clientX - r.left - r.width  / 2;
      const y  = e.clientY - r.top  - r.height / 2;
      btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });

  /* ── 10. 3-D tilt on project items ────────────────────── */
  document.querySelectorAll('.project-item').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r   = card.getBoundingClientRect();
      const x   = (e.clientX - r.left) / r.width  - 0.5;
      const y   = (e.clientY - r.top)  / r.height - 0.5;
      card.style.transform = `perspective(800px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  /* ── 11. Interactive skills physics canvas ─────────────── */
  (function initSkillsCanvas() {
    const canvas = document.getElementById('skills-canvas');
    if (!canvas) return;

    const wrap   = canvas.parentElement;
    const ctx    = canvas.getContext('2d');
    const data   = document.getElementById('skills-data');
    if (!data) return;

    const skills = Array.from(data.querySelectorAll('.badge')).map(b => b.textContent.trim().toUpperCase());
    if (!skills.length) return;

    let W, H;
    function resize() {
      W = canvas.width  = wrap.offsetWidth;
      H = canvas.height = wrap.offsetHeight;
    }
    resize();
    window.addEventListener('resize', () => { resize(); });

    /* mouse */
    let mx = -9999, my = -9999;
    wrap.addEventListener('mousemove', e => {
      const r = canvas.getBoundingClientRect();
      mx = e.clientX - r.left;
      my = e.clientY - r.top;
    });
    wrap.addEventListener('mouseleave', () => { mx = -9999; my = -9999; });

    /* scatter on click */
    wrap.addEventListener('click', () => {
      bubbles.forEach(b => {
        const ang = Math.random() * Math.PI * 2;
        b.vx += Math.cos(ang) * (4 + Math.random() * 6);
        b.vy += Math.sin(ang) * (4 + Math.random() * 6);
      });
    });

    /* measure text */
    ctx.font = 'bold 11px Space Mono, monospace';
    const PAD_X = 22, PAD_Y = 12, R = 4;

    /* bubble colors — purple/violet/fuchsia palette */
    const HUES = [262, 272, 285, 300, 252, 240];

    const bubbles = skills.map((text, i) => {
      const tw = ctx.measureText(text).width;
      const bw = tw + PAD_X * 2;
      const bh = 13 + PAD_Y * 2;
      return {
        text, bw, bh,
        x:  Math.random() * (W - bw) + bw / 2,
        y:  Math.random() * (H - bh) + bh / 2,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        hue: HUES[i % HUES.length],
        hover: false,
        scale: 1,
      };
    });

    /* rounded rect helper */
    function pill(x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.arcTo(x + w, y, x + w, y + r, r);
      ctx.lineTo(x + w, y + h - r);
      ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
      ctx.lineTo(x + r, y + h);
      ctx.arcTo(x, y + h, x, y + h - r, r);
      ctx.lineTo(x, y + r);
      ctx.arcTo(x, y, x + r, y, r);
      ctx.closePath();
    }

    function drawBubble(b) {
      const x = b.x - b.bw / 2;
      const y = b.y - b.bh / 2;
      const s = b.scale;

      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.scale(s, s);
      ctx.translate(-b.x, -b.y);

      /* glow */
      ctx.shadowBlur   = b.hover ? 28 : 8;
      ctx.shadowColor  = `hsla(${b.hue},80%,65%,${b.hover ? .9 : .35})`;

      /* fill */
      pill(x, y, b.bw, b.bh, R);
      ctx.fillStyle = b.hover
        ? `hsla(${b.hue},72%,52%,0.95)`
        : `hsla(${b.hue},55%,22%,0.75)`;
      ctx.fill();

      /* border */
      ctx.strokeStyle = `hsla(${b.hue},70%,65%,${b.hover ? .95 : .4})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.shadowBlur = 0;

      /* text */
      ctx.font = `bold 11px Space Mono, monospace`;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = b.hover ? '#fff' : `hsla(${b.hue},70%,78%,0.9)`;
      ctx.fillText(b.text, b.x, b.y);

      ctx.restore();
    }

    const REPEL_R  = 130;
    const ATTRACT_R = 300;
    const MAX_SPD  = 10;
    const FRICTION = 0.965;

    function loop() {
      /* clear */
      ctx.clearRect(0, 0, W, H);

      /* subtle grid */
      ctx.strokeStyle = 'rgba(168,85,247,.04)';
      ctx.lineWidth = 1;
      for (let gx = 0; gx < W; gx += 72) { ctx.beginPath(); ctx.moveTo(gx,0); ctx.lineTo(gx,H); ctx.stroke(); }
      for (let gy = 0; gy < H; gy += 72) { ctx.beginPath(); ctx.moveTo(0,gy); ctx.lineTo(W,gy); ctx.stroke(); }

      bubbles.forEach(b => {
        /* mouse forces */
        const dx   = b.x - mx;
        const dy   = b.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;

        b.hover = dist < 55;
        b.scale += (( b.hover ? 1.12 : 1) - b.scale) * 0.15;

        if (dist < REPEL_R) {
          const f = ((REPEL_R - dist) / REPEL_R) * 1.2;
          b.vx += (dx / dist) * f;
          b.vy += (dy / dist) * f;
        }

        /* friction */
        b.vx *= FRICTION;
        b.vy *= FRICTION;

        /* speed cap */
        const spd = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
        if (spd > MAX_SPD) { b.vx *= MAX_SPD / spd; b.vy *= MAX_SPD / spd; }

        /* move */
        b.x += b.vx;
        b.y += b.vy;

        /* wall bounce */
        const hw = b.bw / 2 + 6, hh = b.bh / 2 + 6;
        if (b.x < hw)     { b.x = hw;     b.vx =  Math.abs(b.vx) * 0.7; }
        if (b.x > W - hw) { b.x = W - hw; b.vx = -Math.abs(b.vx) * 0.7; }
        if (b.y < hh)     { b.y = hh;     b.vy =  Math.abs(b.vy) * 0.7; }
        if (b.y > H - hh) { b.y = H - hh; b.vy = -Math.abs(b.vy) * 0.7; }

        drawBubble(b);
      });

      /* bubble–bubble soft collision */
      for (let i = 0; i < bubbles.length; i++) {
        for (let j = i + 1; j < bubbles.length; j++) {
          const a = bubbles[i], b = bubbles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const minD = (a.bw + b.bw) / 2 - 4;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          if (dist < minD) {
            const push = (minD - dist) / minD * 0.4;
            a.vx += (dx / dist) * push;
            a.vy += (dy / dist) * push;
            b.vx -= (dx / dist) * push;
            b.vy -= (dy / dist) * push;
          }
        }
      }

      requestAnimationFrame(loop);
    }

    loop();
  })();

  /* ── 12. Sparkle on primary button click ───────────────── */
  function spawnSparkle(e) {
    const btn = e.currentTarget;
    const r   = btn.getBoundingClientRect();
    const x   = e.clientX - r.left;
    const y   = e.clientY - r.top;
    for (let i = 0; i < 6; i++) {
      const dot = document.createElement('span');
      const ang = (i / 6) * 2 * Math.PI;
      const dist = 36 + Math.random() * 24;
      dot.style.cssText = `
        position:fixed;z-index:9998;pointer-events:none;
        width:5px;height:5px;border-radius:50%;
        background:${Math.random() > .5 ? '#a855f7' : '#e879f9'};
        left:${e.clientX}px;top:${e.clientY}px;
        transition:transform .55s ease,opacity .55s ease;
        transform:translate(-50%,-50%);opacity:1;
      `;
      document.body.appendChild(dot);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        dot.style.transform = `translate(calc(-50% + ${Math.cos(ang)*dist}px),calc(-50% + ${Math.sin(ang)*dist}px)) scale(0)`;
        dot.style.opacity = '0';
      }));
      setTimeout(() => dot.remove(), 600);
    }
  }
  document.querySelectorAll('.btn-primary').forEach(b => b.addEventListener('click', spawnSparkle));

})();

/* ── 13. Scroll progress bar ───────────────────────────────── */
(function () {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
  }, {passive: true});
})();

/* ── 14. Nav auto-hide on scroll ───────────────────────────── */
(function () {
  const nav = document.querySelector('.site-nav');
  if (!nav) return;
  let last = 0;
  window.addEventListener('scroll', () => {
    const cur = window.scrollY;
    if (cur > last + 8 && cur > 80) nav.classList.add('hidden');
    else if (cur < last - 4) nav.classList.remove('hidden');
    last = cur;
  }, {passive: true});
})();

/* ── 15. Mouse ambient glow ────────────────────────────────── */
(function () {
  const glow = document.getElementById('ambient-glow');
  if (!glow) return;
  document.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top  = e.clientY + 'px';
  });
})();

/* ── 16. Page transition on nav links ──────────────────────── */
(function () {
  const overlay = document.getElementById('page-transition');
  if (!overlay) return;
  /* fade in on load then out */
  overlay.classList.add('fade-in');
  requestAnimationFrame(() => requestAnimationFrame(() => overlay.classList.remove('fade-in')));
  document.querySelectorAll('a[href]').forEach(a => {
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto') || href.startsWith('http')) return;
    a.addEventListener('click', e => {
      e.preventDefault();
      overlay.classList.add('fade-in');
      setTimeout(() => { window.location.href = href; }, 420);
    });
  });
})();

/* ── 17. Intro / loading screen ────────────────────────────── */
(function () {
  const screen = document.getElementById('intro-screen');
  if (!screen) return;
  const bar    = screen.querySelector('.intro-bar');
  if (!bar) return;
  /* Only show on index page */
  const isIndex = !location.pathname.split('/').pop().replace('index.html','');
  if (!isIndex && location.pathname.split('/').pop() !== '') { screen.classList.add('done'); return; }
  let pct = 0;
  const iv = setInterval(() => {
    pct += 2 + Math.random() * 4;
    if (pct >= 100) { pct = 100; clearInterval(iv); }
    bar.style.width = pct + '%';
    if (pct === 100) setTimeout(() => screen.classList.add('done'), 300);
  }, 30);
})();

/* ── 18. Hero name text scramble ───────────────────────────── */
(function () {
  const el = document.querySelector('.hero-name');
  if (!el) return;
  const original = el.getAttribute('data-text') || el.textContent.trim();
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&';
  let frame = 0;
  const DURATION = 28; /* frames */
  const delay = 900; /* ms after page load */
  setTimeout(() => {
    const iv = setInterval(() => {
      el.textContent = original.split('').map((ch, i) => {
        if (ch === ' ') return ' ';
        if (frame / DURATION > i / original.length) return ch;
        return CHARS[Math.floor(Math.random() * CHARS.length)];
      }).join('');
      if (++frame > DURATION) {
        clearInterval(iv);
        el.textContent = original;
        el.setAttribute('data-text', original);
      }
    }, 40);
  }, delay);
})();

/* ── 19. Directional reveals ───────────────────────────────── */
(function () {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, {threshold: 0.12, rootMargin: '0px 0px -24px 0px'});
  document.querySelectorAll('.reveal-left,.reveal-right').forEach(el => io.observe(el));
})();

/* ── 13. Cursor particle trail ─────────────────────────────── */
(function () {
  const COLORS = ['#a855f7','#c084fc','#e879f9','#7c3aed','#d946ef'];
  const MAX = 14;
  const trail = Array.from({length: MAX}, (_, i) => {
    const el = document.createElement('div');
    el.className = 'cursor-trail';
    const size = Math.max(2, 7 - i * 0.4);
    el.style.cssText = `width:${size}px;height:${size}px;background:${COLORS[i % COLORS.length]};opacity:${((MAX - i) / MAX * 0.65).toFixed(2)}`;
    document.body.appendChild(el);
    return {el, x: 0, y: 0};
  });
  let mx = 0, my = 0;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  (function animate() {
    trail.forEach((dot, i) => {
      const src = i === 0 ? {x: mx, y: my} : trail[i - 1];
      const ease = Math.max(0.08, 0.38 - i * 0.022);
      dot.x += (src.x - dot.x) * ease;
      dot.y += (src.y - dot.y) * ease;
      dot.el.style.left = dot.x + 'px';
      dot.el.style.top  = dot.y + 'px';
    });
    requestAnimationFrame(animate);
  })();
})();

/* ── 14. Hero particle network canvas ──────────────────────── */
(function () {
  const canvas = document.getElementById('hero-particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;
  function resize() { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; }
  resize();
  window.addEventListener('resize', resize);
  const COUNT = 55, LINK = 115;
  let mx = W / 2, my = H / 2;
  canvas.parentElement.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top;
  });
  const pts = Array.from({length: COUNT}, () => ({
    x: Math.random() * W, y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.45, vy: (Math.random() - 0.5) * 0.45,
    r: 0.8 + Math.random() * 1.4,
  }));
  function loop() {
    ctx.clearRect(0, 0, W, H);
    pts.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
    });
    const all = [...pts, {x: mx, y: my}];
    for (let i = 0; i < all.length; i++) {
      for (let j = i + 1; j < all.length; j++) {
        const dx = all[i].x - all[j].x, dy = all[i].y - all[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < LINK) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(168,85,247,${(1 - d / LINK) * 0.28})`;
          ctx.lineWidth = 0.6;
          ctx.moveTo(all[i].x, all[i].y);
          ctx.lineTo(all[j].x, all[j].y);
          ctx.stroke();
        }
      }
    }
    pts.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(168,85,247,0.55)';
      ctx.fill();
    });
    requestAnimationFrame(loop);
  }
  loop();
})();

/* ── 15. 3D rotating skill sphere ──────────────────────────── */
(function () {
  const canvas = document.getElementById('sphere-canvas');
  if (!canvas) return;
  const wrap = canvas.parentElement;
  const ctx  = canvas.getContext('2d');
  const data = document.getElementById('skills-data');
  if (!data) return;
  const skills = Array.from(data.querySelectorAll('.badge')).map(b => b.textContent.trim().toUpperCase());
  if (!skills.length) return;

  let W, H;
  function resize() { W = canvas.width = wrap.offsetWidth; H = canvas.height = wrap.offsetHeight; }
  resize();
  window.addEventListener('resize', resize);

  const HUES = [262, 272, 285, 300, 252, 240, 310, 230];
  const pts = skills.map((text, i) => {
    const phi   = Math.acos(1 - 2 * (i + 0.5) / skills.length);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;
    return {text, phi, theta, hue: HUES[i % HUES.length]};
  });

  let rotX = 0.35, rotY = 0, velX = 0, velY = 0.004;
  let drag = false, lmx = 0, lmy = 0, inflX = 0, inflY = 0;

  wrap.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    inflX = ((e.clientX - r.left) / W - 0.5) * 0.007;
    inflY = ((e.clientY - r.top)  / H - 0.5) * 0.004;
    if (drag) {
      velY = (e.clientX - lmx) * 0.007;
      velX = (e.clientY - lmy) * 0.007;
      lmx = e.clientX; lmy = e.clientY;
    }
  });
  wrap.addEventListener('mousedown', e => { drag = true; lmx = e.clientX; lmy = e.clientY; });
  wrap.addEventListener('mouseup',    () => drag = false);
  wrap.addEventListener('mouseleave', () => { drag = false; inflX = 0; inflY = 0; });

  function rRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y); ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h); ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r); ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    if (!drag) { velY += inflX; velY += 0.0028; }
    velX *= 0.94; velY *= 0.985;
    rotX += velX; rotY += velY;

    const R   = Math.min(W, H) * 0.35;
    const FOV = 560;
    const cX = Math.cos(rotX), sX = Math.sin(rotX);
    const cY = Math.cos(rotY), sY = Math.sin(rotY);

    ctx.beginPath();
    ctx.ellipse(W / 2, H / 2, R, R * 0.14, 0, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(168,85,247,0.07)';
    ctx.lineWidth = 1;
    ctx.stroke();

    const projected = pts.map(p => {
      const sx = Math.sin(p.phi), cx2 = Math.cos(p.phi);
      let x  = R * sx * Math.cos(p.theta);
      let y  = R * cx2;
      let z  = R * sx * Math.sin(p.theta);
      const x1 = x * cY + z * sY, z1 = -x * sY + z * cY;
      const y2 = y * cX - z1 * sX, z2 = y * sX + z1 * cX;
      const sc = FOV / (FOV + z2 + R * 0.4);
      const depth = (z2 + R) / (2 * R);
      return {...p, px: W/2 + x1 * sc, py: H/2 + y2 * sc, depth, z: z2};
    }).sort((a, b) => a.z - b.z);

    projected.forEach(p => {
      const a  = 0.12 + p.depth * 0.88;
      const fs = Math.round(8 + p.depth * 5);
      ctx.font = `bold ${fs}px Space Mono, monospace`;
      const tw = ctx.measureText(p.text).width;
      const bw = tw + 16, bh = fs + 10;
      ctx.save();
      ctx.globalAlpha = a;
      if (p.depth > 0.55) {
        ctx.shadowBlur  = 18 * ((p.depth - 0.55) / 0.45);
        ctx.shadowColor = `hsla(${p.hue},85%,65%,.9)`;
      }
      rRect(p.px - bw / 2, p.py - bh / 2, bw, bh, 4);
      ctx.fillStyle   = `hsla(${p.hue},55%,${16 + p.depth * 24}%,${0.45 + p.depth * 0.5})`;
      ctx.fill();
      ctx.strokeStyle = `hsla(${p.hue},70%,65%,${a * 0.6})`;
      ctx.lineWidth   = 1;
      ctx.stroke();
      ctx.shadowBlur  = 0;
      ctx.fillStyle   = `hsla(${p.hue},55%,${72 + p.depth * 18}%,${a})`;
      ctx.textAlign   = 'center';
      ctx.textBaseline= 'middle';
      ctx.fillText(p.text, p.px, p.py);
      ctx.restore();
    });
    requestAnimationFrame(loop);
  }
  loop();
})();

/* ── 16. Experience timeline draw ──────────────────────────── */
(function () {
  const line = document.querySelector('.exp-timeline-line');
  if (!line) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { line.classList.add('drawn'); io.unobserve(line); } });
  }, {threshold: 0.1});
  io.observe(line);
})();
