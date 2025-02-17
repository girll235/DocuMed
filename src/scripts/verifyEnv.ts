import { resolve } from 'path'
import { config } from 'dotenv'
import * as fs from 'fs'

const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID'
]

const verifyEnv = () => {
  // Try loading from .env.local first, then fall back to .env
  const envPath = fs.existsSync(resolve(process.cwd(), '.env.local'))
    ? resolve(process.cwd(), '.env.local')
    : resolve(process.cwd(), '.env')

  // Load environment variables
  config({ path: envPath })

  const missing = requiredEnvVars.filter(key => !process.env[key])
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '))
    process.exit(1)
  }

  console.log('✅ All required environment variables are present')
}

verifyEnv()