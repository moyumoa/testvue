<template>
  <div class="operation_page" v-loading="loading">
    <div class="page_page">
      <!-- 预览 -->
      <previewPage
        :somePreviewInfo="somePreviewInfo"
        :chooseTab="$data.chooseTab"
        :configInfo="$data.configInfo"
        :data="$data"
      />
      <!-- 配置 -->
      <div class="setting_page">
        <!-- <el-tabs class="tab_box hide_underline" v-model="$data.chooseTab">
          <el-tab-pane
            v-for="(tab, i) in $data.tabList"
            :key="i"
            :label="tab.label"
            :name="tab.name"
          ></el-tab-pane>
        </el-tabs> -->
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
import { batchGetByGroup, batchUpdateConfig } from '@/api/market/miniprogram_operation.js'
import previewPage from './preview_page.vue'
import { throttle, isEmpty, isNotEmpty } from '@/utils/tools.js'
import { configList } from './components/config.js'

const loading = ref(true) // 初始化的Loading
const saveLoading = ref(false) // 保存的Loading

const somePreviewInfo = reactive({
  followVideoList: [] // 转发视频的预览列表
})
const $data = reactive({
  chooseTab: 'mission:KOC', // 当前定位在哪个配置列表
  tabList: [], // 配置列表
  configInfo: {
    // 'mission:KOC': [], // 首页
  } // 所有的配置信息--保存时给后端的

  // KOCInfo: {
  //   info: {}, // 首页信息
  //   err: false // 是否设置完整
  // },//单个的配置信息  这个实在config.js里面去配置
  // ---注释别删，为了后续可以看到每个字段原有的样子
})

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

