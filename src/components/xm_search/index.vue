<template>
  <div class="xm_search">
    <template v-if="searchComponents.length > 0">
      <template v-for="(item, index) in searchComponents">
        <div
          class="search_item"
          :style="props.showShrink && item.shrink && isShrink ? 'display:none' : ''"
          v-if="!item.hiddenItem"
          :key="index"
        >
          <label :class="['item_label', item.showLabelTip ? 'item_label_flex' : '']">
            {{ item.label }}
            <slot v-if="item.showLabelTip" name="labelTip"></slot>
          </label>
          <div class="item_content">
            <el-input
              clearable
              @blur="retEmit($event, index)"
              @input="inputEmit($event, index, item)"
              @clear="inputClearEmit($event, index, item)"
              :maxlength="item.isPhone ? 11 : null"
              v-model.trim="item.val"
              :placeholder="item.placeholder || '请输入' + item.label"
              :type="item.inputType ? item.inputType : 'text'"
              v-if="item.type === 'input'"
            ></el-input>
            <!-- clearable == true为不可清空，不传或者false为可清空 -->
            <el-select
              :clearable="item.clearable ? false : true"
              :multiple="item.multiple || false"
              :filterable="item.filterable || false"
              :collapse-tags="item['collapse-tags'] || false"
              :collapse-tags-tooltip="item['collapse-tags'] || false"
              :remote="item.remote"
              :remote-method="item.remoteMethod"
              v-model="item.val"
              :placeholder="
                item.placeholder ||
                '请选择' + (item.selectDefultName ? select[item.selectDefultName[1]] : item.label)
              "
              style="width: 100%"
              :reserve-keyword="false"
              v-else-if="item.type === 'select'"
            >
              <el-option
                v-for="select in item.selects"
                :key="item.selectDefultName ? select[item.selectDefultName[0]] : select.value"
                :label="item.selectDefultName ? select[item.selectDefultName[1]] : select.label"
                :value="item.selectDefultName ? select[item.selectDefultName[0]] : select.value"
              ></el-option>
            </el-select>
            <el-select
              clearable
              :multiple="item.multiple || false"
              :filterable="item.filterable || false"
              :collapse-tags="item['collapse-tags'] || false"
              :collapse-tags-tooltip="item['collapse-tags'] || false"
              :remote="item.remote"
              :remote-method="item.remoteMethod"
              v-model="item.val"
              :placeholder="
                item.placeholder ||
                '请选择' + (item.selectDefultName ? select[item.selectDefultName[1]] : item.label)
              "
              style="width: 100%"
              :reserve-keyword="false"
              v-else-if="item.type === 'selectByGroup'"
            >
              <template v-for="group in item.selects">
                <el-option-group
                  v-if="group[item.childName] && group[item.childName].length > 0"
                  :key="item.selectDefultName ? group[item.selectDefultName[0]] : group.value"
                  :label="item.selectDefultName ? group[item.selectDefultName[1]] : group.label"
                >
                  <el-option
                    v-for="child in group[item.childName]"
                    :key="item.selectDefultName ? child[item.selectDefultName[0]] : child.value"
                    :label="item.selectDefultName ? child[item.selectDefultName[1]] : child.label"
                    :value="item.selectDefultName ? child[item.selectDefultName[0]] : child.value"
                  />
                </el-option-group>
              </template>
            </el-select>
            <el-date-picker
              :clearable="item.clearable ? false : true"
              v-model="item.val"
              type="daterange"
              range-separator="至"
              :start-placeholder="item.placeholder ? item.placeholder[0] : ''"
              :end-placeholder="item.placeholder ? item.placeholder[1] : ''"
              v-else-if="item.type === 'dateRange'"
              unlink-panels
              :disabled-date="item.disabledDate"
              :shortcuts="item.shortcuts ? item.shortcuts : []"
              :editable="item.isDisEdit ? false : true"
              @change="rangeTimeChange($event, item)"
            ></el-date-picker>
            <el-date-picker
              :clearable="item.clearable"
              v-model="item.val"
              type="date"
              :disabled-date="item.disabledDate"
              v-else-if="item.type === 'date'"
              :placeholder="item.placeholder || '请选择' + item.label"
            ></el-date-picker>
            <el-date-picker
              :clearable="item.clearable"
              v-model="item.val"
              type="datetimerange"
              range-separator="至"
              :start-placeholder="item.placeholder ? item.placeholder[0] : ''"
              :end-placeholder="item.placeholder ? item.placeholder[1] : ''"
              v-else-if="item.type === 'datetimerange'"
              unlink-panels
              :shortcuts="item.shortcuts ? item.shortcuts : []"
              :disabled-date="item.disabledDate"
              :editable="item.isDisEdit ? false : true"
              :default-time="item.defaultTime"
            ></el-date-picker>
            <el-cascader
              v-model="item.val"
              :options="item.options"
              :clearable="item.clearable"
              :collapse-tags="item['collapse-tags'] || false"
              :show-all-levels="item['show-all-levels'] || false"
              :props="item.props"
              v-else-if="item.type === 'cascader'"
              :placeholder="item.placeholder || '请选择' + item.label"
            ></el-cascader>
            <el-cascader
              ref="cascader"
              @change="onChangeCascader(item)"
              :options="item.options"
              :clearable="item.clearable"
              :collapse-tags="item['collapse-tags'] || false"
              :show-all-levels="item['show-all-levels'] || false"
              :props="item.props"
              v-else-if="item.type === 'org'"
              :placeholder="item.placeholder || '请选择' + item.label"
            ></el-cascader>
            <el-cascader
              v-model="item.val"
              ref="cascader"
              @change="onChangeOrg(item)"
              :options="item.options"
              :clearable="item.clearable"
              :collapse-tags="item['collapse-tags'] || false"
              :show-all-levels="item['show-all-levels'] || false"
              :props="item.props"
              v-else-if="item.type === 'orgCheck'"
              :placeholder="item.placeholder || '请选择' + item.label"
            ></el-cascader>
            <choose_dept_search
              v-else-if="item.type === 'chooseDept'"
              ref="chooseDeptSearchRef"
              @updateDeptIds="updateDeptIds($event, item, index)"
              @updateDeptInfos="updateDeptInfos($event, item, index)"
              :multiple="item.multiple"
              :isUsePermission="item.isUsePermission"
              :searchLabel="item.label"
              :defaultValue="item.defaultValue"
            />
            <template v-else-if="item.type === 'newLabelFilter'">
              <div
                style="
                  display: flex;
                  flex-direction: row;
                  justify-content: flex-start;
                  align-items: center;
                "
              >
                <span style="margin-right: 10px">
                  已{{ item.behavior ? item.behavior : '选择'
                  }}{{ (item.val && item.val.length) || 0 }}个{{
                    item.choseName ? item.choseName : '标签'
                  }}
                </span>
                <el-button @click="openChoseLabel(item.tagType)">选择</el-button>
              </div>
            </template>
            <choose_tag_dialog
              v-else-if="item.type === 'newLabelFilterV2'"
              :behavior="item.behavior"
              :choseName="item.choseName"
              :addTagInfo="item.addTagInfo"
              :chooseList="item.val"
              @updateTag="updateTag($event, item, index)"
            />
            <template v-else-if="item.type === 'numberRange'">
              <div
                class="numberRange_box"
                :style="{ border: !item.checkStu ? '1px solid #dcdfe6' : '1px solid #f21111' }"
              >
                <el-input
                  clearable
                  @blur="retEmitNumber($event, index)"
                  @input="inputEmit($event, index, item, 'minVal')"
                  style="width: 100px"
                  v-model.trim="item.minVal"
                  :type="item.inputType ? item.inputType : 'text'"
                  :placeholder="item.placeholder ? item.placeholder[0] : ''"
                ></el-input>
                至
                <el-input
                  clearable
                  @blur="retEmitNumber($event, index)"
                  @input="inputEmit($event, index, item, 'maxVal')"
                  style="width: 100px"
                  v-model.trim="item.maxVal"
                  :type="item.inputType ? item.inputType : 'text'"
                  :placeholder="item.placeholder ? item.placeholder[1] : ''"
                ></el-input>
              </div>
            </template>
            <template v-else-if="item.type === 'numberRange2'">
              <div
                class="numberRange_box"
                :style="{ border: !item.checkStu ? '1px solid #dcdfe6' : '1px solid #f21111' }"
              >
                <el-input
                  clearable
                  @blur="retEmitMinNumber($event, index, 'minVal')"
                  @input="inputEmit($event, index, item, 'minVal')"
                  :style="item.style || 'width: 100px'"
                  v-model.trim="item.minVal"
                  :type="item.inputType ? item.inputType : 'text'"
                  :placeholder="item.placeholder ? item.placeholder[0] : ''"
                ></el-input>
                至
                <el-input
                  clearable
                  @blur="retEmitMaxNumber($event, index, 'maxVal')"
                  @input="inputEmit($event, index, item, 'maxVal')"
                  :style="item.style || 'width: 100px'"
                  v-model.trim="item.maxVal"
                  :type="item.inputType ? item.inputType : 'text'"
                  :placeholder="item.placeholder ? item.placeholder[1] : ''"
                ></el-input>
              </div>
            </template>
            <choose_business_search
              :ref="`chooseBusinessSearchRef${item.principalType}`"
              v-else-if="item.type === 'chooseBusiness'"
              @updateBusiness="updateBusiness($event, item, index)"
              :multiple="item.multiple"
              :principalType="item.principalType"
              :searchLabel="item.label"
              :defaultValue="item.defaultVal"
              :key="item.principalType"
              :isGetId="item.isGetId"
              :isGroupSelect="item.isGroupSelect"
            />
            <!-- 有分组的业务主体筛选（最初做在choose_business_search一起，后来经后端讨论分开） -->
            <choose_business_search_group
              :ref="`chooseBusinessSearchGroupRef${item.principalType}`"
              v-else-if="item.type === 'chooseBusinessGroup'"
              @updateBusiness="updateBusiness($event, item, index)"
              :multiple="item.multiple"
              :principalType="item.principalType"
              :searchLabel="item.label"
              :defaultValue="item.defaultVal"
              :key="item.principalType + ''"
              :isGetId="item.isGetId"
            />
            <choose_search_fail
              v-if="item.type === 'fail'"
              :placeholder="item.placeholder"
              :failType="item.failType"
              :fileID="item.val"
              @updateFail="searchFailSelect($event, item, index)"
            />
          </div>
        </div>
      </template>
      <slot name="searchItem"></slot>
      <div class="search_item">
        <slot name="searchTip"></slot>
        <div v-if="showShrink" class="shrink_btn" @click="updateShrink">
          更多
          <el-icon style="margin-left: 2px" v-if="isShrink"><i-arrow-down /></el-icon>
          <el-icon style="margin-left: 2px" v-else><i-arrow-up /></el-icon>
        </div>
        <el-button type="primary" :disabled="props.btnDis" @click="query">查询</el-button>
        <el-button @click="reset" :disabled="props.btnDis">重置</el-button>
        <slot name="searchBtn"></slot>
      </div>
    </template>
    <slot></slot>
  </div>
