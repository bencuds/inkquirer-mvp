import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { fetchUserConfigs } from "../lib/feedConfigs";

export function useSupabaseAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savedConfigs, setSavedConfigs] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setLoading(false);

      if (session?.user) {
        fetchUserConfigs(session.user.id).then(setSavedConfigs);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setLoading(false);

      if (session?.user) {
        fetchUserConfigs(session.user.id).then(setSavedConfigs);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return { user, loading, savedConfigs, setUser, setSavedConfigs };
}
