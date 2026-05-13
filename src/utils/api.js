import { API_BASE } from './config';
const BASE_URL = API_BASE;

export function request(options) {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_URL}${options.url}`,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        ...options.header
      },
      success(res) {
        if (res.data && res.data.code === 0) {
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
