import { useEffect, useRef, useState, useCallback } from "react";

/* ============================================================
   Dexlie — Under Construction
   Monochrome glassmorphism · React + Tailwind + CSS animation
   ============================================================ */

/* ---------- hooks ---------- */

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const fn = (e) => setReduced(e.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);
  return reduced;
}

/* Scroll reveal: blur + fade + rise */
function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        filter: shown ? "blur(0px)" : "blur(14px)",
        transform: shown ? "translateY(0px)" : "translateY(36px)",
        transition: `opacity 1.1s cubic-bezier(.16,1,.3,1) ${delay}ms,
                     filter 1.1s cubic-bezier(.16,1,.3,1) ${delay}ms,
                     transform 1.1s cubic-bezier(.16,1,.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* Magnetic wrapper for buttons */
function Magnetic({ children, strength = 0.28, className = "" }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const onMove = (e) => {
    if (reduced) return;
    const el = ref.current;
    const r = el.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
  };
  const onLeave = () => {
    ref.current.style.transform = "translate(0px, 0px)";
  };
  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={className}
      style={{ transition: "transform .45s cubic-bezier(.16,1,.3,1)", willChange: "transform" }}
    >
      {children}
    </div>
  );
}

/* Tilt glass card with tracked light reflection */
function TiltCard({ children, className = "" }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const onMove = (e) => {
    if (reduced) return;
    const el = ref.current;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.transform = `perspective(900px) rotateX(${(0.5 - py) * 6}deg) rotateY(${(px - 0.5) * 6}deg) translateY(-6px)`;
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
  };
  const onLeave = () => {
    ref.current.style.transform =
      "perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0px)";
  };
  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} className={`dx-card ${className}`}>
      <div className="dx-card-sheen" aria-hidden="true" />
      {children}
    </div>
  );
}

/* ---------- background layers ---------- */

function Particles() {
  const canvasRef = useRef(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let raf, w, h;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const N = 60;
    const pts = [];

    const resize = () => {
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w * DPR;
      canvas.height = h * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < N; i++) {
      pts.push({
        x: Math.random(),
        y: Math.random(),
        r: Math.random() * 1.4 + 0.4,
        vx: (Math.random() - 0.5) * 0.00016,
        vy: (Math.random() - 0.5) * 0.00016,
        a: Math.random() * 0.35 + 0.08,
        ph: Math.random() * Math.PI * 2,
      });
    }

    const tick = (t) => {
      ctx.clearRect(0, 0, w, h);
      for (const p of pts) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = 1;
        if (p.x > 1) p.x = 0;
        if (p.y < 0) p.y = 1;
        if (p.y > 1) p.y = 0;
        const tw = 0.6 + 0.4 * Math.sin(t * 0.0006 + p.ph);
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.a * tw})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [reduced]);
  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 h-full w-full opacity-70"
      aria-hidden="true"
    />
  );
}

function Background({ parallax }) {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
      {/* gradient mesh blobs */}
      <div
        className="dx-blob"
        style={{
          width: "55vw",
          height: "55vw",
          top: "-18vw",
          left: "-12vw",
          background:
            "radial-gradient(circle at 40% 40%, rgba(255,255,255,0.10), rgba(255,255,255,0.02) 55%, transparent 70%)",
          animationDuration: "26s",
          transform: `translate(${parallax.x * 26}px, ${parallax.y * 26}px)`,
        }}
      />
      <div
        className="dx-blob"
        style={{
          width: "48vw",
          height: "48vw",
          bottom: "-16vw",
          right: "-10vw",
          background:
            "radial-gradient(circle at 60% 60%, rgba(255,255,255,0.07), rgba(255,255,255,0.015) 55%, transparent 72%)",
          animationDuration: "34s",
          animationDelay: "-8s",
          transform: `translate(${parallax.x * -34}px, ${parallax.y * -34}px)`,
        }}
      />
      <div
        className="dx-blob"
        style={{
          width: "34vw",
          height: "34vw",
          top: "38%",
          left: "58%",
          background:
            "radial-gradient(circle at 50% 50%, rgba(160,160,160,0.09), transparent 68%)",
          animationDuration: "30s",
          animationDelay: "-14s",
          transform: `translate(${parallax.x * 48}px, ${parallax.y * 48}px)`,
        }}
      />

      {/* spotlight behind hero */}
      <div
        className="absolute left-1/2 top-[-10%] h-[80vh] w-[90vw] -translate-x-1/2"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.09), rgba(255,255,255,0.025) 42%, transparent 68%)",
        }}
      />

      {/* floating glass shapes */}
      <div
        className="dx-shape"
        style={{
          width: 130,
          height: 130,
          top: "22%",
          left: "8%",
          animationDuration: "13s",
          transform: `translate(${parallax.x * 60}px, ${parallax.y * 60}px)`,
        }}
      />
      <div
        className="dx-shape"
        style={{
          width: 90,
          height: 90,
          top: "62%",
          right: "10%",
          borderRadius: "9999px",
          animationDuration: "17s",
          animationDelay: "-5s",
          transform: `translate(${parallax.x * -50}px, ${parallax.y * -50}px)`,
        }}
      />
      <div
        className="dx-shape"
        style={{
          width: 60,
          height: 60,
          top: "12%",
          right: "22%",
          animationDuration: "11s",
          animationDelay: "-3s",
          transform: `rotate(18deg) translate(${parallax.x * 40}px, ${parallax.y * 40}px)`,
        }}
      />

      {/* noise texture */}
      <div className="dx-noise absolute inset-0" />
      {/* vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(0,0,0,0.55) 100%)",
        }}
      />
    </div>
  );
}

function CursorGlow() {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) return;
    let raf;
    const pos = { x: -400, y: -400 };
    const target = { x: -400, y: -400 };
    const onMove = (e) => {
      target.x = e.clientX;
      target.y = e.clientY;
    };
    const tick = () => {
      pos.x += (target.x - pos.x) * 0.09;
      pos.y += (target.y - pos.y) * 0.09;
      if (ref.current) {
        ref.current.style.transform = `translate(${pos.x - 260}px, ${pos.y - 260}px)`;
      }
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);
  if (reduced) return null;
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-0 h-[520px] w-[520px]"
      style={{
        background:
          "radial-gradient(circle, rgba(255,255,255,0.05), rgba(255,255,255,0.015) 45%, transparent 70%)",
        willChange: "transform",
      }}
    />
  );
}

/* ---------- logo ---------- */

function DexlieMark({ size = 64 }) {
  return (
    <div
      className="dx-logo relative grid place-items-center rounded-2xl"
      style={{ width: size, height: size }}
    >
      <svg
        width={size * 0.5}
        height={size * 0.5}
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M8 5h9c6.075 0 11 4.925 11 11s-4.925 11-11 11H8V5zm5 5v12h4a6 6 0 0 0 0-12h-4z"
          fill="white"
          fillOpacity="0.95"
        />
      </svg>
    </div>
  );
}

/* ---------- sections ---------- */

const HEADLINE = ["Work.", "Think.", "Create."];

function Hero() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
      {/* logo */}
      <div
        style={{
          opacity: loaded ? 1 : 0,
          transform: loaded ? "translateY(0) scale(1)" : "translateY(24px) scale(.92)",
          transition: "all 1.2s cubic-bezier(.16,1,.3,1)",
        }}
        className="mb-10 flex flex-col items-center gap-4"
      >
        <DexlieMark size={72} />
        <span className="text-sm font-medium uppercase tracking-[0.42em] text-white/60">
          Dexlie
        </span>
      </div>

      {/* word-staggered headline */}
      <h1 className="dx-hero-h mb-7 max-w-5xl text-5xl font-semibold leading-[1.05] tracking-tight text-white sm:text-7xl lg:text-8xl">
        {HEADLINE.map((word, i) => (
          <span key={word} className="inline-block overflow-hidden align-bottom">
            <span
              className="inline-block"
              style={{
                opacity: loaded ? 1 : 0,
                filter: loaded ? "blur(0px)" : "blur(10px)",
                transform: loaded ? "translateY(0)" : "translateY(110%)",
                transition: `all 1.15s cubic-bezier(.16,1,.3,1) ${260 + i * 140}ms`,
              }}
            >
              {word}
              {i < HEADLINE.length - 1 ? "\u00A0" : ""}
            </span>
          </span>
        ))}
      </h1>

      <p
        className="mx-auto mb-12 max-w-2xl text-base leading-relaxed text-white/55 sm:text-lg"
        style={{
          opacity: loaded ? 1 : 0,
          transform: loaded ? "translateY(0)" : "translateY(20px)",
          filter: loaded ? "blur(0)" : "blur(8px)",
          transition: "all 1.2s cubic-bezier(.16,1,.3,1) 750ms",
        }}
      >
        Dexlie is building the next generation AI-powered workspace where tasks, notes,
        knowledge, planning and intelligent assistance come together in one beautifully
        simple experience.
      </p>

      <div
        className="flex flex-col items-center gap-4 sm:flex-row"
        style={{
          opacity: loaded ? 1 : 0,
          transform: loaded ? "translateY(0)" : "translateY(20px)",
          transition: "all 1.2s cubic-bezier(.16,1,.3,1) 950ms",
        }}
      >
        <Magnetic>
          <button className="dx-btn-primary group relative overflow-hidden rounded-full bg-white px-9 py-3.5 text-sm font-semibold text-black">
            <span className="relative z-10">Notify Me</span>
            <span className="dx-btn-shine" aria-hidden="true" />
          </button>
        </Magnetic>
        <Magnetic strength={0.2}>
          <button className="dx-btn-ghost rounded-full px-9 py-3.5 text-sm font-medium text-white/75">
            Coming Soon
          </button>
        </Magnetic>
      </div>

      {/* scroll hint */}
      <div
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
        style={{ opacity: loaded ? 1 : 0, transition: "opacity 1.4s ease 1600ms" }}
      >
        <div className="dx-scrollhint flex h-10 w-6 items-start justify-center rounded-full border border-white/15 p-1.5">
          <div className="dx-scrolldot h-1.5 w-1.5 rounded-full bg-white/60" />
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section className="relative z-10 mx-auto max-w-3xl px-6 py-28 text-center sm:py-36">
      <Reveal>
        <p className="mb-5 text-xs font-medium uppercase tracking-[0.35em] text-white/40">
          About Dexlie
        </p>
      </Reveal>
      <Reveal delay={100}>
        <h2 className="mb-8 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Reimagining how people organise their work and ideas.
        </h2>
      </Reveal>
      <Reveal delay={200}>
        <p className="mb-6 text-base leading-relaxed text-white/55 sm:text-lg">
          Instead of switching between dozens of productivity apps, Dexlie combines
          everything into one intelligent workspace designed to help you think clearly,
          work faster, and stay focused.
        </p>
      </Reveal>
      <Reveal delay={300}>
        <p className="mb-10 text-base leading-relaxed text-white/55 sm:text-lg">
          Whether you're a student, creator, entrepreneur or professional, Dexlie adapts
          to the way you work — not the other way around.
        </p>
      </Reveal>
      <Reveal delay={400}>
        <p className="text-lg font-medium text-white/85 sm:text-xl">
          Our mission is simple:{" "}
          <span className="text-white">build the workspace we always wished existed.</span>
        </p>
      </Reveal>
    </section>
  );
}

/* icons: minimal white line icons */
const Icon = {
  spark: <path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4L12 3z" />,
  notes: (
    <>
      <rect x="5" y="4" width="14" height="16" rx="2" />
      <path d="M9 9h6M9 13h6M9 17h3" />
    </>
  ),
  tasks: (
    <>
      <path d="M4 7l2 2 4-4" />
      <path d="M4 15l2 2 4-4" />
      <path d="M13 7.5h7M13 15.5h7" />
    </>
  ),
  timer: (
    <>
      <circle cx="12" cy="13" r="7" />
      <path d="M12 10v3.5l2.5 1.5M9.5 3h5" />
    </>
  ),
  calendar: (
    <>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M4 10h16M8 3v4M16 3v4" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6" />
      <path d="M15.5 15.5L20 20" />
    </>
  ),
  files: <path d="M4 7a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7z" />,
  sync: (
    <>
      <path d="M20 12a8 8 0 0 1-14.5 4.6M4 12a8 8 0 0 1 14.5-4.6" />
      <path d="M4 17v-4h4M20 7v4h-4" />
    </>
  ),
  workspace: (
    <>
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </>
  ),
};

const FEATURES = [
  {
    icon: Icon.spark,
    title: "Smart AI Assistant",
    desc: "An assistant that understands your work and helps you move it forward.",
  },
  {
    icon: Icon.notes,
    title: "Notes & Knowledge Base",
    desc: "Capture ideas and connect them into a living body of knowledge.",
  },
  {
    icon: Icon.tasks,
    title: "Tasks & Projects",
    desc: "Plan, prioritise and finish work without leaving your workspace.",
  },
  {
    icon: Icon.timer,
    title: "Pomodoro Focus Timer",
    desc: "Structured deep-work sessions built directly into your flow.",
  },
  {
    icon: Icon.calendar,
    title: "Calendar Integration",
    desc: "Your schedule and your work, finally in the same place.",
  },
  {
    icon: Icon.search,
    title: "AI Search",
    desc: "Ask in plain language. Find anything across everything you've made.",
  },
  {
    icon: Icon.files,
    title: "File Organisation",
    desc: "Every document, reference and asset, quietly kept in order.",
  },
  {
    icon: Icon.sync,
    title: "Cross-device Sync",
    desc: "Pick up exactly where you left off, on any device.",
  },
  {
    icon: Icon.workspace,
    title: "Intelligent Workspace",
    desc: "An environment that adapts to how you think and work.",
  },
];

function Features() {
  return (
    <section className="relative z-10 mx-auto max-w-6xl px-6 py-24 sm:py-32">
      <Reveal className="text-center">
        <p className="mb-5 text-xs font-medium uppercase tracking-[0.35em] text-white/40">
          Upcoming Features
        </p>
        <h2 className="mx-auto mb-16 max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Everything you need to think, plan and create.
        </h2>
      </Reveal>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f, i) => (
          <Reveal key={f.title} delay={(i % 3) * 120}>
            <TiltCard className="h-full p-7">
              <div className="dx-icon mb-6 grid h-11 w-11 place-items-center rounded-xl">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="rgba(255,255,255,0.9)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  {f.icon}
                </svg>
              </div>
              <h3 className="mb-2 text-base font-semibold text-white">{f.title}</h3>
              <p className="text-sm leading-relaxed text-white/50">{f.desc}</p>
            </TiltCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function UnderConstruction() {
  return (
    <section className="relative z-10 mx-auto max-w-4xl px-6 py-24 sm:py-32">
      <Reveal>
        <div className="dx-construct relative overflow-hidden rounded-3xl p-[1px]">
          <div className="dx-construct-border" aria-hidden="true" />
          <div className="relative rounded-3xl bg-black/60 px-8 py-16 text-center backdrop-blur-2xl sm:px-16 sm:py-20">
            <div className="mx-auto mb-8 flex w-fit items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5">
              <span className="dx-pulse relative h-2 w-2 rounded-full bg-white" />
              <span className="text-xs font-medium tracking-wide text-white/60">
                In active development
              </span>
            </div>
            <h2 className="dx-shimmer mb-6 text-3xl font-semibold tracking-tight sm:text-5xl">
              Website Under Construction
            </h2>
            <p className="mx-auto mb-3 max-w-xl text-lg text-white/70">
              We're crafting something extraordinary.
            </p>
            <p className="mx-auto max-w-xl text-base text-white/45">
              Dexlie is currently in development and will launch soon.
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/[0.06] px-6 py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-3">
          <DexlieMark size={30} />
          <span className="text-sm font-medium tracking-wide text-white/70">Dexlie</span>
        </div>
        <p className="text-center text-xs text-white/35">
          © 2026 Dexlie · Building the future of productivity.
        </p>
      </div>
    </footer>
  );
}

/* ---------- app ---------- */

export default function DexlieLanding() {
  const reduced = useReducedMotion();
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const raf = useRef(null);

  const onMouse = useCallback(
    (e) => {
      if (reduced) return;
      if (raf.current) return;
      raf.current = requestAnimationFrame(() => {
        setParallax({
          x: e.clientX / window.innerWidth - 0.5,
          y: e.clientY / window.innerHeight - 0.5,
        });
        raf.current = null;
      });
    },
    [reduced]
  );

  return (
    <div
      onMouseMove={onMouse}
      className="relative min-h-screen overflow-x-hidden bg-black text-white antialiased"
      style={{
        fontFamily:
          "'Inter', 'Geist', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        ::selection { background: rgba(255,255,255,.9); color: #000; }
        html { scroll-behavior: smooth; }

        /* ---- background ---- */
        .dx-blob {
          position: absolute;
          border-radius: 9999px;
          filter: blur(60px);
          animation: dx-drift linear infinite alternate;
          will-change: transform;
        }
        @keyframes dx-drift {
          from { translate: 0 0; }
          to   { translate: 4vw 3vw; }
        }
        .dx-shape {
          position: absolute;
          border-radius: 22px;
          border: 1px solid rgba(255,255,255,0.08);
          background: linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01));
          backdrop-filter: blur(6px);
          animation: dx-float ease-in-out infinite alternate;
        }
        @keyframes dx-float {
          from { translate: 0 -14px; rotate: -2deg; }
          to   { translate: 0 14px;  rotate: 2deg; }
        }
        .dx-noise {
          opacity: .05;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E");
        }

        /* ---- logo ---- */
        .dx-logo {
          border: 1px solid rgba(255,255,255,0.14);
          background: linear-gradient(145deg, rgba(255,255,255,0.10), rgba(255,255,255,0.02));
          backdrop-filter: blur(12px);
          box-shadow: 0 0 40px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.18);
          animation: dx-breathe 5s ease-in-out infinite;
        }
        @keyframes dx-breathe {
          0%, 100% { box-shadow: 0 0 34px rgba(255,255,255,0.07), inset 0 1px 0 rgba(255,255,255,0.18); }
          50%      { box-shadow: 0 0 60px rgba(255,255,255,0.16), inset 0 1px 0 rgba(255,255,255,0.24); }
        }

        /* ---- hero ---- */
        .dx-hero-h {
          animation: dx-tracking 2.2s cubic-bezier(.16,1,.3,1) both;
        }
        @keyframes dx-tracking {
          from { letter-spacing: .06em; }
          to   { letter-spacing: -0.02em; }
        }

        /* ---- buttons ---- */
        .dx-btn-primary {
          transition: transform .35s cubic-bezier(.16,1,.3,1), box-shadow .35s ease;
          box-shadow: 0 0 0 rgba(255,255,255,0);
        }
        .dx-btn-primary:hover {
          transform: scale(1.05);
          box-shadow: 0 0 44px rgba(255,255,255,0.30);
        }
        .dx-btn-primary:focus-visible,
        .dx-btn-ghost:focus-visible {
          outline: 2px solid rgba(255,255,255,.8);
          outline-offset: 3px;
        }
        .dx-btn-shine {
          position: absolute;
          inset: 0;
          background: linear-gradient(105deg, transparent 30%, rgba(0,0,0,0.10) 50%, transparent 70%);
          transform: translateX(-120%);
          transition: transform .8s ease;
        }
        .dx-btn-primary:hover .dx-btn-shine { transform: translateX(120%); }
        .dx-btn-ghost {
          border: 1px solid rgba(255,255,255,0.14);
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(10px);
          transition: all .35s cubic-bezier(.16,1,.3,1);
        }
        .dx-btn-ghost:hover {
          transform: scale(1.04);
          border-color: rgba(255,255,255,0.30);
          background: rgba(255,255,255,0.07);
          box-shadow: 0 0 28px rgba(255,255,255,0.10);
        }

        /* ---- glass cards ---- */
        .dx-card {
          position: relative;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.09);
          background: linear-gradient(160deg, rgba(255,255,255,0.05), rgba(255,255,255,0.015));
          backdrop-filter: blur(14px);
          transition: transform .5s cubic-bezier(.16,1,.3,1),
                      border-color .4s ease, box-shadow .4s ease;
          transform-style: preserve-3d;
          will-change: transform;
          overflow: hidden;
        }
        .dx-card:hover {
          border-color: rgba(255,255,255,0.22);
          box-shadow: 0 24px 60px rgba(0,0,0,0.5), 0 0 34px rgba(255,255,255,0.06);
        }
        .dx-card-sheen {
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity .4s ease;
          background: radial-gradient(320px circle at var(--mx, 50%) var(--my, 50%),
                      rgba(255,255,255,0.10), transparent 65%);
          pointer-events: none;
        }
        .dx-card:hover .dx-card-sheen { opacity: 1; }
        .dx-icon {
          border: 1px solid rgba(255,255,255,0.12);
          background: linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02));
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.14);
        }

        /* ---- under construction ---- */
        .dx-construct-border {
          position: absolute;
          inset: -60%;
          background: conic-gradient(from 0deg,
            transparent 0deg, rgba(255,255,255,0.5) 40deg, transparent 90deg,
            transparent 180deg, rgba(255,255,255,0.25) 220deg, transparent 270deg);
          animation: dx-spin 9s linear infinite;
        }
        @keyframes dx-spin { to { transform: rotate(360deg); } }
        .dx-shimmer {
          background: linear-gradient(100deg,
            rgba(255,255,255,0.55) 20%, #ffffff 45%, rgba(255,255,255,0.55) 70%);
          background-size: 220% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: dx-shimmer 4.5s ease-in-out infinite;
        }
        @keyframes dx-shimmer {
          0%   { background-position: 130% 0; }
          100% { background-position: -80% 0; }
        }
        .dx-pulse::after {
          content: "";
          position: absolute;
          inset: -4px;
          border-radius: 9999px;
          border: 1px solid rgba(255,255,255,0.6);
          animation: dx-ping 2s cubic-bezier(0,0,.2,1) infinite;
        }
        @keyframes dx-ping {
          0%   { transform: scale(.6); opacity: 1; }
          100% { transform: scale(2.2); opacity: 0; }
        }

        /* ---- scroll hint ---- */
        .dx-scrolldot { animation: dx-scroll 2.2s ease-in-out infinite; }
        @keyframes dx-scroll {
          0%, 100% { transform: translateY(0); opacity: 1; }
          60%      { transform: translateY(14px); opacity: .1; }
        }

        /* ---- reduced motion ---- */
        @media (prefers-reduced-motion: reduce) {
          .dx-blob, .dx-shape, .dx-logo, .dx-hero-h, .dx-construct-border,
          .dx-shimmer, .dx-pulse::after, .dx-scrolldot {
            animation: none !important;
          }
          .dx-shimmer { color: #fff; background: none; -webkit-background-clip: initial; }
          * { transition-duration: .01ms !important; }
        }
      `}</style>

      <Background parallax={parallax} />
      <Particles />
      <CursorGlow />

      <main>
        <Hero />
        <About />
        <Features />
        <UnderConstruction />
      </main>
      <Footer />
    </div>
  );
}
