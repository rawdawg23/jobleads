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
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
    serverComponentsExternalPackages: [
      '@supabase/supabase-js',
      '@supabase/realtime-js',
      '@supabase/ssr',
      '@supabase/postgrest-js',
      '@supabase/storage-js',
      '@supabase/functions-js',
      '@supabase/gotrue-js'
    ],
  },
  compress: true,
  poweredByHeader: false,
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
          },
        },
      }
    }
    
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
    
    if (!isServer) {
      config.externals = config.externals || []
      config.externals.push({
        '@supabase/realtime-js': '@supabase/realtime-js',
        '@supabase/supabase-js': '@supabase/supabase-js',
      })
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
