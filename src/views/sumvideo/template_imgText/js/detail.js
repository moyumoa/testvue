import { throttle, isEmpty } from '@/utils/tools'
import {
  saveImageCreativeMedia,
  removeImageCreativeMedia,
  saveImageCreativeSetting
} from '@/api/sumvideo/template_imgText'
import { list } from '@/api/content_center/material_library.js'
export function detailFun(origin, templateId, info, previewImg, errList, showPageType) {
  const message = inject('$message')
  // 校验表单 type all 所有 shoot 实拍图 scene 场景图 model 虚拟模特
  function validFun(type) {
    console.log('校验', type)
    return new Promise(resolve => {
      const shootLen = previewImg.value.length - info.value.nonReplaceable.length
      let errTip = ''

      if (['all', 'shoot'].includes(type)) {
        if (info.value.realShootList.length < shootLen) {
          if (!errTip) {
            errTip =
              info.value.realShootList.length > 0 ? `请选择至少${shootLen}张实拍图` : '请选择实拍图'
          }
          errList.shoot = true
        } else if (isEmpty(info.value.realShootSelectMode) && origin === 'batchCreate') {
          if (!errTip) {
            errTip = `请设置实拍图处理方式`
          }
          errList.shoot = true
        } else {
          if (!errList.shoot) {
            errList.shoot = false
          }
        }
      }

      if (['all', 'scene'].includes(type)) {
        // 校验场景图的个数 不能为空
        if (isEmpty(info.value.sceneList)) {
          if (!errTip) {
            errTip = `请选择场景图`
          }
          errList.scene = true
        } else {
          if (!errList.scene) {
            errList.scene = false
          }
        }
      }

      if (['all', 'model'].includes(type)) {
        // 校验虚拟模特的个数 不能为空 批量生成需要校验 模板生成无需校验，可使用员工上传的
        if (
          info.value.imageReplaceType &&
          info.value.imageReplaceType === 1 &&
          origin === 'batchCreate'
        ) {
          if (isEmpty(info.value.mannequinList)) {
            if (!errTip) {
              errTip = `请选择虚拟模特`
            }
            errList.model = true
          } else if (isEmpty(info.value.mannequinSelectMode) && origin === 'batchCreate') {
            if (!errTip) {
              errTip = `请设置虚拟模特处理方式`
            }
            errList.model = true
          } else {
            if (!errList.model) {
              errList.model = false
            }
          }
        } else {
          errList.model = false
        }
      }
      // 校验关键词  不能为空 图文才校验
      if (
        (!showPageType || (showPageType && showPageType.value === 2)) &&
        isEmpty(info.value.titleGenconfig.keyword) &&
        info.value.creativeStruct === 2
      ) {
        if (!errTip) {
          errTip = `请填写文案关键词`
        }
        errList.text = true
      } else {
        errList.text = false
      }
      resolve(errTip || '')
    })
  }
  // --选择实拍图

  const chooseMaterialDialog = ref({
    show: false
  })

  const showChooseMaterialFun = throttle(() => {
    chooseMaterialDialog.value = {
      extraParams: {
        isNeedReplaceFace: info.value.imageReplaceType === 1 ? 1 : 0
      },
      hideName: true,
      show: true,
      materialType: 2,
      materialSources: [20],
      materialTypeList: [2],
      dialogTitle: '选择实拍图',
      fileOrigin: 'productShoot',
      fileType: 4,
      origin: 'productShoot',
      showMarkICON: true,
      searchComponents: [
        {
          type: 'input',
          label: '商品',
          val: '',
          placeholder: '请输入商品名称',
          filed: 'productName'
        },
        {
          type: 'input',
          label: '实拍模特',
          val: '',
          placeholder: '请输入实拍模特姓名',
          filed: 'mannequinName'
        }
      ]
    }
  }, 700)

  // 更新选中的数据 - 场景图和实拍图都用这个 区分字段：chooseMaterialDialog.value.origin
  function updateSelectFun(list, dialog, btnLoading) {
    console.log('updateSelectFun', list, dialog, btnLoading)
    saveImageCreativeMedia({
      creativeId: templateId || info.value.id,
      isSelectAll: false,
      resourceIds: list,
      resourceType:
        chooseMaterialDialog.value.origin === 'productShoot'
          ? 0
          : chooseMaterialDialog.value.origin === 'productScene'
          ? 1
          : 2
    })
      .then(res => {
        // 根据返回的Id列表，查询数据的详情列表
        if (res.code === 0) {
          getListByIdFun(
            res.data,
            chooseMaterialDialog.value.origin === 'productShoot'
              ? 'shoot'
              : chooseMaterialDialog.value.origin === 'productScene'
              ? 'scene'
              : 'model',
            'add',
            dialog,
            btnLoading
          )
        } else {
          btnLoading.value = false
        }
      })
      .catch(() => {
        btnLoading.value = false
      })
  }
  // 根据ID列表获取详情列表
  function getListByIdFun(ids, origin, type, dialog, btnLoading, delLoading) {
    console.log('getListByIdFun', type, btnLoading, chooseMaterialDialog.value.materialSources)
    if (isEmpty(ids)) {
      setListFun([], 0, ids, origin, type, dialog, btnLoading, delLoading)
      return
    }
    list({
      sources: chooseMaterialDialog.value.materialSources,
      subSource: [],
      pageSize: 20,
      pageNo: 1,
      includeIds: ids,
      isDelete: 2
    })
      .then(res => {
        if (res.code === 0) {
          console.log('getListByIdFun', ids, origin, type)
          const list = res.data.records || []
          setListFun(list, res.data.total || 0, ids, origin, type, dialog, btnLoading, delLoading)
        } else {
          if (type === 'add') {
            btnLoading.value = false
          } else {
            delLoading.value = ''
          }
        }
      })
      .catch(() => {
        if (type === 'add') {
          btnLoading.value = false
        } else {
          delLoading.value = ''
        }
      })
  }
  function setListFun(list, total, ids, origin, type, dialog, btnLoading, delLoading) {
    if (origin === 'shoot') {
      info.value.realShootList = list
      info.value.realShootIds = ids
      info.value.realShootMax = total
      if (showPageType && showPageType.value) showPageType.value = 2
    } else if (origin === 'scene') {
      info.value.sceneList = list
      info.value.sceneIds = ids
      info.value.sceneMax = total
    } else if (origin === 'model') {
      info.value.mannequinList = list
      info.value.mannequinIds = ids
      info.value.mannequinMax = total
    }
    if (type === 'add') {
      dialog.handleClose()
      btnLoading.value = false
    } else {
      delLoading.value = ''
    }
    if (origin === 'shoot') {
      errList.shoot = false
    } else if (origin === 'scene') {
      errList.scene = false
    } else {
      errList.model = false
    }
    message.success(
      `${origin === 'shoot' ? '实拍图' : origin === 'scene' ? '场景图' : '虚拟模特'}${
        type === 'add' ? '添加' : '删除'
      }成功`
    )
  }
  // --选择实拍图 end

  // --选择不可替换图
  const addNoReplaceDialog = ref({
    show: false,
    list: [], // 目前已上传的图片列表
    maxSize: null // 最多添加的个数
  })
  const showAddNoReplaceFun = throttle(() => {
    addNoReplaceDialog.value = {
      show: true,
      maxSize: previewImg.value.length - info.value.nonReplaceable.length - 1, // 保证起码有一张在合成中可以替换
      list: info.value.nonReplaceable ? JSON.parse(JSON.stringify(info.value.nonReplaceable)) : []
    }
  }, 700)
  function updateNoReplaceFun(list, previewList) {
    console.log('更新不可替换', list, previewList)
    delLoading.value = 'noReplace'
    saveImageCreativeSetting({
      creativeId: templateId || info.value.id,
      nonReplaceable: list
    })
      .then(res => {
        if (res.code === 0) {
          info.value.nonReplaceable = list
          previewImg.value = previewList
        }
        delLoading.value = ''
      })
      .catch(err => {
        console.log('err', err)
        delLoading.value = ''
      })
  }
  // --选择不可替换图 end

  // --选择场景图
  const showChooseSceneFun = throttle(() => {
    chooseMaterialDialog.value = {
      show: true,
      materialType: 21,
      materialSources: [21],
      materialTypeList: [99],
      dialogTitle: '添加场景图片',
      fileOrigin: 'productScene',
      fileType: 5,
      origin: 'productScene',
      searchComponents: [
        {
          type: 'input',
          label: '场景图名称',
          val: '',
          placeholder: '请输入场景图名称',
          filed: 'name'
        },
        {
          type: 'newLabelFilterV2',
          label: '场景图标签',
          behavior: '选择',
          val: [], // 选择数据
          choseName: '标签',
          placeholder: '请输入标签关键词',
          filed: 'tags',
          addTagInfo: {
            type: 18,
            hideTitleSpan: false,
            id: null,
            index: [],
            source: null
          } // addTag的需要的相关数据，比如回显等，不会在入参内
        },
        {
          type: 'select',
          label: '场景图类型',
          placeholder: '请选择场景图类型',
          filed: 'pictureType',
          val: -1,
          defaultVal: -1,
          selects: [
            {
              label: '全部',
              value: -1
            },
            {
              label: '单图',
              value: 1
            },
            {
              label: '组图',
              value: 2
            }
          ]
        }
      ]
    }
  }, 700)
  // --选择场景图 end

  // --选择虚拟模特
  const selectModelDialog = ref({
    show: false
  })
  const showSelectModelFun = throttle(() => {
    chooseMaterialDialog.value = {
      origin: 'model',
      materialSources: []
    }
    selectModelDialog.value = {
      show: true
    }
  }, 700)

  // --选择虚拟模特 end

  // --删除图片
  const delLoading = ref() // 要显示哪块的删除Loading
  const delFun = throttle((index, type, item) => {
    console.log('delFun', index, type, item)
    if (type === 'noReplace') {
      delLoading.value = type
      const list2 = JSON.parse(JSON.stringify(info.value.nonReplaceable)).splice(index, 1)
      saveImageCreativeSetting({
        creativeId: templateId || info.value.id,
        nonReplaceable: list2 || []
      })
        .then((res) => {
          if (res.code === 0) {
            previewImg.value[item.index].url = ''
            info.value.nonReplaceable.splice(index, 1)
          }
          delLoading.value = ''
        })
        .catch(() => {
          delLoading.value = ''
        })
    } else {
      chooseMaterialDialog.value.materialSources =
        type === 'shoot' ? [20] : type === 'scene' ? [21] : [22]
      delLoading.value = type
      removeImageCreativeMedia({
        creativeId: templateId || info.value.id,
        isSelectAll: false,
        resourceIds: [item.id || item.tagvvMediaId],
        resourceType: type === 'shoot' ? 0 : type === 'scene' ? 1 : 2
      })
        .then(res => {
          if (res.code === 0) {
            getListByIdFun(res.data, type, 'del', null, null, delLoading)
          } else {
            delLoading.value = ''
          }
        })
        .catch(() => {
          delLoading.value = ''
        })
    }
  })
  // --删除图片 end

  // --查看全部
  const allMaterialDilog = ref({
    show: false
  })
  const showAllFun = throttle((type, materialIds) => {
    console.log('查看全部', type)
    const materialText = type === 'shoot' ? '实拍图' : type === 'scene' ? '场景图' : '虚拟模特'
    allMaterialDilog.value = {
      type: type,
      show: true,
      showMarkICON: type === 'shoot',
      hideName: type === 'shoot',
      dialogTitle: '全部' + materialText,
      materialText: materialText,
      materialIds: materialIds,
      delMessageBox: {
        content: `删除所选${materialText}？<br/><span style="line-height: 30px;font-size:13px;color:#606266">注：不会刪除${materialText}库中对应的${materialText}</span>`,
        confirmButtonText: '刪除',
        title: `删除${materialText}`
      },
      creativeId: templateId || info.value.id,
      resourceType: type === 'shoot' ? 0 : type === 'scene' ? 1 : 2,
      mediaType: type === 'scene' ? 16 : 8, // 实际的原料类型
      materialType: type === 'scene' ? 16 : 8 // 要显示的原料类型
    }
  }, 700)
  // 查看全部弹窗里点击了删除，所以要更新最新的导入原料信息和数量
  function updateChooseList(list, total, ids) {
    console.log('updateChooseList', list, total, ids)
    switch (allMaterialDilog.value.type) {
      case 'shoot':
        info.value.realShootList = list
        info.value.realShootMax = total
        info.value.realShootIds = ids
        break
      case 'scene':
        info.value.sceneList = list
        info.value.sceneMax = total
        info.value.sceneIds = ids
        break
      case 'model':
        info.value.mannequinList = list
        info.value.mannequinMax = total
        info.value.mannequinIds = ids
        break
    }
  }
  // --查看全部 end

  // --预览信息
  const previewInfo = ref({
    show: false
  }) // 预览弹窗的信息
  function previewFun(title, url, type, cover, urlList) {
    previewInfo.value = {
      show: true,
      title: title,
      url: url,
      urlList: urlList,
      type: type,
      cover: cover || ''
    }
  }
  // --预览信息 end

  return {
    validFun,
    previewInfo,
    previewFun,
    updateChooseList,
    showAllFun,
    allMaterialDilog,
    delFun,
    delLoading,
    showSelectModelFun,
    selectModelDialog,
    showChooseSceneFun,
    updateNoReplaceFun,
    showAddNoReplaceFun,
    addNoReplaceDialog,
    setListFun,
    getListByIdFun,
    updateSelectFun,
    showChooseMaterialFun,
    chooseMaterialDialog
  }
}
