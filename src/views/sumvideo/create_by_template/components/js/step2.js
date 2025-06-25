import { throttle } from '@/utils/tools.js'
export const trackFun = storyboardInfo => {
  const itemRefsListItem = ref([]) // 每个分镜的实例
  // 获取每个分镜的实例，用于点击轨道定位
  const setItemRefListItem = (el, id) => {
    return el => {
      if (el) {
        const existingItem = itemRefsListItem.value.find(item => item.id === id)
        if (!existingItem) {
          itemRefsListItem.value.push({ id, ref: el })
        } else {
          existingItem.ref = el
        }
      }
    }
  }

  // 分镜轨道的点击
  const choseTrack = throttle(function (e, storyItem) {
    const { MediaURL, Content } = storyItem
    const currentId = MediaURL || Content
    console.log('点击轨道', currentId, storyItem)
    // 单选storyItem.trackChecked = true
    // $data.VideoTracks.forEach(s => {
    //   s.forEach(ss => {
    //     if ((ss.MediaURL ? ss.MediaURL : ss.Content) === currentId) {
    //       ss.trackChecked = true
    //     } else {
    //       ss.trackChecked = false
    //     }
    //   })
    // })
    const isGroup = false
    // 当前分镜是否在分镜组内
    // 在所有分镜列表内找到对应的分镜
    // storyboardInfo.listData ||
    //   [].forEach(s => {
    //     s.groupClipList.forEach(ss => {
    //       if (`$${ss.replaceId}` === currentId) {
    //         ss.trackChecked = true
    //         if (s.isRealGroup === 1) isGroup = true
    //       } else {
    //         ss.trackChecked = false
    //       }
    //     })
    //   })

    console.log('isGroup', isGroup)
    if (!isGroup) {
      const itemRef = itemRefsListItem.value.find(itemRefsItem => {
        console.log('itemRefsItem', itemRefsItem)
        return `$${itemRefsItem.id}` === currentId
      })
      console.log('itemRef', itemRef)
      if (itemRef && !isElementInViewport(itemRef.ref)) {
        itemRef.ref.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, 500)
  // 判断当前数据是否超出可是范围
  function isElementInViewport(el) {
    const rect = el.getBoundingClientRect()
    // rect.top >= 336 被轨道图挡住也算可视区域外
    return (
      rect.top >= 336 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    )
  }

  // 隐藏轨道图
  const hideTrackAreaFn = () => {
    // 将数据内的选中去除
    storyboardInfo.listData.forEach(s => {
      s.groupClipList.forEach(ss => {
        ss.trackChecked = false
      })
    })
  }

  return { setItemRefListItem, choseTrack, hideTrackAreaFn, itemRefsListItem, isElementInViewport }
}
