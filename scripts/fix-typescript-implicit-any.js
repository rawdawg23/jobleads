import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Common type mappings for different contexts
const TYPE_MAPPINGS = {
  // Database result types
  job: "{ id?: string; status?: string; created_at?: string; customer_postcode?: string; quote?: number | null; amount?: number | null; [key: string]: any }",
  user: "{ id?: string; firstName?: string; lastName?: string; email?: string; created_at?: string; [key: string]: any }",
  payment: "{ amount: number | null; created_at?: string; [key: string]: any }",
  booking:
    "{ id?: string; created_at?: string; users?: { firstName?: string; lastName?: string }; [key: string]: any }",
  app: "{ status?: string; created_at?: string; quote?: number | null; job?: any; [key: string]: any }",
  application: "{ status?: string; created_at?: string; quote?: number | null; [key: string]: any }",
  message: "{ id?: string; content?: string; created_at?: string; [key: string]: any }",

  // Reduce accumulator types
  sum: "number",
  total: "number",
  count: "number",
  acc: "any",
}

function getTypeForParameter(paramName, context = "") {
  // Check for exact matches first
  if (TYPE_MAPPINGS[paramName]) {
    return TYPE_MAPPINGS[paramName]
  }

  // Check for partial matches or context clues
  if (paramName.includes("sum") || paramName.includes("total") || paramName.includes("count")) {
    return "number"
  }

  if (paramName.includes("job") || context.includes("job")) {
    return TYPE_MAPPINGS.job
  }

  if (paramName.includes("user") || context.includes("user")) {
    return TYPE_MAPPINGS.user
  }

  if (paramName.includes("payment") || context.includes("payment")) {
    return TYPE_MAPPINGS.payment
  }

  if (paramName.includes("app") || context.includes("app")) {
    return TYPE_MAPPINGS.app
  }

  // Default fallback
  return "any"
}

function fixImplicitAnyTypes(content, filePath) {
  console.log(`[v0] Processing file: ${filePath}`)

  // Regex patterns for common array methods with implicit any parameters
  const patterns = [
    // .filter((param) => ...)
    /\.filter$$\s*\(([^:)]+)$$\s*=>/g,
    // .map((param) => ...)
    /\.map$$\s*\(([^:)]+)$$\s*=>/g,
    // .forEach((param) => ...)
    /\.forEach$$\s*\(([^:)]+)$$\s*=>/g,
    // .reduce((acc, param) => ...)
    /\.reduce$$\s*\(([^:)]+),\s*([^:)]+)$$\s*=>/g,
    // .find((param) => ...)
    /\.find$$\s*\(([^:)]+)$$\s*=>/g,
    // .some((param) => ...)
    /\.some$$\s*\(([^:)]+)$$\s*=>/g,
    // .every((param) => ...)
    /\.every$$\s*\(([^:)]+)$$\s*=>/g,
  ]

  let fixedContent = content
  let changesMade = false

  patterns.forEach((pattern, index) => {
    fixedContent = fixedContent.replace(pattern, (match, ...params) => {
      // Handle reduce case (has 2 parameters)
      if (index === 3 && params.length >= 2) {
        const param1 = params[0].trim()
        const param2 = params[1].trim()

        // Skip if already typed
        if (param1.includes(":") && param2.includes(":")) {
          return match
        }

        const type1 = param1.includes(":") ? "" : `: ${getTypeForParameter(param1, filePath)}`
        const type2 = param2.includes(":") ? "" : `: ${getTypeForParameter(param2, filePath)}`

        const newMatch = match.replace(`(${param1}, ${param2})`, `(${param1}${type1}, ${param2}${type2})`)

        if (newMatch !== match) {
          console.log(`[v0] Fixed reduce parameters: ${param1}${type1}, ${param2}${type2}`)
          changesMade = true
        }

        return newMatch
      } else {
        // Handle single parameter cases
        const param = params[0].trim()

        // Skip if already typed
        if (param.includes(":")) {
          return match
        }

        const paramType = getTypeForParameter(param, filePath)
        const newMatch = match.replace(`(${param})`, `(${param}: ${paramType})`)

        if (newMatch !== match) {
          console.log(`[v0] Fixed parameter: ${param}: ${paramType}`)
          changesMade = true
        }

        return newMatch
      }
    })
  })

  return { content: fixedContent, changed: changesMade }
}

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath, { withFileTypes: true })
  let totalFixed = 0

  for (const file of files) {
    const fullPath = path.join(dirPath, file.name)

    if (file.isDirectory()) {
      // Skip node_modules and .next directories
      if (file.name === "node_modules" || file.name === ".next" || file.name === ".git") {
        continue
      }
      totalFixed += processDirectory(fullPath)
    } else if (file.name.endsWith(".ts") || file.name.endsWith(".tsx")) {
      try {
        const content = fs.readFileSync(fullPath, "utf8")
        const result = fixImplicitAnyTypes(content, fullPath)

        if (result.changed) {
          fs.writeFileSync(fullPath, result.content, "utf8")
          console.log(`[v0] ✅ Fixed TypeScript issues in: ${fullPath}`)
          totalFixed++
        }
      } catch (error) {
        console.error(`[v0] ❌ Error processing ${fullPath}:`, error.message)
      }
    }
  }

  return totalFixed
}

// Main execution
console.log("[v0] 🚀 Starting TypeScript implicit any fixer...")

const projectRoot = path.resolve(__dirname, "..")
const totalFilesFixed = processDirectory(projectRoot)

console.log(`[v0] ✨ Completed! Fixed ${totalFilesFixed} files with TypeScript implicit any issues.`)

if (totalFilesFixed > 0) {
  console.log("[v0] 🎉 All TypeScript implicit any type errors should now be resolved!")
  console.log('[v0] 💡 Run "npm run build" to verify the fixes.')
} else {
  console.log("[v0] ℹ️  No TypeScript implicit any issues found.")
}
