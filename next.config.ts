import type { NextConfig } from "next"

// Validate environment variables at build time
const validateEnv = () => {
  const requiredEnvs = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID'
  ]

  for (const env of requiredEnvs) {
    if (!process.env[env]) {
      throw new Error(`Missing required environment variable: ${env}`)
    }
  }
}

// Run validation
validateEnv()

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hebbkx1anhila5yf.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'bootdey.com',
        port: '',
        pathname: '/img/**',
      },
    ],
  },
  // Remove env section as Next.js automatically loads environment variables prefixed with NEXT_PUBLIC_
  typescript: {
    ignoreBuildErrors: false,
  },
  experimental: {
    // Add any experimental features here if needed
  }
}

export default nextConfig