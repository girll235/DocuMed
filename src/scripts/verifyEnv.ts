import { config } from 'dotenv'
import * as fs from 'fs'
import { resolve } from 'path'

const verifyDeployment = () => {
  // Load local env file in development
  if (process.env.NODE_ENV !== 'production') {
    const envPath = fs.existsSync(resolve(process.cwd(), '.env.local'))
      ? resolve(process.cwd(), '.env.local')
      : resolve(process.cwd(), '.env')
    
    config({ path: envPath })
  }

  // Log environment info
  console.log('Environment:', process.env.NODE_ENV)
  console.log('Vercel Environment:', process.env.VERCEL_ENV)
  
  const requiredVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID'
  ]

  const missing = requiredVars.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    console.error('❌ Missing environment variables:', missing.join(', '))
    process.exit(1)
  }

  console.log('✅ All required environment variables are present')
}

verifyDeployment()