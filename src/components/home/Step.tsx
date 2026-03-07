type StepProps = {
  number: number;
  title: string;
  description: string;
};

export default function Step({ number, title, description }: StepProps) {
  return (
    <div className="flex flex-col gap-3">
      <span className="font-serif text-[13px] tracking-[0.05em] text-[#F5A623]">
        0{number}
      </span>
      <h3 className="font-serif text-xl leading-tight text-white/[0.92]">
        {title}
      </h3>
      <p className="font-sans text-sm leading-relaxed font-light text-white/45">
        {description}
      </p>
    </div>
  );
}
