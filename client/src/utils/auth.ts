const pwKey = (username: string) =>
  `anatomix_pw_${username.toLowerCase().replace(/\s+/g, '_')}`;

const userKey = (username: string) =>
  `anatomix_user_${username.toLowerCase().replace(/\s+/g, '_')}`;

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode('anatomix:' + password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export function accountExists(username: string): boolean {
  return !!localStorage.getItem(userKey(username));
}

export function hasPassword(username: string): boolean {
  return !!localStorage.getItem(pwKey(username));
}

export async function setPassword(username: string, password: string): Promise<void> {
  const hash = await hashPassword(password);
  localStorage.setItem(pwKey(username), hash);
}

export async function verifyPassword(username: string, password: string): Promise<boolean> {
  const stored = localStorage.getItem(pwKey(username));
  if (!stored) return false;
  const hash = await hashPassword(password);
  return hash === stored;
}

export async function removePassword(username: string): Promise<void> {
  localStorage.removeItem(pwKey(username));
}
