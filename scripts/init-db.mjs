import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { Client } from 'pg'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function run() {
  const connStr = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL
  if (!connStr) {
    console.error('POSTGRES_URL_NON_POOLING or POSTGRES_URL not set')
    process.exit(1)
  }

  const client = new Client({ connectionString: connStr, ssl: { rejectUnauthorized: false } })
  await client.connect()

  const sqlFiles = [
    path.join(__dirname, '01-create-tables.sql'),
    path.join(__dirname, '04-create-auth-trigger.sql'),
    path.join(__dirname, '06-fix-users-table.sql'),
  ]

  for (const file of sqlFiles) {
    const exists = fs.existsSync(file)
    if (!exists) continue
    const sql = fs.readFileSync(file, 'utf8')
    console.log(`\n--- Executing ${path.basename(file)} ---`)
    try {
      await client.query(sql)
      console.log(`Executed ${path.basename(file)} successfully`)
    } catch (err) {
      console.error(`Error executing ${path.basename(file)}:`, err.message)
      process.exit(1)
    }
  }

  await client.end()
  console.log('Database initialization complete')
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})