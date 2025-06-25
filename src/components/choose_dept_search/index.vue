<template>
  <div>
    <el-popover
      @click="showOrHidePopver"
      :visible="visible"
      placement="bottom"
      :popper-class="{ dept_search_popper: true, shoot_dept_search_popper: shootDeptSearch }"
      trigger="click"
      ref="popoverRef"
    >
      <template #reference>
        <!-- 输入框+选中的部门tag -->
        <div
          v-click-outside="onClickOutside"
          class="input_box"
          :style="disabled ? 'background:#f5f7fa' : visible ? 'border-color:#364fcd' : ''"
        >
          <!-- 选中的部门tag -->
          <div class="input_choose" v-if="chooseDeptId && chooseDeptId.length > 0">
            <div class="one_choose">
              <div class="one_choose_name line-hidden1" :title="getFirstName(chooseDeptId[0])">
                {{ chooseDeptId[0].label || '' }}
              </div>
              <!-- 删除第一个部门的入口 -->
              <el-icon v-if="!disabled" class="one_choose_icon" @click.stop="delFirstChoose">
                <i-close />
              </el-icon>
            </div>
            <!-- :title="getOtherName()" -->
            <div class="one_more" v-if="chooseDeptId && chooseDeptId.length > 1">
              + {{ chooseDeptId.length - 1 }}
            </div>
          </div>
          <!-- 输入框 获取焦点的时候就打开弹出框-->
          <el-input
            :readonly="readonly"
            :disabled="disabled"
            class="input_input"
            :placeholder="
              chooseDeptId && chooseDeptId.length > 0
                ? '请选择'
                : `请选择${searchLabel || '矩阵号部门'}`
            "
            type="text"
            v-model.trim="inputValue"
            @focus="showPopver"
            @keyup.enter="getDpetByName"
            @input="inputFun"
          ></el-input>
          <!-- 下拉/上拉/清空的ICON -->
          <div :class="{ input_icon_box: true, input_icon_rotate: visible }">
            <div
              @click.stop="showPopver"
              class="down_icon"
              :style="
                clearable && multiple
                  ? chooseDeptId && chooseDeptId.length > 0
                    ? ''
                    : 'display:flex !important'
                  : 'display:flex !important'
              "
            >
              <el-icon>
                <i-arrow-up />
              </el-icon>
            </div>
            <div
              v-if="clearable && multiple"
              class="close_icon"
              :style="chooseDeptId && chooseDeptId.length > 0 ? '' : 'display:none !important'"
            >
              <el-icon v-if="chooseDeptId && chooseDeptId.length > 0" @click.stop="clearAndHideFun">
                <i-circle-close />
              </el-icon>
            </div>
          </div>
        </div>
      </template>
      <!-- 弹出框的数据 分搜索后的数据 单列  和   级联选择器 多列-->
      <div
        class="content_box"
        v-loading="treeLoading || (searchLoading && searchParam.pageNumber === 1)"
      >
        <!-- 单列 -->
        <div class="none_data" v-if="popoverType === 2">
          <template v-if="searchList && searchList.length > 0">
            <div
              ref="searchRef"
              class="search_box"
              :infinite-scroll-delay="500"
              v-infinite-scroll="loadFun"
              :infinite-scroll-distance="50"
              :infinite-scroll-immediate="false"
              :infinite-scroll-disabled="searchList.length >= searchParam.total"
            >
              <!-- 多选框 -->
              <template v-if="multiple">
                <el-checkbox
                  :title="checkShowName(item)"
                  @change="checkChange($event, item)"
                  v-for="item in searchList"
                  :key="item.fullId"
                  :label="item.id"
                  :checked="item.checked"
                  v-model="item.checked"
                >
                  {{ checkShowName(item) }}
                </el-checkbox>
              </template>
              <!-- 单选框 -->
              <template v-else>
                <div
                  class="search_radio_box"
                  @click.stop="radioChange(item, index)"
                  v-for="(item, index) in searchList"
                  :key="item.value"
                >
                  <div :class="{ radio_box: true, radio_check: item.checked }"></div>
                  <div
                    :style="item.checked ? 'color:#364fcd' : ''"
                    class="serach_radio_name line-hidden1"
                    :title="checkShowName(item)"
                  >
                    {{ checkShowName(item) }}
                  </div>
                </div>
              </template>
              <div class="xm_pullUpToLoadMore">
                <img
                  src="/public/loading.gif"
                  v-if="searchLoading && searchParam.pageNumber > 1"
                  alt=""
                />
                {{
                  searchLoading
                    ? searchParam.pageNumber === 1
                      ? ''
                      : '加载中...'
                    : searchList.length >= searchParam.total
                    ? searchList.length > 10
                      ? '已经到底了~'
                      : ''
                    : '上拉加载更多~'
                }}
              </div>
            </div>
          </template>
          <div class="none_data" v-if="!(searchList && searchList.length > 0) && !searchLoading">
            暂无数据
          </div>
        </div>
        <!-- 多列 -->
        <div class="cascader_parent" ref="cascaderRef" v-else-if="popoverType === 1">
          <div class="cascader_box" ref="cascaderChildRef">
            <div class="one_cascader_pane" v-for="(item, index) in cascaderList" :key="index">
              <template v-if="item && item.length > 0">
                <div
                  class="pane_data"
                  @click="addLastFun(x, index)"
                  v-for="(x, y) in item"
                  :key="y"
                >
                  <div class="pane_data_left">
                    <!-- 多选框 -->
                    <el-checkbox
                      v-if="multiple"
                      @click.stop=""
                      @change="cascaderCheckChange($event, x, index, y)"
                      :key="x.value"
                      :label="x.value"
                      :checked="x.checked"
                      v-model="x.checked"
                    >
                      {{}}
                    </el-checkbox>
                    <!-- 单选框 -->
                    <div
                      :class="{ radio_box: true, radio_check: x.checked }"
                      v-else
                      :key="x.value"
                      :label="x.value"
                      :checked="x.checked"
                      @click.stop="cascaderRadioChange(x, index, y)"
                    ></div>
                    <div
                      :title="x.label"
                      :class="{
                        pane_data_label: true,
                        'line-hidden1': true,
                        pane_data_blue: x.isBlue || x.checked,
                        pane_data_bold: boldFun(x.value, index)
                      }"
                    >
                      {{ x.label }}
                    </div>
                  </div>
                  <!-- 加载下一级中显示Loading 否则就显示向右的箭头 -->
                  <el-icon
                    class="is-loading"
                    v-if="cascaderLoading && x.value === cascaderClickValue"
                  >
                    <i-loading />
                  </el-icon>
                  <el-icon
                    class="pane_data_icon"
                    v-if="!x.leaf && !(cascaderLoading && x.value === cascaderClickValue)"
                  >
                    <i-arrow-right />
                  </el-icon>
                </div>
              </template>
              <div class="none_data" style="width: 100%; height: 100%" v-else>暂无数据</div>
            </div>
          </div>
        </div>
      </div>
    </el-popover>
  </div>
