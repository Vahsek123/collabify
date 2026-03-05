type StepProps = {
  number: number;
  title: string;
  description: string;
};

export default function Step({ number, title, description }: StepProps) {
  return (
    <div className="flex flex-col gap-3">
      <span className="font-serif text-[13px] text-[#F5A623] tracking-[0.05em]">
        0{number}
      </span>
      <h3 className="font-serif text-xl text-white/[0.92] leading-tight">
        {title}
      </h3>
      <p className="font-sans font-light text-sm leading-relaxed text-white/45">
        {description}
      </p>
    </div>
  );
}
