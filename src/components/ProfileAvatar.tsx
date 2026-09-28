import type { Profile } from "../lib/profiles";

export function avatarBg(color: string): string {
  if (!color) return "bg-slate-500";
  if (color.startsWith("from-")) return `bg-gradient-to-br ${color}`;
  return color;
}

export function SmileyFace({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      <circle cx="22" cy="25" r="4.5" fill="currentColor" />
      <circle cx="42" cy="25" r="4.5" fill="currentColor" />
      <path
        d="M18 37c2.5 7.5 9.5 12 14 12s11.5-4.5 14-12"
        stroke="currentColor"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ProfileAvatar({
  profile,
  className = "h-32 w-32 rounded-xl",
  faceClass = "h-3/5 w-3/5",
  emojiClass = "text-5xl",
}: {
  profile: Pick<Profile, "avatarColor" | "avatarEmoji" | "isKids">;
  className?: string;
  faceClass?: string;
  emojiClass?: string;
}) {
  return (
    <div
      className={`${className} ${avatarBg(
        profile.avatarColor
      )} flex items-center justify-center overflow-hidden shadow-lg`}
    >
      {profile.avatarEmoji ? (
        <span className={`${emojiClass} select-none leading-none`}>
          {profile.avatarEmoji}
        </span>
      ) : (
        <SmileyFace className={`${faceClass} text-white/95`} />
      )}
    </div>
  );
}
