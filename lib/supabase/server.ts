export const isSupabaseConfigured = true

// Create a cached version of the Supabase client for Server Components
export const createClient = () => {
  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
    },
    from: (table: string) => ({
      select: (columns?: string) => ({
        eq: (column: string, value: any) => ({
          single: async () => ({ data: null, error: null }),
        }),
        order: (column: string, options?: any) => ({
          limit: (count: number) => Promise.resolve({ data: [], error: null }),
        }),
        limit: (count: number) => Promise.resolve({ data: [], error: null }),
      }),
      insert: (values: any) => Promise.resolve({ data: null, error: null }),
      update: (values: any) => ({
        eq: (column: string, value: any) => Promise.resolve({ data: null, error: null }),
      }),
      delete: () => ({
        eq: (column: string, value: any) => Promise.resolve({ data: null, error: null }),
      }),
    }),
  }
}

export const createServerClient = createClient
