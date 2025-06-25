<template>
  <el-dialog
    ref="dialog"
    custom-class="rule_setting_dialog  "
    :close-on-click-modal="false"
    destroy-on-close
    v-model="show"
    :title="
      type === 3
        ? '设置标签'
        : [14, 15, 12, 16, 17, 18, 19, 20].includes(type)
        ? '选择标签'
        : type === 21
        ? '智能过滤'
        : '编辑标签'
    "
    width="820px"
    :before-close="handleClose"
  >
    <template #title>
      <div class="dialog_title">
        {{
          type === 3
            ? '设置标签'
            : [14, 15, 12, 16, 17, 18, 19, 20].includes(type)
            ? '选择标签'
            : type === 21
            ? '智能过滤'
            : '编辑标签'
        }}
        <span
          v-if="
            [14, 15, 4, 5, 21, 6, 16, 7, 17, 8, 18, 9, 19, 20].includes(type) &&
            !props.addDialog.hideTitleSpan
          "
        >
          {{ subtitle ? subtitle : '' }}
        </span>
      </div>
    </template>
    <div class="dialog_box" style="padding: 16px 16px 0; width: 100%">
      <div class="add_tab_box">
        <el-input
          v-model.trim="inputTabName"
          @input="retEmit($event)"
          style="width: 230px"
          clearable
          :placeholder="type == 21 ? '新增或搜索关键词' : '新增或搜索标签'"
          @clear="clearInput"
          maxlength="20"
        />
        <el-button class="add_btn" type="primary" @click="getTagList">确认</el-button>
      </div>
      <div class="addTag_box" @click="addNewTag" v-if="newTag.show">
        创建新{{ type == 21 ? '关键词' : '标签' }}“{{ newTag.name }}”
      </div>
      <div class="line"></div>
      <div
        class="box_container"
        :style="[3, 14, 15, 12, 16, 17, 18, 19, 20].includes(type) ? 'height:385px' : ''"
      >
        <div class="all_tab_box half_box" v-loading="loading">
          <div
            v-if="type === 21 && allTagList && allTagList.length > 0"
            class="left_all_btn"
            @click="allChooseFun()"
          >
            一键全选
          </div>
          <!-- 无标签数据 -->
          <div class="none_tab" v-if="!loading && showNone && !inputTabName.value">
            暂无{{ type == 21 ? '关键词' : '标签' }}，请先添加
          </div>
          <template v-else>
            <div class="current_tab_box" v-for="(item, index) in allTagList" :key="index">
              <div class="label" v-if="item.group && item.group.length > 0">{{ item.title }}</div>
              <div class="tab_box" v-if="item.group && item.group.length > 0">
                <div
                  :class="x.choose ? 'tab choose_tab' : 'tab'"
                  @click="addTag(x)"
                  v-for="(x, y) in item.group"
                  :key="y"
                >
                  <div
                    v-if="x.source === 1"
                    class="close_icon"
                    style="margin: 0 4px 0 0; font-size: 16px"
                  >
                    <el-icon><i-star /></el-icon>
                  </div>
                  {{ x.name }}
                  <div v-if="x.source !== 1 && canDelete" class="close_icon">
                    <el-icon @click.stop="tagAllClose(x, y, index)"><i-close-bold /></el-icon>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
        <div class="current_tab_box half_box" style="overflow: hidden; position: relative">
          <div v-if="type === 21" class="left_all_btn" @click="clearChooseFun()">清空</div>
          <div class="label choose_label" v-if="type === 21">
            已过滤
            <span>{{ chooseTagList.length }}</span>
            个关键词
          </div>
          <div class="label choose_label" v-else>
            {{ [3, 14, 15, 12, 16, 17, 18, 19, 20].includes(type) ? '已选' : '已打' }}
            <span>{{ chooseTagList.length }}</span>
            个标签
          </div>
          <div
            class="tab_box"
            style="
              max-height: calc(100% - 40px);
              overflow-y: auto;
              width: 100%;
              padding-bottom: 20px;
            "
          >
            <div class="tab choose_tab" v-for="(item, index) in chooseTagList" :key="index">
              <div
                v-if="item.source === 1"
                class="close_icon"
                style="margin: 0 4px 0 0; font-size: 16px"
              >
                <el-icon><i-star /></el-icon>
              </div>
              {{ item.name }}
              <div class="close_icon">
                <el-icon @click="tagClose(item, index)"><i-close-bold /></el-icon>
              </div>
            </div>
            <!-- <div class="mark_text" v-if="chooseTagList.length === 0">
              暂无相关标签，请从所有标签中选取哦~
            </div> -->
          </div>
        </div>
      </div>
    </div>

    <template #footer v-if="[3, 14, 15, 21, 12, 16, 17, 18, 19, 20].includes(type)">
      <div class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="saveDialog">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script setup>