</template>
<script setup>
import { ClickOutside as vClickOutside } from 'element-plus'
import { getLazyDeptTree, queryDepartment } from '@/api/main/dept.js'
import { debounce, throttle } from '@/utils/tools'
const props = defineProps({
  shootDeptSearch: {
    type: Boolean,
    default: false
  }, // 设置弹出窗最大高度为206
  searchLabel: {
    type: String,
    default: ''
  },
  clearable: {
    type: Boolean,
    default: true
  }, // 多选时是否要一键清空所有
  multiple: {
    type: Boolean,
    default: true
  }, // 是否多选
  isUsePermission: {
    type: Boolean,
    default: false
  }, // 是否受数据权限控制
  disabled: {
    type: Boolean,
    default: false
  }, // 是否禁用该组件
  readonly: {
    type: Boolean,
    default: false
  }, // 是否只读
  returnDataWithLevel: {
    type: Boolean,
    default: false
  }, // 多选时是否返回选中ID的层级 例如[[0,12]]
  defaultValue: {
    type: Array,
    default: () => {
      return []
    }
  }, // 默认值 多选是[{☆fullIds:[],//全路径ID fullPath:'',//全路径名称 ☆value:null,//直属部门ID ☆label:'',//部门名称 }] 单选是[0]  如果要默认选中跟部门就传[0]
  isConfigPermission: {
    type: Boolean,
    default: false
  }
})
const {
  clearable,
  shootDeptSearch,
  disabled,
  searchLabel,
  multiple,
  isUsePermission,
  returnDataWithLevel,
  defaultValue,
  isConfigPermission
} = toRefs(props)
console.log(
  '矩阵号部门组件初始化',
  clearable.value,
  shootDeptSearch.value,
  disabled.value,
  multiple.value,
  isUsePermission.value,
  returnDataWithLevel.value,
  defaultValue.value
)
const visible = ref(false) // 是否显示弹出框
const popoverType = ref(1) // 显示弹出框内容的类型 1级联选择器 2搜索
const inputValue = ref('') // 输入框的内容
const searchList = ref([]) // 根据输入框查询出来的单列多选框列表
const searchLoading = ref(false) // 单列多选框的列表加载Loading
const chooseDeptId = ref([]) // 最终选择的部门ID 格式[{value:null,label:'',fullIds:[],fullPath:''}]
const treeLoading = ref(true) // 初次加载多列
const searchParam = ref({
  pageNumber: 1,
  pageSize: 20,
  total: null
}) // 单列多选框的搜索分页条件
// 输入框的Input时间，当输入框内容为空时，显示多列多选框
const inputFun = debounce(name => {
  if (!name) {
    // 输入查询出来的列表清空
    searchList.value = []
    setBlue()
    popoverType.value = 1
    nextTick(() => {
      unref(popoverRef).popperRef?.popperInstanceRef?.update()
    })
  }
}, 500)
// 输入框回车查询输入后符合条件的数据
const getDpetByName = debounce(() => {
  // 如果输入框内容为空，则显示多选多选框
  if (!inputValue.value) {
    // 输入查询出来的列表清空
    searchList.value = []
    setBlue()
    popoverType.value = 1
    return
  }
  // 反之显示单列多选框
  popoverType.value = 2
  searchParam.value.pageNumber = 1
  searchParam.value.total = 0
  // 查询
  getSearchList(true)
}, 500)

