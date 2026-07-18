import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePortalAuth } from "@/portal/PortalAuthContext";
import { relativeTime } from "@/portal/lib/activity";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bell } from "lucide-react";

interface NotificationRow {
  id: string;
  title: string;
  body: string | null;
  read_at: string | null;
  created_at: string;
}

const NotificationsMenu = () => {
  const { user } = usePortalAuth();
  const [items, setItems] = useState<NotificationRow[]>([]);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("notifications")
      .select("id,title,body,read_at,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(12);
    setItems((data as NotificationRow[]) ?? []);
  };

  useEffect(() => { load(); }, [user?.id]);

  const unread = items.filter((item) => !item.read_at).length;

  const markAllRead = async () => {
    if (!user || unread === 0) return;
    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .is("read_at", null);
    load();
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-blaze ring-2 ring-background" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-foreground/10 px-4 py-3">
          <div>
            <h3 className="text-sm font-semibold">Notifications</h3>
            <p className="text-xs text-muted-foreground">{unread} unread</p>
          </div>
          <Button variant="ghost" size="sm" onClick={markAllRead} disabled={unread === 0}>Mark read</Button>
        </div>
        <div className="max-h-96 overflow-y-auto p-2">
          {items.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">No notifications yet.</p>
          ) : items.map((item) => (
            <div key={item.id} className="rounded-lg px-3 py-2 hover:bg-foreground/5">
              <div className="flex items-start gap-2">
                {!item.read_at && <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-hydro" />}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-tight">{item.title}</p>
                  {item.body && <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{item.body}</p>}
                  <p className="mt-1 text-[11px] text-muted-foreground">{relativeTime(item.created_at)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsMenu;
