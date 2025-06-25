import router from '@/router'
/**
 * @description 判断是否在每平每屋环境下
 * @return {Boolean}
 */
export function judgeOEA() {
  return (
    window?.self !== window?.top &&
    localStorage.getItem('envSource') &&
    localStorage.getItem('envSource') === 'mpmw'
  )
}
/**
 * @description 判断是否在海尔环境下
 * @return {Boolean}
 */
export function judgeHWork() {
  return (
    window?.self !== window?.top &&
    localStorage.getItem('envSource') &&
    localStorage.getItem('envSource') === 'hwork'
  )
}
/**
 * @description 根据是否在OEA环境下显示对应的系统名称
 * @return {Boolean}
 */
export function showSystemName() {
  return judgeOEA() ? 'OEA矩阵获客' : '星麦云'
}

/**
 * @description  OEA环境下重写跳转的url 每个url带上envSource、hideHeader、hideAside
 * @param {String} url 要跳转的url
 * @param {Boolean} addQuery 是否要带上envSource等信息
 * @return {String}

 */
export function rewriteUrl(url, addQuery) {
  console.log('OEA-准备更改路由地址', document.location.href, url, addQuery, document, window)
  let newUrl = ''
  if (url.indexOf('http') === -1) {
    newUrl = location.origin + url
  } else {
    newUrl = url
  }
  if (addQuery) {
    const hideHeader = localStorage.getItem('hideHeader')
    const hideAside = localStorage.getItem('hideAside')
    const envSource = localStorage.getItem('envSource')
    let str2 = url
    if (url.indexOf('envSource') === -1) {
      str2 = `${url.indexOf('?') > -1 ? '&' : '?'}${envSource ? 'envSource=' + envSource : ''}${
        hideHeader ? '&hideHeader=' + hideHeader : ''
      }${hideAside ? '&hideAside=' + hideAside : ''}`
    }
    return newUrl + str2
  } else {
    return newUrl
  }
}
/**
 * @description  OEA环境下location.href需要发送消息
 * @param {String} url 要跳转的地址
 * @param {Boolean} useLocation 强制使用location
 */
export function sendHrefMessage(url, useLocation) {
  if (judgeOEA()) {
    location.href = url
    console.log('OEA-location.href发送消息')
    window.parent.postMessage(
      {
        metaData: {
          event: 'urlChange'
        },
        data: {
          url: rewriteUrl(url, true),
          target: '_self'
        }
      },
      '*'
    )
  } else if (judgeHWork()) {
    if (useLocation) {
      if (url.indexOf('?') > -1) {
        location.href = url + '&envSource=' + localStorage.getItem('envSource')
      } else {
        location.href = url + '?envSource=' + localStorage.getItem('envSource')
      }
    } else {
      // 正常逻辑，海尔的location.href 或者 window.open都要用router.push跳转
      // 因为sumvideo和大屏都不属于这个项目，所以要用location.href
      if (
        url.indexOf('sumvideo/editing_project_web') > -1 ||
        url.indexOf('/sumvideo/') > -1 ||
        url.indexOf('/largeview/') > -1
      ) {
        if (url.indexOf('?') > -1) {
          location.href = url + '&envSource=' + localStorage.getItem('envSource')
        } else {
          location.href = url + '?envSource=' + localStorage.getItem('envSource')
        }
      } else {
        // --如果打开的是外部网址 那就不发送消息
        // eslint-disable-next-line prefer-regex-literals
        const reg = new RegExp(/(\w+):\/\/([^/:]+)(:\d*)?/)
        const result = url.match(reg)
        if (result && result.length > 0 && result[0] !== location.origin) {
          location.href = url
        } else {
          if (url.indexOf(location.origin) > -1) {
            const reUrl = url.split(location.origin)[1]
            router.push(reUrl)
          } else {
            router.push(url)
          }
        }
      }
    }
  } else if (localStorage.getItem('systemVersion') === '2') {
    // 切影[抖店]/基础版 要携带cutShadow 如果打开的是外部网址 就不携带
    // eslint-disable-next-line prefer-regex-literals
    const reg = new RegExp(/(\w+):\/\/([^/:]+)(:\d*)?/)
    const result = url.match(reg)
    if (result && result.length > 0 && result[0] !== location.origin) {
      location.href = url
    } else {
      if (url.indexOf('?') > -1) {
        location.href = url + '&cutShadow=' + localStorage.getItem('systemVersion')
      } else {
        location.href = url + '?cutShadow=' + localStorage.getItem('systemVersion')
      }
    }
  } else {
    location.href = url
  }
}

/**
 * @description OEA环境下 sumvideo的iframe地址更改 如果是OEA环境下带上query
 */
export function sumvideoRewriteUrl(url) {
  console.log(
    'sumvideo-iframe-路由更改',
    window?.self !== window?.top,
    localStorage.getItem('envSource') === 'mpmw'
  )
  if (judgeOEA() || judgeHWork()) {
    return rewriteUrl(url, true)
  } else {
    return url
  }
}

/**
 * @description OEA环境下 sumvideo的iframe发消息通知免登
 */
export function sumvideoNeedLogin(url) {
  console.log(
    'sumvideo-iframe-免登',
    window?.self !== window?.top,
    localStorage.getItem('envSource') === 'mpmw'
  )
  if (judgeOEA() || judgeHWork()) {
    window.parent.postMessage(
      {
        metaData: {
          event: 'needLogin'
        },
        data: {
          url: url
        }
      },
      '*'
    )
  }
}
