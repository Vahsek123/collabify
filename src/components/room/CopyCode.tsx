'use client';
import { useState } from 'react';

export default function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="group inline-flex items-center gap-2 rounded-lg border border-white/9 bg-white/4 px-3 py-1.5 transition-all duration-150 hover:border-white/20 hover:bg-white/[0.07]"
    >
      <span className="font-mono text-[13px] tracking-widest text-white/50 transition-colors duration-150 group-hover:text-white/70">
        {code}
      </span>
      {copied ? (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path
            d="M1.5 6L4.5 9L10.5 3"
            stroke="#22C55E"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
          <rect
            x="4"
            y="0.5"
            width="6.5"
            height="6.5"
            rx="1.5"
            stroke="currentColor"
            strokeWidth="1.2"
            className="text-white/25"
          />
          <path
            d="M1 4H2.5V10H8.5V10"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            className="text-white/25"
          />
        </svg>
      )}
    </button>
  );
}
