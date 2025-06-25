/*
 * @Author: Dong wen hao
 * @Date: 2022-02-25 11:31:15
 * @LastEditors: dong wenhao
 * @LastEditTime: 2022-04-21 17:14:16
 * @Description:埋点方法
 */

import { getOsInfo } from '../tools'
import { TRACK_EVENT_ID } from '../dictionary/track'
import store from '@/store'
import { triggerTrack } from '@/api/main/track'
import router from '@/router'

const OS = getOsInfo()

class Tracking {
  constructor() {
    this.enterTime = 0 // 进入页面时间戳
    this._init()
    // 无需埋点页面
    this.whiteList = ['/', '/login', '/fly_book_auth', '/enterprise_wechart_auth']
    // 无隶属模块 独立的页面
    this.independentList = ['/404', '/choice_system', '/system_manage/personal', '/forget_password']
  }

  // 初始化埋点信息
  _init() {
    this.trackInfo = {
      eventId: '', // 事件id
      eventName: '', // 事件名称
      eventExplain: '', // 事件说明
      isMobile: 0,
      osType: OS.name,
      osVersion: OS.version,
      stayTime: 0, // 页面停留时长
      isActive: 1
    }
  }

  // 处理路由对象
  _handleRoute(route) {
    const name = route.meta && route.meta.title ? route.meta.title : route.name
    const menu = store.getters.systemModule
    const that = this
    let scopeLevel = 0
    this.trackInfo.pageName = name
    if (!this.independentList.includes(route.path)) {
      this.trackInfo.moduleRoot = sessionStorage.getItem('module')
    }
    function recursiveMenu(list, _name, parent) {
      list.forEach(item => {
        if (item.childrenMenuList && item.childrenMenuList.length) {
          recursiveMenu(item.childrenMenuList, _name, item)
        }
        if (parent && item.scopeName === name) {
          scopeLevel = parent.scopeLevel
          switch (parent.scopeLevel) {
            case 1:
              if (!item.childrenMenuList.length) {
                that.trackInfo.moduleFirst = item.scopeName
              }
              break
            case 2:
              that.trackInfo.moduleFirst = parent.scopeName
              break
          }
        }
      })
    }
    recursiveMenu(menu, name)
    if (!scopeLevel && route.meta) {
      // 非菜单页面不在后端数据里，单独处理
      this.trackInfo.moduleFirst = route.meta.parentMenu || ''
      this.trackInfo.moduleSecond = route.meta.parentModule || ''
    }
  }

  /**
   * @description: 埋点方法前置处理
   * @param {Object} route vue路由对象
   * @param {Function} trackCallback 埋点方法
   */
  _trakEvent(trackCallback, route) {
    this._init()
    if (route) {
      if (this.whiteList.includes(route.path)) return
      this._handleRoute(route)
    }
    trackCallback && trackCallback()
    triggerTrack(this.trackInfo)
  }

  // 页面未关闭，但暂时离开（切换标签或最小化）
  pageHide() {
    // 累加页面停留时间
    const _stayTime = parseInt((new Date().getTime() - this.enterTime) / 1000)
    this.trackInfo.stayTime += _stayTime
  }

  // 页面从隐藏状态回到显示状态
  pageShow() {
    // 重置进入时间
    this.enterTime = new Date().getTime()
  }

  /**
   * @description: 进入页面
   * @param {Object} route vue路由对象
   */
  enterPage(route, remark) {
    this._trakEvent(() => {
      this.enterTime = new Date().getTime()
      this.trackInfo.activeType = 1
      this.trackInfo.eventId = 101
      this.trackInfo.eventName = TRACK_EVENT_ID.getCN(this.trackInfo.eventId)
      this.trackInfo.eventExplain = remark || ''
    }, route)
  }

  /**
   * @description: 离开页面
   * @param {Object} route vue路由对象
   */
  leavePage(route, remark) {
    const _stayTime =
      parseInt((new Date().getTime() - this.enterTime) / 1000) + this.trackInfo.stayTime
    const ONE_DAY = 60 * 60 * 24
    if (_stayTime > ONE_DAY) return
    this._trakEvent(() => {
      this.trackInfo.stayTime += _stayTime
      this.trackInfo.activeType = 2
      this.trackInfo.eventId = 102
      this.trackInfo.eventName = TRACK_EVENT_ID.getCN(this.trackInfo.eventId)
      this.trackInfo.eventExplain = remark || ''
    }, route)
  }

  /**
   * @description: 点击事件埋点
   * @param {Number} eventId 事件id
   */
  clickBtn(eventId) {
    console.log('埋点事情导出', this)
    this._trakEvent(() => {
      this.trackInfo.eventId = eventId
      this.trackInfo.eventName = TRACK_EVENT_ID.getCN(eventId)
    })
  }
}

const Track = new Tracking()

document.addEventListener('visibilitychange', function (event) {
  const pageHidden = document.hidden
  if (router?.currentRoute?.value) {
    pageHidden ? Track.pageHide() : Track.pageShow()
  }
})

export default Track
