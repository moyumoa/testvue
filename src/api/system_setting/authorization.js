import request from '@/utils/request'

// 小程序授权列表
export const getAppAuth = data => {
  return request.post('/v1/system/account/auth/getAppAuth', data)
}
// 小程序授权url
export const appAuthLink = data => {
  return request.post('/v1/system/account/auth/appAuthLink', data)
}

// 抖音小店授权列表
export const getShopAuth = data => {
  return request.post('/v1/system/account/auth/getShopAuth', data)
}
// 所有抖音小店
export const getAllShopAuth = data => {
  return request.post('/v1/system/account/auth/getBrandShopAuth', data)
}
// 抖店授权地址
export const shopAuthLink = data => {
  return request.post('/v1/system/account/auth/shopAuthLink', data)
}
// 抖店取消授权
export const cancelShopAuth = data => {
  return request.post('/v1/system/account/auth/cancelShopAuth', data)
}

// 账号授权列表
export const getShopAccount = data => {
  return request.post('/v1/system/account/auth/getShopAccount', data)
}
// 账号抖音授权地址
export const accountAuthLink = data => {
  return request.post('/v1/system/account/auth/accountAuthLink', data)
}
// 取消账号抖音授权
export const cancelDyAccountAuth = data => {
  return request.post('/v1/system/account/auth/cancelDyAccountAuth', data)
}
// 账号百应授权地址
export const accountByAuthLink = data => {
  return request.post('/v1/system/account/auth/accountByAuthLink', data)
}
// 取消账号百应授权
export const cancelByAccountAuth = data => {
  return request.post('/v1/system/account/auth/cancelByAccountAuth', data)
}
// 账号百应授权刷新
export const accountByAuthFresh = data => {
  return request.post('/v1/system/account/auth/accountByAuthFresh', data)
}
// 修改运营者信息
export const uptAuthOperation = data => {
  return request.post('/v1/system/account/operation/auth/uptAuthOperation', data)
}
// 小程序授权设置抖店
export const programSetShop = data => {
  return request.post('/v1/system/account/auth/appSetShop', data)
}
// 小程序授权设置抖店列表
export const getAuthShop = data => {
  return request.post('/v1/system/account/auth/getBrandShopAuth', data)
}

// 抖音小店授权管理-抖店获取百应授权状态 0 初始化 1 扫码成功 2 授权成功
export const dyShopAuthFresh = data => {
  return request.post('/v1/system/account/auth/dyShopAuthFresh', data)
}

// 抖音小店授权管理- 抖店取消抖店百应授权接口
export const cancelDyShopAuth = data => {
  return request.post('/v1/system/account/auth/cancelDyShopAuth', data)
}

// 抖音小店授权管理- 抖店百应授权URL
export const dyShopAuthLink = data => {
  return request.post('/v1/system/account/auth/dyShopAuthLink', data)
}

// 酷家乐授权管理- 酷家乐授权的URL
export const kujialeAuthLink = data => {
  return request.post('/v1/system/account/auth/kujiale/kujialeAuthLink', data)
}

// 酷家乐授权管理- 酷家乐授权列表
export const getKujialeAuthList = data => {
  return request.post('/v1/system/account/auth/kujiale/getKujialeAuthList', data)
}
// 酷家乐授权管理-酷家乐授权列表不分页
export const getKujialeAuthInfoList = data => {
  return request.post(`/v1/system/account/auth/kujiale/getKujialeAuthInfoList`, data)
}
// 小程序授权设置落地页
export const setAppLandPage = data => {
  return request.post('/v1/system/account/auth/appSetLandPage', data)
}
// 取消小程序授权
export const delMiniAuth = data => {
  return request.post('/v1/system/account/auth/delMiniAuth', data)
}

// 账号抖音web端授权地址/获取剪映授权二维码
export const accountDyWebAuthLink = data => {
  return request.post('/v1/system/account/auth/accountDyWebAuthLink', data)
}
// 取消账号抖音web端授权
export const cancelDyWebAccountAuth = data => {
  return request.post('/v1/system/account/auth/cancelDyWebAccountAuth', data)
}
// 账号抖音web端授权刷新/获取剪映授权状态
export const accountDyWebAuthFresh = data => {
  return request.post('/v1/system/account/auth/accountDyWebAuthFresh', data)
}

//  强制同步视频列表-抖开
export const videoListForceSync = data => {
  return request.post('/v1/system/account/microapp/videoListForceSync', data)
}

// 抖音web端授权获取验证码
export const getDyWebCode = data => {
  return request.post('/v1/system/account/auth/dyWebPhoneLogin', data)
}

// 抖音web端授权 提交验证码
export const submitDyWebCode = data => {
  return request.post('/v1/system/account/auth/dyWebLoginPhoneCodeSet', data)
}

// 抖音web端授权 查询授权验证码登陆状态
export const dyWebLoginPhoneCodeSet = data => {
  return request.post('/v1/system/account/auth/dyWebPhoneLoginStatus', data)
}

// 是否有UID
export const dyWebAuthAllow = data => {
  return request.post('/v1/system/account/auth/dyWebAuthAllow', data)
}

// 获取授权记录
export function getAccountAuthRecord(data) {
  return request.post(`/v1/system/account/auth/getAccountAuthRecord`, data)
}

