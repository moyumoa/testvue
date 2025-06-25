<template>
  <div class="operation_page" v-loading="loading">
    <div class="page_page">
      <!-- 预览 -->
      <previewPage
        @updateTab="updateTab"
        :somePreviewInfo="somePreviewInfo"
        :chooseTab="$data.chooseTab"
        :configInfo="$data.configInfo"
        :data="$data"
        :followUpNum="followUpNum"
        :materialNum="materialNum"
      />
      <!-- 配置 -->
      <div class="setting_page">
        <el-tabs class="tab_box hide_underline" v-model="$data.chooseTab">
          <el-tab-pane
            v-for="(tab, i) in $data.tabList"
            :key="i"
            :label="tab.label"
            :name="tab.name"
          ></el-tab-pane>
        </el-tabs>
        <div
          class="setting_content"
          v-if="!loading && $data.tabList.find(i => i.name === $data.chooseTab)"
        >
          <component
            :is="$data.tabList.find(i => i.name === $data.chooseTab).page"
            @edit="onEdit"
            @updateSetting="updateSetting"
            @updatePreviewInfo="updatePreviewInfo"
            @validConfig="validConfig"
            :data="$data"
            :followUpNum="followUpNum"
            :materialNum="materialNum"
          />
        </div>
      </div>
    </div>
    <!-- 保存按钮 -->
    <div class="btn_box">
      <el-button type="primary" v-if="!loading" @click="saveFun" :loading="saveLoading">
        保存
      </el-button>
    </div>
  </div>
</template>
<script setup>
import {
  batchGetByGroup,
  batchUpdateConfig,
  getOpenTemplateCount
} from '@/api/market/miniprogram_operation.js'
import previewPage from './preview_page.vue'
import { throttle, isEmpty, isNotEmpty } from '@/utils/tools.js'
import { configList } from './components/config.js'
import { goldTypeList } from '@/api/market/gold.js'
import { getWorkLibraryListV2 } from '@/api/content_center/content_repository.js'
import { useStore } from 'vuex'
import { getForwardVideoList } from '@/api/market/task.js'

const store = useStore()
const systemVersion = computed(() => store.state.user.systemVersion)
const loading = ref(true) // 初始化的Loading
const saveLoading = ref(false) // 保存的Loading
const goldRankSelectList = ref([]) // 金币类型列表
const somePreviewInfo = reactive({
  followVideoList: [] // 转发视频的预览列表
})
const $data = reactive({
  chooseTab: 'mission:banner', // 当前定位在哪个配置列表
  tabList: [], // 配置列表
  configInfo: {
    // 'mission:banner': [], // banner图
    // 'mission:rank': [], // 发视频
    // video_recommend: [], // 精彩视频
    // task_recommend: [], // 热门活动
    // current_version_recommend: [] // 精彩视频
  } // 所有的配置信息--保存时给后端的

  // bannerInfo: {
  //   list: [], // 轮播图列表
  //   err: false // 是否设置完整
  // },//单个的配置信息  这个实在config.js里面去配置
  // ---注释别删，为了后续可以看到每个字段原有的样子
})
// const unSettingKeyConfig = ['rankMajorInfo'] // 不处理的key

for (const key in configList) {
  // 更新tab--配置列表
  if (configList[key].settingPage) {
    $data.tabList.push({
      name: configList[key].id,
      label: configList[key].label,
      page: configList[key].settingPage
    })
    // 初始化存储的配置信息--保存时要给后端的格式
    $data.configInfo[key] = []
    // 初始化单个的配置信息
    $data[configList[key].infoKey] = configList[key].infoValue
  } else {
    console.log('没有配置页面 ')
  }
}
// 更新一些预览信息
function updatePreviewInfo(filed, data) {
  somePreviewInfo[filed] = data
}

// 获取类金币类型列表
function _goldTypeList() {
  return new Promise(resolve => {
    goldTypeList({
      detail: true,
      isValid: 1
    }).then(response => {
      if (response.code === 0) {
        // 总余额
        const total = [
          {
            id: '', // gold_type_ + '' 就是总余额
            name: '总余额',
            value: ''
          }
        ]
        const data = total.concat(response.data)
        goldRankSelectList.value = data.map(x => {
          return {
            name: x.name,
            value: `gold_type_${x.id}` // 按金币余额排序的金币类型字段入参具体类型
          }
        })
        resolve() // 使用resolve而不是res
      }
    })
  })
}

