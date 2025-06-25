<template>
  <div class="rule_filter_page">
    <div :class="{ page_left: true, element_page_left: props.rulesOrigin < 10 }">
      <!-- 筛选项 -->
      <div class="left_top">
        <template v-for="(item, index) in props.showRules">
          <div class="one_left_top" v-if="item == 'elementOrigin'" :key="index">
            <div class="top_label">原料类型：</div>
            <div class="top_content">
              {{
                props.rulesOrigin == 1
                  ? '视频'
                  : props.rulesOrigin == 2
                  ? '图片'
                  : props.rulesOrigin == 3
                  ? '音频'
                  : props.rulesOrigin == 4
                  ? '文本（用于音频分镜制作）'
                  : ''
              }}
            </div>
          </div>
          <div class="one_left_top" v-if="item == 'isDynamicFilter'" :key="index">
            <div class="top_label">筛选规则：</div>
            <div class="top_content">
              <el-radio-group v-model="form.isDynamicFilter">
                <el-radio-button :label="true">
                  <div class="one_radio_box">
                    动态规则
                    <el-tooltip
                      class="item"
                      effect="dark"
                      :content="`根据筛选条件直接选中${filterName}，已选${filterName}数将根据筛选条件动态变化`"
                      placement="top"
                    >
                      <img
                        src="https://tagvv-1256030678.file.myqcloud.com/20230322gvgyn.png"
                        class="tooltip_icon"
                        alt
                      />
                    </el-tooltip>
                  </div>
                </el-radio-button>
                <el-radio-button :label="false">
                  <div class="one_radio_box">
                    静态规则
                    <el-tooltip
                      class="item"
                      effect="dark"
                      :content="`选择的${filterName}数量固定，可在条件查找后对单个${filterName}进行选择`"
                      placement="top"
                    >
                      <img
                        src="https://tagvv-1256030678.file.myqcloud.com/20230322gvgyn.png"
                        class="tooltip_icon"
                        alt
                      />
                    </el-tooltip>
                  </div>
                </el-radio-button>
              </el-radio-group>
            </div>
          </div>
          <div class="one_left_top" v-if="item == 'createTime'" :key="index">
            <div class="top_label">上传时间：</div>
            <div class="top_content">
              <el-date-picker
                clearable
                style="width: 220px"
                v-model="form.filter.createTime"
                type="daterange"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                unlink-panels
                :disabled-date="
                  time => {
                    return time.getTime() > Date.now()
                  }
                "
                @change="rangeTimeChange"
                :editable="false"
              ></el-date-picker>
            </div>
          </div>
          <div class="one_left_top" v-if="item == 'modelName'" :key="index">
            <div class="top_label">模型名称：</div>
            <div class="top_content">
              <el-input
                clearable
                style="width: 220px"
                v-model.trim="form.filter.modelName"
                placeholder="请输入模型名称"
                @blur="retEmit($event, 'modelName')"
              />
            </div>
          </div>
          <div class="one_left_top" v-if="item == 'userName'" :key="index">
            <div class="top_label" style="text-align: right">用户名：</div>
            <div class="top_content">
              <el-input
                clearable
                style="width: 220px"
                v-model.trim="form.filter.userName"
                placeholder="请输入用户名"
                @blur="retEmit($event, 'userName')"
              />
            </div>
          </div>
          <div class="one_left_top" v-if="item == 'departmentIds'" :key="index">
            <div class="top_label">所属部门：</div>
            <div class="top_content">
              <el-cascader
                style="width: 220px"
                v-model="form.filter.departmentIdList"
                :options="props.depList"
                clearable
                collapse-tags
                placeholder="请选择部门"
                :show-all-levels="false"
                :props="depProp"
                @change="departmentChange"
              ></el-cascader>
            </div>
          </div>
          <div class="one_left_top" v-if="item == 'tags'" :key="index">
            <div class="top_label">标签筛选：</div>

            <div class="top_content">
              已选择{{ form.filter.tags ? form.filter.tags.length : 0 }}个标签
              <el-button style="margin-left: 16px" @click="openTagChose">选择</el-button>
              <el-tooltip
                class="item"
                effect="dark"
                :content="
                  props.rulesOrigin > 10
                    ? '标签筛选仅对品牌自有的模型生效，不包含星麦内置的'
                    : '标签筛选仅对品牌自有的原料生效，不包含星麦内置的'
                "
                placement="top"
              >
                <img
                  src="https://tagvv-1256030678.file.myqcloud.com/20230322gvgyn.png"
                  class="tooltip_icon"
                  alt
                />
              </el-tooltip>
            </div>
          </div>
          <div class="one_left_top" v-if="item == 'elementName'" :key="index">
            <div class="top_label">原料名称：</div>
            <div class="top_content">
              <el-input
                clearable
                style="width: 220px"
                v-model.trim="form.filter.name"
                placeholder="请输入名称/关键词"
                @blur="retEmit($event, 'name')"
              />
            </div>
          </div>
          <div class="one_left_top" v-if="item == 'sources'" :key="index">
            <div class="top_label">原料来源：</div>
            <div class="top_content">
              <el-select
                v-model="form.filter.sources"
                placeholder="请选择原料来源"
                style="width: 220px"
                clearable
                multiple
                collapse-tags
                collapse-tags-tooltip
              >
                <el-option
                  v-for="item in elementSourceList"
                  :label="item.label"
                  :value="item.value"
                  :key="item.value"
                />
              </el-select>
            </div>
          </div>
          <!-- 使用次数 -->
          <div class="one_left_top" v-if="item == 'useTime'" :key="index">
            <div class="top_label">使用次数：</div>

            <div class="top_content item_box">
              <el-input-number
                placeholder="最低次数"
                v-model="form.filter.useTimesMin"
                :min="undefined"
                :precision="0"
                :step="1"
                :max="form.filter.useTimesMax || 9999"
                @blur="changeUseTimeMin($event)"
              ></el-input-number>

              <span style="color: #c8c9cc; font-size: 14px">至</span>
              <el-input-number
                placeholder="最高次数"
                v-model="form.filter.useTimesMax"
                :max="9999"
                :precision="0"
                :step="1"
                :min="form.filter.useTimesMin || undefined"
                @blur="changeUseTimeMax($event)"
              ></el-input-number>
            </div>
          </div>
          <!-- 时长(秒) -->
          <div class="one_left_top" v-if="item == 'duration'" :key="index">
            <div class="top_label">时长(秒)：</div>

            <div class="top_content item_box">
              <el-input-number
                placeholder="最低时长"
                v-model="form.filter.durationMin"
                :min="undefined"
                :precision="2"
                :step="0.01"
                :max="form.filter.durationMax || 9999"
                @blur="changeDurationMin($event)"
              ></el-input-number>

              <span style="color: #c8c9cc; font-size: 14px">至</span>
              <el-input-number
                placeholder="最高时长"
                v-model="form.filter.durationMax"
                :max="9999"
                :precision="2"
                :step="0.01"
                :min="undefined"
                @blur="changeDurationMax($event)"
              ></el-input-number>
            </div>
          </div>
        </template>
      </div>
      <!-- 筛选按钮 -->
      <div class="left_bottom">
        <template v-if="form.isDynamicFilter">
          <el-button class="left_bottom_btn" @click="searchFun('dynamic')">
            预览已选{{ filterName }}
          </el-button>
          <div class="left_bottom_mark">
            注：不设置条件即表示选择当前{{ filterName }}库中所有{{ filterName }}
          </div>
        </template>
        <el-button class="left_bottom_btn" v-else @click="searchFun('static')">
          查找{{ filterName }}
        </el-button>
      </div>
    </div>
    <div :class="{ page_right: true, element_page_right: props.rulesOrigin < 10 }">
      <!-- 动态规则的已选预览  -->
      <div class="page_right_box page_right_dynamic" v-if="form.isDynamicFilter">
        <div class="dynamic_title">已选{{ filterName }}预览</div>
        <div
          class="has_dynamic"
          v-loading="pageInfo.loading"
          v-if="dynamicList && dynamicList.length > 0"
        >
          <div
            class="dynamic_content"
            :infinite-scroll-delay="1000"
            v-infinite-scroll="dynamicLoadFun"
            :infinite-scroll-distance="50"
            :infinite-scroll-immediate="false"
            :infinite-scroll-disabled="dynamicList.length >= pageInfo.dynamicTotal"
          >
            <filterSwiper
              :list="dynamicList"
              filterOrigin="dynamic"
              :rulesOrigin="props.rulesOrigin"
            ></filterSwiper>
            <div class="swiper_loading_box">
              <img
                src="/public/loading.gif"
                v-if="pageInfo.loading && pageInfo.dynamicPageNo > 1"
                alt=""
              />
              {{
                pageInfo.loading
                  ? pageInfo.dynamicPageNo === 1
                    ? ''
                    : '加载中...'
                  : dynamicList.length >= pageInfo.dynamicTotal
                  ? pageInfo.dynamicPageNo < 2
                    ? ''
                    : '已经到底了~'
                  : '上拉加载更多~'
              }}
            </div>
          </div>
          <div class="dynamic_bottom">
            约
            <span>{{ pageInfo.dynamicTotal }}</span>
            条
            <el-tooltip
              class="item"
              effect="dark"
              :content="`将根据${filterName}库实际情况即时调整`"
              placement="right"
            >
              <img
                src="https://tagvv-1256030678.file.myqcloud.com/20230322gvgyn.png"
                class="tooltip_icon"
                alt
              />
            </el-tooltip>
          </div>
        </div>

        <div class="none_list has_dynamic" v-else>
          <img src="@/assets/images/content_center/no_activity.png" alt />
          暂无数据
        </div>
      </div>
      <!-- 静态规则的查找结果和已选预览 -->
      <div class="page_right_box page_right_static" v-else>
        <el-tabs v-model="staticChooseTab">
          <el-tab-pane label="查找结果" name="search">
            <div
              class="static_search_box"
              v-loading="pageInfo.loading"
              v-if="staticList && staticList.length > 0"
            >
              <div
                class="static_search_content"
                :infinite-scroll-delay="1000"
                v-infinite-scroll="staticLoadFun"
                :infinite-scroll-distance="50"
                :infinite-scroll-immediate="false"
                :infinite-scroll-disabled="staticList.length >= pageInfo.staticTotal"
              >
                <filterSwiper
                  :list="staticList"
                  filterOrigin="staticSearch"
                  :rulesOrigin="props.rulesOrigin"
                  @chooseFun="chooseFun"
                ></filterSwiper>
                <div class="swiper_loading_box">
                  <img
                    src="/public/loading.gif"
                    v-if="pageInfo.loading && pageInfo.staticPageNo > 1"
                    alt=""
                  />
                  {{
                    pageInfo.loading
                      ? pageInfo.staticPageNo === 1
                        ? ''
                        : '加载中...'
                      : staticList.length >= pageInfo.staticTotal
                      ? pageInfo.staticPageNo < 2
                        ? ''
                        : '已经到底了~'
                      : '上拉加载更多~'
                  }}
                </div>
              </div>
              <div class="static_search_bottom">
                共
                <span>{{ pageInfo.staticTotal }}</span>
                条，已选
                <span>{{ staticChooseList.length }}</span>
                条
              </div>
            </div>
            <div class="none_list static_search_box" v-else>
              <img src="@/assets/images/content_center/no_activity.png" alt />
              暂无数据
            </div>
          </el-tab-pane>
          <el-tab-pane :label="`已选${filterName}预览`" name="choose">
            <div class="static_search_box" v-if="staticChooseList && staticChooseList.length > 0">
              <div class="static_search_content">
                <filterSwiper
                  :list="staticChooseList"
                  filterOrigin="staticChoose"
                  :rulesOrigin="props.rulesOrigin"
                  @delFun="delFun"
                ></filterSwiper>
              </div>
              <div class="static_search_bottom">
                <el-link type="primary" style="margin-right: 12px" @click="clearFun">清空</el-link>
                共
                <span>{{ staticChooseList.length }}</span>
                条
              </div>
            </div>
            <div class="none_list static_search_box" v-else>
              <img src="@/assets/images/content_center/no_activity.png" alt />
              暂无数据
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
    <addTagDOM
      v-if="searchTagDialog.show"
      :addDialog="searchTagDialog"
      @updateTag="updateTag"
      :subtitle="searchTagDialog.subtitle"
      :canDelete="searchTagDialog.canDelete"
    />
  </div>
