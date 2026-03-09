import { verifySession } from '@/lib/dal';
import { ReactNode } from 'react';

export default async function DashboardLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  await verifySession();

  return children;
}