function loadFun() {
  searchParam.value.pageNumber++
  getSearchList()
}
const searchRef = ref()
// init 代表是第一次请求 ，要让滚动条回到顶部
function getSearchList(init) {
  searchLoading.value = true
  if (init) {
    searchRef.value?.scrollTo(0, 0)
  }
  queryDepartment({
    deptName: inputValue.value,
    pageNumber: searchParam.value.pageNumber,
    pageSize: searchParam.value.pageSize,
    isUsePermission: !!isUsePermission.value,
    parentIdsContainsSelf: true
  })
    .then(res => {
      if (res.code === 0) {
        // 查询返回的name是全路径名字，但是我们显示上不需要显示根部门名字
        // 返回的父ID ，有的情况是返回0/  有的是返回0/1  所以 全路径ID 如果是0/ ，那就手动拼上子ID 否则直接取父ID
        const list =
          res.data && res.data.records && res.data.records.length > 0 ? res.data.records : []
        const resultList = list.map(x => {
          const nameList = x.name ? x.name.split('/') : []
          return {
            checked: chooseDeptId.value.findIndex(y => y.value === x.departmentId) > -1,
            id: x.departmentId,
            name: nameList && nameList.length > 0 ? nameList[nameList.length - 1] : '',
            fullPath: nameList && nameList.length > 1 ? nameList.slice(1).join('/') : x.name,
            fullId: x.parentIds
              ? x.parentIds.substring(x.parentIds.length - 1) === '/'
                ? x.parentIds + x.departmentId
                : x.parentIds
              : x.departmentId
          }
        })
        if (searchParam.value.pageNumber === 1) {
          searchList.value = resultList
        } else {
          searchList.value = searchList.value.concat(resultList)
        }
        searchParam.value.total = res.data.total
      }
      searchLoading.value = false
      nextTick(() => {
        // 重新跟新popover位置
        unref(popoverRef).popperRef?.popperInstanceRef?.update()
      })
    })
    .catch(() => {
      searchLoading.value = false
    })
}

