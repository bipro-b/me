/* Biprodas Barai — Portfolio (vanilla JS, no dependencies) */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Navbar scroll state + back-to-top ---------- */
  const nav = $("#nav");
  const toTop = $("#toTop");
  let ticking = false;
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle("is-scrolled", y > 20);
    toTop.classList.toggle("is-visible", y > 600);
    ticking = false;
  };
  window.addEventListener("scroll", () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();
  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));

  /* ---------- Mobile drawer ---------- */
  const drawer = $("#drawer");
  const backdrop = $("#drawerBackdrop");
  const openBtn = $("#menuOpen");
  const closeBtn = $("#menuClose");

  const setDrawer = (open) => {
    drawer.classList.toggle("is-open", open);
    drawer.setAttribute("aria-hidden", String(!open));
    drawer.toggleAttribute("inert", !open);
    openBtn.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("no-scroll", open);
    if (open) {
      backdrop.hidden = false;
      requestAnimationFrame(() => backdrop.classList.add("is-open"));
      closeBtn.focus();
    } else {
      backdrop.classList.remove("is-open");
      setTimeout(() => { backdrop.hidden = true; }, 300);
      openBtn.focus({ preventScroll: true });
    }
  };
  openBtn.addEventListener("click", () => setDrawer(true));
  closeBtn.addEventListener("click", () => setDrawer(false));
  backdrop.addEventListener("click", () => setDrawer(false));
  $$(".drawer__link", drawer).forEach(a => a.addEventListener("click", () => setDrawer(false)));
  document.addEventListener("keydown", e => { if (e.key === "Escape" && drawer.classList.contains("is-open")) setDrawer(false); });
  // close drawer if resized to desktop
  window.matchMedia("(min-width: 900px)").addEventListener("change", e => { if (e.matches && drawer.classList.contains("is-open")) setDrawer(false); });

  /* ---------- Scrollspy ---------- */
  const spyLinks = $$("[data-spy]");
  const sections = $$("main section[id]");
  const spy = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const id = en.target.id;
      spyLinks.forEach(l => {
        const on = l.dataset.spy === id;
        l.classList.toggle("is-active", on);
        on ? l.setAttribute("aria-current", "true") : l.removeAttribute("aria-current");
      });
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach(s => spy.observe(s));

  /* ---------- Typewriter ---------- */
  const typed = $("#typed");
  const words = ["Backend Engineer.", "Platform Engineer.", "Cloud & DevOps.", "Microservices Architect."];
  if (reduceMotion) {
    typed.textContent = words[0];
  } else {
    let w = 0, i = 0, deleting = false;
    const TYPE = 70, DELETE = 35, HOLD = 2000;
    const tick = () => {
      const word = words[w];
      i += deleting ? -1 : 1;
      typed.textContent = word.slice(0, i);
      let delay = deleting ? DELETE : TYPE;
      if (!deleting && i === word.length) { deleting = true; delay = HOLD; }
      else if (deleting && i === 0) { deleting = false; w = (w + 1) % words.length; delay = 300; }
      setTimeout(tick, delay);
    };
    tick();
  }

  /* ---------- Resume tabs (ARIA tabs pattern) ---------- */
  const tabs = $$(".tab");
  const activate = (tab, focus = false) => {
    tabs.forEach(t => {
      const on = t === tab;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute("aria-controls"));
      panel.hidden = !on;
      panel.classList.remove("is-active");
      if (on) requestAnimationFrame(() => requestAnimationFrame(() => panel.classList.add("is-active")));
    });
    if (focus) tab.focus();
  };
  tabs.forEach((t, idx) => {
    t.addEventListener("click", () => activate(t));
    t.addEventListener("keydown", e => {
      const k = e.key;
      if (k === "ArrowRight" || k === "ArrowLeft") {
        e.preventDefault();
        activate(tabs[(idx + (k === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length], true);
      }
    });
  });

  /* ---------- Certificates carousel (touch + keyboard + dots) ---------- */
  const carousel = $("#carousel");
  if (carousel) {
    const track = $(".carousel__track", carousel);
    const viewport = $(".carousel__viewport", carousel);
    const slides = $$(".slide", carousel);
    const dots = $$(".dot", carousel);
    let index = 0;

    const go = (n) => {
      index = (n + slides.length) % slides.length;
      track.style.transform = `translate3d(${-index * 100}%,0,0)`;
      dots.forEach((d, i) => {
        d.classList.toggle("is-active", i === index);
        d.setAttribute("aria-current", i === index ? "true" : "false");
      });
      slides.forEach((s, i) => {
        s.setAttribute("aria-hidden", String(i !== index));
        s.toggleAttribute("inert", i !== index);
      });
    };
    $$(".carousel__btn", carousel).forEach(b => b.addEventListener("click", () => go(index + Number(b.dataset.dir))));
    dots.forEach(d => d.addEventListener("click", () => go(Number(d.dataset.index))));
    carousel.addEventListener("keydown", e => {
      if (e.key === "ArrowRight") go(index + 1);
      if (e.key === "ArrowLeft") go(index - 1);
    });

    // swipe
    let startX = 0, startY = 0, dx = 0, dragging = false, locked = null;
    viewport.addEventListener("pointerdown", e => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      dragging = true; locked = null; dx = 0;
      startX = e.clientX; startY = e.clientY;
    });
    viewport.addEventListener("pointermove", e => {
      if (!dragging) return;
      const mx = e.clientX - startX, my = e.clientY - startY;
      if (locked === null && (Math.abs(mx) > 6 || Math.abs(my) > 6)) {
        locked = Math.abs(mx) > Math.abs(my) ? "x" : "y";
        if (locked === "x") { track.classList.add("is-dragging"); viewport.setPointerCapture(e.pointerId); }
      }
      if (locked !== "x") return;
      dx = mx;
      track.style.transform = `translate3d(calc(${-index * 100}% + ${dx}px),0,0)`;
    });
    const end = () => {
      if (!dragging) return;
      dragging = false;
      track.classList.remove("is-dragging");
      if (locked === "x") {
        const threshold = Math.min(80, viewport.clientWidth * 0.18);
        if (dx < -threshold) go(index + 1);
        else if (dx > threshold) go(index - 1);
        else go(index);
      }
    };
    viewport.addEventListener("pointerup", end);
    viewport.addEventListener("pointercancel", end);
    // prevent link clicks firing after a swipe
    viewport.addEventListener("click", e => { if (Math.abs(dx) > 10) { e.preventDefault(); dx = 0; } }, true);

    go(0);
  }

  /* ---------- Contact form ---------- */
  const form = $("#contactForm");
  const msg = $("#formMsg");
  const emailRe = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/;
  const rules = [
    ["username", v => v !== "", "Username is required!"],
    ["phone", v => v !== "", "Phone number is required!"],
    ["email", v => v !== "", "Please give your Email!"],
    ["email", v => emailRe.test(v.toLowerCase()), "Give a valid Email!"],
    ["subject", v => v !== "", "Please give your Subject!"],
    ["message", v => v !== "", "Message is required!"],
  ];
  const show = (text, type) => {
    msg.hidden = false;
    msg.textContent = text;
    msg.className = `form__msg is-${type}`;
  };
  form.addEventListener("submit", e => {
    e.preventDefault();
    $$(".input", form).forEach(i => { i.classList.remove("is-invalid"); i.removeAttribute("aria-invalid"); });
    for (const [id, test, error] of rules) {
      const el = form.elements[id];
      if (!test(el.value.trim())) {
        el.classList.add("is-invalid");
        el.setAttribute("aria-invalid", "true");
        show(error, "error");
        el.focus();
        return;
      }
    }
    const name = form.elements.username.value.trim();
    // TODO: wire to a form backend (Formspree / Web3Forms / your API) — currently client-side only, same as the React version.
    show(`Thank you dear ${name}, your message has been sent successfully!`, "success");
    form.reset();
  });

  /* ---------- Footer year ---------- */
  $("#year").textContent = new Date().getFullYear();
})();
