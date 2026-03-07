import { ReactNode } from 'react';

type SectionProps = {
  title: string;
  count: number;
  children: ReactNode;
};

export default function Section({ title, count, children }: SectionProps) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-3">
        <h2 className="font-sans text-[12px] font-medium tracking-widest text-white/25 uppercase">
          {title}
        </h2>
        {count > 0 && (
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/[0.07] font-sans text-[11px] font-medium text-white/40">
            {count}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}