import {
  add,
  deleteTag,
  operator,
  ModalOperator,
  creationOperator,
  creationDeleteTag,
  creationAdd,
  filterTagOperate,
  delFilterTag
} from '@/api/content_center/material_library.js'
import { throttle } from '@/utils/tools.js'
import { ElMessageBox, ElMessage } from 'element-plus'

import { getWorkDetail } from '@/api/content_center/content_repository.js'
const props = defineProps({
  addDialog: {
    type: Object,
    default: () => {
      return {
        id: null,
        show: true, // 是否显示弹窗
        chooseTagList: [],
        relatedMediaIds: []
      }
    },
    required: true
  },
  canDelete: {
    // 能操作删除标签
    type: Boolean,
    default: true
  },
  // 自定义的 subtitle
  subtitle: String,
  canCreate: {
    type: Boolean,
    default: true
  } // 是否可以新建标签
})
const dialog = ref()
const id = ref(null)
const type = ref(null) // 1设置作品的标签 3选择任务的标签【任务和素材用的是同一批标签】4设置创意模型的标签 5设置创意元素的标签  14选择创意模型的标签 15选择创意元素的标签 21线索数据-智能过滤 12 素材库设置标签  6 实拍库商品的设置标签 16 实拍库商品的选择标签 7 实拍库模特的设置标签 17 实拍库模特的选择标签 8 商品场景库的设置标签 18 商品场景库的选择标签 9 媒体资源库的设置标签 19 媒体资源库的选择标签 20 获取虚拟模特标签
const show = toRef(props.addDialog, 'show')
const loading = ref(false)
const showNone = ref(false) // 是否显示暂无相关标签的文案
const inputTabName = ref('')
const allTagList = ref([])
const chooseTagList = ref([])
// const allDelTag = ref([]) // 所有删除的标签
const newTag = reactive({
  show: false,
  name: ''
}) // 创建标签-输入框
const tagType = reactive({
  5: 1, // 设置创意元素的标签
  15: 1, // 选择创意元素的标签
  4: 2, // 设置创意模型的标签
  14: 2, // 选择创意模型的标签
  8: 11, // 商品场景库的设置标签
  18: 11, // 商品场景库的选择标签
  6: 6, // 实拍库商品的设置标签
  16: 6, // 实拍库商品的选择标签
  7: 7, // 实拍库模特的设置标签
  17: 7, // 实拍库模特的选择标签
  9: 10, // 媒体资源库的设置标签
  19: 10, // 媒体资源库的选择标签
  20: 9, // 虚拟模特选择标签
  22: 9 // 虚拟模特设置标签
}) // 每个来源各自的tagtype
// 页面初始化
function init() {
  loading.value = true
  console.log('init', props.addDialog)
  if (props.addDialog.id) {
    id.value = props.addDialog.id
    type.value = props.addDialog.type
    chooseTagList.value = JSON.parse(JSON.stringify(props.addDialog.chooseTagList))
    if (type.value === 1) {
      getCurrentTagList()
    } else {
      getTagList()
    }
  }
  // 任务过来的
  if (props.addDialog.origin === 'task') {
    type.value = 3
    chooseTagList.value = JSON.parse(JSON.stringify(props.addDialog.chooseTagList))
    getTagList()
  }
  // 12 素材标签
  if ([14, 15, 12, 16, 17, 18, 19, 20].includes(props.addDialog.type)) {
    type.value = props.addDialog.type
    chooseTagList.value = JSON.parse(JSON.stringify(props.addDialog.chooseTagList))
    getTagList()
  }
  // 智能过滤
  if (props.addDialog.type === 21) {
    type.value = props.addDialog.type
    console.log('props.addDialog.chooseTagList', props.addDialog.chooseTagList)
    chooseTagList.value = JSON.parse(JSON.stringify(props.addDialog.chooseTagList))
    // 获取所有要过滤的关键词(标签)
    getList21()
  }
}
init()
// 删除关键词
function _delFilterTag(e, index, parentIndex) {
  delFilterTag({ tagIds: [e.id] }).then(res => {
    if (res.code === 0) {
      allTagList.value[parentIndex].group.splice(index, 1)
      setNone()
      // 如果是关键词，右边也要删掉
      if (type.value === 21) {
        const { id } = e
        chooseTagList.value = chooseTagList.value.filter(x => x.id !== id)
        // 更新已选
        emits('updateTag', chooseTagList.value)
      }
    }
  })
}
// 获取要过滤的关键词
function getList21(isCreate = 0, name = '') {
  filterTagOperate({ isCreate, name })
    .then(res => {
      if (res.code === 0) {
        allTagList.value = res.data.list || []

        if (isCreate) {
          changeChoose()
          ElMessage({
            type: 'success',
            message: '新增成功'
          })
          const addItem = res.data.add.group[0]
          if (
            !(
              props.addDialog.max &&
              props.addDialog.max > 0 &&
              chooseTagList.value.length >= props.addDialog.max
            )
          ) {
            addTag(addItem)
          } else {
            newTag.show = false
          }
        }
        if (!isCreate) {
          if (inputTabName.value && res.data.isExactMatch === 0) {
            newTag.show = true
            newTag.name = inputTabName.value
          } else {
            newTag.show = false
            newTag.name = ''
          }
          changeChoose()
          setNone()
        }
      } else {
        if (newTag.show === false && newTag.name === '') {
          showNone.value = true
        }
      }
    })
    .finally(() => {
      loading.value = false
    })
}