// 设置运营者 搜索
export function listUserInfo(data) {
  return request.post(`/v1/system/account/operation/auth/listUserInfo`, data)
}

// 导出
export const exportAccountListV2 = data => {
  return request.post(`/v1/system/account/auth/exportAccountList`, data)
}

// 获取视频号的授权引导地址
export function getWxAuthUrl(params) {
  return request.post('/v1/microapp/auth/v2/getWxAuthUrl', params)
}
// 获取视频号的授权状态
export function getWxAuthUrlStatus(params) {
  return request.post('/v1/microapp/auth/v2/getWxAuthUrlStatus', params)
}
// 获取小红书的授权引导地址
export function getXhsAuthUrl(params) {
  return request.post('/v1/microapp/auth/v2/getXhsAuthUrl', params)
}
// 获取小红书的授权状态
export function getXhsAuthUrlStatus(params) {
  return request.post('/v1/microapp/auth/v2/getXhsAuthUrlStatus', params)
}

// 删除矩阵号
export function delAuthAccount(params) {
  return request.post('/v1/system/account/auth/delAuthAccount', params)
}

// 获取企业员工号授权二维码
export function getDyAuthQrCode(params) {
  return request.post('/v1/microapp/auth/v2/getDyAuthQrCode', params)
}
// 获取企业员工号抖音二维码授权状态
export function getDyQrAuthStatus(params) {
  return request.post('/v1/microapp/auth/v2/getDyQrAuthStatus', params)
}

// 获取抖音手机号授权验证码
export function sendSmsAuthCheckCode(params) {
  return request.post('/v1/microapp/auth/v2/sendSmsAuthCheckCode', params)
}

// 抖音手机号授权(携带AuthNo)
export function smsAuth(params) {
  return request.post('/v1/microapp/auth/v2/smsAuth', params)
}
// 手机号验证码的授权结果
export function getAuthRecord(params) {
  return request.post('/v1/system/account/auth/getAuthRecord', params)
}
// 获取抖音uid
export function initUidByOpenId(params) {
  return request.post('/v1/system/account/microapp/initUidByOpenId', params)
}
// 取消线索授权
export function cancelClueAuth(params) {
  return request.post('/v1/system/account/auth/cancelClueAuth', params)
}

// 获取快手授权二维码
export function getKsAuthQrCode(params) {
  return request.post('/v1/microapp/auth/v2/getKsAuthQrCode', params)
}
// 获取快手二维码授权状态
export function getKsQrAuthStatus(params) {
  return request.post('/v1/microapp/auth/v2/getKsQrAuthStatus', params)
}
// --视频号授权 [24/2/2]--

// 机构号授权列表
export function listWxMcnAuths(params) {
  return request.post('/v1/system/account/auth/wxMcn/listWxMcnAuths', params)
}

// 解除或者取消机构号授权
export function cancelWxMcnAccountAuth(params) {
  return request.post('/v1/system/account/auth/wxMcn/cancelWxMcnAccountAuth', params)
}

// 机构号授权引导
export function getWxMcnAuthGuid(params) {
  return request.post('/v1/auth/center/wxMcn/getWxMcnAuthGuid', params)
}

// 获取视频号授权状态 0初始化二维码 1待星麦云确认 2 授权成功 3授权失败
export function getWxMcnAuthStatus(params) {
  return request.post('/v1/auth/center/wxMcn/getWxMcnAuthStatus', params)
}

// 搜索视频号 最开始是精确搜索返回对象，后又改为模糊搜索返回list
export function searchWxOpenByNickname(params) {
  return request.post('/v1/auth/center/wxOpen/searchWxOpenByNickname', params)
}
// 获取视频号授权二维码
export function confirmWxOpenAuth(params) {
  return request.post('/v1/auth/center/wxOpen/confirmWxOpenAuth', params)
}
// 轮询视频号授权状态
export function getAuthGuidStatusV1(params) {
  return request.post('/v1/auth/center/wxOpen/getAuthGuidStatusV1', params)
}
// 已确认扫码
export function confirmQrCodeScanned(params) {
  return request.post('/v1/auth/center/wxOpen/confirmQrCodeScanned', params)
}
// 查询品牌是否开启内置机构号
export function getBrandDefaultMcnConfig(params) {
  return request.post('/v1/system/account/auth/wxMcn/getBrandDefaultMcnConfig', params)
}

// 查询品牌是否开启内置机构号
export function getBrandDefaultMcnConfigV2(params) {
  return request.post('/v1/system/account/auth/wxMcn/getBrandDefaultMcnConfigV2', params)
}

// 查询各个平台授权数
export function getAccountAuthCount(params) {
  return request.post('/v1/system/account/auth/getAccountAuthCount', params)
}

// 新授权接口  启用 关闭时使用
export function updateAccountDataAuth(params) {
  return request.post('/v1/system/account/auth/updateAccountDataAuth', params)
}

// 新授权检查接口  检查当前是否可以授权
export function checkCanAuth(params) {
  return request.post('/v1/system/account/brand/checkCanAuth', params)
}

// 取消抖音机构号授权
export function cancelMcnAccountAuth(params) {
  return request.post('/v1/system/account/auth/wxMcn/cancelMcnAccountAuth', params)
}