const isDelAfter = ref(false)
// 打开弹出框
function showPopver() {
  if (isDelAfter.value) {
    popoverType.value = null
    nextTick(() => {
      popoverType.value = 1
    })
  }
  isDelAfter.value = false

  setBlue()
  visible.value = true
  nextTick(() => {
    unref(popoverRef).popperRef?.popperInstanceRef?.update()
  })
}
// 显示或隐藏弹出框
function showOrHidePopver() {
  if (disabled.value) {
    return
  }
  if (visible.value) {
    clearPopver()
    visible.value = false
  } else {
    visible.value = true
    nextTick(() => {
      unref(popoverRef).popperRef?.popperInstanceRef?.update()
    })
  }
}
// 清空弹出框的数据
function clearPopver() {
  searchParam.value.pageNumber = 1
  inputValue.value = ''
  popoverType.value = 1
  searchList.value = []
}

const popoverRef = ref()
const onClickOutside = e => {
  if (visible.value && !unref(popoverRef).popperRef.contentRef.contains(e.target)) {
    visible.value = false
    clearPopver()
  }
}
function checkShowName(e) {
  if (e.fullPath && e.fullPath.indexOf('/') > -1) {
    return e.fullPath
  } else {
    return e.name || ''
  }
}
// 单列多选框选中的数据
const checkChange = (e, data) => {
  if (e) {
    // 顾家多层级架构，会存在部门ID一样，但是父部门不一样的情况。所以根据部门名称查询会有多条数据，但是实际上都是同一个部门
    // 所以添加的时候先校验一下该部门ID是否一样加过了
    const index = chooseDeptId.value.findIndex(x => x.value === data.id)
    if (index > -1) {
      return
    }
    // 选中 往chooseDeptId添加数据
    let fullIds = []
    if (data.fullId && data.fullId.indexOf(';') > -1) {
      fullIds = data.fullId
        .split(';')[0]
        .split('/')
        .map(x => {
          return parseInt(x)
        })
    } else {
      fullIds = data.fullId.split('/').map(x => {
        return parseInt(x)
      })
    }
    chooseDeptId.value.push({
      value: data.id,
      label: data.name,
      fullIds: fullIds,
      fullPath: data.fullPath
    })
  } else {
    // 取消选中 在chooseDeptId删除数据
    const index = chooseDeptId.value.findIndex(y => y.value === data.id)
    if (index > -1) {
      chooseDeptId.value.splice(index, 1)
    }
  }
}
// 单列单选框选中的数据
const radioChange = (data, index) => {
  if (data.checked) {
    // 不做任何反应，因为不能取消选中
  } else {
    searchList.value.forEach(x => {
      x.checked = x.fullId === data.fullId
    })
    // 选中 往chooseDeptId添加数据
    const fullIds = data.fullId.split('/').map(x => {
      return parseInt(x)
    })
    chooseDeptId.value = [
      {
        value: data.id,
        label: data.name,
        fullIds: fullIds,
        fullPath: data.fullPath
      }
    ]
  }
}

