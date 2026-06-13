export function publicAssetUrl(path: string): string {
  if (/^(https?:)?\/\//.test(path) || path.startsWith('data:') || path.startsWith('blob:')) return path;
  const cleanPath = path.replace(/^\/+/, '');
  const base = import.meta.env.BASE_URL || '/';
  return `${base}${cleanPath}`;
}
