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
                : `请选择${searchLabel || '矩阵号部门分组'}`
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
      <div class="content_warp">
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
                <!-- 多选框  -->
                <template v-if="multiple">
                  <div class="check_warp" v-for="item in searchList" :key="item.fullId">
                    <div
                      class="check_warp_all_has_children"
                      :class="{
                        check_warp_all_has_children_checked: item.checked
                      }"
                    >
                      <el-checkbox
                        @change="checkChange($event, item)"
                        :key="item.fullId"
                        v-model="item.checked"
                        :indeterminate="item.indeterminate"
                      ></el-checkbox>
                      <span @click.stop="openGroup($event, item)" class="check_name">
                        {{ checkShowName(item) }}
                      </span>
                      <div
                        @click.stop="openGroup($event, item)"
                        class="icon_warp"
                        :class="{ icon_warp_active: item.openChildren }"
                        v-if="!(item.departmentVOList && item.departmentVOList.length === 0)"
                      >
                        <el-icon><i-arrow-down /></el-icon>
                      </div>
                    </div>
                    <!-- <template v-else>
                      <el-checkbox
                        :title="checkShowName(item)"
                        @change="checkChange($event, item)"
                        :key="item.fullId"
                        :label="item.id"
                        v-model="item.checked"
                        :indeterminate="item.indeterminate"
                      >
                        {{ checkShowName(item) }}
                      </el-checkbox>
                    </template> -->
                    <!-- 子级列表 -->
                    <div
                      class="children_check_warp"
                      v-show="
                        item.departmentVOList &&
                        item.departmentVOList.length > 0 &&
                        item.openChildren
                      "
                    >
                      <el-checkbox
                        :title="checkShowName(item)"
                        @change="checkChangeChildren($event, item, x)"
                        v-for="x in item.departmentVOList"
                        :key="x.fullId"
                        :label="x.id"
                        :checked="x.checked"
                        v-model="x.checked"
                      >
                        {{ checkShowName(x) }}
                      </el-checkbox>
                    </div>
                  </div>
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
          <!-- 如果要做侧边展开，子级数据就放在这里，判断父级是否有子级数据显示向右箭头，以及点击展开子级数据 -->
        </div>
        <!-- 弹出框的数据其余列 -->
        <!-- <div class="content_box_next"></div> -->
      </div>
    </el-popover>
  </div>
</template>
<script setup>
import { listBusinessGroupBody } from '@/api/system_setting/business_entity.js'
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
  } // 默认值 多选是[{fullIds:[],//全路径ID fullPath:'',//全路径名称 ☆value:null,//直属部门ID ☆label:'',//部门名称 }]
})
const {
  principalType,
  clearable,
  shootDeptSearch,
  disabled,
  searchLabel,
  multiple,
  isGetId,
  defaultValue
} = toRefs(props)
const isOver = ref(false) // 是否操作完成
const visible = ref(false) // 是否显示弹出框
const inputValue = ref('') // 输入框的内容
const searchList = ref([]) // 根据输入框查询出来的单列多选框列表
const searchLoading = ref(false) // 单列多选框的列表加载Loading
const chooseDeptId = ref([]) // 最终选择的部门ID 格式[{value:null,label:'',fullIds:[],fullPath:''}]
// const totalNum = ref(null) // 当前业务主体下有多少个部门
const checkNum = ref(null) // 当前业务下选中的数量
const removeIdList = ref([]) // 移除的ID列表 初次全选状态下用到
const firstCheckAll = ref(false) // 是否在无内容时，点击了全选按钮
const checkAll = ref(false) // 输入框为空时 是否全选
const isIndeterminate = ref(false) // 输入框为空时 是否半选
const checkAll2 = ref(false) // 输入框有内容时 是否全选
const checkAll3 = ref(false) // 只是用于显示 不会变 因为有内容时，就算全选了，也要显示半选
const isIndeterminate2 = ref(false) // 输入框有内容时 是否半选
const chooseGroupIds = ref([]) // 选择的分组ids
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
function addGroupStatus(x) {
  let checked = false // 当前x选中状态
  let checkChildrenNum = 0

  if (x.departmentVOList && x.departmentVOList.length > 0) {
    x.departmentVOList.forEach(xxx => {
      const index = chooseDeptId.value.findIndex(xx => xx.value === xxx.id)
      // 如果子级元素在排除的ids内就不能选中
      if (index > -1 && !removeIdList.value.includes(xxx.id)) {
        xxx.checked = true
        checkChildrenNum++
      }
    })
    // 更新父级状态
    // if (checkChildrenNum > 0) {
    //   x.openChildren = true
    // }
    // 除了全选和全不选，父级的indeterminate都是true
    if (checkChildrenNum === 0 || checkChildrenNum === x.departmentVOList.length) {
      x.indeterminate = false
    } else {
      x.indeterminate = true
    }
    // 子级如果全部全部选中，父级的checked才是true
    if (checkChildrenNum === x.departmentVOList.length && checkChildrenNum > 0) {
      checked = true
    }
  } else {
    if (chooseGroupIds.value.includes(x.id)) {
      checked = true
    }
  }

  return checked
}

