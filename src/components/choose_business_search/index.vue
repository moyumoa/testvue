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
              <div class="one_choose_name line-hidden1" :title="chooseDeptId[0].label">
                {{ chooseDeptId[0].label || '' }}
              </div>
              <!-- 删除第一个部门的入口 -->
              <el-icon
                v-if="!disabled"
                class="one_choose_icon"
                @click.stop="delFirstChoose(chooseDeptId[0])"
              >
                <i-close />
              </el-icon>
            </div>
            <div class="one_more" v-if="checkNum > 1">+ {{ checkNum - 1 }}</div>
          </div>
          <!-- 输入框 获取焦点的时候就打开弹出框-->
          <el-input
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
      <!-- 弹出框的数据:搜索后的数据 单列-->
      <div
        class="content_box"
        v-loading="checkLoading || (searchLoading && searchParam.pageNumber === 1)"
      >
        <div class="">
          <template v-if="searchList && searchList.length > 0">
            <!-- 全选 -->
            <div class="all_check_box" v-if="multiple">
              <!-- 当输入框有内容时的全选 -->
              <el-checkbox
                v-if="inputValue && searchType == 2"
                @change="checkAllChange2Fun"
                label="全选"
                :indeterminate="isIndeterminate2"
                v-model="checkAll3"
              >
                全选
              </el-checkbox>
              <!-- 当输入框没有内容时的全选 -->
              <el-checkbox
                v-else
                @change="checkAllChangeFun"
                label="全选"
                :indeterminate="isIndeterminate"
                v-model="checkAll"
              >
                全选
              </el-checkbox>
            </div>
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
      </div>
    </el-popover>
  </div>
