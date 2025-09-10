export type Role = "PATIENT" | "PRESCRIBER"

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function isValidEmail(email: string): boolean {
  // Minimal RFC5322-ish check, good enough for basic validation
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isValidPassword(password: string): boolean {
  return typeof password === "string" && password.length >= 8
}

export function isValidRole(role: unknown): role is Role {
  return role === "PATIENT" || role === "PRESCRIBER"
}

export function validateRegistration(input: any):
  | { ok: true; value: { email: string; password: string; name: string; role: Role } }
  | { ok: false; error: string } {
  if (!input || typeof input !== "object") {
    return { ok: false, error: "Invalid request body" }
  }

  const email = typeof input.email === "string" ? normalizeEmail(input.email) : ""
  const password = typeof input.password === "string" ? input.password : ""
  const name = typeof input.name === "string" ? input.name.trim() : ""
  const role = input.role

  if (!email || !password || !name || !role) {
    return { ok: false, error: "Missing required fields" }
  }

  if (!isValidEmail(email)) {
    return { ok: false, error: "Invalid email address" }
  }

  if (!isValidPassword(password)) {
    return { ok: false, error: "Password must be at least 8 characters" }
  }

  if (!isValidRole(role)) {
    return { ok: false, error: "Invalid role" }
  }

  return { ok: true, value: { email, password, name, role } }
}
