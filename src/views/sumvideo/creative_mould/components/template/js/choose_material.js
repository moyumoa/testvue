import { isNotEmpty } from '@/utils/tools'
import { ElMessage } from 'element-plus'
import { list } from '@/api/content_center/material_library.js'

// 删除元素
export function delFun(e, $data, mediaType) {
  console.log('删除', e, $data)
  $data.chooseLoading = true
  // 如果是条件匹配[动态筛选]，那就是往excludeIds里加，否则就是从creationIds里删。
  if ($data.info.isDynamicFilter) {
    // 条件匹配

    const index3 = ($data.info.filter.excludeIds || []).findIndex(x => x === e)
    if (index3 === -1) {
      if ($data.info.filter.excludeIds && $data.info.filter.excludeIds.length > 0) {
        $data.info.filter.excludeIds.push(e)
      } else {
        $data.info.filter.excludeIds = [e]
      }
    }
    if (mediaType === 3) {
      $data.extraInfo.audioFilter = $data.info.filter
    } else if (mediaType === 4) {
      $data.extraInfo.textFilter = $data.info.filter
    }
  } else {
    // 精确匹配
    const index2 = $data.info.creationIds.findIndex(x => x === e)
    if (index2 > -1) {
      $data.info.creationIds.splice(index2, 1)
    }

    if (mediaType === 3) {
      $data.extraInfo.audioCreationIds = $data.info.creationIds
    } else if (mediaType === 4) {
      $data.extraInfo.textCreationIds = $data.info.creationIds
    }
  }
  // 删除之后，需要重新调取元素列表接口获取最新的20条数据

  getMaterialList($data, 'del')
}
// 获取最新的原料列表
// 入参介绍：$data 数据 source 来源[del 调用删除之后 chooseType 根据原料选择的类型导入匹配之后] sourceByChooseType 根据哪个原料类型过来的[match 条件匹配 select 精确匹配]
export function getMaterialList(
  $data,
  source,
  sourceByChooseType,
  dialog,
  btnLoading,
  emits,
  initNoUseLoading,
  isNotBGM
) {
  console.log('getMaterialList', $data.info.filter, $data.info.creationIds, source, $data)
  if (
    ($data.info.isDynamicFilter && isNotEmpty($data.info.filter)) ||
    (!$data.info.isDynamicFilter && isNotEmpty($data.info.creationIds))
  ) {
    if (source === 'init' && !initNoUseLoading) {
      $data.chooseLoading = true
    }
    const params = JSON.parse(
      JSON.stringify(
        $data.info.isDynamicFilter
          ? $data.info.filter || {}
          : {
              includeIds: $data.info.creationIds || []
            }
      )
    )
    params.pageNo = 1
    params.pageSize = 20
    params.isDelete = 0
    params.subSource = [1, 0]
    if ($data.info.isDynamicFilter) {
      params.type = [params.type]
    }
    list(params)
      .then(res => {
        if (res.code === 0) {
          console.log('获取到的数据集', res)
          const resData = res.data || {}
          if (source === 'chooseType') {
            emits('updateChooseList', resData.records || [], resData.total || 0)
            dialog.handleClose()
            if (sourceByChooseType === 'match') {
              ElMessage({
                message: `条件匹配到${resData.total || 0}个原料`,
                type: 'success'
              })
            }
          } else {
            $data.chooseList = resData.records || []
            $data.listTotal = resData.total || 0
          }
        } else {
          if (source === 'chooseType') {
            btnLoading = false
          }
        }
        if (source === 'del') {
          ElMessage({
            message: `刪除成功`,
            type: 'success'
          })

          $data.chooseLoading = false
        } else if (source === 'init') {
          if (initNoUseLoading) {
            if (isNotBGM) {
              emits('update:initLoading', false)
            }
            $data.initLoading = false
          }
          $data.chooseLoading = false
        }
      })
      .catch(() => {
        if (source === 'chooseType') {
          btnLoading = false
        } else if (source === 'del') {
          ElMessage({
            message: `刪除成功`,
            type: 'success'
          })
          $data.chooseLoading = false
        } else if (source === 'init') {
          if (initNoUseLoading) {
            if (isNotBGM) {
              emits('update:initLoading', false)
            }
            $data.initLoading = false
          }
          $data.chooseLoading = false
        }
      })
  } else {
    if (source === 'chooseType') {
      btnLoading = false
    } else {
      $data.chooseList = []
      $data.listTotal = 0
      $data.chooseLoading = false
      if (initNoUseLoading) {
        if (isNotBGM) {
          emits('update:initLoading', false)
        }
        $data.initLoading = false
      }
    }
  }
}