// init 代表是第一次请求 ，要让滚动条回到顶部
function getSearchList(init) {
  searchLoading.value = true
  if (init) {
    searchRef.value?.scrollTo(0, 0)
  }
  listBusinessGroupBody({
    deptGroupName: inputValue.value,
    pageNumber: searchParam.value.pageNumber,
    // pageSize: inputValue.value ? 2000 : searchParam.value.pageSize,
    pageSize: 2000,
    principalType: principalType.value
  })
    .then(res => {
      if (res.code === 0 && res.data) {
        const { records: list = [], total: resultTotal = 0 } = res.data
        const resultList = list.map(x => {
          let checked = false
          // let openChildren = false // 是否展开子级
          // let indeterminate = false // 父级半选状态
          checked = addGroupStatus(x)
          return {
            checked: checked,
            id: x.id,
            name: x.groupName,
            departmentVOList: x.departmentVOList || [], // 子级
            openChildren: x.openChildren || false, // 是否打开子级
            indeterminate: x.indeterminate || false // 半选状态
          }
        })
        if (searchParam.value.pageNumber === 1) {
          searchList.value = resultList
        } else {
          searchList.value = searchList.value.concat(resultList)
        }
        // console.log('searchList', searchList.value)
        searchParam.value.total = resultTotal
        searchType.value = inputValue.value ? 2 : 1
        nextTick(() => {
          updateCheckedStatus()
        })
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
    .finally(() => {
      searchType.value = inputValue.value ? 2 : 1
      nextTick(() => {
        // 重新跟新popover位置
        unref(popoverRef)?.popperRef?.popperInstanceRef?.update()
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
// 全部可选数据 - 所有二级列表
function getAllSelectList(list) {
  const existingItems = new Set()
  return (list || []).reduce((arr, item) => {
    if (item?.departmentVOList) {
      item.departmentVOList.forEach(childrenItem => {
        if (!existingItems.has(childrenItem)) {
          arr.push(childrenItem)
          existingItems.add(childrenItem)
        }
      })
    }
    return arr
  }, [])
}
// 批量添加数据
function batchAddFun(dataList, addNum) {
  // console.log('批量添加 batchAddFun')
  const list = JSON.parse(JSON.stringify(chooseDeptId.value))
  let num = 0
  dataList.forEach(x => {
    // 更新父级状态为全选
    x.checked = true
    x.indeterminate = false
    const gii = chooseGroupIds.value.findIndex(xx => xx === x.id)
    // console.log('是否在分组', gii)
    if (gii === -1) {
      chooseGroupIds.value.push(x.id)
    }

    // x.openChildren = true
    if (x.departmentVOList && x.departmentVOList.length > 0) {
      // console.log('批量添加选中时候，添加子级的选中，而不是当前父级')
      x.departmentVOList.forEach(xxx => {
        xxx.checked = true
        const ii = chooseDeptId.value.findIndex(y => y.value === xxx.id)
        if (ii === -1) {
          num++
          list.push({
            value: xxx.id,
            label: xxx.name,
            departmentVOList: xxx.departmentVOList
          })
        }
      })
    }
  })
  if (addNum) {
    checkNum.value = checkNum.value + num
  }
  chooseDeptId.value = list
}
// 批量添加一个分组内的数据
function batchAddFunV2(data, addNum) {
  const list = JSON.parse(JSON.stringify(chooseDeptId.value))
  let num = 0
  if (data && data.departmentVOList && data.departmentVOList.length > 0) {
    data.departmentVOList.forEach(xxx => {
      xxx.checked = true
      const ii = chooseDeptId.value.findIndex(y => y.value === xxx.id)
      if (ii === -1) {
        num++
        list.push({
          value: xxx.id,
          label: xxx.name
        })
      }
    })
    if (addNum) {
      checkNum.value = checkNum.value + num
    }
    chooseDeptId.value = list
  } else {
    console.log('没有子级列表')
  }
}
// 批量移除数据
function batchRemoveFun(dataList, addNum) {
  // console.log('批量移除 batchRemoveFun')
  let num = 0
  dataList.forEach(x => {
    // 更新父级选择状态
    x.checked = false
    x.indeterminate = false
    // console.log('取消选择，如果有子级那就不是取消自己而是取消已选择的子级')
    if (x.departmentVOList && x.departmentVOList.length > 0) {
      x.departmentVOList.forEach(xxx => {
        if (xxx.checked) {
          xxx.checked = false
          num++
        }
      })
    }
    const gii = chooseGroupIds.value.findIndex(xx => xx === x.id)
    if (gii > -1) {
      chooseGroupIds.value.splice(gii, 1)
    }
  })
  const dataList2 = getAllSelectList(dataList) // 排除的是-全部可选项，dataList内包含分组，而真正选择的是分组内的children
  const getId2 = dataList2.map(item => item.id)
  const list2 = chooseDeptId.value.filter(item => !getId2.includes(item.value))
  chooseDeptId.value = list2
  if (addNum) {
    checkNum.value = checkNum.value - num
  }
}
// 批量移除一个分组内的数据
function batchRemoveFunV2(data, addNum) {
  let num = 0
  const getId2 = []
  if (data && data.departmentVOList && data.departmentVOList.length > 0) {
    data.departmentVOList.forEach(xxx => {
      if (xxx.checked) {
        xxx.checked = false
        num++
        getId2.push(xxx.id)
      }
    })
    chooseDeptId.value = chooseDeptId.value.filter(item => !getId2.includes(item.value))

    if (addNum) {
      checkNum.value = checkNum.value - num
    }
  } else {
    console.log('没有子级列表')
  }
}

const checkLoading = ref(false)
// 无输入框内容时的全选
const checkAllChangeFun = e => {
  // console.log('没有输入内容的全选，要增加选择的分组的id')
  if (searchParam.value.total <= searchList.value.length) {
    checkLoading.value = true
    // console.log('无输入框内容时的全选', e)
    firstCheckAll.value = e
    if (e) {
      checkAll.value = true
      isIndeterminate.value = false
      batchAddFun(searchList.value)
      checkNum.value = getAllSelectList(searchList.value).length
    } else {
      checkAll.value = false
      isIndeterminate.value = false
      checkNum.value = 0
      chooseGroupIds.value = []
      batchRemoveFun(searchList.value)
    }
    removeIdList.value = []
    nextTick(() => {
      setTimeout(() => {
        checkLoading.value = false
      }, 0)
    })
  } else {
    // console.log('没有获取到所有分组，全选就应该是选择id')
    checkAllChange2Fun()
  }
}
const message = inject('$message')
// 有输入框内容时的全选
const checkAllChange2Fun = e => {
  checkLoading.value = true
  checkAll3.value = false
  const allSearchList = getAllSelectList(searchList.value) // 将要选择的数据内包含子级，而不是列表一级
  const chooseList = allSearchList.filter(x => x.checked)
  const chooseGroupIds2 = JSON.parse(JSON.stringify(chooseGroupIds.value))
  // 是否是 非全部选择了 -- xxx -- 如果是就要选择 反之 取消选择
  if (!(chooseList && chooseList.length === allSearchList.length)) {
    // console.log('选择')
    isIndeterminate2.value = true
    if (firstCheckAll.value) {
      searchList.value.forEach(x => {
        if (x.departmentVOList && x.departmentVOList.length > 0) {
          // 父级状态
          x.checked = true
          x.indeterminate = false
          x.departmentVOList.forEach(xxx => {
            checkNum.value++
            xxx.checked = true
            // 是否在移出列表
            const iiii = removeIdList.value.findIndex(y => y === xxx.id)
            if (iiii > -1) {
              removeIdList.value.splice(iiii, 1)
            }
            const ii = chooseDeptId.value.findIndex(y => y.value === xxx.id)
            // console.log('选择 - 子级 - 是否在选中列表 - ii', ii)
            if (ii === -1) {
              chooseDeptId.value.push({
                value: xxx.id,
                label: xxx.name,
                departmentVOList: xxx.departmentVOList
              })
            }
          })
        }
        const gii = chooseGroupIds2.findIndex(xx => xx === x.id)
        // console.log('gii - 选择', gii)
        if (gii === -1) {
          chooseGroupIds.value.push(x.id)
        }
      })
    } else {
      batchAddFun(searchList.value, true)
    }
    // 根据名称搜索后，点击全选 如果还有未加载的数据就 toast一个“本次成功勾选2000条，滑动加载并选择更多”
    if (searchList.value.length < searchParam.value.total) {
      message.warning(`本次成功勾选${allSearchList.length}条，滑动加载并选择更多`)
    }
  } else {
    isIndeterminate2.value = false
    // 如果初次全选了，那就在移除Id列表里添加当页的id们
    if (firstCheckAll.value) {
      // 列表内一个子级都没
      if (allSearchList.length === 0) {
        // 判断当前条件下的列表是否全选
        const allGroupIds = searchList.value.map(y => y.id)
        const selectStatus = isSubset(allGroupIds, chooseGroupIds.value)
        // console.log('当前列表是否全选了', selectStatus)
        if (selectStatus) {
          isIndeterminate2.value = false
          batchRemoveFun(searchList.value)
        } else {
          isIndeterminate2.value = true
          batchAddFun(searchList.value)
        }
      } else {
        const deepChooseDeptId = JSON.parse(JSON.stringify(chooseDeptId.value))
        searchList.value.forEach(x => {
          // 父级状态
          x.checked = false
          x.indeterminate = false
          if (x.departmentVOList && x.departmentVOList.length > 0) {
            x.departmentVOList.forEach(xxx => {
              const ii = deepChooseDeptId.findIndex(y => y.value === xxx.id)
              // console.log('取消选择 - 子级 - 是否在选中列表 - ii', ii > -1)
              if (ii > -1) {
                xxx.checked = false
                removeIdList.value.push(xxx.id)
                chooseDeptId.value.splice(ii, 1)
                checkNum.value--
              }
            })
          }

          const gii = chooseGroupIds2.findIndex(xx => xx === x.id)
          // console.log('gii - 取消选择', gii)
          if (gii === -1) {
            chooseGroupIds.value.splice(x.id, 1)
          }
        })
      }
    } else {
      // 列表内一个子级都没
      if (allSearchList.length === 0) {
        // 判断当前条件下的列表是否全选
        const allGroupIds = searchList.value.map(y => y.id)
        const selectStatus = isSubset(allGroupIds, chooseGroupIds.value)
        // console.log('当前列表是否全选了', selectStatus)
        if (selectStatus) {
          isIndeterminate2.value = false
          batchRemoveFun(searchList.value)
        } else {
          isIndeterminate2.value = true
          batchAddFun(searchList.value)
        }
      } else {
        batchRemoveFun(searchList.value, true)
      }
    }
  }
  nextTick(() => {
    setTimeout(() => {
      checkLoading.value = false
    }, 0)
  })
}
function isSubset(A, B) {
  const BSet = new Set(B)
  return A.every(element => BSet.has(element))
}
// 更新选中状态
function updateCheckedStatus() {
  if (searchType.value === 2) {
    // const ctl = getAllSelectList(searchList.value).filter(xx => xx.checked)?.length
    const ctl = searchList.value.filter(x => x.checked)?.length || 0
    if (!ctl) {
      isIndeterminate2.value = false
    } else {
      isIndeterminate2.value = true
    }
  } else {
    // 全部选项 getAllSelectList(searchList.value)
    // 没有输入内容时 全不选checkAll=false，isIndeterminate=false；半选checkAll=true，isIndeterminate=true；全选checkAll=true，isIndeterminate=false
    // const ct = chooseDeptId?.value?.length // 已选数量
    let ct = 0 // 已经选择的分组数量

    searchList.value.forEach(xx => {
      if (xx.departmentVOList && xx.departmentVOList.length > 0) {
        const childrenNum = xx.departmentVOList.length
        let ctcn = 0 // 选择的子级数量
        xx.departmentVOList.forEach(xxx => {
          if (xxx.checked) {
            ctcn++
          }
        })
        if (childrenNum === ctcn) {
          ct++
        }
      } else {
        if (xx.checked) {
          ct++
        }
      }
    })
    // console.log('最终的选中分组的数量', ct)
    if (ct === 0) {
      checkAll.value = false
      isIndeterminate.value = false
    } else if (ct > 0 && ct < searchParam.value.total) {
      // getAllSelectList(searchList.value).length
      checkAll.value = true
      isIndeterminate.value = true
    } else {
      isIndeterminate.value = false
      checkAll.value = true
    }
  }
}

// 打开/关闭子级
function openGroup(e, item) {
  if (item.departmentVOList && item.departmentVOList.length > 0) {
    item.openChildren = !item.openChildren
  } else {
    if (item.checked) {
      item.checked = false
      const gii = chooseGroupIds.value.findIndex(xx => xx === item.id)
      if (gii > -1) {
        chooseGroupIds.value.splice(gii, 1)
      }
    } else {
      item.checked = true
      chooseGroupIds.value.push(item.id)
    }
    // console.log('chooseGroupIds.value', chooseGroupIds.value)
    updateCheckedStatus()
  }
}

// 单个子级元素的选择/取消选择
const checkChangeChildren = (e, data, x) => {
  // console.log('单个子级元素的选择/取消选择', e)
  // console.log('父级', data)
  // console.log('当前元素', x)
  if (e) {
    const index = chooseDeptId.value.findIndex(y => y.value === x.id)
    if (index > -1) {
      return
    }
    x.checked = true
    chooseDeptId.value.push({
      value: x.id,
      label: x.name
    })

    const iii = removeIdList.value.findIndex(iiii => iiii === x.id)
    if (iii > -1) {
      removeIdList.value.splice(iii, 1)
    }
    // 父级选中状态
    data.indeterminate =
      data.departmentVOList && data.departmentVOList.findIndex(y => !y.checked) > -1
    data.checked = data.departmentVOList && data.departmentVOList.findIndex(y => y.checked) > -1
    checkNum.value++
  } else {
    const index = chooseDeptId.value.findIndex(y => y.value === x.id)
    if (index > -1) {
      const deepItem = JSON.parse(JSON.stringify(chooseDeptId.value))[index] // 将子级内的数据添加到移出列表
      x.checked = false
      chooseDeptId.value.splice(index, 1)
      if (firstCheckAll.value && deepItem?.value) {
        removeIdList.value.push(deepItem.value)
      }
    }
    // 父级选中状态
    data.indeterminate =
      data.departmentVOList && data.departmentVOList.findIndex(y => y.checked) > -1
    data.checked = data.departmentVOList && data.departmentVOList.findIndex(y => y.checked) > -1
    checkNum.value--
    // console.log('子级---取消选择 --- 如果全选就要加入到移出列表')
  }

  // 对于分组 - 如果父级选中了就添加，如果取消了就删除
  const chooseGroupIds2 = JSON.parse(JSON.stringify(chooseGroupIds.value))
  const gii = chooseGroupIds2.findIndex(xx => xx === data.id)
  if (!data.indeterminate && !data.checked) {
    // console.log('删除分组id')
    // 删除
    if (gii > -1) {
      chooseGroupIds.value.splice(gii, 1)
    }
  } else {
    if (gii === -1) {
      // console.log('添加分组id')
      chooseGroupIds.value.push(data.id)
    }
  }
  // 全选的选中状态
  updateCheckedStatus()
}
// 单个多选框选中的数据
const checkChange = (e, data) => {
  // console.log('单个多选框-11111', e, chooseDeptId.value)
  // console.log('只选择分组内数据')
  // console.log('有子级，就要全部选中，（并展开子级？）', data)
  // data.openChildren = true
  const beforeCheckChildren = data?.departmentVOList
    ? JSON.parse(JSON.stringify(data.departmentVOList))
    : []
  const selectStatus =
    (beforeCheckChildren || []).filter(y => y.checked).length === (beforeCheckChildren || []).length // 如果子级内的元素全部选择了就是取消全选其余情况都是全选
  const chooseGroupIds2 = JSON.parse(JSON.stringify(chooseGroupIds.value))
  const gii = chooseGroupIds2.findIndex(xx => xx === data.id)

  if (!selectStatus) {
    data.checked = true
    data.indeterminate = false
    if (gii === -1) {
      chooseGroupIds.value.push(data.id)
    }
    batchAddFunV2(data, true)
  } else {
    data.checked = false
    data.indeterminate = false
    batchRemoveFunV2(data, true)
    // 更新分组的选择
    if (beforeCheckChildren.length > 0) {
      if (gii > -1) {
        chooseGroupIds.value.splice(gii, 1)
      }
    } else {
      data.checked = true
      if (gii === -1) {
        // console.log('gii', gii)
        chooseGroupIds.value.push(data.id)
      } else {
        data.checked = false
        chooseGroupIds.value.splice(gii, 1)
      }
    }
  }
  // console.log('chooseGroupIds.value', chooseGroupIds.value)
  updateCheckedStatus()
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
    chooseDeptId.value = [
      {
        value: data.id,
        label: data.name
      }
    ]
  }
}

// 初始化选择器
function init() {
  // 如果有
  if (defaultValue.value && defaultValue.value.length > 0) {
    // console.log('初始化选择器', defaultValue.value)
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
  // console.log('要移出选中的数据，看是否有分镜组的数据', data)
  if (firstCheckAll.value) {
    removeIdList.value.push(data.value)
  }
  checkNum.value--
  chooseDeptId.value.splice(0, 1)

  // 如果删除的数量和列表总数一致，就清空所有数据
  const allSearchList = getAllSelectList(searchList.value).length
  if (
    firstCheckAll.value &&
    removeIdList.value.length === allSearchList &&
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
  firstCheckAll.value = false
  checkAll.value = false
  isIndeterminate.value = false
  checkAll2.value = false
  isIndeterminate2.value = false
  removeIdList.value = []
  checkNum.value = 0
  chooseDeptId.value = []
  chooseGroupIds.value = []
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
    checkNum.value = chooseDeptId.value.length
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
      // console.log('是否操作完成', val, firstCheckAll.value, chooseDeptId.value, removeIdList.value)
      let chooseIds = []
      if (isGetId.value) {
        chooseIds = chooseDeptId.value.map(x => x.value)
      }
      emits('updateBusiness', {
        isCheckAll: false,
        ids: chooseIds,
        infos: chooseDeptId.value
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
  .check_warp {
    .check_warp_all_has_children {
      display: flex;
      align-items: center;
      cursor: pointer;
      padding: 0 20px;
      :deep(.el-checkbox) {
        padding: 0;
      }
      .check_name {
        padding-left: 8px;
        display: inline-block;
        white-space: nowrap;
        flex: 1;
      }
      .icon_warp {
        transition: transform 0.1s;
        width: 14px;
        height: 14px;
        color: #c0c4cc !important;
        transform: rotate(-90deg);
      }
      .icon_warp_active {
        transform: rotate(0deg);
      }
    }
    .check_warp_all_has_children_checked {
      color: #364fcd;
    }
    .children_check_warp {
      margin-left: 20px;
    }
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
.content_warp {
  display: flex;
  max-width: calc(100vw - 64px);
  overflow-x: auto;
}
.content_box {
  min-width: 206px;
  min-height: 206px;
}
.content_box_next {
  min-width: 206px;
  min-height: 206px;
  border: 1px solid #000;
  box-sizing: border-box;
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
