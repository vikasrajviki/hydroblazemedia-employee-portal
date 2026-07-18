import { PortalProfile } from "./PortalAuthContext";

interface Props {
  profile?: Pick<PortalProfile, "full_name" | "email" | "avatar_url"> | null;
  name?: string | null;
  email?: string | null;
  url?: string | null;
  size?: number;
  className?: string;
}

export function initialsFrom(name?: string | null, email?: string | null): string {
  const source = (name && name.trim()) || (email && email.split("@")[0]) || "?";
  return source
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("") || "?";
}

const UserAvatar = ({ profile, name, email, url, size = 36, className = "" }: Props) => {
  const finalName = name ?? profile?.full_name ?? null;
  const finalEmail = email ?? profile?.email ?? null;
  const finalUrl = url ?? profile?.avatar_url ?? null;
  const initials = initialsFrom(finalName, finalEmail);
  const style = { width: size, height: size, fontSize: Math.max(10, Math.round(size * 0.38)) };
  if (finalUrl) {
    return (
      <img
        src={finalUrl}
        alt={finalName ?? finalEmail ?? "avatar"}
        style={style}
        className={`rounded-full object-cover border border-foreground/10 shrink-0 ${className}`}
      />
    );
  }
  return (
    <div
      style={style}
      aria-hidden="true"
      className={`rounded-full shrink-0 grid place-items-center font-semibold text-white bg-gradient-to-br from-hydro to-blaze shadow-sm ${className}`}
    >
      {initials}
    </div>
  );
};

export default UserAvatar;