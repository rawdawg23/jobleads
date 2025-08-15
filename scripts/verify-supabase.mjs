import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

async function main() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

  if (!url || !key) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY/NEXT_PUBLIC_SUPABASE_ANON_KEY in env')
    process.exit(1)
  }

  const supabase = createClient(url, key)
  const requiredTables = [
    'users',
    'dealers',
    'jobs',
    'job_applications',
    'payments',
    'messages',
    'tracking_updates',
    'tools',
    'ecu_brands',
    'ecu_models',
  ]

  const results = []
  for (const table of requiredTables) {
    const { error } = await supabase.from(table).select('id').limit(1)
    results.push({ table, ok: !error, error: error?.message })
  }

  const failed = results.filter((r) => !r.ok)
  if (failed.length > 0) {
    console.log('Supabase verification: FAILED')
    for (const f of failed) console.log(`- ${f.table}: ${f.error}`)
    process.exit(2)
  }

  console.log('Supabase verification: OK (all core tables present)')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})