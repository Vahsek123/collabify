export default function Loading() {
  return (
    <svg
      className="animate-spin-slow"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
    >
      <circle cx="9" cy="9" r="7" stroke="rgba(0,0,0,0.2)" strokeWidth="2" />
      <path
        d="M9 2a7 7 0 017 7"
        stroke="#0A0A0A"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
