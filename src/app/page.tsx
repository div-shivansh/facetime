"use client";

/**
 * Landing page – instant video calling app
 *
 * Install:  npm i gsap @gsap/react react-icons
 * Place at: app/page.tsx
 *
 * Design notes
 * - Flat colour, thick ink outlines and hard offset shadows (sticker look).
 * - One signature moment: a live "mock call" in the hero that joins, talks,
 *   then everyone leaves and the room is deleted. It loops, and it is the
 *   product's whole promise in 10 seconds.
 * - One scroll moment: a pinned section where the call grid dissolves.
 * - Everything else stays still. Reduced-motion users get a static page.
 */

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import {
  FaVideo,
  FaMicrophone,
  FaPhoneSlash,
  FaLock,
  FaLink,
  FaShuffle,
} from "react-icons/fa6";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/* ------------------------------------------------------------------ */
/* Config                                                              */
/* ------------------------------------------------------------------ */

const APP_NAME = "Quickroom"; // change to your product name
const APP_DOMAIN = "quickroom.app"; // used in the sample link

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display" });
const body = Instrument_Sans({ subsets: ["latin"], variable: "--font-body" });

const C = {
  mist: "#E8EDF6",
  ink: "#0B1630",
  blue: "#2147FF",
  mint: "#24D6A0",
  sun: "#FFC53D",
  coral: "#FF6F59",
  lilac: "#B9A8FF",
};

const displayFont = { fontFamily: "var(--font-display), system-ui, sans-serif" };

const PEOPLE = [
  { name: "Priya", bg: C.sun, skin: "#8A5A3C", cloth: C.ink },
  { name: "Marcus", bg: C.lilac, skin: "#E8B48F", cloth: C.blue },
  { name: "Aiko", bg: C.coral, skin: "#F2C9A5", cloth: C.ink },
  { name: "You", bg: C.mint, skin: "#6B4430", cloth: C.blue },
];

const ADJ = ["calm", "bright", "swift", "quiet", "bold", "sunny", "lucky", "brisk"];
const NOUN = ["otter", "falcon", "maple", "comet", "harbor", "pixel", "ember", "meadow"];

const FEATURES = [
  {
    title: "Instant access",
    text: "Share a link and you're in. No waiting room, no sign-up, nothing to install.",
  },
  {
    title: "Zero trace",
    text: "A room exists only while someone is in it. When the last person disconnects, the room is deleted.",
  },
  {
    title: "HD, low latency",
    text: "Calls run over WebRTC, so video stays sharp and the conversation stays natural.",
  },
];

/* ------------------------------------------------------------------ */
/* Small pieces                                                        */
/* ------------------------------------------------------------------ */

function Avatar({ skin, cloth }: { skin: string; cloth: string }) {
  return (
    <div className="avatar absolute inset-x-0 bottom-0 flex flex-col items-center">
      <div
        className="head aspect-square w-[27%] rounded-full"
        style={{ background: skin }}
      />
      <div
        className="mt-[3%] aspect-2/1 w-[68%] rounded-t-full"
        style={{ background: cloth }}
      />
    </div>
  );
}

