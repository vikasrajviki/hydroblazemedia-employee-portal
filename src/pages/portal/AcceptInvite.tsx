import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const AcceptInvite = () => {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [invite, setInvite] = useState<{ email: string; role: string; accepted_at: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    supabase
      .rpc("get_invite_by_token", { _token: token })
      .then(({ data, error }) => {
        if (error) toast.error(error.message);
        else if (data && data.length > 0) setInvite(data[0] as any);
        setLoading(false);
      });
  }, [token]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invite) return;
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: invite.email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/portal`,
        data: { full_name: fullName },
      },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Account created. You are signed in.");
    navigate("/portal");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md p-8 rounded-2xl border border-foreground/10 bg-card/60 backdrop-blur-xl">
        <h1 className="font-display text-2xl font-bold mb-1">Accept invitation</h1>
        {loading ? (
          <p className="text-sm text-muted-foreground mt-4">Loading invite…</p>
        ) : !invite ? (
          <p className="text-sm text-destructive mt-4">Invalid or expired invite link.</p>
        ) : invite.accepted_at ? (
          <p className="text-sm text-muted-foreground mt-4">
            This invitation was already accepted. Please sign in instead.
          </p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-6">
              You've been invited as <span className="text-foreground font-medium">{invite.role}</span> for{" "}
              <span className="text-foreground font-medium">{invite.email}</span>. Set a password to continue.
            </p>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <Label htmlFor="name">Full name</Label>
                <Input id="name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="pw">Password</Label>
                <Input id="pw" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? "Creating…" : "Create account"}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default AcceptInvite;