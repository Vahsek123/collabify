import Hero from '@/components/home/Hero';
import Step from '@/components/home/Step';
import '@/styles/home.css';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] relative overflow-clip">
      {/* ── Grain overlay ── */}
      <div
        className="animate-grain fixed inset-[-50%] w-[200%] h-[200%] pointer-events-none z-1 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />

      {/* ── Ambient glows ── */}
      <div className="absolute -top-52 -right-24 w-175 h-175 rounded-full bg-[radial-gradient(circle,rgba(245,166,35,0.07)_0%,transparent_70%)] pointer-events-none z-0" />
      <div className="absolute -bottom-72 -left-48 w-200 h-200 rounded-full bg-[radial-gradient(circle,rgba(126,184,164,0.05)_0%,transparent_70%)] pointer-events-none z-0" />

      {/* ── NAV ── */}
      <nav className="animate-fade-in relative z-10 flex justify-between items-center px-12 py-6 border-b border-white/6">
        <div className="font-serif text-[22px] text-[#F5F0E8] tracking-[-0.02em] flex items-center gap-2">
          <span className="text-[#F5A623]">♪</span> Collabify
        </div>
        <a
          href="/login"
          className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-[#F5A623] text-[#0A0A0A] rounded-full font-sans font-medium text-sm tracking-[-0.01em] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(245,166,35,0.35)] hover:bg-[#F7B740] active:translate-y-0"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
          </svg>
          Continue with Spotify
        </a>
      </nav>

      {/* ── HERO ── */}
      <section className="relative z-2 max-w-300 mx-auto px-12 pt-20 pb-24">
        <div className="flex flex-col lg:flex-row items-center gap-16 justify-between">
          {/* Left: copy */}
          <div className="flex-1 max-w-140 text-center lg:text-left">
            {/* Eyebrow */}
            <div className="animate-fade-up inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#F5A623]/30 bg-[#F5A623]/[0.07] mb-7">
              <div className="w-1.5 h-1.5 rounded-full bg-[#F5A623] animate-pulse" />
              <span className="font-sans font-medium text-[11px] text-[#F5A623] tracking-[0.06em] uppercase">
                Real-time · Democratic · Collaborative
              </span>
            </div>

            {/* Headline */}
            <h1 className="animate-fade-up delay-1 font-serif text-[clamp(52px,6vw,80px)] leading-none tracking-[-0.03em] text-[#F5F0E8] mb-6">
              The playlist
              <br />
              <em className="text-[#F5A623] not-italic">everyone</em>
              <br />
              agrees on.
            </h1>

            {/* Subheading */}
            <p className="animate-fade-up delay-2 font-sans font-light text-[17px] leading-[1.7] text-white/50 mb-10 max-w-105 mx-auto lg:mx-0">
              Create a room, invite your friends, and let the crowd decide.
              Everyone suggests tracks, everyone votes — the best songs rise,
              the rest sink.
            </p>

            {/* CTAs */}
            <div className="animate-fade-up delay-3 flex items-center gap-3.5 flex-wrap justify-center lg:justify-start">
              <a
                href="/login"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-[#F5A623] text-[#0A0A0A] rounded-full font-sans font-medium text-[15px] tracking-[-0.01em] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(245,166,35,0.35)] hover:bg-[#F7B740] active:translate-y-0"
              >
                Start a room
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M1 7H13M7 1L13 7L7 13"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
              <Link
                href="#how-it-works"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-transparent text-white/60 border border-white/12 rounded-full font-sans text-[15px] transition-all duration-200 hover:border-white/30 hover:text-white/90 hover:bg-white/4"
              >
                See how it works
              </Link>
            </div>

            {/* Social proof */}
            <div className="animate-fade-up delay-4 mt-12 flex items-center gap-3.5 justify-center lg:justify-start">
              <div className="flex">
                {[
                  'bg-[#F5A623]',
                  'bg-[#7EB8A4]',
                  'bg-[#C084FC]',
                  'bg-[#60A5FA]',
                ].map((color, i) => (
                  <div
                    key={i}
                    className={`w-7.5 h-7.5 rounded-full border-2 border-[#0A0A0A] opacity-80 ${color} ${i > 0 ? '-ml-2' : ''}`}
                  />
                ))}
              </div>
              <p className="font-sans font-light text-[13px] text-white/40">
                Built for parties, road trips &amp; offices
              </p>
            </div>
          </div>

          {/* Right: live mockup */}
          <div className="animate-fade-in delay-5 shrink-0">
            <Hero />
          </div>
        </div>
      </section>

      {/* ── DIVIDER ── */}
      <div className="max-w-300 mx-auto px-12">
        <div className="h-px bg-[linear-gradient(to_right,transparent,rgba(255,255,255,0.08)_30%,rgba(255,255,255,0.08)_70%,transparent)]" />
      </div>

      {/* ── HOW IT WORKS ── */}
      <section
        id="how-it-works"
        className="relative z-2 max-w-300 mx-auto px-12 py-24"
      >
        <p className="font-sans font-medium text-[12px] text-white/25 tracking-[0.12em] uppercase mb-12">
          How it works
        </p>

        <div className="flex flex-col lg:flex-row gap-10 lg:gap-0 items-start">
          <div className="flex-1">
            <Step
              number={1}
              title="Create a room"
              description="Open a session, give it a name, and set your vote threshold. You'll get a shareable invite code instantly."
            />
          </div>

          {/* Vertical dividers — desktop only */}
          <div className="hidden lg:block w-px self-stretch mx-12 bg-[linear-gradient(to_bottom,transparent,rgba(255,255,255,0.1)_30%,rgba(255,255,255,0.1)_70%,transparent)]" />

          <div className="flex-1">
            <Step
              number={2}
              title="Invite & suggest"
              description="Share the code with your crew. Everyone joins and starts searching and suggesting tracks from Spotify's full catalogue."
            />
          </div>

          <div className="hidden lg:block w-px self-stretch mx-12 bg-[linear-gradient(to_bottom,transparent,rgba(255,255,255,0.1)_30%,rgba(255,255,255,0.1)_70%,transparent)]" />

          <div className="flex-1">
            <Step
              number={3}
              title="Vote & push"
              description="Upvote the bangers, downvote the skips. Top-voted songs get promoted — you push them straight to a shared Spotify playlist."
            />
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-2 border-t border-white/6 px-12 py-7 flex justify-between items-center">
        <div className="font-serif text-base text-white/30">
          <span className="text-[#F5A623]/50">♪</span> Collabify
        </div>
        <p className="font-sans font-light text-xs text-white/20">Vahsek123</p>
      </footer>
    </div>
  );
}