function fmt(seconds: number) {
  const s = Math.floor(seconds);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Home() {
  const router = useRouter();
  const root = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [meeting, setMeeting] = useState<string>("");

  /* ---- functionality (unchanged behaviour) ---- */

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (meeting.trim()) {
      router.push(`/call/${meeting}`);
    }
  };

  const generateRandomCode = () => {
    const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
    const code = `${pick(ADJ)}-${pick(NOUN)}-${Math.floor(10 + Math.random() * 89)}`;
    const typed = { n: 0 };
    gsap.to(typed, {
      n: code.length,
      duration: 0.45,
      ease: "none",
      onUpdate: () => setMeeting(code.slice(0, Math.round(typed.n))),
    });
    inputRef.current?.focus({ preventScroll: true });
  };

  const jumpToInput = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    window.setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 500);
  };

  /* ---- animation ---- */

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          ok: "(prefers-reduced-motion: no-preference)",
          reduce: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const { reduce } = ctx.conditions as { reduce: boolean };

          // Reduced motion: show everything, animate nothing.
          if (reduce) {
            gsap.set(".hl-inner, .js-in, .stage-wrap, .sticker, .zt-b", {
              opacity: 1,
            });
            return;
          }

          /* 1. Page-load sequence */
          gsap.fromTo(
            ".hl-inner",
            { yPercent: 105, opacity: 0 },
            { yPercent: 0, opacity: 1, duration: 1, ease: "power4.out", stagger: 0.12 }
          );
          gsap.fromTo(
            ".js-in",
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", stagger: 0.1, delay: 0.45 }
          );
          gsap.fromTo(
            ".stage-wrap",
            { y: 50, opacity: 0, rotate: 2 },
            { y: 0, opacity: 1, rotate: 0, duration: 1.1, ease: "power3.out", delay: 0.3 }
          );
          gsap.fromTo(
            ".sticker",
            { scale: 0, rotate: -30, opacity: 0 },
            { scale: 1, rotate: 6, opacity: 1, duration: 0.7, ease: "back.out(2)", delay: 1.2 }
          );

          /* 2. The mock call: join -> talk -> everyone leaves -> room gone */
          const tiles = gsap.utils.toArray<HTMLElement>(".tile");
          const rings = gsap.utils.toArray<HTMLElement>(".tile .ring");
          const timerEl = root.current?.querySelector<HTMLElement>(".call-timer");
          const clock = { s: 0 };

          gsap.set(tiles, { scale: 0.5, autoAlpha: 0 });

          gsap.to(".tile .head", {
            y: -5,
            duration: 1.5,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut",
            stagger: { each: 0.35, from: "random" },
          });

          const call = gsap.timeline({ repeat: -1, repeatDelay: 0.3, delay: 1.1 });
          call
            .set(tiles, { scale: 0.5, autoAlpha: 0 }, 0)
            .set(".closed", { opacity: 0 }, 0)
            .set(rings, { opacity: 0 }, 0)
            .fromTo(
              clock,
              { s: 0 },
              {
                s: 48,
                duration: 7.4,
                ease: "none",
                onUpdate: () => {
                  if (timerEl) timerEl.textContent = fmt(clock.s);
                },
              },
              0.2
            )
            .to(
              tiles,
              { scale: 1, autoAlpha: 1, duration: 0.6, ease: "back.out(1.6)", stagger: 0.5 },
              0.3
            )
            .to(rings[0], { opacity: 1, duration: 0.2 }, 2.6)
            .to(rings[0], { opacity: 0, duration: 0.2 }, 3.8)
            .to(rings[2], { opacity: 1, duration: 0.2 }, 4.2)
            .to(rings[2], { opacity: 0, duration: 0.2 }, 5.3)
            .to(
              tiles,
              { scale: 0.6, autoAlpha: 0, duration: 0.35, ease: "power2.in", stagger: 0.3 },
              6.3
            )
            .to(".closed", { opacity: 1, duration: 0.4 }, 7.5)
            .to(".closed", { opacity: 0, duration: 0.3 }, 9.3);

          /* 3. Scroll moment: the call grid dissolves */
          gsap
            .timeline({
              scrollTrigger: {
                trigger: ".zt",
                start: "top top",
                end: "+=160%",
                pin: true,
                scrub: 0.6,
              },
            })
            .to(
              ".zt-tile",
              {
                scale: 0.4,
                opacity: 0,
                duration: 0.6,
                ease: "power2.in",
                stagger: { each: 0.2, from: "random" },
              },
              0
            )
            .fromTo(
              ".zt-b",
              { opacity: 0, y: 24 },
              { opacity: 1, y: 0, duration: 0.7, stagger: 0.25 },
              2.9
            )
            .to({}, { duration: 0.8 });
        }
      );
    },
    { scope: root }
  );

  /* ---- shared style tokens ---- */

  const btnBase =
    "inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#0B1630] font-semibold transition-all duration-150 " +
    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2147FF]/40 " +
    "enabled:hover:-translate-y-0.5 enabled:active:translate-x-[3px] enabled:active:translate-y-[3px] enabled:active:shadow-none";

  return (
    <main
      ref={root}
      className={`${display.variable} ${body.variable} min-h-screen overflow-x-clip text-[#0B1630] antialiased`}
      style={{
        fontFamily: "var(--font-body), system-ui, sans-serif",
        background: C.mist,
      }}
    >
      {/* ============================ HERO ============================ */}
      <section className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 pb-16 md:px-10">
        {/* Nav */}
        <nav className="flex items-center justify-between py-6">
          <a href="#" className="flex items-center gap-3" aria-label={APP_NAME}>
            <span className="grid h-10 w-10 place-items-center rounded-xl border-2 border-[#0B1630] bg-[#2147FF] text-white shadow-[3px_3px_0_0_#0B1630]">
              <FaVideo />
            </span>
            <span className="text-xl font-extrabold tracking-tight" style={displayFont}>
              {APP_NAME}
            </span>
          </a>
          <div className="flex items-center gap-6 text-sm font-semibold">
            <a href="#how" className="hidden underline-offset-4 hover:underline sm:inline">
              How it works
            </a>
            <a href="#zero-trace" className="hidden underline-offset-4 hover:underline sm:inline">
              Privacy
            </a>
            <button
              onClick={jumpToInput}
              className={`${btnBase} bg-white px-4 py-2 shadow-[3px_3px_0_0_#0B1630]`}
            >
              Join a room
            </button>
          </div>
        </nav>

        <div className="grid flex-1 items-center gap-14 py-8 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
          {/* Left: copy + form */}
          <div>
            <h1
              className="text-[clamp(3rem,8.4vw,7.25rem)] font-extrabold leading-[0.92] tracking-[-0.04em]"
              style={displayFont}
            >
              <span className="hl-line block overflow-hidden pb-[0.08em]">
                <span className="hl-inner block opacity-0">Meetings without</span>
              </span>
              <span className="hl-line block overflow-hidden pb-[0.08em]">
                <span className="hl-inner block opacity-0">the friction.</span>
              </span>
            </h1>

            <p className="js-in mt-7 max-w-xl text-lg leading-relaxed text-[#0B1630]/75 opacity-0 md:text-xl">
              No accounts, no downloads. Pick a room code, share the link, and start talking.
              When the last person leaves, the room is gone.
            </p>

            <form onSubmit={handleSubmit} className="js-in mt-9 w-full max-w-xl opacity-0">
              <label htmlFor="room" className="sr-only">
                Room code
              </label>
              <div className="flex items-stretch gap-2 rounded-2xl border-2 border-[#0B1630] bg-white p-2 shadow-[6px_6px_0_0_#0B1630] focus-within:ring-4 focus-within:ring-[#2147FF]/30">
                <span className="hidden select-none items-center pl-4 font-mono text-lg text-[#0B1630]/40 sm:flex">
                  /call/
                </span>
                <input
                  id="room"
                  ref={inputRef}
                  value={meeting}
                  onChange={(e) =>
                    setMeeting(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                  }
                  placeholder="daily-standup"
                  type="text"
                  autoComplete="off"
                  spellCheck={false}
                  className="min-w-0 flex-1 bg-transparent px-3 py-3 font-mono text-xl text-[#0B1630] outline-none placeholder:text-[#0B1630]/30 sm:pl-1"
                />
                <button
                  type="submit"
                  disabled={!meeting.trim()}
                  className={`${btnBase} bg-[#2147FF] px-6 text-lg text-white shadow-[3px_3px_0_0_#0B1630] disabled:cursor-not-allowed disabled:border-[#0B1630]/20 disabled:bg-[#0B1630]/10 disabled:text-[#0B1630]/40`}
                >
                  Join room
                </button>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                <button
                  type="button"
                  onClick={generateRandomCode}
                  className="group inline-flex items-center gap-2 font-semibold underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2147FF]/40"
                >
                  <FaShuffle className="transition-transform duration-300 group-hover:rotate-180" />
                  Generate a code for me
                </button>
                <span className="text-[#0B1630]/60">Anyone with the code can join.</span>
              </div>
            </form>
          </div>

          {/* Right: the mock call */}
          <div className="stage-wrap relative mx-auto w-full max-w-145 opacity-0">
            {/* blue slab */}
            <div
              aria-hidden
              className="absolute inset-0 translate-x-4 translate-y-5 rotate-3 rounded-[28px] border-2 border-[#0B1630] bg-[#2147FF]"
            />
            {/* sticker */}
            <div
              aria-hidden
              className="sticker absolute -right-3 -top-7 z-20 grid h-24 w-24 place-items-center rounded-full border-2 border-[#0B1630] bg-[#FFC53D] p-2 text-center text-[13px] font-extrabold leading-tight opacity-0 shadow-[3px_3px_0_0_#0B1630] sm:-right-8 sm:h-28 sm:w-28 sm:text-sm"
              style={displayFont}
            >
              No account needed
            </div>

            <div
              className="relative overflow-hidden rounded-[28px] border-2 border-[#0B1630] bg-[#0B1630] shadow-[8px_8px_0_0_#0B1630]"
              role="img"
              aria-label="Illustration of a video call where four people join, talk, then leave and the room closes"
            >
              {/* title bar */}
              <div className="flex items-center justify-between gap-3 border-b-2 border-[#0B1630] bg-white px-4 py-3">
                <div className="flex min-w-0 items-center gap-2 rounded-full bg-[#E8EDF6] px-3 py-1.5 font-mono text-sm">
                  <FaLock className="shrink-0 text-xs text-[#0B1630]/50" />
                  <span className="truncate">
                    {APP_DOMAIN}/call/{meeting || "your-room"}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-2 text-sm font-semibold">
                  <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#24D6A0]" />
                  <span className="call-timer font-mono tabular-nums">00:00</span>
                </div>
              </div>

              {/* tiles */}
              <div className="relative grid grid-cols-2 gap-3 p-3">
                {PEOPLE.map((p) => (
                  <div
                    key={p.name}
                    className="tile relative aspect-4/3 overflow-hidden rounded-2xl border-2 border-[#0B1630]"
                    style={{ background: p.bg }}
                  >
                    <Avatar skin={p.skin} cloth={p.cloth} />
                    <span className="ring pointer-events-none absolute inset-0 rounded-[14px] border-[5px] border-[#0B1630] opacity-0" />
                    <span className="absolute bottom-2 left-2 rounded-full bg-[#0B1630] px-2.5 py-1 text-xs font-semibold text-white">
                      {p.name}
                    </span>
                  </div>
                ))}

                {/* room closed overlay */}
                <div className="closed pointer-events-none absolute inset-3 grid place-items-center rounded-2xl bg-[#0B1630] text-center opacity-0">
                  <div>
                    <p className="text-2xl font-extrabold text-white" style={displayFont}>
                      Everyone left.
                    </p>
                    <p className="mt-1 text-[#24D6A0]">Room deleted. Nothing saved.</p>
                  </div>
                </div>
              </div>

              {/* controls */}
              <div className="flex items-center justify-center gap-3 border-t-2 border-[#0B1630] bg-white py-3">
                <span className="grid h-10 w-10 place-items-center rounded-full border-2 border-[#0B1630] bg-[#E8EDF6]">
                  <FaMicrophone />
                </span>
                <span className="grid h-10 w-10 place-items-center rounded-full border-2 border-[#0B1630] bg-[#E8EDF6]">
                  <FaVideo />
                </span>
                <span className="grid h-10 w-14 place-items-center rounded-full border-2 border-[#0B1630] bg-[#FF6F59] text-white">
                  <FaPhoneSlash />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================ HOW IT WORKS ============================ */}
      <section id="how" className="border-y-2 border-[#0B1630] bg-white">
        <div className="mx-auto max-w-7xl px-6 py-24 md:px-10">
          <h2
            className="max-w-2xl text-4xl font-extrabold leading-none tracking-[-0.03em] md:text-6xl"
            style={displayFont}
          >
            Three steps. About ten seconds.
          </h2>

          <ol className="mt-16 grid gap-px overflow-hidden rounded-3xl border-2 border-[#0B1630] bg-[#0B1630] md:grid-cols-3">
            {/* Step 1 */}
            <li className="flex flex-col justify-between gap-12 bg-[#FFC53D] p-8">
              <div className="flex h-24 items-center">
                <span className="rounded-xl border-2 border-[#0B1630] bg-white px-4 py-3 font-mono text-lg shadow-[4px_4px_0_0_#0B1630]">
                  design-review
                </span>
              </div>
              <div>
                <p className="text-sm font-bold text-[#0B1630]/60">Step 1</p>
                <h3 className="mt-1 text-2xl font-extrabold" style={displayFont}>
                  Pick a room code
                </h3>
                <p className="mt-2 text-[#0B1630]/80">
                  Type anything memorable, or let us generate one for you.
                </p>
              </div>
            </li>

            {/* Step 2 */}
            <li className="flex flex-col justify-between gap-12 bg-[#B9A8FF] p-8">
              <div className="flex h-24 items-center">
                <span className="inline-flex max-w-full items-center gap-2 rounded-xl border-2 border-[#0B1630] bg-white px-4 py-3 font-mono text-sm shadow-[4px_4px_0_0_#0B1630]">
                  <FaLink className="shrink-0" />
                  <span className="truncate">{APP_DOMAIN}/call/design-review</span>
                </span>
              </div>
              <div>
                <p className="text-sm font-bold text-[#0B1630]/60">Step 2</p>
                <h3 className="mt-1 text-2xl font-extrabold" style={displayFont}>
                  Share the link
                </h3>
                <p className="mt-2 text-[#0B1630]/80">
                  Send it in any chat. Guests open it in their browser and that&apos;s it.
                </p>
              </div>
            </li>

            {/* Step 3 */}
            <li className="flex flex-col justify-between gap-12 bg-[#24D6A0] p-8">
              <div className="flex h-24 items-center">
                <div className="flex -space-x-4">
                  {PEOPLE.slice(0, 3).map((p) => (
                    <span
                      key={p.name}
                      className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-[#0B1630]"
                      style={{ background: p.bg }}
                    >
                      <Avatar skin={p.skin} cloth={p.cloth} />
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-bold text-[#0B1630]/60">Step 3</p>
                <h3 className="mt-1 text-2xl font-extrabold" style={displayFont}>
                  Start talking
                </h3>
                <p className="mt-2 text-[#0B1630]/80">
                  Video and audio connect right away. Leave whenever you like.
                </p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      {/* ============================ ZERO TRACE (pinned) ============================ */}
      <section
        id="zero-trace"
        className="zt relative flex h-screen items-center justify-center overflow-hidden bg-[#0B1630] text-white"
      >
        <div
          aria-hidden
          className="absolute inset-0 grid grid-cols-3 gap-3 p-3 sm:grid-cols-4 sm:grid-rows-3"
        >
          {Array.from({ length: 12 }).map((_, i) => {
            const p = PEOPLE[i % PEOPLE.length];
            return (
              <div
                key={i}
                className={`zt-tile relative overflow-hidden rounded-2xl opacity-[0.32] ${
                  i >= 9 ? "hidden sm:block" : ""
                }`}
                style={{ background: p.bg }}
              >
                <Avatar skin={p.skin} cloth={p.cloth} />
              </div>
            );
          })}
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <h2
            className="zt-a text-4xl font-extrabold leading-none tracking-[-0.03em] sm:text-6xl md:text-7xl"
            style={displayFont}
          >
            When the last person leaves, the room is gone.
          </h2>
          <div className="mt-10 space-y-2 text-xl font-semibold text-[#24D6A0] md:text-2xl">
            <p className="zt-b opacity-0">No recording.</p>
            <p className="zt-b opacity-0">No history.</p>
            <p className="zt-b opacity-0">No account to delete.</p>
          </div>
        </div>
      </section>

      {/* ============================ FEATURES ============================ */}
      <section className="mx-auto max-w-7xl px-6 py-28 md:px-10">
        <h2
          className="max-w-3xl text-4xl font-extrabold leading-none tracking-[-0.03em] md:text-6xl"
          style={displayFont}
        >
          Built to get out of your way.
        </h2>

        <div className="mt-14 border-b-2 border-[#0B1630]">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="grid gap-4 border-t-2 border-[#0B1630] py-9 md:grid-cols-[1fr_1.2fr] md:gap-12"
            >
              <h3
                className="text-3xl font-extrabold tracking-[-0.02em] md:text-5xl"
                style={displayFont}
              >
                {f.title}
              </h3>
              <p className="max-w-lg text-lg leading-relaxed text-[#0B1630]/75 md:pt-2 md:text-xl">
                {f.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ============================ FINAL CTA ============================ */}
      <section className="border-t-2 border-[#0B1630] bg-[#2147FF] text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-8 px-6 py-24 md:flex-row md:items-end md:justify-between md:px-10">
          <h2
            className="max-w-3xl text-5xl font-extrabold leading-[0.95] tracking-[-0.035em] md:text-7xl"
            style={displayFont}
          >
            Your next call starts with a code.
          </h2>
          <button
            onClick={jumpToInput}
            className={`${btnBase} shrink-0 bg-[#FFC53D] px-8 py-4 text-lg text-[#0B1630] shadow-[5px_5px_0_0_#0B1630]`}
          >
            Pick a room code
          </button>
        </div>
      </section>

      {/* ============================ FOOTER ============================ */}
      <footer className="bg-[#0B1630] px-6 py-8 text-sm text-white/70 md:px-10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-2 sm:flex-row">
          <span>{APP_NAME}. Free video calls with nothing to sign up for.</span>
          <span>Rooms are never recorded.</span>
        </div>
      </footer>
    </main>
  );
}