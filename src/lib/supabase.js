import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const missingConfigError = new Error(
  "Faltan VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en la configuracion del sitio.",
);

function resolveMissingConfig() {
  return Promise.resolve({ data: null, error: missingConfigError });
}

function createDisabledQuery() {
  const query = {
    select: () => query,
    insert: () => query,
    update: () => query,
    delete: () => query,
    upsert: () => query,
    eq: () => query,
    neq: () => query,
    gt: () => query,
    gte: () => query,
    lt: () => query,
    lte: () => query,
    ilike: () => query,
    is: () => query,
    in: () => query,
    not: () => query,
    order: () => query,
    limit: () => query,
    single: resolveMissingConfig,
    maybeSingle: resolveMissingConfig,
    then: (resolve, reject) => resolveMissingConfig().then(resolve, reject),
  };
  return query;
}

function createDisabledSupabaseClient() {
  return {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      getUser: resolveMissingConfig,
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
      signInWithPassword: resolveMissingConfig,
      signOut: resolveMissingConfig,
      resetPasswordForEmail: resolveMissingConfig,
      updateUser: resolveMissingConfig,
      mfa: {
        enroll: resolveMissingConfig,
        challengeAndVerify: resolveMissingConfig,
        getAuthenticatorAssuranceLevel: () =>
          Promise.resolve({ data: { currentLevel: "aal1" }, error: null }),
        listFactors: () => Promise.resolve({ data: { totp: [] }, error: null }),
        unenroll: resolveMissingConfig,
      },
    },
    channel: () => ({
      on: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }),
      subscribe: () => ({ unsubscribe: () => {} }),
    }),
    from: () => createDisabledQuery(),
    functions: { invoke: resolveMissingConfig },
    removeChannel: () => Promise.resolve({ error: null }),
    rpc: resolveMissingConfig,
    storage: {
      from: () => ({
        getPublicUrl: (path) => ({ data: { publicUrl: path || "" } }),
        upload: resolveMissingConfig,
        remove: resolveMissingConfig,
      }),
    },
  };
}

const supabaseClient =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    : createDisabledSupabaseClient();

supabaseClient.isConfigured = Boolean(supabaseUrl && supabaseKey);

export const supabase = supabaseClient;
