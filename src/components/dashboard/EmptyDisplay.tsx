type EmptyDisplayProps = {
  message: string;
};

export default function EmptyDisplay({ message }: EmptyDisplayProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/8 px-6 py-14 text-center">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-white/8 bg-white/4">
        <span className="font-serif text-lg text-white/20">♪</span>
      </div>
      <p className="max-w-50 font-sans text-[13px] leading-relaxed font-light text-white/30">
        {message}
      </p>
    </div>
  );
}
