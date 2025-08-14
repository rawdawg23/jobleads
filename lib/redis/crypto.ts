export class WebCrypto {
  private static encoder = new TextEncoder()
  private static decoder = new TextDecoder()

  static async hash(password: string, saltRounds = 12): Promise<string> {
    // Generate a random salt
    const salt = crypto.getRandomValues(new Uint8Array(16))

    // Create key from password
    const keyMaterial = await crypto.subtle.importKey("raw", this.encoder.encode(password), { name: "PBKDF2" }, false, [
      "deriveBits",
    ])

    // Derive key using PBKDF2
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: Math.pow(2, saltRounds),
        hash: "SHA-256",
      },
      keyMaterial,
      256,
    )

    // Combine salt and hash
    const hashArray = new Uint8Array(derivedBits)
    const combined = new Uint8Array(salt.length + hashArray.length)
    combined.set(salt)
    combined.set(hashArray, salt.length)

    // Convert to base64
    return btoa(String.fromCharCode(...combined))
  }

  static async compare(password: string, hash: string): Promise<boolean> {
    try {
      // Decode the hash
      const combined = new Uint8Array(
        atob(hash)
          .split("")
          .map((char) => char.charCodeAt(0)),
      )

      // Extract salt and hash
      const salt = combined.slice(0, 16)
      const originalHash = combined.slice(16)

      // Create key from password
      const keyMaterial = await crypto.subtle.importKey(
        "raw",
        this.encoder.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveBits"],
      )

      // Derive key using same parameters
      const derivedBits = await crypto.subtle.deriveBits(
        {
          name: "PBKDF2",
          salt: salt,
          iterations: Math.pow(2, 12), // Default salt rounds
          hash: "SHA-256",
        },
        keyMaterial,
        256,
      )

      const newHash = new Uint8Array(derivedBits)

      // Compare hashes
      if (newHash.length !== originalHash.length) return false

      let result = 0
      for (let i = 0; i < newHash.length; i++) {
        result |= newHash[i] ^ originalHash[i]
      }

      return result === 0
    } catch (error) {
      console.error("Password comparison error:", error)
      return false
    }
  }
}