// 设置配置
async function setDefaultConfig(key, info) {
  switch (key) {
    case 'mission:KOC':
      if (info && info.length > 0) {
        // 轮播图
        const bannerListValue = info.find(item => item.key === 'koc_banner_list')

        if (!bannerListValue) {
          info.push({
            key: 'koc_banner_list',
            group: 'mission:KOC',
            value: ''
          })
        }
        // 主题色
        const themeInfoValue = info.find(item => item.key === 'koc_mini_theme')

        if (!themeInfoValue) {
          info.push({
            key: 'koc_mini_theme',
            group: 'mission:KOC',
            value: ''
          })
        }
        // 企业LOGO
        const LogoValue = info.find(item => item.key === 'koc_mini_logo')

        if (!LogoValue) {
          info.push({
            key: 'koc_mini_logo',
            group: 'mission:KOC',
            value: ''
          })
        }
        $data.configInfo[key] = info
        $data.KOCInfo.bannerList =
          bannerListValue && bannerListValue.value ? JSON.parse(bannerListValue.value) : []

        $data.KOCInfo.themeInfo =
          themeInfoValue && themeInfoValue.value ? JSON.parse(themeInfoValue.value) : {}

        $data.KOCInfo.logo = LogoValue && LogoValue.value ? LogoValue.value || '' : ''
        console.log('find---KOCInfo---over', $data.KOCInfo)
      } else {
        $data.configInfo[key] = [
          {
            key: 'koc_banner_list',
            group: 'mission:KOC',
            value: ''
          },
          {
            key: 'koc_mini_theme',
            group: 'mission:KOC',
            value: ''
          },
          {
            key: 'koc_mini_logo',
            group: 'mission:KOC',
            value: ''
          }
        ]
        $data.KOCInfo.bannerList = []
        $data.KOCInfo.themeInfo = {}
        $data.KOCInfo.logo = ''
      }
      break
  }
  if ($data[configList[key].infoKey]) {
    $data[configList[key].infoKey].err = false
  }
}
// 更新配置属性 type要改哪个属性名 changeKey 改哪个对应的配置属性默认都是改list data 要改的信息
function updateSetting(type, data, changeKey = 'list') {
  console.log('更新配置属性', type, data, changeKey)
  // 修改配置属性
  $data[configList[type].infoKey][changeKey] = data
  // 上面这句话对应的格式参考如下 拿banner图作为案例
  // $data.KOCInfo.list = data
  // console.log('修改属性', $data)
  // 验证配置属性--不需要实施验证
  validConfig(type)
}
// 验证配置是否正确
function validConfig(type) {
  switch (type) {
    case 'mission:KOC':
      console.log('保存', $data.KOCInfo)
      // 轮播图 bannerList [banner图,数组长度大于0,有上传图片(coverUrl不能为空)]
      // 主题色 themeInfo name[菜单名称],theme1[主题色1],theme2[主题色2],backgroundStyle[背景样式1 纯色背景 2 图片背景],backgroundColor[纯色背景的色值],backgroundUrl[图片背景的地址]
      // 企业Logo logo[logo地址]
      // if (isEmpty($data.KOCInfo.bannerList)) {
      //   $data.KOCInfo.err = true
      //   $data.KOCInfo.errText = '保存失败！请设置Banner图'
      //   return
      // }
      if (isNotEmpty($data.KOCInfo.bannerList)) {
        // 校验banner图
        const bannerList = $data.KOCInfo.bannerList
        // banner图为空 报错
        // if (isEmpty(bannerList)) {
        //   $data.KOCInfo.err = true
        //   $data.KOCInfo.errText = '保存失败！请设置Banner图'
        //   return
        // }
        // banner图长度大于0 但是没有上传图片 报错
        const validBannerList = bannerList.filter(item => isNotEmpty(item.coverUrl))
        if (isNotEmpty(bannerList) && validBannerList.length !== bannerList.length) {
          $data.KOCInfo.err = true
          $data.KOCInfo.errText = '保存失败！请设置Banner图'
          return
        }
        // banner图设置了跳转页面，但是没有设置跳转的信息 报错
        const validBannerList2 = bannerList.filter(item => {
          if (item.radio === 2) {
            return isNotEmpty(item.jump)
          }
          return true
        })
        if (isNotEmpty(bannerList) && validBannerList2.length !== bannerList.length) {
          $data.KOCInfo.err = true
          $data.KOCInfo.errText = '保存失败！请设置Banner图跳转页面的信息'
          return
        }
      }

      if (isEmpty($data.KOCInfo.themeInfo)) {
        $data.KOCInfo.err = true
        $data.KOCInfo.errText = '保存失败！请设置主题色'
        return
      }
      if (isNotEmpty($data.KOCInfo.themeInfo)) {
        // 菜单名称为空 报错
        if (isEmpty($data.KOCInfo.themeInfo.name)) {
          $data.KOCInfo.err = true
          $data.KOCInfo.errText = '保存失败！请设置首页菜单及页面名称'
          return
        }
        // 主题色为空 报错
        if (isEmpty($data.KOCInfo.themeInfo.theme1) || isEmpty($data.KOCInfo.themeInfo.theme2)) {
          $data.KOCInfo.err = true
          $data.KOCInfo.errText = '保存失败！请设置主题色'
          return
        }
        // 背景样式为空 报错
        if (isEmpty($data.KOCInfo.themeInfo.backgroundStyle)) {
          $data.KOCInfo.err = true
          $data.KOCInfo.errText = '保存失败！请设置背景样式'
          return
        }
        // 背景样式为图片背景，但是背景图片为空 报错
        if (
          $data.KOCInfo.themeInfo.backgroundStyle === 2 &&
          isEmpty($data.KOCInfo.themeInfo.backgroundUrl)
        ) {
          $data.KOCInfo.err = true
          $data.KOCInfo.errText = '保存失败！请设置图片背景'
          return
        }
        // 背景样式为纯色背景，但是背景色为空 报错
        if (
          $data.KOCInfo.themeInfo.backgroundStyle === 1 &&
          isEmpty($data.KOCInfo.themeInfo.backgroundColor)
        ) {
          $data.KOCInfo.err = true
          $data.KOCInfo.errText = '保存失败！请设置背景色'
          return
        }
      }

      // Logo为空 报错
      if (isEmpty($data.KOCInfo.logo)) {
        $data.KOCInfo.err = true
        $data.KOCInfo.errText = '保存失败！请设置企业logo图片'
        return
      }
      $data.KOCInfo.err = false
      $data.KOCInfo.errText = ''

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
      case 'mission:KOC':
        $data.configInfo[key].forEach(x => {
          if (x.key === 'koc_banner_list') {
            x.value =
              $data.KOCInfo.bannerList && $data.KOCInfo.bannerList.length > 0
                ? JSON.stringify($data.KOCInfo.bannerList)
                : ''
          } else if (x.key === 'koc_mini_theme') {
            if ($data.KOCInfo && isNotEmpty($data.KOCInfo.themeInfo)) {
              if ($data.KOCInfo.themeInfo.backgroundStyle === 1) {
                $data.KOCInfo.themeInfo.backgroundUrl = ''
              } else if ($data.KOCInfo.themeInfo.backgroundStyle === 2) {
                $data.KOCInfo.themeInfo.backgroundColor = ''
              }
            }
            x.value = isNotEmpty($data.KOCInfo.themeInfo)
              ? JSON.stringify($data.KOCInfo.themeInfo)
              : ''
          } else if (x.key === 'koc_mini_logo') {
            x.value = $data.KOCInfo.logo || ''
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
</script>
<style lang="scss" scoped>
@import '@/views/market/miniprogram_operation/components/css/setting_page.scss';
:deep(.el-tabs__nav-next),
:deep(.el-tabs__nav-prev) {
  line-height: 30px;
}
.setting_content {
  height: 100% !important;
}
</style>
