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
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  compress: true,
  poweredByHeader: false,
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      process: false,
      buffer: false,
      util: false,
      stream: false,
      events: false,
    }
    
    return config
  },
  serverExternalPackages: [
    '@supabase/supabase-js',
    '@supabase/realtime-js',
    '@supabase/ssr',
    '@supabase/postgrest-js',
    '@supabase/storage-js',
    '@supabase/functions-js',
    '@supabase/gotrue-js'
  ],
}

export default nextConfig