</template>
<script setup>
import { listBusinessBody, listBusinessGroupBody } from '@/api/system_setting/business_entity.js'
import { debounce, throttle } from '@/utils/tools'
import { ClickOutside as vClickOutside } from 'element-plus'
const props = defineProps({
  principalType: {
    type: Number,
    default: null
  }, // 业务主体类型的ID
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
  disabled: {
    type: Boolean,
    default: false
  }, // 是否禁用该组件
  isGetId: {
    type: Boolean,
    default: true
  }, // 返回的是否只有id
  defaultValue: {
    type: Array,
    default: () => {
      return []
    }
  }, // 默认值 多选是[{fullIds:[],//全路径ID fullPath:'',//全路径名称 ☆value:null,//直属部门ID ☆label:'',//部门名称 }]
  isGroupSelect: {
    type: Boolean,
    default: false
  } // 是否是只筛选分组
})
const {
  principalType,
  clearable,
  shootDeptSearch,
  disabled,
  searchLabel,
  multiple,
  isGetId,
  defaultValue,
  isGroupSelect
} = toRefs(props)
const isOver = ref(false) // 是否操作完成
const visible = ref(false) // 是否显示弹出框
const inputValue = ref('') // 输入框的内容
const searchList = ref([]) // 根据输入框查询出来的单列多选框列表
const searchLoading = ref(false) // 单列多选框的列表加载Loading
const chooseDeptId = ref([]) // 最终选择的部门ID 格式[{value:null,label:'',fullIds:[],fullPath:''}]
const totalNum = ref(null) // 当前业务主体下有多少个部门
const checkNum = ref(null) // 当前业务下选中的数量
const removeIdList = ref([]) // 移除的ID列表 初次全选状态下用到
const firstCheckAll = ref(false) // 是否在无内容时，点击了全选按钮
const checkAll = ref(false) // 输入框为空时 是否全选
const isIndeterminate = ref(false) // 输入框为空时 是否半选
const checkAll2 = ref(false) // 输入框有内容时 是否全选
const checkAll3 = ref(false) // 只是用于显示 不会变 因为有内容时，就算全选了，也要显示半选
const isIndeterminate2 = ref(false) // 输入框有内容时 是否半选
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
    getSearchList(true)
  }
}, 500)
// 输入框回车查询输入后符合条件的数据
const getDpetByName = debounce(() => {
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
const searchType = ref(1) // 1没有内容的查询成功 2 有输入框内容的查询成功
// init 代表是第一次请求 ，要让滚动条回到顶部
function getSearchList(init) {
  searchLoading.value = true
  if (init) {
    searchRef.value?.scrollTo(0, 0)
  }
  console.log('是否选择分组', isGroupSelect.value)
  const promiseRequest = isGroupSelect.value
    ? listBusinessGroupBody({
        deptGroupName: inputValue.value,
        pageNumber: searchParam.value.pageNumber,
        pageSize: inputValue.value ? 2000 : searchParam.value.pageSize,
        principalType: principalType.value
      })
    : listBusinessBody({
        departmentName: inputValue.value,
        pageNumber: searchParam.value.pageNumber,
        pageSize: inputValue.value ? 2000 : searchParam.value.pageSize,
        principalType: principalType.value
      })

  promiseRequest
    .then(res => {
      if (res.code === 0 && res.data) {
        const { records: list = [], total: resultTotal = 0 } = res.data
        const resultList = list.map(x => {
          const nameList = x.fullPath ? x.fullPath.split('/') : []
          let checked = false
          //  无输入内容时
          if (!inputValue.value) {
            if (firstCheckAll.value) {
              // 如果是全选，那就都加上
              checked = removeIdList.value.findIndex(xx => xx === x.id) === -1
              if (checked) {
                if (isGroupSelect.value) {
                  chooseDeptId.value.push({
                    value: x.id,
                    label: x.groupName,
                    fullIds: [],
                    fullPath: ''
                  })
                } else {
                  // 选中 往chooseDeptId添加数据
                  let fullIds = []

                  if (x.parentIds && x.parentIds.indexOf(';') > -1) {
                    fullIds = x.parentIds
                      .split(';')[0]
                      .split('/')
                      .map(x => {
                        return parseInt(x)
                      })
                  } else {
                    console.log('x?.parentIds', x?.parentIds.split('/'))
                    fullIds = x?.parentIds.split('/').map(x => {
                      return parseInt(x)
                    })
                  }

                  chooseDeptId.value.push({
                    value: x.id,
                    label: x.name || x.groupName,
                    fullIds: fullIds,
                    fullPath: nameList && nameList.length > 1 ? nameList.slice(1).join('/') : x.name
                  })
                }

                console.log('chooseDeptId.value', chooseDeptId.value)
              }
            } else {
              // 非全选，那就看移除ID列表里是否存在该ID，存在就不选中
              checked = chooseDeptId.value.findIndex(xx => xx.value === x.id) > -1
            }
          } else {
            if (firstCheckAll.value) {
              // 如果是全选，那就都加上
              checked = removeIdList.value.findIndex(xx => xx === x.id) === -1
            } else {
              // 非全选，那就看移除ID列表里是否存在该ID，存在就不选中
              checked = chooseDeptId.value.findIndex(xx => xx.value === x.id) > -1
            }
          }
          return {
            checked: checked,
            id: x.id,
            name: x.name || x.groupName,
            fullPath: nameList && nameList.length > 1 ? nameList.slice(1).join('/') : x.name,
            fullId: x.parentIds || ''
          }
        })
        if (searchParam.value.pageNumber === 1) {
          searchList.value = resultList

          const llll = resultList.filter(x => x.checked)
          // 需要记录总数量 用于后续全选的时候显示总数
          if (!inputValue.value) {
            totalNum.value = resultTotal
            if (checkNum.value === resultTotal && llll && llll.length > 0) {
              isIndeterminate.value = false
              checkAll.value = true
            } else {
              checkAll.value = false
              isIndeterminate.value = llll && llll.length > 0
            }
          } else {
            // 根据列表的选中数据来显示到底半选还是不选
            isIndeterminate2.value = llll && llll.length > 0
          }
        } else {
          searchList.value = searchList.value.concat(resultList)
        }
        searchParam.value.total = resultTotal
      }
      console.log('初始化完毕')
      searchLoading.value = false
      nextTick(() => {
        // 重新跟新popover位置
        unref(popoverRef).popperRef?.popperInstanceRef?.update()
      })
    })
    .catch(() => {
      searchLoading.value = false
    })
    .finally(() => {
      searchType.value = inputValue.value ? 2 : 1
      nextTick(() => {
        // 重新跟新popover位置
        unref(popoverRef).popperRef?.popperInstanceRef?.update()
      })
    })
}

// 打开弹出框
function showPopver() {
  if (!searchList.value.length) {
    getSearchList(true)
  }

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
    if (!searchList.value.length) {
      getSearchList(true)
    }
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
  searchList.value = []
}

const popoverRef = ref()
const onClickOutside = e => {
  if (visible.value && !unref(popoverRef).popperRef.contentRef.contains(e.target)) {
    visible.value = false
    clearPopver()
  }
}
// 显示业务主体名字 showName true 只显示名字 false 显示全路径名字
function checkShowName(e, showName = true) {
  if (showName) {
    return e.name || ''
  }
  if (e.fullPath && e.fullPath.indexOf('/') > -1) {
    return e.fullPath
  } else {
    return e.name || ''
  }
}

// 批量添加数据
function batchAddFun(dataList, addNum) {
  const list = JSON.parse(JSON.stringify(chooseDeptId.value))
  let num = 0
  dataList.forEach(x => {
    x.checked = true
    const ii = chooseDeptId.value.findIndex(y => y.value === x.id)
    if (ii === -1) {
      num++
      let fullIds = []
      if (x.fullId && x.fullId.indexOf(';') > -1) {
        fullIds = x.fullId
          .split(';')[0]
          .split('/')
          .map(x => {
            return parseInt(x)
          })
      } else {
        fullIds = x.fullId.split('/').map(x => {
          return parseInt(x)
        })
      }
      list.push({
        value: x.id,
        label: x.name,
        fullIds: fullIds,
        fullPath: x.fullPath
      })
    }
  })
  if (addNum) {
    checkNum.value = checkNum.value + num
  }
  chooseDeptId.value = list
}
// 批量移除数据
function batchRemoveFun(dataList, addNum) {
  let num = 0
  dataList.forEach(x => {
    if (x.checked) {
      x.checked = false
      num++
    }
  })
  const getId = chooseDeptId.value.map(item => item.value)
  const getId2 = dataList.map(item => item.id)

  const list2 = chooseDeptId.value.filter(item => !getId2.includes(item.value))
  chooseDeptId.value = list2

  const list = dataList.filter(item => !getId.includes(item.id))
  console.log('getid', getId, list, dataList, list2, chooseDeptId.value)
  if (addNum) {
    checkNum.value = checkNum.value - num
  }
}

const checkLoading = ref(false)
// 无输入框内容时的全选
const checkAllChangeFun = e => {
  checkLoading.value = true
  console.log('无输入框内容时的全选', e)
  firstCheckAll.value = e
  if (e) {
    checkAll.value = true
    isIndeterminate.value = false
    batchAddFun(searchList.value)
    checkNum.value = totalNum.value
  } else {
    checkAll.value = false
    isIndeterminate.value = false
    checkNum.value = 0
    batchRemoveFun(searchList.value)
  }
  removeIdList.value = []
  nextTick(() => {
    setTimeout(() => {
      checkLoading.value = false
    }, 0)
  })
}
const message = inject('$message')
// 有输入框内容时的全选
const checkAllChange2Fun = e => {
  checkLoading.value = true
  checkAll3.value = false
  console.log('有输入框内容时的全选', e, checkAll2.value, isIndeterminate2.value)
  const chooseList = searchList.value.filter(x => x.checked)
  console.log('xxx', !(chooseList && chooseList.length === searchList.value.length))
  if (!(chooseList && chooseList.length === searchList.value.length)) {
    isIndeterminate2.value = true
    // 如果初次全选了，那就在移除Id列表里删掉当页的id们
    if (firstCheckAll.value) {
      searchList.value.forEach(x => {
        const iiii = removeIdList.value.findIndex(y => y === x.id)
        if (iiii > -1) {
          x.checked = true
          removeIdList.value.splice(iiii, 1)
          checkNum.value++
        }
      })
    } else {
      batchAddFun(searchList.value, true)
    }
    // 根据名称搜索后，点击全选 如果还有未加载的数据就 toast一个“本次成功勾选2000条，滑动加载并选择更多”
    if (searchList.value.length < searchParam.value.total) {
      message.warning(`本次成功勾选${searchList.value.length}条，滑动加载并选择更多`)
    }
  } else {
    isIndeterminate2.value = false
    console.log(removeIdList.value)
    // 如果初次全选了，那就在移除Id列表里添加当页的id们
    if (firstCheckAll.value) {
      searchList.value.forEach(x => {
        const iiii = removeIdList.value.findIndex(y => y === x.id)
        if (iiii === -1) {
          x.checked = false
          removeIdList.value.push(x.id)
          checkNum.value--
        }
      })
    } else {
      batchRemoveFun(searchList.value, true)
    }
  }
  nextTick(() => {
    setTimeout(() => {
      checkLoading.value = false
    }, 0)
  })
}

// 单个多选框选中的数据
const checkChange = (e, data) => {
  console.log('单个多选框', e, chooseDeptId.value)
  if (e) {
    // 添加的时候先校验一下该部门ID是否一样加过了
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
    const iii = removeIdList.value.findIndex(iiii => iiii === data.id)
    if (iii > -1) {
      removeIdList.value.splice(iii, 1)
    }
    checkNum.value++
    if (searchType.value === 2) {
      console.log('有内容时')
      isIndeterminate2.value = true
    } else {
      console.log('单个多选框')
      if (checkNum.value === totalNum.value && removeIdList.value.length === 0) {
        isIndeterminate.value = false
        checkAll.value = true

        firstCheckAll.value = true
      } else {
        isIndeterminate.value = true
        checkAll.value = false
      }
    }
  } else {
    // 取消选中 在chooseDeptId删除数据
    const index = chooseDeptId.value.findIndex(y => y.value === data.id)
    if (index > -1) {
      chooseDeptId.value.splice(index, 1)
    }
    checkNum.value--
    // 有输入内容
    if (searchType.value === 2) {
      console.log('有输入内容')
      if (!searchList.value.filter(xxx => xxx.checked).length) {
        isIndeterminate2.value = false
      }
      if (firstCheckAll.value) {
        removeIdList.value.push(data.id)
      }
    } else {
      // 无输入内容
      checkAll.value = false
      isIndeterminate.value = chooseDeptId.value.length > 0
      if (firstCheckAll.value) {
        removeIdList.value.push(data.id)
      }

      // 如果searchList的未勾选数量和总数一致，那就把初次全选的标志清空
      const lll = searchList.value.filter(x => !x.checked)
      if (lll.length === totalNum.value) {
        clearFun()
      }
    }
    // 如果删除的数量和列表总数一致，就清空所有数据
    if (removeIdList.value.length === totalNum.value && removeIdList.value.length > 0) {
      clearFun()
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

// 初始化选择器
function init() {
  // 如果有
  if (defaultValue.value && defaultValue.value.length > 0) {
    console.log('初始化选择器', defaultValue.value)
    clearFun()
    chooseDeptId.value = JSON.parse(JSON.stringify(defaultValue.value))
    isOver.value = false
    nextTick(() => {
      isOver.value = true
    })
  }
  getSearchList()
}

init()

// 删除第一个选中的结果
const delFirstChoose = throttle(data => {
  if (firstCheckAll.value) {
    removeIdList.value.push(data.value)
  }
  checkNum.value--
  chooseDeptId.value.splice(0, 1)

  // 如果删除的数量和列表总数一致，就清空所有数据
  if (
    firstCheckAll.value &&
    removeIdList.value.length === totalNum.value &&
    removeIdList.value.length > 0
  ) {
    clearFun()
  }
  // 如果全选，并且添加的数量为空，也清空所有数据
  if (firstCheckAll.value && chooseDeptId.value.length === 0) {
    clearFun()
  }
  visible.value = false
  clearPopver()
  isOver.value = false
  nextTick(() => {
    isOver.value = true
  })
}, 500)

// 清空数据
function clearFun() {
  console.log('清空')
  firstCheckAll.value = false
  checkAll.value = false
  isIndeterminate.value = false
  checkAll2.value = false
  isIndeterminate2.value = false
  removeIdList.value = []
  checkNum.value = 0
  chooseDeptId.value = []
}
// 清空并隐藏弹出框
const clearAndHideFun = throttle(() => {
  clearFun()
  visible.value = false
  clearPopver()
  isOver.value = false
  nextTick(() => {
    isOver.value = true
  })
}, 500)

// 设置默认值
function setDefaultValueFun(val) {
  if (val && val.length > 0) {
    clearFun()
    chooseDeptId.value = JSON.parse(JSON.stringify(val))
    isOver.value = false
    nextTick(() => {
      isOver.value = true
    })
  }
}
defineExpose({
  clearFun,
  clearAndHideFun,
  setDefaultValueFun
})

const emits = defineEmits(['updateBusiness'])

watch(
  () => visible.value,
  val => {
    isOver.value = !val
  },
  {
    deep: true
  }
)
watch(
  () => isOver.value,
  val => {
    if (val) {
      console.log('是否操作完成', val, firstCheckAll.value, chooseDeptId.value, removeIdList.value)
      let chooseIds = []
      if (isGetId.value) {
        chooseIds = chooseDeptId.value.map(x => x.value)
      }
      emits('updateBusiness', {
        isCheckAll: firstCheckAll.value,
        ids: firstCheckAll.value ? removeIdList.value : chooseIds
      })
    }
  },
  {
    deep: true
  }
)
// 监听默认数据
watch(
  () => props.defaultValue,
  val => {
    if (val && val.length > 0) {
      clearFun()
      chooseDeptId.value = JSON.parse(JSON.stringify(val))
      isOver.value = false
      nextTick(() => {
        isOver.value = true
      })
    }
  },
  { deep: true }
)
</script>
<style lang="scss" scoped>
.all_check_box {
  border-bottom: 1px solid #ccc;
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
@media screen and(max-width: 1600px) {
  .search_box {
    max-height: 204px;
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
