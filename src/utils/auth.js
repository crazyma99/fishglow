import { request, clearCache } from './api';

const OPENID_KEY = 'fishglow_openid';

/**
 * 检查是否已登录
 */
export function isLoggedIn() {
  return !!uni.getStorageSync(OPENID_KEY);
}

/**
 * 获取 openid，未登录返回空串
 */
export function getOpenid() {
  return uni.getStorageSync(OPENID_KEY) || '';
}

/**
 * 登录
 * 小程序: wx.login → openid
 * APP: 跳转手机号登录页
 */
export function login() {
  const cached = uni.getStorageSync(OPENID_KEY);
  if (cached) return Promise.resolve(cached);

  // #ifdef APP-PLUS
  // APP 端跳转手机号登录页
  return new Promise((resolve, reject) => {
    uni.navigateTo({
      url: '/pages/phone-login/index',
      events: {
        loginSuccess(data) {
          const openid = data.openid;
          uni.setStorageSync(OPENID_KEY, openid);
          resolve(openid);
        }
      },
      fail: reject
    });
  });
  // #endif

  // #ifndef APP-PLUS
  // 小程序端用 wx.login
  return new Promise((resolve, reject) => {
    uni.login({
      provider: 'weixin',
      success(loginRes) {
        if (!loginRes.code) {
          reject(new Error('获取登录凭证失败'));
          return;
        }
        request({
          url: '/auth/openid',
          method: 'POST',
          data: { code: loginRes.code }
        }).then(res => {
          const openid = res.data.openid;
          uni.setStorageSync(OPENID_KEY, openid);
          resolve(openid);
        }).catch(err => {
          reject(err);
        });
      },
      fail(err) {
        reject(err);
      }
    });
  });
  // #endif
}

/**
 * 确保已登录，未登录则触发登录流程
 */
export async function ensureLogin() {
  if (isLoggedIn()) return getOpenid();

  try {
    const openid = await login();
    return openid;
  } catch (e) {
    uni.showToast({ title: '登录失败，请重试', icon: 'none' });
    return '';
  }
}

/**
 * 退出登录
 */
export function logout() {
  uni.removeStorageSync(OPENID_KEY);
  clearCache();
}
