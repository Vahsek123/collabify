'use client';

import { ReactNode } from 'react';

type AnchorLinkProps = {
  id: string;
  className?: string;
  children?: ReactNode;
};

export default function AnchorLink({
  id,
  className,
  children,
}: AnchorLinkProps) {
  return (
    <button
      className={className}
      onClick={() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }}
    >
      {children}
    </button>
  );
}
