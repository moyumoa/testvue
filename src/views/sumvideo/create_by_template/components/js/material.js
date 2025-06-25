import { removeMaterial } from '@/api/sumvideo/create_by_template.js'
import { throttle } from '@/utils/tools'

export function materialAction() {
  // const message = inject('$message')
  // 删除原料
  const materialDelFun = throttle(
    (
      item,
      index,
      pipelineId,
      templateId,
      creativeReplaceId,
      showMore,
      chooseList,
      listTotal,
      emits,
      chooseText,
      origin
    ) => {
      if (origin === 'templateEdit') {
        emits('delFun', item.id || item.tagvvMediaId)
        return
      }
      if (chooseText) {
        emits('changeDelInfo', creativeReplaceId, true)
      } else {
        emits('update:clickStoryboardId', creativeReplaceId)
        emits('update:uploadLoading', true)
      }
      removeMaterial({
        pipelineId: pipelineId,
        scriptId: templateId,
        scriptReplaceId: creativeReplaceId,
        tagvvMediaIds: [item.id || item.tagvvMediaId]
      })
        .then(res => {
          if (res.code === 0) {
            // 删除原料，直接重置列表[获取第一页数据]，如果不重置，会导致数据分页显示不准
            emits('delFun')
            // listImportMaterial({
            //   pageNo: 1,
            //   pageSize: 20,
            //   pipelineId: pipelineId,
            //   scriptId: templateId,
            //   scriptReplaceId: creativeReplaceId
            // })
            //   .then(res => {
            //     if (res.code === 0) {
            //       const list = res.data?.records || []
            //       if (page.index === 1) {
            //         listData.value = list
            //         page.total = res.data?.total || 0
            //       } else {
            //         listData.value = listData.value.concat(list)
            //       }
            //     }
            //   })
            //   .catch(() => {})

            // // 在步骤二直接删除，如果总数小于20或者当前列表的总数小于15，就去请求接口获取最新的20条数据 因为我们初始化只返回20条数据
            // if (showMore) {
            //   // 直接删除
            //   if (chooseList.length < 15 || listTotal < 20) {
            //     emits('delFun')
            //   } else {
            //     chooseList.splice(index, 1)
            //     if (listTotal > 0) {
            //       emits('update:listTotal', listTotal - 1)
            //     }
            //     message.success('刪除成功')
            //   }
            // } else {
            //   chooseList.splice(index, 1)
            //   if (listTotal > 0) {
            //     emits('update:listTotal', listTotal - 1)
            //   }
            //   emits('delFun')
            //   message.success('刪除成功')
            // }
          } else {
            if (chooseText) {
              emits('changeDelInfo', creativeReplaceId, false)
            } else {
              emits('update:uploadLoading', false)
            }
          }
        })
        .catch(() => {
          if (chooseText) {
            emits('changeDelInfo', creativeReplaceId, false)
          } else {
            emits('update:uploadLoading', false)
          }
        })
    },
    500
  )

  // 获取音频分镜的处理方式 BGM或非BGM
  function getVideoStoryboardMethodType(replaceRule) {
    let isBackground = false // isBackground
    if (replaceRule) {
      const info = JSON.parse(replaceRule)
      isBackground = info.isBackground
    }
    return isBackground
  }
  return {
    materialDelFun,
    getVideoStoryboardMethodType
  }
}
