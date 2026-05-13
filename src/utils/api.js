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
    uni.uploadFile({
      url: `${BASE_URL}/recognize`,
      filePath,
      name: 'file',
      success(res) {
        try {
          const data = JSON.parse(res.data);
          if (data.code === 0) {
            resolve(data);
          } else {
            reject(data);
          }
        } catch (e) {
          reject({ message: '解析失败' });
        }
      },
      fail(err) {
        reject(err);
      }
    });
  });
}
