export async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import("bcryptjs")
  const saltRounds = 10
  return bcrypt.hash(password, saltRounds)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const bcrypt = await import("bcryptjs")
  return bcrypt.compare(password, hash)
}