// 更新定位的配置
function updateTab(e) {
  const notChangeKeyList = ['rank_major'] // 不切换的list
  if ($data.chooseTab !== e && !notChangeKeyList.includes(e)) {
    $data.chooseTab = e
  }
}
// 是否修改--暂未用到
const isEdit = ref(false)
const onEdit = val => {
  isEdit.value = val
}

// 获取所有配置
function getAllConfig() {
  loading.value = true
  const configGroups = Object.keys(configList)
  batchGetByGroup({ configGroups })
    .then(async res => {
      await _goldTypeList()
      const data = res.code === 0 && res.data ? res.data : {}
      Object.keys(configList).forEach(key => {
        let oneInfo = [] // 如果配置过，就存配置过的信息
        Object.keys(data).forEach(x => {
          if (x === key) {
            oneInfo = data[x]
          }
        })
        // 如果已经配置过的就用配置过的，没有就用默认的
        if (oneInfo && oneInfo.length > 0) {
          setDefaultConfig(key, oneInfo)
        } else {
          setDefaultConfig(key)
        }
      })
      nextTick(() => {
        loading.value = false
      })
    })
    .catch(() => {
      Object.keys(configList).forEach(key => {
        setDefaultConfig(key)
      })
      loading.value = false
    })
}
getAllConfig()
function objectHasKey(obj, key) {
  if (!key || typeof key !== 'string') return false
  return Object.prototype.hasOwnProperty.call(obj, key)
}
// 回显转发视频选择的列表
async function getFollowVideoList() {
  if (isNotEmpty($data.rankInfo.info.forward_video_config)) {
    const params = {
      ...$data.rankInfo.info.forward_video_config,
      pageSize: 6
    }
    const res = await getForwardVideoList(params)
    updatePreviewInfo('followVideoList', res?.data?.records || [])
  }
}
// 设置配置
async function setDefaultConfig(key, info) {
  switch (key) {
    case 'mission:banner':
      if (info && info.length > 0) {
        const listValue = info.find(item => item.key === 'banner_list')

        if (!listValue) {
          info.push({
            key: 'banner_list',
            group: 'mission:banner',
            value: ''
          })
        }

        $data.configInfo[key] = info
        $data.bannerInfo.list = listValue && listValue.value ? JSON.parse(listValue.value) : []
        console.log('find---bannerInfo---over', $data.bannerInfo)
      } else {
        $data.configInfo[key] = [
          {
            key: 'banner_list',
            group: 'mission:banner',
            value: ''
          }
        ]
        $data.bannerInfo.list = []
      }
      break
    case 'mission:rank':
      if (info && info.length > 0) {
        const switchValue = info.find(item => item.key === 'rank_mini_display')
        const listValue = info.find(item => item.key === 'rank_display_options')
        if (!switchValue) {
          info.push({ key: 'rank_mini_display', group: 'mission:rank', value: '1' })
        }
        if (!listValue) {
          info.push({
            key: 'rank_display_options',
            group: 'mission:rank',
            value: 'gold_cnt'
          })
        }
        // 默认增加 文案提取、发视频 三个配置
        if (listValue && listValue.value) {
          const listValueMid = JSON.parse(listValue.value)
          if (!objectHasKey(listValueMid, 'copy_extractio')) {
            listValueMid.copy_extractio = '1'
          }
          if (!objectHasKey(listValueMid, 'post_video')) {
            listValueMid.post_video = listValueMid.post_video || '1'
          }
          if (!objectHasKey(listValueMid, 'foolish_pipeline_open')) {
            listValueMid.foolish_pipeline_open = '1'
          }
          if (!objectHasKey(listValueMid, 'video_rank')) {
            listValueMid.video_rank = 'play_increment_cnt'
          }
          listValue.value = JSON.stringify(listValueMid)
        }
        $data.configInfo[key] = info
        $data.rankInfo.switch = switchValue && switchValue.value ? switchValue.value || '1' : '1'
        const rankInfoValue =
          listValue && listValue.value
            ? JSON.parse(listValue.value)
            : {
                video_rank: 'play_increment_cnt',
                live_rank: '',
                gold_rank: 'gold_cnt',
                team_data: '1', // 展示团队数据，同时小程序还要再判断是否有权限
                inspire: '1', // 展示找灵感
                account_diagnosis: '', // 账号诊断
                copy_extractio: '1', // 视频文案提取工具
                post_video: info.post_video || '1', // 发视频
                foolish_pipeline_open: '1', // 一键转发
                forward_video_config: null,
                text_create: '', // 文案创作
                text_title: '', // 爆款标题
                text_writing: '' // 智能仿写
              }
        // 配置的视频视频池转发参数
        rankInfoValue.forward_video_config = rankInfoValue?.forward_video_config
          ? rankInfoValue.forward_video_config
          : null
        // 修改数据-区分标准版和企业版
        if (systemVersion.value === 1 || systemVersion.value === 4) {
          rankInfoValue.post_video = '2' // 标准版/专业版只用这个
        }
        $data.rankInfo.info = rankInfoValue
        // 标准版配置完成后回显数据
        if (systemVersion.value === 1 || systemVersion.value === 4) {
          getFollowVideoList()
        }

        // 在这里将筛选项传入，避免重复获取
        $data.rankInfo.goldRankSelectList = goldRankSelectList.value
        console.log('find---rankInfo---over', $data.rankInfo)
      } else {
        $data.configInfo[key] = [
          { key: 'rank_mini_display', group: 'mission:rank', value: '1' },
          {
            key: 'rank_display_options',
            group: 'mission:rank',
            value: 'gold_cnt'
          }
        ]
        $data.rankInfo.switch = '1'
        $data.rankInfo.info = {
          video_rank: 'play_increment_cnt',
          live_rank: '',
          gold_rank: 'gold_cnt',
          team_data: '1', // 展示团队数据，同时小程序还要再判断是否有权限
          inspire: '1', // 展示找灵感
          account_diagnosis: '', // 账号诊断
          copy_extractio: '1', // 视频文案提取工具
          post_video: '1', // 发视频
          foolish_pipeline_open: '1',
          forward_video_config: null,
          text_create: '', // 文案创作
          text_title: '', // 爆款标题
          text_writing: '' // 智能仿写
        }
      }
      break
    case 'video_recommend':
      if (info && info.length > 0) {
        const switchValue = info.find(item => item.key === 'video_recommend_mini_display')
        const listValue = info.find(item => item.key === 'video_list')
        const titleValue = info.find(item => item.key === 'video_recommend_title_bar')
        if (!switchValue) {
          info.push({
            key: 'video_recommend_mini_display',
            group: 'video_recommend',
            value: '0'
          })
        }
        if (!listValue) {
          info.push({
            key: 'video_list',
            group: 'video_recommend',
            value: ''
          })
        }
        if (!titleValue) {
          info.push({
            key: 'video_recommend_title_bar',
            group: 'video_recommend',
            value: ''
          })
        }

        $data.configInfo[key] = info
        $data.videoInfo.switch = switchValue && switchValue.value ? switchValue.value || '0' : '0'
        $data.videoInfo.list = listValue && listValue.value ? JSON.parse(listValue.value) : []
        $data.videoInfo.title =
          titleValue && titleValue.value ? titleValue.value : $data.videoInfo.defaultTitle
        console.log('find---video---over', $data.videoInfo)
      } else {
        $data.configInfo[key] = [
          {
            key: 'video_list',
            group: 'video_recommend',
            value: ''
          },
          {
            key: 'video_recommend_mini_display',
            group: 'video_recommend',
            value: '0'
          },
          {
            key: 'video_recommend_title_bar',
            group: 'video_recommend',
            value: ''
          }
        ]
        $data.videoInfo.switch = '0'
        $data.videoInfo.list = []
        $data.videoInfo.title = $data.videoInfo.defaultTitle
      }
      break
    case 'customer_record':
      if (info && info.length > 0) {
        const switchValue = info.find(item => item.key === 'customer_record_mini_display')
        const titleValue = info.find(item => item.key === 'customer_title_bar')
        if (!switchValue) {
          info.push({
            key: 'customer_record_mini_display',
            group: 'customer_record',
            value: '0'
          })
        }
        if (!titleValue) {
          info.push({
            key: 'customer_title_bar',
            group: 'customer_record',
            value: ''
          })
        }

        $data.configInfo[key] = info
        $data.customerInfo.switch =
          switchValue && switchValue.value ? switchValue.value || '0' : '0'
        $data.customerInfo.title =
          titleValue && titleValue.value ? titleValue.value : $data.customerInfo.defaultTitle
        console.log('find---video---over', $data.customerInfo)
      } else {
        $data.configInfo[key] = [
          {
            key: 'customer_record_mini_display',
            group: 'customer_record',
            value: '0'
          },
          {
            key: 'customer_title_bar',
            group: 'customer_record',
            value: ''
          }
        ]
        $data.customerInfo.switch = '0'
        $data.customerInfo.title = $data.customerInfo.defaultTitle
      }
      break
    case 'creative_follow_up':
      if (info && info.length > 0) {
        const switchValue = info.find(item => item.key === 'creative_follow_up_mini_display')
        const titleValue = info.find(item => item.key === 'creative_follow_up_title_bar')
        if (!switchValue) {
          info.push({
            key: 'creative_follow_up_mini_display',
            group: 'creative_follow_up',
            value: '0'
          })
        }
        if (!titleValue) {
          info.push({
            key: 'creative_follow_up_title_bar',
            group: 'creative_follow_up',
            value: ''
          })
        }

        $data.configInfo[key] = info
        $data.followUpInfo.switch =
          switchValue && switchValue.value ? switchValue.value || '0' : '0'
        $data.followUpInfo.title =
          titleValue && titleValue.value ? titleValue.value : $data.followUpInfo.defaultTitle
        console.log('find---creative_follow_up---over', $data.followUpInfo)
      } else {
        $data.configInfo[key] = [
          {
            key: 'creative_follow_up_mini_display',
            group: 'creative_follow_up',
            value: '0'
          },
          {
            key: 'creative_follow_up_title_bar',
            group: 'creative_follow_up',
            value: ''
          }
        ]
        $data.followUpInfo.switch = '0'
        $data.followUpInfo.title = $data.followUpInfo.defaultTitle
      }
      break

    case 'task_recommend':
      if (info && info.length > 0) {
        const switchValue = info.find(item => item.key === 'task_recommend_mini_display')
        const listValue = info.find(item => item.key === 'recommend_task_list')
        const titleValue = info.find(item => item.key === 'task_recommend_title_bar')
        const viewValue = info.find(item => item.key === 'task_recommend_display_mode')
        if (!switchValue) {
          info.push({
            key: 'task_recommend_mini_display',
            group: 'task_recommend',
            value: '1'
          })
        }
        if (!listValue) {
          info.push({
            key: 'recommend_task_list',
            group: 'task_recommend',
            value: ''
          })
        }
        if (!titleValue) {
          info.push({
            key: 'task_recommend_title_bar',
            group: 'task_recommend',
            value: ''
          })
        }
        if (!viewValue) {
          info.push({
            key: 'task_recommend_display_mode',
            group: 'task_recommend',
            value: '1'
          })
        }

        $data.configInfo[key] = info
        $data.taskInfo.switch = switchValue && switchValue.value ? switchValue.value || '1' : '1'
        $data.taskInfo.list = listValue && listValue.value ? JSON.parse(listValue.value) : []
        $data.taskInfo.title =
          titleValue && titleValue.value ? titleValue.value : $data.taskInfo.defaultTitle
        $data.taskInfo.view = viewValue && viewValue.value ? viewValue.value : '1'
        console.log('find---taskInfo---over', $data.taskInfo)
      } else {
        $data.configInfo[key] = [
          {
            key: 'task_recommend_mini_display',
            group: 'task_recommend',
            value: '1'
          },
          {
            key: 'recommend_task_list',
            group: 'task_recommend',
            value: ''
          },
          {
            key: 'task_recommend_title_bar',
            group: 'task_recommend',
            value: ''
          },
          {
            key: 'task_recommend_display_mode',
            group: 'task_recommend',
            value: '1'
          }
        ]
        $data.taskInfo.switch = '1'
        $data.taskInfo.list = []
        $data.taskInfo.title = $data.taskInfo.defaultTitle
      }
      break

    case 'creation_open':
      if (info && info.length > 0) {
        const switchValue = info.find(item => item.key === 'creation_open_mini_display')
        const titleValue = info.find(item => item.key === 'creation_open_title_bar')
        if (!switchValue) {
          info.push({
            key: 'creation_open_mini_display',
            group: 'creation_open',
            value: '0'
          })
        }
        if (!titleValue) {
          info.push({
            key: 'creation_open_title_bar',
            group: 'creation_open',
            value: ''
          })
        }

        $data.configInfo[key] = info
        $data.materialInfo.switch =
          switchValue && switchValue.value ? switchValue.value || '0' : '0'
        $data.materialInfo.title =
          titleValue && titleValue.value ? titleValue.value : $data.materialInfo.defaultTitle
        console.log('find---creation_open---over', $data.materialInfo)
      } else {
        $data.configInfo[key] = [
          {
            key: 'creation_open_mini_display',
            group: 'creation_open',
            value: '0'
          },
          {
            key: 'creation_open_title_bar',
            group: 'creation_open',
            value: ''
          }
        ]
        $data.materialInfo.switch = '0'
        $data.materialInfo.title = $data.materialInfo.defaultTitle
      }
      break
    case 'creative_inspiration':
      if (info && info.length > 0) {
        const switchValue = info.find(item => item.key === 'creative_inspiration_mini_display')
        const titleValue = info.find(item => item.key === 'creative_inspiration_title_bar')
        if (!switchValue) {
          info.push({
            key: 'creative_inspiration_mini_display',
            group: 'creative_inspiration',
            value: '0'
          })
        }
        if (!titleValue) {
          info.push({
            key: 'creative_inspiration_title_bar',
            group: 'creative_inspiration',
            value: ''
          })
        }

        $data.configInfo[key] = info
        $data.inspirationInfo.switch =
          switchValue && switchValue.value ? switchValue.value || '0' : '0'
        $data.inspirationInfo.title =
          titleValue && titleValue.value ? titleValue.value : $data.inspirationInfo.defaultTitle
        console.log('find---creative_inspiration---over', $data.inspirationInfo)
      } else {
        $data.configInfo[key] = [
          {
            key: 'creative_inspiration_mini_display',
            group: 'creative_inspiration',
            value: '0'
          },
          {
            key: 'creative_inspiration_title_bar',
            group: 'creative_inspiration',
            value: ''
          }
        ]
        $data.inspirationInfo.switch = '0'
        $data.inspirationInfo.title = $data.inspirationInfo.defaultTitle
      }
      break
    case 'current_version_recommend':
      if (info && info.length > 0) {
        const switchValue = info.find(item => item.key === 'current_version_recommend_mini_display')
        const listValue = info.find(item => item.key === 'current_version_recommend_list')
        const titleValue = info.find(item => item.key === 'current_version_recommend_title_bar')
        if (!switchValue) {
          info.push({
            key: 'current_version_recommend_mini_display',
            group: 'current_version_recommend',
            value: '1'
          })
        }
        if (!listValue) {
          info.push({
            key: 'current_version_recommend_list',
            group: 'current_version_recommend',
            value: ''
          })
        }
        if (!titleValue) {
          info.push({
            key: 'current_version_recommend_title_bar',
            group: 'current_version_recommend',
            value: ''
          })
        }

        $data.configInfo[key] = info
        $data.recommendInfo.switch =
          switchValue && switchValue.value ? switchValue.value || '1' : '1'
        // 因为标签是以字符串格式保存的，所以要将他再转成数组
        if (listValue && listValue.value) {
          const recommendList = JSON.parse(listValue.value)
          if (recommendList && recommendList.length > 0) {
            recommendList.forEach(x => {
              x.extra1 = x.extra ? x.extra.split(',') : []
            })
          }
          $data.recommendInfo.list = recommendList
        } else {
          $data.recommendInfo.list = []
        }

        // $data.recommendInfo.list = listValue && listValue.value ? JSON.parse(listValue.value) : []
        $data.recommendInfo.title =
          titleValue && titleValue.value ? titleValue.value : $data.recommendInfo.defaultTitle
        console.log('find---recommendInfo---over', $data.recommendInfo)
      } else {
        $data.configInfo[key] = [
          {
            key: 'current_version_recommend_list',
            group: 'current_version_recommend',
            value: ''
          },
          {
            key: 'current_version_recommend_mini_display',
            group: 'current_version_recommend',
            value: '1'
          },
          {
            key: 'current_version_recommend_title_bar',
            group: 'current_version_recommend',
            value: ''
          }
        ]
        $data.recommendInfo.switch = '1'
        $data.recommendInfo.list = []
        $data.recommendInfo.title = $data.recommendInfo.defaultTitle
      }
      break
  }
  if ($data[configList[key].infoKey]) {
    $data[configList[key].infoKey].err = false
  }
}
// 更新配置属性 type要改哪个属性名 changeKey 改哪个对应的配置属性默认都是改list data 要改的信息
function updateSetting(type, data, changeKey = 'list') {
  // 修改配置属性
  $data[configList[type].infoKey][changeKey] = data
  // 上面这句话对应的格式参考如下 拿banner图作为案例
  // $data.bannerInfo.list = data
  // console.log('修改属性', $data)
  // 验证配置属性--不需要实施验证
  validConfig(type)
}
// 验证配置是否正确
function validConfig(type) {
  switch (type) {
    case 'mission:banner':
      // banner:[数组长度可以为0，也可以大于0]
      // 如果果数组长度大于0的话，就要判断是否有上传图片(coverUrl不能为空)
      if ($data.bannerInfo.list && $data.bannerInfo.list.length > 0) {
        const validList = $data.bannerInfo.list.filter(item => !isEmpty(item.coverUrl))
        if (validList.length !== $data.bannerInfo.list.length) {
          $data.bannerInfo.err = true
          $data.bannerInfo.errText = '保存失败！请设置Banner图'
        } else {
          let stu = false
          $data.bannerInfo.list.forEach(x => {
            if ((x.radio === 2 || x.radio === 3) && JSON.stringify(x.jump) === '{}') {
              stu = true
            }
          })
          $data.bannerInfo.err = stu
          $data.bannerInfo.errText = stu ? '保存失败！请将Banner图跳转页面的信息填写完整' : ''
        }
      } else {
        $data.bannerInfo.err = false
        $data.bannerInfo.errText = ''
      }
      break
    case 'mission:rank':
      // 发视频:如果开关打开[内容不能为空]
      // 那要内容不能为空（info不能是空对象）
      if (!(systemVersion.value === 1 || systemVersion.value === 4)) {
        if ($data.rankInfo.switch === '1') {
          if (JSON.stringify($data.rankInfo.info) === '{}') {
            $data.rankInfo.err = true
            $data.rankInfo.errText = '保存失败！请设置发视频内容'
          } else {
            // let checkNum = 0 // 选中的数量
            // let hasRequired = 0 // 是否有必填的找灵感和看数据 + 文案提取、发视频、一键成片、视频榜
            // const notValidNum = $data.rankInfo.info.post_video === '2' ? 1 : 0
            // for (const key in $data.rankInfo.info) {
            //   if (isNotEmpty($data.rankInfo.info[key])) {
            //     const validKeys = [
            //       'inspire',
            //       'team_data',
            //       'copy_extractio',
            //       'post_video',
            //       'foolish_pipeline_open',
            //       'video_rank'
            //     ]
            //     if (validKeys.includes(key)) {
            //       hasRequired++
            //     }
            //     checkNum++
            //   }
            // }
            // checkNum = checkNum - notValidNum
            // console.log('已选择数量', checkNum)
            // // 只能选6或10个
            // if (hasRequired === 6 && (checkNum === 6 || checkNum === 10)) {
            //   $data.rankInfo.err = false
            //   $data.rankInfo.errText = ''
            // } else if (checkNum > 6 && checkNum < 10) {
            //   $data.rankInfo.err = true
            //   $data.rankInfo.errText = '保存失败！仅支持添加6个或10个排行/入口'
            // } else {
            //   $data.rankInfo.err = true
            //   $data.rankInfo.errText =
            //     checkNum < 6
            //       ? '保存失败！请至少勾选6个排行/入口'
            //       : '保存失败！最多勾选10个排行/入口'
            // }
            // 如果是视频池转发，并且配置的视频池个数是0，就要显示提示
            // if ($data.rankInfo.info?.post_video === '2') {
            //   if ($data.rankInfo.info && $data.rankInfo.info.config?.total <= 0) {
            //     $data.rankInfo.err = true
            //     $data.rankInfo.errText = '请配置视频池'
            //   }
            // }
          }
        } else {
          $data.rankInfo.err = false
          $data.rankInfo.errText = ''
        }
      }

      break
    case 'video_recommend':
      // 精彩视频:如果开关打开[数组长度必须等于3]
      // 要判断list数据长度是否为3，并且每个都有视频地址。
      if ($data.videoInfo.switch === '1') {
        if ($data.videoInfo.list && $data.videoInfo.list.length === 3) {
          const validList = $data.videoInfo.list.filter(item => !isEmpty(item.videoPlayUrl))
          if (validList.length !== $data.videoInfo.list.length) {
            $data.videoInfo.err = true
            $data.videoInfo.errText = '保存失败！请添加3个视频'
          } else {
            $data.videoInfo.err = false
            $data.videoInfo.errText = ''
          }
        } else {
          $data.videoInfo.err = true
          $data.videoInfo.errText = '保存失败！请添加3个视频'
        }
      } else {
        $data.videoInfo.err = false
        $data.videoInfo.errText = ''
      }
      break
    case 'task_recommend':
      // 热门活动：如果开关打开
      // 卡片列表式[数组长度可以为0，也可以大于0]：如果数组长度大于0，那要看里面是否有任务（taskId不能为空）。等于0也可以过(因为如果不配置任务，系统会默认推荐任务列表进行中的第一个)
      // 引导式视频[数组长度必须大于0]：数据长度要大于0，并且一定要有任务和视频地址。
      if ($data.taskInfo.switch === '1') {
        if ($data.taskInfo.view === '1') {
          if ($data.taskInfo.list && $data.taskInfo.list.length > 0) {
            const validList = $data.taskInfo.list.filter(item => !isEmpty(item.taskId))
            if (validList.length !== $data.taskInfo.list.length) {
              $data.taskInfo.err = true
              $data.taskInfo.errText = '保存失败！请选择任务'
            } else {
              $data.taskInfo.err = false
              $data.taskInfo.errText = ''
            }
          } else {
            $data.taskInfo.err = false
            $data.taskInfo.errText = ''
          }
        } else {
          if ($data.taskInfo.list && $data.taskInfo.list.length > 0) {
            let stu = false
            $data.taskInfo.list.forEach(x => {
              if (isEmpty(x.taskId) || isEmpty(x.videoPlayUrl)) {
                stu = true
              }
            })
            $data.taskInfo.err = stu
            $data.taskInfo.errText = stu ? '保存失败！引导视频不能为空' : ''
          } else {
            $data.taskInfo.err = true
            $data.taskInfo.errText = '保存失败！请选择任务'
          }
        }
      } else {
        $data.taskInfo.err = false
        $data.taskInfo.errText = ''
      }
      break
    case 'current_version_recommend':
      // 本期推荐：如果开关打开[数组长度可以为0，也可以大于0]
      // 如果果数组长度大于0，要检查里面是否有视频地址
      if ($data.recommendInfo.switch === '1') {
        if ($data.recommendInfo.list && $data.recommendInfo.list.length > 0) {
          const validList = $data.recommendInfo.list.filter(item => !isEmpty(item.url))
          if (validList.length !== $data.recommendInfo.list.length) {
            $data.recommendInfo.err = true
            $data.recommendInfo.errText = '保存失败！请选择视频'
          } else {
            $data.recommendInfo.err = false
            $data.recommendInfo.errText = ''
          }
        } else {
          $data.recommendInfo.err = false
          $data.recommendInfo.errText = ''
        }
      } else {
        $data.recommendInfo.err = false
        $data.recommendInfo.errText = ''
      }
      break
  }
}
const message = inject('$message')
// 点击保存按钮
const saveFun = throttle(() => {
  saveLoading.value = true
  // 保存第一步-先验证配置属性是否都配置完整
  let err = false
  let errText = ''
  Object.keys(configList).forEach(key => {
    validConfig(key)
    if ($data[configList[key].infoKey]?.err) {
      err = true
      errText = errText || $data[configList[key].infoKey].errText
    }
  })

  if (err) {
    message.error(errText)

    saveLoading.value = false
    return
  }
  // 保存第二步-将配置属性填到对应的属性里面。主要是数组、对象格式的数据要转成字符串保存进去。
  Object.keys(configList).forEach(key => {
    switch (key) {
      case 'mission:banner':
        $data.configInfo[key].forEach(x => {
          if (x.key === 'banner_list') {
            x.value =
              $data.bannerInfo.list && $data.bannerInfo.list.length > 0
                ? JSON.stringify($data.bannerInfo.list)
                : ''
          }
        })

        break
      case 'mission:rank':
        $data.configInfo[key].forEach(x => {
          if (x.key === 'rank_mini_display') {
            x.value = $data.rankInfo.switch
          } else if (x.key === 'rank_display_options') {
            x.value = $data.rankInfo.info ? JSON.stringify($data.rankInfo.info) : ''
          }
        })
        break
      case 'video_recommend':
        $data.configInfo[key].forEach(x => {
          if (x.key === 'video_recommend_mini_display') {
            x.value = $data.videoInfo.switch
          } else if (x.key === 'video_list') {
            x.value =
              $data.videoInfo.list && $data.videoInfo.list.length > 0
                ? JSON.stringify($data.videoInfo.list)
                : ''
          } else if (x.key === 'video_recommend_title_bar') {
            x.value = $data.videoInfo.title || ''
          }
        })
        break
      case 'customer_record':
        $data.configInfo[key].forEach(x => {
          if (x.key === 'customer_record_mini_display') {
            x.value = $data.customerInfo.switch
          } else if (x.key === 'customer_title_bar') {
            x.value = $data.customerInfo.title || ''
          }
        })
        break
      case 'creative_follow_up':
        $data.configInfo[key].forEach(x => {
          if (x.key === 'creative_follow_up_mini_display') {
            x.value = $data.followUpInfo.switch
          } else if (x.key === 'creative_follow_up_title_bar') {
            x.value = $data.followUpInfo.title || ''
          }
        })
        break
      case 'task_recommend':
        $data.configInfo[key].forEach(x => {
          if (x.key === 'task_recommend_mini_display') {
            x.value = $data.taskInfo.switch
          } else if (x.key === 'recommend_task_list') {
            // 任务-卡片式：要清空视频地址
            const list =
              $data.taskInfo.list && $data.taskInfo.list.length > 0 ? $data.taskInfo.list : []
            if ($data.taskInfo.view === '1') {
              list.forEach(x => {
                x.videoPlayUrl = ''
                x.videoImgUrl = ''
              })
            }
            x.value = list.length > 0 ? JSON.stringify(list) : '[]'
          } else if (x.key === 'task_recommend_title_bar') {
            x.value = $data.taskInfo.title || ''
          } else if (x.key === 'task_recommend_display_mode') {
            x.value = $data.taskInfo.view || '1'
          }
        })
        break
      case 'creation_open':
        $data.configInfo[key].forEach(x => {
          if (x.key === 'creation_open_mini_display') {
            x.value = $data.materialInfo.switch
          } else if (x.key === 'creation_open_title_bar') {
            x.value = $data.materialInfo.title || ''
          }
        })
        break
      case 'creative_inspiration':
        $data.configInfo[key].forEach(x => {
          if (x.key === 'creative_inspiration_mini_display') {
            x.value = $data.inspirationInfo.switch
          } else if (x.key === 'creative_inspiration_title_bar') {
            x.value = $data.inspirationInfo.title || ''
          }
        })
        break
      case 'current_version_recommend':
        $data.configInfo[key].forEach(x => {
          if (x.key === 'current_version_recommend_mini_display') {
            x.value = $data.recommendInfo.switch
          } else if (x.key === 'current_version_recommend_list') {
            // 本期推荐里的标签要拼接成字符串。
            if ($data.recommendInfo.list && $data.recommendInfo.list.length > 0) {
              const recommendList = $data.recommendInfo.list
              recommendList.forEach(x => {
                x.extra = x.extra1 && x.extra1.length > 0 ? x.extra1.join(',') : ''
              })
              x.value = JSON.stringify(recommendList)
            } else {
              x.value = '[]'
            }
          } else if (x.key === 'current_version_recommend_title_bar') {
            x.value = $data.recommendInfo.title || ''
          }
        })
        break
    }
  })
  // 保存第三部-调接口
  console.log('保存入参', $data.configInfo)
  // if ($data.configInfo) return
  batchUpdateConfig($data.configInfo)
    .then(res => {
      if (res.code === 0) {
        message.success('保存成功')
      }

      saveLoading.value = false
    })
    .catch(() => {
      saveLoading.value = false
    })
}, 1000)

// 获取创意跟拍的模板数量
const followUpNum = ref(null)
function getCreativeFollowUpNum() {
  getOpenTemplateCount()
    .then(res => {
      if (res.code === 0) {
        followUpNum.value = res.data || 0
      }
    })
    .catch(() => {})
}
getCreativeFollowUpNum()

// 获取开放素材的数量
const materialNum = ref(null)
function getMaterialNum() {
  getWorkLibraryListV2({
    isDelete: 0,
    pageNo: 1,
    pageSize: 10,
    isOpen: 1,
    type: [1, 2]
  }).then(res => {
    if (res.code === 0) {
      materialNum.value = res.data.total || 0
    }
  })
}
getMaterialNum()
</script>
<style lang="scss" scoped>
@import '../components/css/setting_page.scss';
:deep(.el-tabs__nav-next),
:deep(.el-tabs__nav-prev) {
  line-height: 30px;
}
</style>
