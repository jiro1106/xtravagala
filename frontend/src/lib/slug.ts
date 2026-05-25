const ALPHANUM = 'abcdefghijklmnopqrstuvwxyz0123456789';

function randomSuffix(len = 6): string {
  let out = '';
  for (let i = 0; i < len; i++) {
    out += ALPHANUM[Math.floor(Math.random() * ALPHANUM.length)];
  }
  return out;
}

export function slugifyTitle(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
  const safe = base.length >= 2 ? base.slice(0, 80) : 'event';
  return `${safe}-${randomSuffix()}`;
}
