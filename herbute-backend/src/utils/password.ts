import bcrypt from 'bcryptjs';

export async function hashPassword(password: string): Promise<string> {
  // bcryptjs + salt rounds = 12
  // Temps: ~250ms (intentionnellement lent pour stopper brute force)
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
