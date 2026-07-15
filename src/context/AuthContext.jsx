import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { AuthContext } from "./AuthState";

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function hydrateSession(nextSession) {
      setSession(nextSession);
      if (!nextSession?.user) {
        setProfile(null);
        setIsLoading(false);
        return;
      }
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, organization_id, full_name, role, active")
        .eq("id", nextSession.user.id)
        .single();
      if (profileError) console.error("No se pudo cargar el perfil:", profileError.message);
      setProfile(profileData ?? null);
      setIsLoading(false);
    }

    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) console.error("No se pudo recuperar la sesión:", error.message);
      hydrateSession(data?.session ?? null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setTimeout(() => hydrateSession(nextSession), 0);
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(() => ({
    session,
    user: session?.user ?? null,
    profile,
    organizationId: profile?.organization_id ?? null,
    isLoading,
    signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
    signOut: () => supabase.auth.signOut(),
    resetPassword: (email) => supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/admin/login` }),
  }), [session, profile, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