</template>

<script>
import { dateFormat, isEmpty, isNotEmpty } from '@/utils/tools.js'
import { ElMessage } from 'element-plus'
// 组件org和orgCheck被淘汰，现在选择部门或组织架构都换成 chooseDept
export default {
  name: 'xmSearch',
  emits: ['getData', 'reset', 'openChoseLabel', 'rangeTimeChange', 'updateShrink', 'clearInput'],
  props: {
    // 表单组件
    searchComponents: {
      type: Array,
      default: () => []
    },
    // 使用页面自身的重置
    useOwnReset: {
      type: Boolean,
      default: false
    },
    // 是否需要导出按钮
    isNeedExport: {
      type: Boolean,
      default: false
    },
    // 是否支持将筛选项折叠
    showShrink: {
      type: Boolean,
      default: false
    },
    btnDis: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    // 兼容组织结构cascader选择逻辑
    onChangeCascader(item) {
      const checkedNodes = this.$refs.cascader[0].getCheckedNodes()
      const values = checkedNodes.map(e => e.value)
      item.val = values
    },
    onChangeOrg(item) {
      console.log(item, item.val)
      const deps = []
      if (item.val && item.val.length > 0) {
        item.val.forEach(x => {
          deps.push(x[x.length - 1])
        })
      }
      item.val = deps
    }
  },
  setup(props, { emit, expose }) {
    const loading = ref(false)
    const { proxy } = getCurrentInstance()
    const searchComponents = toRef(props, 'searchComponents')
    function clearQuery() {
      for (const item of searchComponents.value) {
        if (item.type === 'cascader') {
          item.val = []
        } else if (item.type === 'numberRange' || item.type === 'numberRange2') {
          item.minVal = ''
          item.maxVal = ''
          item.checkStu = false
        } else if (item.type === 'newLabelFilter') {
          item.val = isEmpty(item.defaultVal) ? [] : item.defaultVal
        } else if (item.type === 'newLabelFilterV2') {
          item.val = []
        } else if (item.type === 'org' && !item.hiddenItem) {
          item.val = []
          proxy.$refs.cascader[0].panel.clearCheckedNodes()
        } else if (item.type === 'chooseDept' && !item.hiddenItem) {
          item.val = []
          item.infos = []
          if (proxy.$refs.chooseDeptSearchRef) {
            proxy.$refs.chooseDeptSearchRef[0]?.clearFun()
          }
        } else if (item.type === 'chooseBusiness' && !item.hiddenItem) {
          let ids = []
          if (item.defaultVal && item.defaultVal.length > 0) {
            ids = item.defaultVal.map(x => x.value)
          }
          item.ids = ids || []
          item.isCheckAll = false
          item.infos = []
          if (proxy.$refs[`chooseBusinessSearchRef${item.principalType}`]) {
            proxy.$refs[`chooseBusinessSearchRef${item.principalType}`][0]?.clearFun()
            if (item.defaultVal && item.defaultVal.length > 0) {
              proxy.$refs[`chooseBusinessSearchRef${item.principalType}`][0]?.setDefaultValueFun(
                item.defaultVal
              )
            }
          }
        } else if (item.type === 'fail' && !item.hiddenItem) {
          item.val = {}
        } else if (item.type === 'chooseBusinessGroup' && !item.hiddenItem) {
          let ids = []
          if (item.defaultVal && item.defaultVal.length > 0) {
            ids = item.defaultVal.map(x => x.value)
          }
          item.ids = ids || []
          item.isCheckAll = false
          item.infos = []
          if (proxy.$refs[`chooseBusinessSearchGroupRef${item.principalType}`]) {
            proxy.$refs[`chooseBusinessSearchGroupRef${item.principalType}`][0]?.clearFun()
            if (item.defaultVal && item.defaultVal.length > 0) {
              proxy.$refs[
                `chooseBusinessSearchGroupRef${item.principalType}`
              ][0]?.setDefaultValueFun(item.defaultVal)
            }
          }
        } else {
          item.val = isEmpty(item.defaultVal) ? null : item.defaultVal
        }
      }
    }
    // 初始化筛选项的数据 -- 目前仅支持普通的筛选项、部门、业务主体
    function initQuery(e) {
      searchComponents.value.forEach((item, i) => {
        if (item.type === 'numberRange' || item.type === 'numberRange2') {
          item.minVal = e[i].minVal
          item.maxVal = e[i].maxVal
          item.checkStu = e[i].checkStu
        } else if (item.type === 'org' && !item.hiddenItem) {
          item.val = e[i].val
          // proxy.$refs.cascader[0].panel.clearCheckedNodes()
        } else if (item.type === 'chooseDept' && !item.hiddenItem) {
          item.val = e[i].val
          if (proxy.$refs.chooseDeptSearchRef) {
            if (isNotEmpty(e[i].infos)) {
              proxy.$refs.chooseDeptSearchRef[0]?.setDefaultValueFun(e[i].infos)
            } else {
              proxy.$refs.chooseDeptSearchRef[0]?.clearFun()
            }
          }
        } else if (item.type === 'chooseBusiness' && !item.hiddenItem) {
          item.ids = isNotEmpty(e[i].ids) ? e[i].ids : []
          item.isCheckAll = e[i].isCheckAll || false
          if (proxy.$refs[`chooseBusinessSearchRef${item.principalType}`]) {
            // proxy.$refs[`chooseBusinessSearchRef${item.principalType}`][0]?.clearFun()
            if (item.defaultVal && item.defaultVal.length > 0) {
              proxy.$refs[`chooseBusinessSearchRef${item.principalType}`][0]?.setDefaultValueFun(
                item.defaultVal
              )
            }
          }
        } else if (item.type === 'chooseBusinessGroup' && !item.hiddenItem) {
          item.ids = isNotEmpty(e[i].ids) ? e[i].ids : []
          item.isCheckAll = e[i].isCheckAll || false
          if (proxy.$refs[`chooseBusinessSearchGroupRef${item.principalType}`]) {
            if (e[i].infos && e[i].infos.length > 0) {
              proxy.$refs[
                `chooseBusinessSearchGroupRef${item.principalType}`
              ][0]?.setDefaultValueFun(e[i].infos)
            } else {
              proxy.$refs[
                `chooseBusinessSearchGroupRef${item.principalType}`
              ][0]?.setDefaultValueFun([])
              proxy.$refs[`chooseBusinessSearchGroupRef${item.principalType}`][0]?.clearFun()
            }
          }
        } else {
          item.val = isEmpty(e[i].val) ? null : e[i].val
        }
      })
    }
    function reset() {
      if (searchComponents.value.length > 0) {
        clearQuery()
        resetDeptMoreLine()
        if (props.useOwnReset) {
          emit('reset')
        } else {
          query()
        }
      } else {
        emit('reset')
      }
    }

    // 内置查询方法 返回查询对象
    function query() {
      const searchObj = {}
      let checkStu = false
      for (const item of searchComponents.value) {
        if (item.type === 'numberRange' && item.checkStu) {
          checkStu = item.checkStu
        }
        // 处理proxy对象
        searchObj[item.filed] = typeof item.val === 'object' ? toRaw(item.val) : item.val
      }
      if (checkStu) {
        ElMessage({ type: 'error', message: '请规范输入内容' })
        return
      }
      emit('getData', searchObj)
    }

    // 内置导出文件
    function send() {
      console.log('export') //
    }

    // 检查是否有表情包
    function retEmit(e, index, valName = 'val') {
      searchComponents.value[index][valName] = e.target.value.replace(
        // eslint-disable-next-line no-misleading-character-class
        /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\\A9|AE]\u3030|\uA9|\uAE|\u3030/gi,
        ''
      )
    }
    function retEmitMinNumber(e, index, valName = 'val') {
      const reg =
        /[^a-zA-Z0-9_\u4e00-\u9fa5\u3002\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\u3001\uff1f\u300a\u300b/\s,.!！:()?/_""-——]/g
      searchComponents.value[index][valName] = e.target.value.replace(reg, '')

      // 比较两个数字的大小
      const { minVal, maxVal } = searchComponents.value[index]

      if (parseInt(minVal) < 0) {
        searchComponents.value[index][valName] = undefined
      } else if (minVal && maxVal && parseInt(minVal) > parseInt(maxVal)) {
        searchComponents.value[index][valName] = maxVal
      } else if (parseInt(minVal) > 999999) {
        searchComponents.value[index][valName] = 999999
      }
    }
    function retEmitMaxNumber(e, index, valName = 'val') {
      const reg =
        /[^a-zA-Z0-9_\u4e00-\u9fa5\u3002\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\u3001\uff1f\u300a\u300b/\s,.!！:()?/_""-——]/g
      searchComponents.value[index][valName] = e.target.value.replace(reg, '')
      // 比较两个数字的大小
      const { minVal, maxVal } = searchComponents.value[index]
      if (parseInt(maxVal) < 0) {
        searchComponents.value[index][valName] = minVal || undefined
      } else if (minVal && maxVal && parseInt(minVal) > parseInt(maxVal)) {
        searchComponents.value[index][valName] = minVal
      } else if (parseInt(maxVal) > 999999) {
        searchComponents.value[index][valName] = 999999
      }
    }
    function retEmitNumber(e, index, valName = 'val') {
      const reg =
        /[^a-zA-Z0-9_\u4e00-\u9fa5\u3002\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\u3001\uff1f\u300a\u300b/\s,.!！:()?/_""-——]/g
      searchComponents.value[index][valName] = e.target.value.replace(reg, '')
      console.log(searchComponents.value[index])
      // 比较两个数字的大小
      const { minVal, maxVal } = searchComponents.value[index]
      console.log(minVal, maxVal)
      if (minVal && maxVal && parseInt(minVal) > parseInt(maxVal)) {
        searchComponents.value[index].checkStu = true
      } else if (parseInt(maxVal) === 0 && minVal && parseInt(minVal) > parseInt(maxVal)) {
        searchComponents.value[index].checkStu = true
      } else {
        searchComponents.value[index].checkStu = false
      }
    }
    function inputEmit(e, index, item, valName = 'val') {
      // 只能输入数字
      if (item.isNumber || item.isPhone) {
        searchComponents.value[index][valName] = e.replace(/[^\d]/g, '')
      }
    }

    const message = inject('$message')
    function rangeTimeChange(e, item) {
      console.log('rangetIME', e, item)
      if (item.typeOrigin === 'videoThreeMonth') {
        if (e && e.length > 0) {
          console.log(dateFormat(e[1]))
          console.log(dateFormat(e[0]))
          const endDateTime = new Date(dateFormat(e[1]) + ' 00:00:00').getTime()
          const startDateTime = new Date(dateFormat(e[0]) + ' 00:00:00').getTime()
          const three = 89 * 24 * 3600 * 1000
          const threeMonths = endDateTime - three
          if (startDateTime < threeMonths) {
            message.error('最多只能选择3个月')
            item.val = [
              new Date(dateFormat(e[0]) + ' 00:00:00'),
              new Date(
                dateFormat(
                  new Date(
                    new Date().setTime(
                      new Date(dateFormat(e[0]) + ' 00:00:00').getTime() + 89 * 24 * 60 * 60 * 1000
                    )
                  )
                ) + ' 23:59:59'
              )
            ]
          }
        }
      } else if (item.typeOrigin === 'dateMonthRange') {
        if (e && e.length > 0) {
          console.log(dateFormat(e[1]))
          console.log(dateFormat(e[0]))
          const endDateTime = new Date(dateFormat(e[1]) + ' 00:00:00').getTime()
          const startDateTime = new Date(dateFormat(e[0]) + ' 00:00:00').getTime()
          const three = (parseInt(item.typeOriginNumber || 1) * 31 - 1) * 24 * 3600 * 1000
          const threeMonths = endDateTime - three
          if (startDateTime < threeMonths) {
            message.error(`最多只能选择${parseInt(item.typeOriginNumber || 1) * 31}天内数据`)
            item.val = [
              new Date(dateFormat(e[0]) + ' 00:00:00'),
              new Date(
                dateFormat(
                  new Date(
                    new Date().setTime(
                      new Date(dateFormat(e[0]) + ' 00:00:00').getTime() +
                        (parseInt(item.typeOriginNumber || 1) * 31 - 1) * 24 * 60 * 60 * 1000
                    )
                  )
                ) + ' 23:59:59'
              )
            ]
          }
        }
      } else {
        emit('rangeTimeChange', e)
      }
    }

    // 打开选择标签组件
    function openChoseLabel(type) {
      emit('openChoseLabel', type)
    }

    // 更新部门选中数据
    function updateDeptIds(data, item, index) {
      searchComponents.value[index].val = isNotEmpty(data) ? data : []
    }
    function updateDeptInfos(data, item, index) {
      searchComponents.value[index].infos = isNotEmpty(data) ? data : []
    }
    // 获取部门筛选组件的层级列表 返回格式为多维数组
    function getMoreInfo() {
      return proxy.$refs.chooseDeptSearchRef[0]?.getMoreInfo()
    }

    // 将部门筛选组件的展开列表重置 例如keepalive页面 原先展开了3列，重新加载时，需要置回1列
    function resetDeptMoreLine() {
      if (proxy.$refs.chooseDeptSearchRef) {
        proxy.$refs.chooseDeptSearchRef[0]?.resetMoreLine()
      }
    }

    // 更新业务主体选中的数据
    function updateBusiness(info, item, index) {
      if (isNotEmpty(info)) {
        console.log('选中的数据 - 111,', info.ids, index)
        searchComponents.value[index].isCheckAll = info.isCheckAll || false
        searchComponents.value[index].ids = info.ids || []
        searchComponents.value[index].infos = info.infos || []
      } else {
        searchComponents.value[index].isCheckAll = false
        searchComponents.value[index].ids = []
        searchComponents.value[index].infos = []
      }
    }

    // 标签选择数据
    function updateTag(info, item, index) {
      if (isNotEmpty(info)) {
        item.val = info
      } else {
        item.val = []
      }
    }
    // 文件夹数据选中
    function searchFailSelect(info, item, index) {
      if (isNotEmpty(info)) {
        item.val = info
      } else {
        item.val = []
      }
    }
    const isShrink = ref(true)
    // 折叠/展开
    function updateShrink() {
      isShrink.value = !isShrink.value
      emit('updateShrink', isShrink.value)
    }
    function clearShrink() {
      isShrink.value = true
      emit('updateShrink', isShrink.value)
    }

    function inputClearEmit(e, index, item, valName = 'val') {
      if (item.clearHandle) {
        emit('clearInput', item.filed)
      }
    }
    // 某些页面使用了keepAlive，所以需要菜单点击进入的时候清空筛选项
    expose({
      clearShrink,
      reset,
      clearQuery,
      initQuery,
      getMoreInfo,
      resetDeptMoreLine,
      updateShrink
    })
    return {
      clearShrink,
      searchFailSelect,
      updateTag,
      updateDeptIds,
      updateDeptInfos,
      updateBusiness,
      query,
      reset,
      clearQuery,
      initQuery,
      send,
      retEmit,
      inputEmit,
      rangeTimeChange,
      loading,
      openChoseLabel,
      retEmitNumber,
      retEmitMinNumber,
      retEmitMaxNumber,
      props,
      updateShrink,
      isShrink,
      inputClearEmit
    }
  }
}
</script>

<style lang="scss">
.xm_search {
  padding: 24px 0 8px 24px;
  background: #fff;
  border-radius: 4px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;

  .search_item {
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #303133;
    margin-bottom: 16px;
    margin-right: 24px;

    .item_label {
      flex-shrink: 0;
      margin-right: 14px;
      text-align: right;
    }

    .item_label_flex {
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
      align-items: center;
    }

    .item_content {
      flex-shrink: 0;

      .el-input {
        width: 230px;
      }

      .el-tag__content {
        max-width: 100px !important;
      }

      .el-date-editor--datetimerange {
        .el-range-input {
          width: 45% !important;
        }
      }
    }
    .numberRange_box {
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      .el-input__inner {
        border: 0;
        padding: 0 11px 0 11px;
        text-align: center;
      }
    }
    .el-select__tags {
      padding-left: 6px !important;
    }

    .inputAndSelect {
      .el-select__tags-text {
        max-width: 60px !important;
      }
    }
    .select-trigger .el-select__input {
      margin-left: 5px !important;
    }
  }
  .shrink_btn {
    color: #364fcd;
    cursor: pointer;
    margin-right: 18px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
  }
}
</style>
