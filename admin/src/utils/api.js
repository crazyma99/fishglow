const API_BASE = '';  // 开发用 vite proxy，生产用同源
const ADMIN_KEY = 'fishglow_admin_2024';

export { API_BASE, ADMIN_KEY };

export async function apiFetch(path, method = 'GET', body = null) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(API_BASE + path, opts);
  const data = await res.json();
  if (data.code !== 0 && data.code !== undefined) throw new Error(data.msg || '请求失败');
  return data;
}

export function imgUrl(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return window.location.origin + path;
}
