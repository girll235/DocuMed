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
  // Add debugging information
  console.log('Environment:', process.env.NODE_ENV)
  console.log('Current working directory:', process.cwd())

  // Load environment variables in development or if explicitly requested
  if (process.env.NODE_ENV !== 'production' || process.env.LOAD_ENV_FILE) {
    const envFiles = ['.env.local', '.env']
    let loaded = false

    for (const file of envFiles) {
      const envPath = resolve(process.cwd(), file)
      if (fs.existsSync(envPath)) {
        config({ path: envPath })
        console.log(`Loaded environment variables from ${file}`)
        loaded = true
        break
      }
    }

    if (!loaded) {
      console.warn('No environment file found')
    }
  }

  // Check for required variables
  const missing = requiredEnvVars.filter(key => {
    const value = process.env[key]
    if (!value) {
      console.error(`Missing ${key}`)
      return true
    }
    // Debug: Log first few characters of each env var (safely)
    console.log(`${key}: ${value.substring(0, 3)}...`)
    return false
  })

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '))
    process.exit(1)
  }

  console.log('✅ All required environment variables are present')
}

verifyEnv()