// 清空输入框
function clearInput() {
  showNone.value = false
  newTag.show = false
  newTag.name = ''
  getTagList()
}
// 作品库--需要单独调接口获取已添加过的标签  素材库--是从页面传递过来的
function getCurrentTagList() {
  getWorkDetail({ id: id.value })
    .then(res => {
      if (res.code === 0) {
        chooseTagList.value = res.data.tagList || []
      }
      getTagList()
    })
    .catch(() => {
      getTagList()
    })
}
// 获取所有标签
function getTagList() {
  loading.value = true
  if (type.value === 21) {
    getList21(0, inputTabName.value)
    return
  }
  if ([4, 5, 14, 15, 6, 16, 7, 17, 8, 18, 9, 19, 20, 22].includes(type.value)) {
    const params = {
      source: props.addDialog.source,
      name: inputTabName.value,
      tagType: tagType[type.value]
        ? tagType[type.value]
        : type.value === 5 || type.value === 15
        ? 1
        : 2,
      isCreate: 0
    }
    if ([18, 20].includes(type.value)) {
      params.relatedMediaIds = props.addDialog.relatedMediaIds
    }
    add(params)
      .then(res => {
        if (res.code === 0) {
          allTagList.value = res.data.list || []

          if (inputTabName.value && res.data.isExactMatch === 0 && props.canCreate) {
            newTag.show = true
            newTag.name = inputTabName.value
          } else {
            newTag.show = false
            newTag.name = ''
          }
          changeChoose()
          console.log(res.data)
          setNone()
        } else {
          if (newTag.show === false && newTag.name === '') {
            showNone.value = true
          }
        }
        loading.value = false
      })
      .catch(() => {
        loading.value = false
      })
  } else {
    creationAdd({
      name: inputTabName.value,
      isCreate: 0
    })
      .then(res => {
        if (res.code === 0) {
          allTagList.value = res.data.list || []

          if (inputTabName.value && res.data.isExactMatch === 0) {
            newTag.show = true
            newTag.name = inputTabName.value
          } else {
            newTag.show = false
            newTag.name = ''
          }
          changeChoose()
          console.log(res.data)

          setNone()
        } else {
          if (newTag.show === false && newTag.name === '') {
            showNone.value = true
          }
        }
        loading.value = false
      })
      .catch(() => {
        loading.value = false
      })
  }
}
// 设置是否显示空数据的样式
function setNone() {
  if (newTag.show === false && newTag.name === '' && !inputTabName.value) {
    if (allTagList.value.length > 0) {
      let hasChild = false
      allTagList.value.forEach(x => {
        if (x.group && x.group.length > 0) {
          hasChild = true
        }
      })
      showNone.value = !hasChild
    } else {
      showNone.value = true
    }
  } else {
    showNone.value = false
  }
}
// function changeDel() {
// 之前是自己保存删除的列表，如果你已经删了，然后又加回来，需要把这个标签再删除列表里剔除
//   return new Promise((resolve, reject) => {
//     // if (allDelTag.value.length > 0) {
//     //   const newAllTagList = JSON.parse(JSON.stringify(allTagList.value))
//     //   const newAllTagList2 = JSON.parse(JSON.stringify(allTagList.value))
//     //   console.log(12, allTagList.value)
//     //   newAllTagList.forEach((x, i) => {
//     //     x.group.forEach((y, ii) => {
//     //       allDelTag.value.forEach((z, iii) => {
//     //         if (y.id === z.id) {
//     //           newAllTagList2[i].group.splice(ii, 1)
//     //         }
//     //       })
//     //     })
//     //   })
//     //   // 判断是否
//     //   let isHaveData = false
//     //   newAllTagList2.forEach(x => {
//     //     if (x.group && x.group.length > 0) {
//     //       isHaveData = true
//     //     }
//     //   })
//     //   if (isHaveData) {
//     //     allTagList.value = newAllTagList2
//     //   } else {
//     //     allTagList.value = newAllTagList
//     //     // 还原的id
//     //     let resId = null
//     //     if (newAllTagList.length === 1 && newAllTagList[0].group.length === 1) {
//     //       resId = newAllTagList[0].group[0].id
//     //     }
//     //     let resIndex = null
//     //     allDelTag.value.forEach((x, i) => {
//     //       if (x.id === resId) {
//     //         resIndex = i
//     //       }
//     //     })
//     //     if (resIndex !== null) {
//     //       allDelTag.value.splice(resIndex, 1)
//     //     }
//     //   }
//     // }
//     resolve()
//   })
// }