const cascaderList = ref([]) // 选择器列表
const cascaderClickParent = ref('') // 选择器要去加载的对应父ID 后端需要根据这个返回子部门对应的parentID
const cascaderClickLevel = ref(0) // 选择器要去加载的第几层级
const cascaderClickValue = ref(null) // 选择器要去加载的ID
const cascaderLoading = ref(false)
// 初始化选择器
function init() {
  // 如果有
  if (defaultValue.value && defaultValue.value.length > 0) {
    console.log('初始化选择器', defaultValue.value)

    const chooseRootId =
      defaultValue.value && defaultValue.value.length === 1 && defaultValue.value[0] === 0
    if (chooseRootId) {
      // 默认选择根部门的话传true
      getDeptTreeFun(chooseRootId, true)
    } else {
      chooseDeptId.value = JSON.parse(JSON.stringify(defaultValue.value))
      getDeptTreeFun(null, true)
    }
  } else {
    getDeptTreeFun(null, true)
  }
}
// chooseRootId  默认选择根部门
function getDeptTreeFun(chooseRootId, isInit) {
  cascaderLoading.value = true
  getLazyDeptTree({
    deptId: cascaderClickValue.value,
    deptIdParentPath: cascaderClickParent.value || '',
    isUsePermission: !!isUsePermission.value,
    isConfigPermission: !!isConfigPermission.value
  })
    .then(res => {
      if (res.code === 0) {
        // 树返回的name是全路径名字，但是我们显示上不需要显示根部门名字
        // 返回的父ID ，有的情况是返回 null 空的 有的是返回0/1 有的是返回0/1;2/1 有的返回0/
        // 所以 如果是null ，那就取直属ID 如果是0/ 那就是拼上直属ID 如果是0/1;2/1 以;分割，取第一个 如果是0/1 那就是0/1
        const resData = res.data || []
        if (chooseRootId) {
          chooseDeptId.value = [
            {
              value: resData[0].id,
              label: resData[0].name,
              fullIds: [resData[0].id],
              fullPath: resData[0].fullPath
            }
          ]
        }
        const l1 = chooseDeptId.value.map(x => x.value)
        const l2 = [...new Set(l1)]
        const arr = chooseDeptId.value.map(x => x.fullIds)
        const arr2 = arr.flat(Infinity)
        const arr3 = [...new Set(arr2)]

        const nodes = resData.map(item => ({
          value: item.id,
          label: item.name,
          checked: l2.findIndex(x => x === item.id) > -1, // 是否选中
          isBlue: arr3.findIndex(x => x === item.id) > -1, // 是否要标蓝--自己选中，或选中的父级都要标蓝
          fullPath: item.fullPath,
          fullId: item.parentIds
            ? item.parentIds.indexOf(';') > -1
              ? item.parentIds.split(';')[0]
              : item.parentIds.substring(item.parentIds.length - 1) === '/'
              ? item.parentIds + item.id
              : item.parentIds
            : item.id,
          leaf: !item.hasChildren // 是否有下一页
        }))

        const casList = []
        if (cascaderClickLevel.value === 0) {
          cascaderList.value[cascaderClickLevel.value] = nodes
        } else {
          for (let i = 0; i <= cascaderClickLevel.value; i++) {
            if (i === cascaderClickLevel.value) {
              casList[i] = nodes
            } else {
              casList[i] = cascaderList.value[i]
            }
          }
          cascaderList.value = JSON.parse(JSON.stringify(casList))
        }

        nextTick(() => {
          // 加载完，要滚到最右边，把新加载的数据显示出来
          const width = cascaderChildRef.value?.clientWidth
          cascaderRef.value?.scrollTo(width, 0)
          cascaderLoading.value = false
        })
      } else {
        cascaderLoading.value = false
      }
      nextTick(() => {
        unref(popoverRef)?.popperRef?.popperInstanceRef?.update()
        treeLoading.value = false
      })
    })
    .catch(() => {
      cascaderLoading.value = false
      treeLoading.value = false
    })
}
const cascaderRef = ref()
const cascaderChildRef = ref()
// 加载下级数据
const addLastFun = (data, level) => {
  // 没有子部门就不加载
  if (!data.leaf) {
    // 如果展开的最后一级部门Id和当前部门一样就不重新加载
    if (data.value === cascaderClickValue.value) {
      return
    }
    // 如果上一个还没加载完，就不加载
    if (cascaderLoading.value) {
      return
    }
    cascaderClickParent.value = data.fullId
    cascaderClickLevel.value = level + 1
    cascaderClickValue.value = data.value
    getDeptTreeFun()
  }
}
init()
// 多列展开的哪一行加粗
function boldFun(e, index) {
  if (index < cascaderList.value.length - 1) {
    return cascaderClickParent.value.split('/').findIndex(y => parseInt(y) === e) > -1
  } else {
    return false
  }
}
// 多列多选框的选中方法
function cascaderCheckChange(e, data, index, index2) {
  if (e) {
    // 选中 往chooseDeptId添加数据
    let fullIds = []
    if (data.fullId && data.fullId.indexOf(';') > -1) {
      fullIds =
        (data.fullId + '').indexOf('/') > -1
          ? data.fullId
              .split(';')[0]
              .split('/')
              .map(x => {
                return parseInt(x)
              })
          : [parseInt(data.fullId)]
    } else {
      fullIds =
        (data.fullId + '').indexOf('/') > -1
          ? data.fullId.split('/').map(x => {
              return parseInt(x)
            })
          : [parseInt(data.fullId)]
    }
    chooseDeptId.value.push({
      value: data.value,
      label: data.label,
      fullIds: fullIds,
      fullPath: data.fullPath
    })
    setBlue()
  } else {
    // 取消选中 在chooseDeptId删除数据
    const index = chooseDeptId.value.findIndex(y => y.value === data.value)
    if (index > -1) {
      chooseDeptId.value.splice(index, 1)
    }

    setBlue()
  }
}
// 多列单选框的选中方法
function cascaderRadioChange(data, index, index2) {
  if (data.checked) {
    // 不做任何反应，因为不能取消选中
  } else {
    // 选中
    const fullIds =
      (data.fullId + '').indexOf('/') > -1
        ? data.fullId.split('/').map(x => {
            return parseInt(x)
          })
        : [parseInt(data.fullId)]
    chooseDeptId.value = [
      {
        value: data.value,
        label: data.label,
        fullIds: fullIds,
        fullPath: data.fullPath
      }
    ]
    setBlue()
  }
}
// 给父级标蓝
function setBlue() {
  nextTick(() => {
    const l1 = chooseDeptId.value.map(x => x.value)
    const l2 = [...new Set(l1)]
    const arr = chooseDeptId.value.map(x => x.fullIds)
    const arr2 = arr.flat(Infinity)
    const arr3 = [...new Set(arr2)]

    for (let i = 0; i < cascaderList.value.length; i++) {
      setOneBlue(cascaderList.value[i], arr3, l2)
    }
  })
}
function setOneBlue(data, data2, data3) {
  data.forEach(y => {
    let isBlue = false
    let isCheck = false
    data3.forEach(z => {
      if (y.value === z) {
        isCheck = true
      }
    })
    data2.forEach(x => {
      if (y.value === x) {
        isBlue = true
      }
    })
    y.isBlue = isBlue
    y.checked = isCheck
  })
}
// 删除第一个选中的结果
const delFirstChoose = throttle(() => {
  chooseDeptId.value.splice(0, 1)
  isDelAfter.value = true
  visible.value = false
  clearPopver()
}, 500)
// 获取部门层级多维数组列表
function getMoreInfo() {
  return chooseDeptId.value
}
// 设置默认值
function setDefaultValueFun(e) {
  chooseDeptId.value = JSON.parse(JSON.stringify(e))
  isDelAfter.value = true
}
// 清空数据
function clearFun() {
  chooseDeptId.value = []
  isDelAfter.value = true
}
// 清空并隐藏弹出框
const clearAndHideFun = throttle(() => {
  clearFun()
  visible.value = false
  clearPopver()
}, 500)
// 重置多列
function resetMoreLine() {
  if (cascaderList.value && cascaderList.value.length > 0) {
    const list = JSON.parse(JSON.stringify(cascaderList.value))
    cascaderList.value = [list[0]]
    cascaderClickParent.value = ''
    cascaderClickLevel.value = 0
    cascaderClickValue.value = null
    inputValue.value = ''
    chooseDeptId.value = []
    searchList.value = []
    searchParam.value = {
      pageNumber: 1,
      pageSize: 20,
      total: null
    }
  }
}
defineExpose({ setDefaultValueFun, clearFun, getMoreInfo, resetMoreLine })

