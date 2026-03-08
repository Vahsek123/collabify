import { cn } from '@/lib/utils';
import { Member } from '@/types/room';
import Image from 'next/image';

export default function MemberAvatars({ members }: { members: Member[] }) {
  const visible = members.slice(0, 5);
  const overflow = members.length - visible.length;

  return (
    <div className="flex items-center gap-2">
      <div className="flex">
        {visible.map((m, i) => (
          <div
            key={m.userId}
            title={m.displayName}
            className={cn(
              `h-7 w-7 shrink-0 overflow-hidden rounded-full border-2 border-[#0A0A0A] bg-[#F5A623]/20`,
              i > 0 && '-ml-2',
            )}
          >
            {m.avatarUrl ? (
              <Image
                src={m.avatarUrl}
                width={28}
                height={28}
                alt={m.displayName}
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="font-serif text-[10px] text-[#F5A623]">
                  {m.displayName[0].toUpperCase()}
                </span>
              </div>
            )}
          </div>
        ))}
        {overflow > 0 && (
          <div className="-ml-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#0A0A0A] bg-white/8">
            <span className="font-sans text-[10px] font-medium text-white/50">
              +{overflow}
            </span>
          </div>
        )}
      </div>
      <span className="font-sans text-[12px] font-light text-white/30">
        {members.length} {members.length === 1 ? 'member' : 'members'}
      </span>
    </div>
  );
}