// 设置选中状态
function changeChoose(clearName) {
  // 是否是创建完标签的情况下，创建完标签会重新获取所有标签列表。需要等数据填充完之后再对标签列表进行选中状态的填充
  if (clearName) {
    nextTick(() => {
      allTagList.value.forEach(x => {
        x.group.forEach(y => {
          let stu = false
          chooseTagList.value.forEach(z => {
            if (y.id === z.id) {
              stu = true
            }
          })
          y.choose = stu
        })
      })
      newTag.show = false
      newTag.name = ''
    })
  } else {
    allTagList.value.forEach(x => {
      x.group.forEach(y => {
        let stu = false
        chooseTagList.value.forEach(z => {
          if (y.id === z.id) {
            stu = true
          }
        })
        y.choose = stu
      })
    })
  }
}
// 删除当前标签 type为1/4/5/6/7/8/9的调接口直接删除
const tagClose = throttle((item, index) => {
  if (type.value === 1) {
    creationOperator({
      id: id.value,
      deleteTagIds: [item.id]
    }).then(res => {
      if (res.code === 0) {
        chooseTagList.value.splice(index, 1)
        changeChoose()
      }
    })
  } else if (type.value === 5) {
    operator({
      id: id.value,
      tagType: type.value === 5 || type.value === 15 ? 1 : 2,
      deleteTagIds: [item.id]
    }).then(res => {
      if (res.code === 0) {
        chooseTagList.value.splice(index, 1)
        changeChoose()
      }
    })
  } else if (type.value === 4) {
    ModalOperator({
      id: id.value,
      tagType: type.value === 5 || type.value === 15 ? 1 : 2,
      deleteTagIds: [item.id],
      brandId: localStorage.getItem('brandInfo')
        ? JSON.parse(localStorage.getItem('brandInfo')).brandId
        : ''
    }).then(res => {
      if (res.code === 0) {
        chooseTagList.value.splice(index, 1)
        changeChoose()
      }
    })
  } else if ([6, 7, 8, 9, 22].includes(type.value)) {
    ModalOperator({
      id: id.value,
      tagType: tagType[type.value],
      deleteTagIds: [item.id],
      brandId: localStorage.getItem('brandInfo')
        ? JSON.parse(localStorage.getItem('brandInfo')).brandId
        : ''
    }).then(res => {
      if (res.code === 0) {
        chooseTagList.value.splice(index, 1)
        changeChoose()
      }
    })
  } else if ([3, 14, 15, 21, 12, 16, 17, 18, 19, 20].includes(type.value)) {
    chooseTagList.value.splice(index, 1)
    changeChoose()
  }
}, 300)
// 添加节点 type为1/4/5的 要调接口 直接添加
const addTag = throttle(item => {
  if (!item.choose) {
    if (
      props.addDialog.max &&
      props.addDialog.max > 0 &&
      chooseTagList.value.length >= props.addDialog.max
    ) {
      ElMessage({
        type: 'warning',
        message: `最多选择${props.addDialog.max}个标签`
      })
      return
    }
    if (type.value === 1) {
      creationOperator({
        id: id.value,
        addTagIds: [item.id]
      }).then(res => {
        if (res.code === 0) {
          addTagAfterFun(item)
        }
      })
    } else if (type.value === 5) {
      operator({
        id: id.value,
        tagType: type.value === 5 || type.value === 15 ? 1 : 2,
        addTagIds: [item.id],
        brandId: localStorage.getItem('brandInfo')
          ? JSON.parse(localStorage.getItem('brandInfo')).brandId
          : ''
      }).then(res => {
        if (res.code === 0) {
          addTagAfterFun(item)
        }
      })
    } else if (type.value === 4) {
      ModalOperator({
        id: id.value,
        tagType: type.value === 5 || type.value === 15 ? 1 : 2,
        addTagIds: [item.id]
      }).then(res => {
        if (res.code === 0) {
          addTagAfterFun(item)
        }
      })
    } else if ([6, 7, 8, 9, 22].includes(type.value)) {
      ModalOperator({
        id: id.value,
        tagType: tagType[type.value],
        addTagIds: [item.id]
      }).then(res => {
        if (res.code === 0) {
          addTagAfterFun(item)
        }
      })
    } else if ([3, 14, 15, 21, 12, 16, 17, 18, 19, 20].includes(type.value)) {
      addTagAfterFun(item)
    }
  }
}, 300)
function addTagAfterFun(item) {
  // 如果添加后发现这个标签已经添加过，就不在往当前标签里增加---去重
  let hasItem = false

  const newList = JSON.parse(JSON.stringify(chooseTagList.value))

  newList.forEach(x => {
    if (x.id === item.id) {
      hasItem = true
    }
  })
  console.log(hasItem)
  if (!hasItem) {
    chooseTagList.value.push(item)
  }

  changeChoose(true)
}
// 点击创建新标签
const addNewTag = throttle(() => {
  if (type.value === 21) {
    getList21(1, newTag.name)
    return
  }

  if ([4, 5, 14, 15, 6, 16, 7, 17, 8, 18, 9, 19, 20, 22].includes(type.value)) {
    add({
      source: props.addDialog.source,
      name: newTag.name,
      tagType: tagType[type.value]
        ? tagType[type.value]
        : type.value === 5 || type.value === 15
        ? 1
        : 2,
      isCreate: 1
    }).then(res => {
      if (res.code === 0) {
        allTagList.value = res.data.list || []
        changeChoose()

        ElMessage({
          type: 'success',
          message: '新增成功'
        })
        const addItem = res.data.add.group[0]
        if (
          !(
            props.addDialog.max &&
            props.addDialog.max > 0 &&
            chooseTagList.value.length >= props.addDialog.max
          )
        ) {
          addTag(addItem)
        } else {
          newTag.show = false
        }

        console.log(res.data)
      }
    })
  } else {
    creationAdd({
      name: newTag.name,

      isCreate: 1
    }).then(res => {
      if (res.code === 0) {
        allTagList.value = res.data.list || []
        changeChoose()

        ElMessage({
          type: 'success',
          message: '新增成功'
        })
        const addItem = res.data.add.group[0]
        if (
          !(
            props.addDialog.max &&
            props.addDialog.max > 0 &&
            chooseTagList.value.length >= props.addDialog.max
          )
        ) {
          if (type.value === 3) {
            addTagAfterFun(addItem)
          } else {
            addTag(addItem)
          }
        } else {
          newTag.show = false
        }

        console.log(res.data)
      }
    })
  }
}, 300)
// 删除所有节点
const tagAllClose = throttle((e, index, parentIndex) => {
  const tips =
    type.value === 21
      ? `是否确定删除关键词【${e.name}】？`
      : `是否确定删除标签库中的标签【${e.name}】？删除后不影响已经打标的业务数据`
  ElMessageBox.confirm(tips, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: ''
  }).then(() => {
    if (type.value === 21) {
      _delFilterTag(e, index, parentIndex)
      return
    }

    if ([4, 5, 14, 15, 6, 16, 7, 17, 8, 18, 9, 19, 20].includes(type.value)) {
      deleteTag({
        tagIds: [e.id],
        tagType: tagType[type.value]
          ? tagType[type.value]
          : type.value === 5 || type.value === 15
          ? 1
          : 2
      }).then(res => {
        if (res.code === 0) {
          console.log(e, index)
          // allDelTag.value.push(e)
          allTagList.value[parentIndex].group.splice(index, 1)
          setNone()
          // 在当前标签也删除这个节点
          // let chooseTagIndex = null
          // chooseTagList.value.forEach((x, y) => {
          //   if (x.id === e.id) {
          //     chooseTagIndex = y
          //   }
          // })
          // if (chooseTagIndex !== null) {
          //   chooseTagList.value.splice(chooseTagIndex, 1)
          // }
          // console.log(allTagList.value, allDelTag.value)
        }
      })
    } else {
      creationDeleteTag({
        tagIds: [e.id]
      }).then(res => {
        if (res.code === 0) {
          console.log(e, index)
          // allDelTag.value.push(e)
          allTagList.value[parentIndex].group.splice(index, 1)
          setNone()
          // 在当前标签也删除这个节点
          // let chooseTagIndex = null
          // chooseTagList.value.forEach((x, y) => {
          //   if (x.id === e.id) {
          //     chooseTagIndex = y
          //   }
          // })
          // if (chooseTagIndex !== null) {
          //   chooseTagList.value.splice(chooseTagIndex, 1)
          // }
          // console.log(allTagList.value, allDelTag.value)
        }
      })
    }
  })
}, 300)
const emits = defineEmits(['updateTag'])
function handleClose(done) {
  if (
    type.value !== 3 &&
    type.value !== 14 &&
    type.value !== 15 &&
    type.value !== 21 &&
    type.value !== 12 &&
    type.value !== 16 &&
    type.value !== 17 &&
    type.value !== 18 &&
    type.value !== 19 &&
    type.value !== 20
  ) {
    emits('updateTag', chooseTagList.value)
  }
  done()
}
// 弹窗的取消操作
function closeDialog() {
  dialog.value.handleClose()
}
// 弹窗的确定操作
const saveDialog = throttle(() => {
  emits('updateTag', chooseTagList.value)
  closeDialog()
}, 700)
// 检查是否有表情包
function retEmit(e) {
  console.log(e)
  if (e) {
    const reg = /[^\u4e00-\u9fa5a-zA-Z0-9]/gi
    inputTabName.value = e.replace(reg, '')
  } else {
    newTag.show = false
    newTag.name = ''
    getTagList()
  }
}
// 一键全选
const allChooseFun = throttle(() => {
  // 全选
  allTagList.value.forEach(x => {
    if (x.group && x.group.length > 0) {
      x.group.forEach(y => {
        if (!y.choose) {
          y.choose = true
          chooseTagList.value.push(y)
        }
      })
    }
  })
}, 300)

