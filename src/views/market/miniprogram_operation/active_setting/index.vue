<template>
  <div class="operation_page" v-loading="$data.loading">
    <div class="page_page">
      <!-- 预览 -->
      <previewPage
        v-if="previewTitleList"
        :previewTitleList="previewTitleList"
        :switchOpenNumber="switchOpenNumber"
        @updateTab="updateTab"
        :chooseTab="$data.chooseTab"
        :configInfo="$data.configInfo"
        :data="$data"
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
        <div class="setting_content" v-if="!$data.loading">
          <component
            :is="$data.tabList.find(i => i.name === $data.chooseTab).page"
            :switchOpenNumber="switchOpenNumber"
            @edit="onEdit"
            @updateSetting="updateSetting"
            @validConfig="validConfig"
            @beforeOpenSwitchChange="beforeOpenSwitchChange"
            :data="$data"
            :materialNum="materialNum"
          />
        </div>
      </div>
    </div>
    <!-- 保存按钮 -->
    <div class="btn_box">
      <el-button type="primary" v-if="!$data.loading" @click="saveFun" :loading="$data.saveLoading">
        保存
      </el-button>
    </div>
  </div>
</template>
<script setup>
import { batchGetByGroup, batchUpdateConfig } from '@/api/market/miniprogram_operation.js'
import previewPage from './preview_page.vue'
import { getWorkLibraryListV2 } from '@/api/content_center/content_repository.js'
import { throttle, isEmpty } from '@/utils/tools.js'
import { configList } from './components/config.js'
const switchOpenNumber = ref(0) // 开关打开的个数 最多2个 最少1个
const previewTitleList = ref([]) // 预览里标题
const $data = reactive({
  loading: true, // 初始化的Loading
  saveLoading: false, // 保存的Loading
  chooseTab: 'activity_square',
  tabList: [],
  configInfo: {}
})
for (const key in configList) {
  if (configList[key].settingPage) {
    // 更新tab--配置列表
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
  previewTitleList.value.push({
    label: configList[key].label,
    value: configList[key].id,
    infoKey: configList[key].infoKey,
    show: configList[key].id === 'my_activity',
    choose: false
  })
}

// 获取配置
function getAllConfig() {
  $data.loading = true

  const configGroups = Object.keys(configList)
  batchGetByGroup({ configGroups })
    .then(res => {
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
          console.log('初始值', oneInfo)
          setDefaultConfig(key, oneInfo)
        } else {
          setDefaultConfig(key)
        }
      })
      nextTick(() => {
        $data.loading = false
      })
    })
    .catch(() => {
      Object.keys(configList).forEach(key => {
        setDefaultConfig(key)
      })
      $data.loading = false
    })
}
getAllConfig()
// 设置配置
function setDefaultConfig(key, info) {
  switch (key) {
    case 'activity_square':
      if (info && info.length > 0) {
        const switchValue = info.find(item => item.key === 'promotion_square_mini_display')
        const listValue = info.find(item => item.key === 'activity_square_task')
        if (!switchValue) {
          info.push({ key: 'promotion_square_mini_display', group: 'activity_square', value: '0' })
        }
        if (!listValue) {
          info.push({
            key: 'activity_square_task',
            group: 'activity_square',
            value: ''
          })
        }
        $data.configInfo[key] = info
        $data.squareInfo.switch = switchValue && switchValue.value ? switchValue.value || '0' : '0'
        $data.squareInfo.list = listValue && listValue.value ? JSON.parse(listValue.value) : []
      } else {
        $data.configInfo[key] = [
          { key: 'promotion_square_mini_display', group: 'activity_square', value: '0' },
          {
            key: 'activity_square_task',
            group: 'activity_square',
            value: ''
          }
        ]
        $data.squareInfo.switch = '0'
        $data.squareInfo.list = []
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
    // case 'creative_inspiration':
    //   if (info && info.length > 0) {
    //     const switchValue = info.find(item => item.key === 'creative_inspiration_mini_display')
    //     const titleValue = info.find(item => item.key === 'creative_inspiration_title_bar')
    //     if (!switchValue) {
    //       info.push({
    //         key: 'creative_inspiration_mini_display',
    //         group: 'creative_inspiration',
    //         value: '0'
    //       })
    //     }
    //     if (!titleValue) {
    //       info.push({
    //         key: 'creative_inspiration_title_bar',
    //         group: 'creative_inspiration',
    //         value: ''
    //       })
    //     }

    //     $data.configInfo[key] = info
    //     $data.inspirationInfo.switch =
    //       switchValue && switchValue.value ? switchValue.value || '0' : '0'
    //     $data.inspirationInfo.title =
    //       titleValue && titleValue.value ? titleValue.value : $data.inspirationInfo.defaultTitle
    //     console.log('find---creative_inspiration---over', $data.inspirationInfo)
    //   } else {
    //     $data.configInfo[key] = [
    //       {
    //         key: 'creative_inspiration_mini_display',
    //         group: 'creative_inspiration',
    //         value: '0'
    //       },
    //       {
    //         key: 'creative_inspiration_title_bar',
    //         group: 'creative_inspiration',
    //         value: ''
    //       }
    //     ]
    //     $data.inspirationInfo.switch = '0'
    //     $data.inspirationInfo.title = $data.inspirationInfo.defaultTitle
    //   }
    //   break
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

  // 验证配置属性
  validConfig(type)
}

const message = inject('$message')
// 验证配置是否正确
function validConfig(type) {
  switch (type) {
    case 'activity_square':
      // 活动广场：如果开关打开，[至少一个活动专区]
      // 如果添加了专区，那专区标题和任务不能为空
      if ($data.squareInfo.switch === '1') {
        if ($data.squareInfo.list && $data.squareInfo.list.length > 0) {
          let stu = false
          let stuText = null
          let hasBanner = false
          let hasTask = false
          $data.squareInfo.list.forEach(x => {
            if (x.type === 'banner') {
              hasBanner = true
              if (x.banner && JSON.stringify(x.banner) !== '{}') {
                if (
                  x.banner.radio !== 1 &&
                  JSON.stringify(x.banner.jump) === '{}' &&
                  x.banner.switch === '1'
                ) {
                  stu = true
                  stuText = stuText || '请将Banner跳转页面的信息填写完整'
                }
              }
            } else if (x.type === 'task') {
              hasTask = true
              if (isEmpty(x.title)) {
                stu = true
                stuText = stuText || '请将专区标题填写完整'
              }
              if (x.tasks && x.tasks.length > 0) {
                x.tasks.forEach(y => {
                  if (isEmpty(y.taskId)) {
                    stu = true
                    stuText = stuText || '请关联任务'
                  }
                })
              } else {
                stu = true
                stuText = stuText || '请关联任务'
              }
            }
          })
          if (!(hasBanner && hasTask)) {
            stu = true
            stuText = '请至少添加一个活动专区'
          }
          $data.squareInfo.err = stu
          $data.squareInfo.errText = stu ? `保存失败！${stuText || '请设置内容'}` : ''
        } else {
          $data.squareInfo.err = true
          $data.squareInfo.errText = '保存失败！请设置内容'
        }
      } else {
        $data.squareInfo.err = false
        $data.squareInfo.errText = ''
      }
      break
    case 'creation_open':
      // if ($data.materialInfo.switch === '1') {
      //   switchOpenNumber.value++
      // } else {
      //   switchOpenNumber.value--
      // }
      break
    // case 'creative_inspiration':
    //   // if ($data.inspirationInfo.switch === '1') {
    //   //   switchOpenNumber.value++
    //   // } else {
    //   //   switchOpenNumber.value--
    //   // }
    //   break
  }
}
const saveFun = throttle(() => {
  $data.saveLoading = true
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
    $data.saveLoading = false
    return
  }
  // if (switchOpenNumber.value > 2) {
  //   message.error('活动页最多同时开启2个功能区，请至少关闭1个后再次开启')
  //   $data.saveLoading = false
  //   return
  // }
  // 保存第二步-将配置属性填到对应的属性里面。主要是数组、对象格式的数据要转成字符串保存进去。
  Object.keys(configList).forEach(key => {
    switch (key) {
      case 'activity_square':
        $data.configInfo[key].forEach(x => {
          if (x.key === 'activity_square_task') {
            x.value =
              $data.squareInfo.list && $data.squareInfo.list.length > 0
                ? JSON.stringify($data.squareInfo.list)
                : ''
          } else if (x.key === 'promotion_square_mini_display') {
            x.value = $data.squareInfo.switch
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
      // case 'creative_inspiration':
      //   $data.configInfo[key].forEach(x => {
      //     if (x.key === 'creative_inspiration_mini_display') {
      //       x.value = $data.inspirationInfo.switch
      //     } else if (x.key === 'creative_inspiration_title_bar') {
      //       x.value = $data.inspirationInfo.title || ''
      //     }
      //   })
      //   break
    }
  })
  // 保存第三部-调接口
  batchUpdateConfig($data.configInfo)
    .then(res => {
      if (res.code === 0) {
        message.success('保存成功')
      }

      $data.saveLoading = false
    })
    .catch(() => {
      $data.saveLoading = false
    })
  console.log('保存保存保存', $data.configInfo)
}, 1000)

// 是否修改--暂未用到
const isEdit = ref(false)
const onEdit = val => {
  isEdit.value = val
}

// 更新定位的配置
function updateTab(e) {
  const notChangeKeyList = ['my_activity'] // 不切换的list
  if ($data.chooseTab !== e && !notChangeKeyList.includes(e)) {
    $data.chooseTab = e
  }
}

// 检测开启的总数
watch(
  () => $data,
  () => {
    let num = 0
    Object.keys(configList).forEach(key => {
      if ($data[configList[key].infoKey] && $data[configList[key].infoKey].switch === '1') num++
    })
    switchOpenNumber.value = num
  },
  {
    deep: true,
    immediate: true
  }
)

// 开关数量超过上限，不允许开启
function beforeOpenSwitchChange(e) {
  console.log('e', e)
  // if (switchOpenNumber.value > 2) {
  //   message.warning('活动页最多同时开启2个功能区，请至少关闭1个后再次开启')
  //   return false
  // } else {
  //   return true
  // }
}
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
      console.warn("素材数量：", materialNum.value);
      
    }
  })
}
getMaterialNum()
</script>
<style lang="scss" scoped>
@import '../components/css/setting_page.scss';
</style>