const emits = defineEmits(['updateDeptIds', 'updateDeptInfos'])
// 回显多选
watch(
  () => chooseDeptId.value,
  val => {
    console.log('最终选中的数据', val)
    emits('updateDeptInfos', val)
    // 返回ID层级 返回格式 多维数组
    if (returnDataWithLevel.value) {
      emits(
        'updateDeptIds',
        val.map(x => x.fullIds)
      )
    } else if (multiple.value) {
      // 多选情况 返回格式 一维数组
      emits(
        'updateDeptIds',
        val.map(x => x.value)
      )
    } else {
      // 单选情况 返回格式 字符串或数字
      if (val && val.length > 0) {
        emits('updateDeptIds', val[0].value)
      } else {
        emits('updateDeptIds', null)
      }
    }
  },
  { deep: true }
  // immediate: true,
)

// 监听默认数据
watch(
  () => props.defaultValue,
  val => {
    if (val && val.length > 0) {
      chooseDeptId.value = JSON.parse(JSON.stringify(val))
    }
  },
  { deep: true }
)
//  // 全路径不显示根部门名称
// function getOneName(data) {
//   if (data.indexOf(';') > -1) {
//     const lll = data.split(';')
//     const nameL = []
//     lll.forEach(x => {
//       let namex = ''
//       const fullPathList = x ? x.split('/') : []
//       if (fullPathList && fullPathList.length > 1) {
//         namex = fullPathList.slice(1).join('/')
//       }
//       nameL.push(namex)
//     })
//     return nameL.join(';')
//   } else {
//     let name = ''
//     const fullPathList = data ? data.split('/') : []
//     if (fullPathList && fullPathList.length > 1) {
//       name = fullPathList.slice(1).join('/')
//     }
//     return name
//   }
// }
// 鼠标挪到选中的部门名称上 显示第一个选中的父部门名称
function getFirstName(data) {
  if (data.fullPath && !multiple.value) {
    // return getOneName(data.fullPath)
    return data.fullPath
  } else {
    const name = data.label
    if (name) {
      if (name.indexOf('/') > -1) {
        const list = name.split('/')
        return list.slice(0, list.length - 1).join('/')
      } else {
        return name
      }
    } else {
      return ''
    }
  }
}
// // 鼠标挪到+1上 显示选中的剩下几个部门名称
// function getOtherName() {
//   if (chooseDeptId.value && chooseDeptId.value.length > 1) {
//     const list = chooseDeptId.value.map(x => x.label)
//     console.log(list, 'x')
//     return list.slice(1).join(';')
//   } else {
//     return ''
//   }
// }
</script>
<style lang="scss" scoped>
.search_box {
  max-width: 800px;
  min-width: 206px;
  min-height: 204px;
  max-height: 400px;
  overflow: auto;

  .el-checkbox {
    padding: 0 20px;
    line-height: 34px;
    display: flex;
    margin-right: 0;
  }
  :deep(.el-checkbox__label) {
    width: calc(100% - 0px);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
.input_box {
  width: 230px;
  border: 1px solid rgb(220, 223, 230);
  border-radius: 4px;
  display: flex !important;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  position: relative;
  .input_choose {
    line-height: 32px;
    z-index: 1;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    .one_choose {
      margin-left: 6px;
      color: rgb(144, 147, 153);
      font-size: 12px;
      background: rgb(240, 242, 245);
      border-radius: 4px;
      max-width: 100px;
      line-height: 22px;
      padding: 0 5px 0 9px;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      .one_choose_icon {
        cursor: pointer;
        &:hover {
          background: #909399;
          border-radius: 100%;
          width: 12px;
          height: 12px;
          color: #fff;
        }
      }
    }
    .one_more {
      margin-left: 6px;
      color: rgb(144, 147, 153);
      font-size: 12px;
      background: rgb(240, 242, 245);
      border-radius: 4px;
      max-width: 100px;
      line-height: 22px;
      padding: 0 9px;
    }
  }
  .input_input {
    flex: 1;
  }
  .input_icon_box {
    cursor: pointer;
    width: 32px;
    height: 32px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    .down_icon {
      display: flex;
      transition: transform 0.3s;
      width: 14px;
      height: 14px;
      color: #c0c4cc !important;
      transform: rotate(180deg);
    }
    .close_icon {
      width: 14px;
      height: 14px;
      display: none;
      color: #c0c4cc !important;
    }

    .el-icon {
      width: 14px;
      height: 14px;
    }
  }
  .input_icon_box:hover {
    .close_icon {
      display: flex;
    }
    .down_icon {
      display: none;
    }
  }
  .input_icon_rotate {
    .down_icon {
      transition: transform 0.3s;
      transform: rotate(0);
    }
  }
  :deep(.el-input__inner) {
    border: none !important;
    padding-right: 0 !important;
  }
}
.none_data {
  max-width: 800px;
  min-width: 206px;
  min-height: 204px;
  padding: 8px 0;
  max-height: 400px;
  font-size: 14px;
  color: #909399;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}
.cascader_parent {
  max-width: 800px;
  overflow-x: auto;
}
.cascader_box {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  width: max-content;

  .one_cascader_pane {
    cursor: pointer;
    width: 206px;
    padding: 8px 0px 8px 0;
    height: 206px;
    overflow-y: hidden;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    .pane_data {
      padding-right: 8px;
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      &:hover {
        background: #f5f7fa;
      }
      .pane_data_left {
        line-height: 34px;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        .pane_data_label {
          width: 140px;
        }
        .pane_data_blue {
          color: #364fcd;
          font-weight: bold;
        }
        .pane_data_bold {
          font-weight: bold;
        }
      }
      .el-checkbox {
        padding: 0 0 0 20px;
        line-height: 34px;
        display: flex;
      }
    }
  }
  .one_cascader_pane:hover {
    overflow-y: auto;
    .pane_data {
      padding-right: 1px;
    }
  }
  .one_cascader_pane + .one_cascader_pane {
    border-left: 1px solid rgb(228, 231, 237);
  }
}
.xm_pullUpToLoadMore {
  padding-bottom: 15px;
}

.radio_box {
  cursor: pointer;
  width: 14px;
  height: 14px;
  border-radius: 100%;
  border: 1px solid #dcdfe6;
  display: flex;
  margin-left: 20px;
  margin-right: 8px;
}
.radio_check {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary);
  position: relative;
  &:hover {
    background: #364fcd;
  }
}
.radio_check:after {
  transform: translate(-50%, -50%) scale(1);
  border-radius: 100%;
  width: 4px;
  height: 4px;
  background-color: var(--el-color-white);
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  transition: transform 0.15s ease-in;
}
.search_radio_box {
  line-height: 34px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  cursor: pointer;
  padding-right: 10px;
  .serach_radio_name {
    color: #606266;
    max-width: 690px;
  }
}
.content_box {
  min-width: 206px;
  min-height: 206px;
}
.shoot_dept_search_popper {
  .none_data {
    min-height: 206px !important;
    max-height: 206px !important;
  }
  .search_box {
    min-height: 100px !important;
    max-height: 206px !important;
  }
}
</style>