// 清空
const clearChooseFun = throttle(() => {
  chooseTagList.value = []
  allTagList.value.forEach(x => {
    if (x.group && x.group.length > 0) {
      x.group.forEach(y => {
        y.choose = false
      })
    }
  })
}, 300)
</script>
<style lang="scss" scoped>
.el-dialog__body {
  .add_tab_box {
    display: flex;
    .add_btn {
      margin-left: 24px;
    }
  }
  .addTag_box {
    width: max-content;
    border: 1px solid rgba(153, 153, 153, 0.5);
    padding: 0px 25px 0 20px;
    border-radius: 16px;
    font-size: 14px;
    font-weight: 400;
    color: #303133;
    line-height: 28px;
    margin-top: 10px;
    height: 28px;
    cursor: pointer;
  }
  .line {
    width: 100%;
    height: 1px;
    margin-top: 16px;
    background: #ebedf0;
  }
  .current_tab_box {
    margin-top: 16px;
    .label {
      font-size: 14px;
      font-weight: 400;
      color: #303133;
      line-height: 22px;
    }
    .choose_label {
      font-size: 14px;
      font-weight: 400;
      color: #606266;
      line-height: 20px;
      span {
        color: #364fcd;
      }
    }
    .tab_box {
      display: flex;
      flex-wrap: wrap;

      .tab {
        margin-right: 10px;
        margin-top: 12px;
        min-height: 24px;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        padding: 0px 8px;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 400;
        color: #303133;
        line-height: 20px;

        border: 1px solid #dcdee0;
        .close_icon {
          // position: absolute;
          width: 16px;
          height: 16px;
          font-size: 14px;
          // top: 7px;
          // right: 7px;
          cursor: pointer;
          // opacity: 0;
          margin-left: 4px;
          color: #303133;
        }
      }
      .choose_tab {
        border: 1px solid #364fcd;

        background: #364fcd;
        color: #fff;
        .close_icon {
          color: #fff;
        }
      }
    }
  }

  .all_tab_box {
    .tab {
      cursor: pointer;
    }
  }
  .all_tab_title {
    margin-top: 24px;
    height: 20px;
    font-size: 14px;
    font-weight: 400;
    color: #303133;
    line-height: 20px;
  }
  .none_tab {
    padding-right: 16px;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
  }
  .all_tab_box {
    position: relative;
    height: 254px;
    overflow-y: auto;
    &::-webkit-scrollbar {
      // display: none;
    }
    .tab_box {
      //      margin-top: 6px;
      .label {
        margin-bottom: 12px;
        height: 20px;
        font-size: 14px;
        font-weight: 400;
        color: #303133;
        line-height: 20px;
      }
      .tab_box {
        display: flex;
        .tab {
          margin-right: 24px;
          height: 28px;
        }
      }
    }
  }
}
:deep(.tab:hover) {
  background: #f6f8fa;
}

.mark_text {
  width: 100%;
  text-align: center;
  height: 30px;
  line-height: 30px;
  font-size: 12px;
}
.box_container {
  width: 100%;
  height: 450px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: flex-start;
  .half_box {
    flex: 1;
    height: 100%;
    box-sizing: border-box;
  }
  .half_box:last-child {
    // margin-left: 5px;
    padding-left: 16px;
    border-left: 1px solid #ebedf0;
    margin-top: 0 !important;
    padding-top: 16px;
  }
  .half_box:first-child {
    padding-right: 10px;
    padding-bottom: 20px;
  }
}
.left_all_btn {
  position: absolute;
  right: 16px;
  top: 16px;
  font-size: 14px;
  color: #364fcd;
  line-height: 22px;
  cursor: pointer;
}
</style>
