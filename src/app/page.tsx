import VotingDisplay from '@/components/home/VotingDisplay';
import Step from '@/components/home/Step';
import SpotifyIcon from '@/components/SpotifyIcon';
import '@/styles/home.css';
import AnchorLink from '@/components/ui/AnchorLink';

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-clip bg-[#0A0A0A]">
      {/* Grain overlay */}
      <div className="bg-noise pointer-events-none absolute inset-0 z-1 bg-size-[256px] opacity-[0.035]" />

      {/* Ambient glows */}
      <div className="pointer-events-none absolute -top-52 -right-24 z-0 h-175 w-175 bg-[radial-gradient(circle,rgba(245,166,35,0.07)_0%,transparent_70%)]" />
      <div className="pointer-events-none absolute -bottom-72 -left-48 z-0 h-200 w-200 bg-[radial-gradient(circle,rgba(126,184,164,0.05)_0%,transparent_70%)]" />

      {/* NAV */}
      <nav className="animate-fade-in relative z-10 flex items-center justify-between border-b border-white/6 px-12 py-6">
        <div className="flex items-center gap-2 font-serif text-[22px] tracking-[-0.02em] text-[#F5F0E8]">
          <span className="text-[#F5A623]">♪</span> Collabify
        </div>
        <a
          href="/login"
          className="inline-flex items-center gap-2.5 rounded-full bg-[#F5A623] px-5 py-2.5 font-sans text-sm font-medium tracking-[-0.01em] text-[#0A0A0A] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F7B740] hover:shadow-[0_12px_32px_rgba(245,166,35,0.35)] active:translate-y-0"
        >
          <SpotifyIcon size={20} />
          Continue with Spotify
        </a>
      </nav>

      {/* HERO */}
      <section className="relative z-2 mx-auto max-w-300 px-12 pt-20 pb-24">
        <div className="flex flex-col items-center justify-between gap-16 lg:flex-row">
          {/* Left: copy */}
          <div className="max-w-140 flex-1 text-center lg:text-left">
            {/* Eyebrow */}
            <div className="animate-fade-up mb-7 inline-flex items-center gap-2 rounded-full border border-[#F5A623]/30 bg-[#F5A623]/[0.07] px-3.5 py-1.5">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#F5A623]" />
              <span className="font-sans text-[11px] font-medium tracking-[0.06em] text-[#F5A623] uppercase">
                Real-time · Democratic · Collaborative
              </span>
            </div>

            {/* Headline */}
            <h1 className="animate-fade-up mb-6 font-serif text-[clamp(52px,6vw,80px)] leading-none tracking-[-0.03em] text-[#F5F0E8] delay-1">
              The playlist
              <br />
              <em className="text-[#F5A623] not-italic">everyone</em>
              <br />
              agrees on.
            </h1>

            {/* Subheading */}
            <p className="animate-fade-up mx-auto mb-10 max-w-105 font-sans text-[17px] leading-[1.7] font-light text-white/50 delay-2 lg:mx-0">
              Create a room, invite your friends, and let the crowd decide.
              Everyone suggests tracks, everyone votes — the best songs rise,
              the rest sink.
            </p>

            {/* CTAs */}
            <div className="animate-fade-up flex flex-wrap items-center justify-center gap-3.5 delay-3 lg:justify-start">
              <a
                href="/login"
                className="inline-flex items-center gap-2.5 rounded-full bg-[#F5A623] px-7 py-3.5 font-sans text-[15px] font-medium tracking-[-0.01em] text-[#0A0A0A] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F7B740] hover:shadow-[0_12px_32px_rgba(245,166,35,0.35)] active:translate-y-0"
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
              <AnchorLink
                id={'how-it-works'}
                className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-transparent px-6 py-3.5 font-sans text-[15px] text-white/60 transition-all duration-200 hover:border-white/30 hover:bg-white/4 hover:text-white/90"
              >
                See how it works
              </AnchorLink>
            </div>

            {/* Social proof */}
            <div className="animate-fade-up mt-12 flex items-center justify-center gap-3.5 delay-4 lg:justify-start">
              <div className="flex">
                {[
                  'bg-[#F5A623]',
                  'bg-[#7EB8A4]',
                  'bg-[#C084FC]',
                  'bg-[#60A5FA]',
                ].map((color, i) => (
                  <div
                    key={i}
                    className={`h-7.5 w-7.5 rounded-full border-2 border-[#0A0A0A] opacity-80 ${color} ${i > 0 ? '-ml-2' : ''}`}
                  />
                ))}
              </div>
              <p className="font-sans text-[13px] font-light text-white/40">
                Built for parties, road trips &amp; offices
              </p>
            </div>
          </div>

          {/* Right: live mockup */}
          <div className="animate-fade-in shrink-0 delay-5">
            <VotingDisplay />
          </div>
        </div>
      </section>

      {/* ── DIVIDER ── */}
      <div className="mx-auto max-w-300 px-12">
        <div className="h-px bg-[linear-gradient(to_right,transparent,rgba(255,255,255,0.08)_30%,rgba(255,255,255,0.08)_70%,transparent)]" />
      </div>

      {/* ── HOW IT WORKS ── */}
      <section
        id="how-it-works"
        className="relative z-2 mx-auto max-w-300 px-12 py-24"
      >
        <p className="mb-12 font-sans text-[12px] font-medium tracking-[0.12em] text-white/25 uppercase">
          How it works
        </p>

        <div className="flex flex-col items-start gap-10 lg:flex-row lg:gap-0">
          <div className="flex-1">
            <Step
              number={1}
              title="Create a room"
              description="Open a session, give it a name, and set your vote threshold. You'll get a shareable invite code instantly."
            />
          </div>

          {/* Vertical dividers — desktop only */}
          <div className="mx-12 hidden w-px self-stretch bg-[linear-gradient(to_bottom,transparent,rgba(255,255,255,0.1)_30%,rgba(255,255,255,0.1)_70%,transparent)] lg:block" />

          <div className="flex-1">
            <Step
              number={2}
              title="Invite & suggest"
              description="Share the code with your crew. Everyone joins and starts searching and suggesting tracks from Spotify's full catalogue."
            />
          </div>

          <div className="mx-12 hidden w-px self-stretch bg-[linear-gradient(to_bottom,transparent,rgba(255,255,255,0.1)_30%,rgba(255,255,255,0.1)_70%,transparent)] lg:block" />

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
      <footer className="relative z-2 flex items-center justify-between border-t border-white/6 px-12 py-7">
        <div className="font-serif text-base text-white/30">
          <span className="text-[#F5A623]/50">♪</span> Collabify
        </div>
        <p className="font-sans text-xs font-light text-white/20">Vahsek123</p>
      </footer>
    </div>
  );
}