</template>
<script setup>
import { list } from '@/api/content_center/material_library.js'
import filterSwiper from './filter_swiper.vue'
import { throttle, dateFormat, isEmpty } from '@/utils/tools.js'
import { listUserCanUseModel } from '@/api/sumvideo/digital_model.js'
import addTagDOM from '@/views/content_center/content_repository/components/addTag_dialog.vue'

const props = defineProps({
  info: {
    type: Object,
    default: () => {
      return {
        rulesOrigin: null, // 1视频 2图片 3音频 4文本   11面部模型 12 任务模型
        showRules: [], // 显示的筛选项
        form: {} // 已经保存的设置项
      }
    }
  },
  depList: {
    type: Array,
    default: () => []
  }, // 所属部门列表
  form: {
    type: Object,
    default: () => {
      return {}
    }
  }, // 已经保存的设置项
  rulesOrigin: {
    type: Number,
    default: null
  }, // 1视频 2图片 3音频 4文本   11面部模型 12 人物模型
  showRules: {
    type: Array,
    default: () => []
  }, // 已经保存的设置项
  minDuration: {
    type: Number || String,
    default: undefined
  } // 视频、音频分镜下 需要设置最小的时长
})
const depProp = ref({
  multiple: true,
  value: 'id',
  label: 'name',
  children: 'children',
  expandTrigger: 'click',
  checkStrictly: true
}) // 部门的prop
const elementSourceList = reactive([
  {
    label: '营销任务上传',
    value: 1
  },
  {
    label: '流水线上传',
    value: 2
  },
  {
    label: '剪辑页上传',
    value: 7
  },
  {
    label: '原料库上传',
    value: 3
  },
  {
    label: '云原料',
    value: 6
  },
  {
    label: '封面制作上传',
    value: 10
  },
  {
    label: '智能拆解',
    value: 13
  },
  {
    label: '模板式生成上传',
    value: 11
  }
  // {
  //   label: '剧本式生成上传',
  //   value: 12
  // }
]) // 原料来源
const form = ref({
  isDynamicFilter: true
}) // 要保存的信息
const pageInfo = reactive({
  pageSize: 16,
  dynamicPageNo: 1,
  staticPageNo: 1,
  dynamicTotal: 0,
  staticTotal: 0,
  loading: false
}) // 分页请求的设置
const dynamicList = ref([]) // 右侧展示的---动态规则的查找结果
const staticList = ref([]) // 右侧展示---静态规则的查找结果
const staticChooseList = ref([]) // 右侧展示---静态规则的已选结果
const staticChooseTab = ref('search')
// 检查是否有表情包
function retEmit(e, type) {
  // const reg =
  //   /[^a-zA-Z0-9_\u4e00-\u9fa5\u3002\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\u3001\uff1f\u300a\u300b/\s,.!！:()?/_""-——]/g
  // form.value[type] = e.target.value.replace(reg, '')
}
// 上传时间的获取
function rangeTimeChange(e) {
  if (e) {
    form.value.filter.createTimeMin = dateFormat(e[0]) + ' 00:00:00'
    form.value.filter.createTimeMax = dateFormat(e[1]) + ' 23:59:59'
  } else {
    form.value.filter.createTimeMin = null
    form.value.filter.createTimeMax = null
  }
}
// 选择标签--begin
const searchTagDialog = reactive({
  show: false, // 显隐
  type: null, // 类型
  hideTitleSpan: true,
  subtitle: '带有特殊标识的标签为云原料标签',
  canDelete: true,
  source: 0, // 0 品牌创建 6 星麦内置（和原料保持一致）
  chooseTagList: [] // 已选择
})
const openTagChose = throttle(() => {
  searchTagDialog.show = true
  searchTagDialog.type = props.rulesOrigin > 10 ? 14 : 15
  // 1视频 2图片 3音频 4文本 显示 subtitle 不可以删除标签
  searchTagDialog.hideTitleSpan = ![1, 2, 3, 4].includes(props.rulesOrigin)
  searchTagDialog.canDelete = ![1, 2, 3, 4].includes(props.rulesOrigin)
  searchTagDialog.source = [1, 2, 3, 4].includes(props.rulesOrigin) ? null : 0
  searchTagDialog.chooseTagList =
    typeof form.value.filter.tagList === 'string'
      ? JSON.parse(form.value.filter.tagList)
      : form.value.filter.tagList
      ? form.value.filter.tagList
      : []
}, 500)
function updateTag(e) {
  form.value.filter.tagList = e
  // 传值给search组件
  const arr = ref([])
  e.forEach(item => {
    arr.value.push(item.id)
  })
  form.value.filter.tags = arr.value
}
// 选择标签--end
// 部门的选择
function departmentChange() {
  console.log(form.value.filter.departmentIdList)

  const deps = []
  if (form.value.filter.departmentIdList && form.value.filter.departmentIdList.length > 0) {
    form.value.filter.departmentIdList.forEach(x => {
      deps.push(x[x.length - 1])
    })
  }
  form.value.filter.departmentIds = deps
}
// 使用次数的修改
function changeUseTimeMin(e) {
  if (parseInt(e.target.value) < 0) {
    form.value.filter.useTimesMin = undefined
  }
}
function changeUseTimeMax(e) {
  if (parseInt(e.target.value) < 0) {
    form.value.filter.useTimesMax = form.value.filter.useTimesMin || undefined
  }
}
// 时长的修改
function changeDurationMin(e) {
  if (Number(props.minDuration) > 0) {
    if (e.target.value === '') {
      form.value.filter.durationMin = props.minDuration
      return
    }
    if (Number(parseFloat(e.target.value).toFixed(2)) < Number(props.minDuration)) {
      form.value.filter.durationMin = props.minDuration
    }
  } else {
    if (Number(parseFloat(e.target.value).toFixed(2)) < 0) {
      form.value.filter.durationMin = undefined
    }
  }
}
function changeDurationMax(e) {
  if (e.target.value === '') {
    form.value.filter.durationMax = undefined
    return
  }
  if (Number(props.minDuration) > 0) {
    if (Number(parseFloat(e.target.value).toFixed(2)) < Number(form.value.filter.durationMin)) {
      form.value.filter.durationMax =
        Number(parseFloat(form.value.filter.durationMin).toFixed(2)) < Number(props.minDuration)
          ? props.minDuration
          : form.value.filter.durationMin
    }
  } else {
    if (Number(parseFloat(e.target.value).toFixed(2)) < 0) {
      form.value.filter.durationMax = form.value.filter.durationMin || undefined
    } else if (
      Number(form.value.filter.durationMin) &&
      Number(parseFloat(e.target.value).toFixed(2)) < Number(form.value.filter.durationMin)
    ) {
      form.value.filter.durationMax = form.value.filter.durationMin || undefined
    }
  }
}
// 查询结果
function getList() {
  const rulePromise =
    props.rulesOrigin > 10
      ? listUserCanUseModel({
          brandId: localStorage.getItem('brandInfo')
            ? JSON.parse(localStorage.getItem('brandInfo')).brandId
            : '',
          depIds: form.value.filter.departmentIds,
          isBackGroundPreview: true,
          modelIds: [],
          modelType: props.rulesOrigin === 11 ? 1 : 2,
          name: form.value.filter.modelName,
          orderSetting: 'DESC:model_create_time',
          pageNo: form.value.isDynamicFilter ? pageInfo.dynamicPageNo : pageInfo.staticPageNo,
          pageSize: pageInfo.pageSize,
          searchCount: true,
          tagIds: form.value.filter.tags || [],
          username: form.value.filter.userName
        })
      : list({
          name: form.value.filter.name,
          createTimeMax: form.value.filter.createTimeMax,
          createTimeMin: form.value.filter.createTimeMin,
          useTimesMin: form.value.filter.useTimesMin,
          useTimesMax: form.value.filter.useTimesMax,
          durationMin: form.value.filter.durationMin,
          durationMax: form.value.filter.durationMax,
          tags: form.value.filter.tags || [],
          type: [props.rulesOrigin],
          sources:
            form.value.filter.sources && form.value.filter.sources.length > 0
              ? form.value.filter.sources
              : [1, 2, 3, 7, 6],
          pageNo: form.value.isDynamicFilter ? pageInfo.dynamicPageNo : pageInfo.staticPageNo,
          pageSize: pageInfo.pageSize,
          subSource: [1, 0]
        })
  rulePromise
    .then(res => {
      if (res.code === 0) {
        if (form.value.isDynamicFilter) {
          if (pageInfo.dynamicPageNo === 1) {
            dynamicList.value = res.data.records || []
            pageInfo.dynamicTotal = res.data.total || 0
          } else {
            dynamicList.value = dynamicList.value.concat(res.data.records || [])
          }
        } else {
          const list = res.data.records || []
          list.forEach(x => {
            x.rulesFilterId = props.rulesOrigin > 10 ? x.modelId : x.id
            let isC = false
            staticChooseList.value.forEach(y => {
              if (x.rulesFilterId === y.rulesFilterId) {
                isC = true
              }
            })
            x.isChoose = isC
          })
          if (pageInfo.staticPageNo === 1) {
            staticList.value = list

            pageInfo.staticTotal = res.data.total || 0
          } else {
            staticList.value = staticList.value.concat(list)
          }
        }
      }
      pageInfo.loading = false
    })
    .catch(() => {
      pageInfo.loading = false
    })
}

