import { NavLink, Outlet, useNavigate, Navigate, Link } from "react-router-dom";
import { LayoutDashboard, CheckSquare, Megaphone, FileText, Users, LogOut, UserCircle2 } from "lucide-react";
import { usePortalAuth } from "./PortalAuthContext";
import { Button } from "@/components/ui/button";
import UserAvatar from "./UserAvatar";
import NotificationsMenu from "./NotificationsMenu";
import GlobalSearch from "./GlobalSearch";

const navItems = [
  { to: "/portal", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/portal/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/portal/announcements", label: "Announcements", icon: Megaphone },
  { to: "/portal/documents", label: "Documents", icon: FileText },
  { to: "/portal/team", label: "Team", icon: Users },
];

const roleLabel: Record<string, string> = {
  admin: "Administrator",
  manager: "Manager",
  employee: "Team Member",
};

const PortalLayout = () => {
  const { session, loading, isAdmin, role, profile, user, signOut } = usePortalAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">
        Loading portal…
      </div>
    );
  }
  if (!session) return <Navigate to="/portal/login" replace />;

  const displayName = profile?.full_name?.trim() || (user?.email ? user.email.split("@")[0] : "Team member");
  const roleText = role ? roleLabel[role] ?? role : "";
  const titleLine = [profile?.job_title, roleText].filter(Boolean).join(" • ");

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <aside className="w-64 border-r border-foreground/10 bg-card/50 backdrop-blur-xl flex flex-col">
        <div className="p-5 border-b border-foreground/10">
          <div className="font-display text-sm font-semibold text-muted-foreground tracking-wide uppercase mb-4">HydroBlaze</div>
          <Link
            to="/portal/profile"
            className="flex items-center gap-3 p-2 -m-2 rounded-lg hover:bg-foreground/5 transition-colors group"
            aria-label="Open profile"
          >
            <UserAvatar profile={profile} email={user?.email ?? null} size={44} />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold truncate">{displayName}</div>
              {titleLine && (
                <div className="text-[11px] text-muted-foreground truncate">{titleLine}</div>
              )}
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-foreground/10 text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                }`
              }
            >
              <it.icon className="w-4 h-4" />
              {it.label}
            </NavLink>
          ))}
          <NavLink
            to="/portal/profile"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-foreground/10 text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
              }`
            }
          >
            <UserCircle2 className="w-4 h-4" />
            My Profile
          </NavLink>
          {isAdmin && (
            <NavLink
              to="/portal/admin"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-foreground/10 text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                }`
              }
            >
              <Users className="w-4 h-4" />
              Team & Invites
            </NavLink>
          )}
        </nav>
        <div className="p-3 border-t border-foreground/10">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2"
            onClick={async () => {
              await signOut();
              navigate("/portal/login");
            }}
          >
            <LogOut className="w-4 h-4" /> Sign out
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-20 border-b border-foreground/10 bg-background/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center justify-end gap-2 px-6 py-3 md:px-10">
            <GlobalSearch />
            <NotificationsMenu />
          </div>
        </header>
        <div className="max-w-6xl mx-auto p-6 md:p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default PortalLayout;