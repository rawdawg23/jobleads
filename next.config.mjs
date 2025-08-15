/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  serverExternalPackages: [
    '@supabase/supabase-js',
    '@supabase/realtime-js',
    '@supabase/auth-helpers-nextjs',
    '@supabase/auth-helpers-shared',
    '@supabase/ssr',
    '@supabase/postgrest-js',
    '@supabase/storage-js'
  ],
}

export default nextConfig