// 动态规则的上拉加载
function dynamicLoadFun() {
  pageInfo.loading = true
  pageInfo.dynamicPageNo++
  getList()
}
// 静态规则的上拉加载
function staticLoadFun() {
  pageInfo.loading = true
  pageInfo.staticPageNo++
  getList()
}
// 重置查询数据
function resetFun() {
  pageInfo.loading = true
  getList()
}

// 按钮的查询
const searchFun = throttle(e => {
  if (e === 'dynamic') {
    pageInfo.dynamicPageNo = 1
  } else {
    pageInfo.staticPageNo = 1
  }
  resetFun()
}, 500)
// 设置初始化的数据
function setFilter() {
  form.value.filter =
    props.rulesOrigin > 10
      ? {
          modelType: props.rulesOrigin === 11 ? 1 : 2,
          modelName: '',
          userName: '',
          departmentIds: [],
          departmentIdList: [],
          tags: []
        }
      : {
          type: props.rulesOrigin,
          name: '',
          createTime: [],
          createTimeMax: undefined,
          createTimeMin: undefined,
          useTimesMax: undefined,
          useTimesMin: undefined,
          durationMin:
            props.rulesOrigin === 1 || props.rulesOrigin === 3 ? props.minDuration : undefined,
          durationMax: undefined,
          tags: [],
          sources: []
        }
}
const filterName = ref('')
function init() {
  console.log(
    '打开选择原料/模型',
    props,
    !isEmpty(props.form),
    props.form.creationList,
    !props.form.isDynamicFilter && props.form.creationIds && props.form.creationIds.length > 0
  )
  pageInfo.dynamicPageNo = 1
  pageInfo.staticPageNo = 1
  filterName.value = props.rulesOrigin > 10 ? '模型' : '原料'
  if (!isEmpty(props.form)) {
    form.value = JSON.parse(JSON.stringify(props.form))
    if (!(props.form.filter && !isEmpty(props.form.filter))) {
      setFilter()
    }
    if (typeof form.value.filter.createTime === 'string') {
      form.value.filter.createTime = JSON.parse(form.value.filter.createTime)
    }
    // 如果是静态规则，并且之前选择过数据了，就默认显示已选列表
    if (
      !props.form.isDynamicFilter &&
      props.form.creationIds &&
      props.form.creationIds.length > 0
    ) {
      staticChooseTab.value = 'choose'
      staticChooseList.value =
        typeof props.form.creationList === 'string'
          ? JSON.parse(props.form.creationList)
          : props.form.creationList
    } else {
      staticChooseList.value = []
      resetFun()

      setFilterCreationFun()
    }
  } else {
    form.value = JSON.parse(
      JSON.stringify({
        isDynamicFilter: true,
        creationIds: [] // 静态筛选时，传全部的作品 id
      })
    )
    setFilter()
    staticChooseList.value = []
    resetFun()

    setFilterCreationFun()
  }
}
init()
// 静态规则-选中数据
const chooseFun = ({ e, item, i }) => {
  if (item.isChoose) {
    staticChooseList.value.push(item)
  } else {
    const index = staticChooseList.value.findIndex(x => x.rulesFilterId === item.rulesFilterId)
    staticChooseList.value.splice(index, 1)
  }

  setFilterCreationFun()
}
// 静态规则-删除选中的数据
const delFun = ({ item, index }) => {
  if (staticList.value && staticList.value.length > 0) {
    const i = staticList.value.findIndex(x => x.rulesFilterId === item.rulesFilterId)
    staticList.value[i].isChoose = false
  }
  staticChooseList.value.splice(index, 1)

  setFilterCreationFun()
}
// 静态规则-清空所有选中的数据
const clearFun = throttle(() => {
  staticChooseList.value = JSON.parse(JSON.stringify([]))
  staticList.value.forEach(x => {
    x.isChoose = false
  })
  setFilterCreationFun()
}, 500)
// 更新选中的数据
function setFilterCreationFun() {
  if (staticChooseList.value && staticChooseList.value.length > 0) {
    const ids = staticChooseList.value.map(x => x.rulesFilterId)
    form.value.creationIds = ids
    form.value.creationList = staticChooseList.value
  } else {
    form.value.creationIds = []
    form.value.creationList = []
  }
}
const emits = defineEmits(['updateInfo'])

