import { API_BASE } from './config';
const BASE_URL = API_BASE;

// GET 请求缓存（30秒）
const cache = {};
const CACHE_TTL = 30 * 1000;

function getCacheKey(url, data) {
  return url + '?' + JSON.stringify(data || {});
}

export function request(options) {
  const method = options.method || 'GET';

  // GET 请求走缓存
  if (method === 'GET' && !options.noCache) {
    const key = getCacheKey(options.url, options.data);
    const cached = cache[key];
    if (cached && Date.now() - cached.time < CACHE_TTL) {
      return Promise.resolve(cached.data);
    }
  }

  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_URL}${options.url}`,
      method,
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        ...options.header
      },
      success(res) {
        if (res.data && res.data.code === 0) {
          // 缓存 GET 响应
          if (method === 'GET') {
            const key = getCacheKey(options.url, options.data);
            cache[key] = { data: res.data, time: Date.now() };
          }
          resolve(res.data);
        } else {
          reject(res.data || { message: '请求失败' });
        }
      },
      fail(err) {
        reject(err);
      }
    });
  });
}

// 清除缓存（登出/刷新时调用）
export function clearCache() {
  Object.keys(cache).forEach(k => delete cache[k]);
}

export function uploadFile(filePath) {
  return new Promise((resolve, reject) => {
    console.log('[uploadFile] url:', `${BASE_URL}/recognize`, 'filePath:', filePath);
    uni.uploadFile({
      url: `${BASE_URL}/recognize`,
      filePath,
      name: 'file',
      success(res) {
        console.log('[uploadFile] success, statusCode:', res.statusCode);
        try {
          const data = JSON.parse(res.data);
          if (data.code === 0) {
            resolve(data);
          } else {
            reject({ message: data.msg || '识别失败' });
          }
        } catch (e) {
          console.error('[uploadFile] parse error:', res.data);
          reject({ message: '解析响应失败' });
        }
      },
      fail(err) {
        console.error('[uploadFile] fail:', JSON.stringify(err));
        reject({ message: err.errMsg || '网络请求失败' });
      }
    });
  });
}