watch(
  () => form.value,
  val => {
    console.log('rules_filter监听form数据', val)

    emits('updateInfo', val)
  },
  { deep: true, immediate: true }
)
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.rule_filter_page {
  width: 100%;
  height: 523px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  .tooltip_icon {
    margin-left: 8px;
    width: 16px;
    height: 16px;
    object-fit: contain;
  }
  .page_left {
    width: 338px;
    border-right: 1px solid #e3e4e6;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-start;
    .left_top {
      width: 100%;
      .one_left_top {
        margin-top: 20px;
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        .top_label {
          width: 78px;
        }
        .top_content {
          width: calc(100% - 78px);
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
          align-items: center;
          :deep(.el-radio-group) {
            height: unset;
          }
          :deep(.el-radio.el-radio--large) {
            height: 20px;
            line-height: 20px;
            margin-right: 24px;
          }
          .one_radio_box {
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
            align-items: center;
          }
        }
        :deep(.el-select .el-select__tags .el-tag:first-child) {
          margin-left: 8px;
        }
        .item_box {
          width: 220px !important;
          border: 1px solid #dcdfe6;
          border-radius: 4px;
          :deep(.el-input-number__increase) {
            display: none !important;
            width: 0 !important;
          }
          :deep(.el-input-number__decrease, ) {
            display: none !important;
            width: 0 !important;
          }
          :deep(.el-input-number) {
            width: auto !important;
          }
        }
        :deep(.item_box .el-input.el-input--default) {
          width: 97px;
        }
        :deep(.item_box .el-input__inner) {
          border: 0;
          padding: 0 31px 0 11px;
          text-align: left;
        }
      }
    }
    .left_bottom {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 100%;
      padding-bottom: 12px;
      .left_bottom_btn {
        width: 298px;
        height: 32px;
        border-radius: 4px;
        border: 1px solid #364fcd;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        background: #fff;
        font-size: 14px;
        font-weight: 400;
        color: #364fcd;
        line-height: 20px;
        padding: 0;
      }
      .left_bottom_mark {
        margin-top: 16px;
        font-size: 12px;
        font-weight: 400;
        color: #909399;
        line-height: 18px;
      }
    }
  }
  .element_page_left {
    width: 354px;
    .top_label {
      width: 94px !important;
      padding-left: 16px;
    }
    .top_content {
      width: calc(100% - 94px) !important;
    }
  }
  .page_right {
    width: calc(100% - 339px);
    height: 100%;
    :deep(.el-tabs__header) {
      margin-bottom: 0;
    }
    .page_right_dynamic {
      width: 100%;
      height: 100%;
      padding: 16px 0px 0px 16px;
      .dynamic_title {
        font-size: 14px;
        font-weight: 400;
        color: #606266;
        line-height: 20px;
      }
      .has_dynamic {
        width: 100%;
        height: 438px !important;
      }
      .dynamic_content {
        width: 100%;
        height: 100%;
        overflow-y: auto;
      }
      .dynamic_bottom {
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        height: 48px;
        > span {
          color: #364fcd;
          margin: 0 2px;
          font-weight: 600;
        }
      }
    }
    .page_right_static {
      width: 100%;
      height: 100%;
      padding: 16px 0px 0px 16px;
      .static_search_box {
        width: 100%;
        height: 474px;
        .static_search_content {
          width: 100%;
          height: calc(100% - 48px);
          overflow-y: auto;
        }
        .static_search_bottom {
          width: 100%;
          height: 48px;
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
          align-items: center;
          font-size: 14px;
          font-weight: 400;
          color: #606266;
          line-height: 20px;
          span {
            color: #364fcd;
            margin: 0 2px;
            font-weight: 600;
          }
          :deep(.el-link.el-link--primary) {
            --el-link-text-color: #364fcd;
          }
        }
      }
    }
    .none_list {
      width: 100%;
      height: 100%;
      background: #ffffff;

      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      font-size: 14px;
      font-weight: 400;
      color: #8f939a;
      line-height: 20px;
      img {
        width: 70px;
        height: 70px;
        object-fit: cover;
        margin-bottom: 7px;
      }
    }
  }
  .element_page_right {
    width: calc(100% - 355px);
  }
  .swiper_loading_box {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    width: 100%;
    margin-top: 12px;

    img {
      height: 25px;
      margin-right: 4px;
    }
  }
}
</style>
