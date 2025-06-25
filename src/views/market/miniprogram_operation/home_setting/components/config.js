import bannerSetting from './banner/setting.vue'
import rankSetting from './rank/setting.vue'
import videoSetting from './video/setting.vue'
import taskSetting from './task/setting.vue'
import recommendSetting from './recommend/setting.vue'
// import customerSetting from './customer/setting.vue'
// import followUpSetting from './creative_followUp/setting.vue'
import inspirationSetting from './creative_inspiration/setting.vue'
// import materialSetting from './material_encyclopedia/setting.vue'
import forwardVideoSetting from './forward_video/setting.vue'

import bannerPreview from './banner/preview.vue'
import rankPreview from './rank/preview.vue'
import videoPreview from './video/preview.vue'
import taskPreview from './task/preview.vue'
import recommendPreview from './recommend/preview.vue'
// import customerPreview from './customer/preview.vue'
// import followUpPreview from './creative_followUp/preview.vue'
import inspirationPreview from './creative_inspiration/preview.vue'
// import materialPreview from './material_encyclopedia/preview.vue'
import forwardVideoPreview from './forward_video/preview.vue'
import rankMajorPreview from './rank_major/preview.vue'

import store from '@/store'
/**
 * 配置介绍----将所有的配置信息存在一个对象里面,key就是对应的属性[由后端定义]
 * id：属性名
 * label：该属性对应的中文名[暂时只在tab上显示用]
 * settingPage: 该属性对应的配置页面
 * previewPage：该属性对应的预览页面
 * info：该属性对应的存储信息 对象格式的 infoKey:infoValue
 *  -- err：【固定信息】如果未配置完整(配置失败)就是true
 *  -- errText：【固定信息】存储配置失败的原因
 *  -- list：如果配置属性里有数组格式的数据(当前都是存放内容设置的信息)都放在这里 // 数据和对象格式的分开放是为了后续判断方便
 *  -- info：如果配置属性里有对象格式的数据(当前都是存放内容设置的信息)都放在这里
 *  -- title：配置属性里有标题栏的就放在这里
 *  -- defaultTitle：可以动态配置标题栏，那就会有默认的标题栏信息
 *  -- switch：配置属性有开关的就用这个。字符串 '1'是开 '0'是关
 */
const systemVersion = computed(() => store.state.user.systemVersion)

// 所有的配置
const configListFirst = {
  'mission:banner': {
    id: 'mission:banner',
    label: 'Banner',
    settingPage: markRaw(bannerSetting),
    previewPage: markRaw(bannerPreview),
    infoKey: 'bannerInfo', // 存储信息的key
    infoValue: {
      list: [], // 轮播图列表
      err: false, // 是否设置完整
      errText: '' // 配置失败的原因
    } // 存储信息的value
  },
  rank_major: {
    // 写死的没有配置的
    id: 'rank_major',
    label: '',
    settingPage: null,
    previewPage: markRaw(rankMajorPreview),
    infoKey: 'rankMajorInfo',
    infoValue: {
      switch: '0',
      err: '',
      errText: ''
    }
  },
  'mission:rank': {
    id: 'mission:rank',
    label: '发视频',
    settingPage: markRaw(rankSetting),
    previewPage: markRaw(rankPreview),
    infoKey: 'rankInfo',
    infoValue: {
      switch: '1', // 功能区开关
      info: {}, // 功能区选中的信息
      err: false, // 是否设置完整
      errText: '' // 配置失败的原因
    }
  },
  video_recommend: {
    id: 'video_recommend',
    label: '精彩视频',
    settingPage: markRaw(videoSetting),
    previewPage: markRaw(videoPreview),
    infoKey: 'videoInfo',
    infoValue: {
      switch: '0', // 精彩视频开关
      list: [], // 选中的视频
      title: '', // 标题栏
      defaultTitle: 'https://tagvv-1256030678.file.myqcloud.com/20230616t4ivv.png', // 默认标题栏的图片
      err: false, // 是否设置完整
      errText: '' // 配置失败的原因
    }
  },
  // customer_record: {
  //   id: 'customer_record',
  //   label: '智能获客',
  //   settingPage: markRaw(customerSetting),
  //   previewPage: markRaw(customerPreview),
  //   infoKey: 'customerInfo',
  //   infoValue: {
  //     switch: '0', // 精彩视频开关
  //     list: [], // 选中的视频
  //     title: '', // 标题栏
  //     defaultTitle:
  //       'https://tagvvcloud-material-center-test.oss-cn-shanghai.aliyuncs.com/xm/file/1b37624ec978408ea9bf9f5216735684_1687163075544.png', // 默认标题栏的图片
  //     err: false, // 是否设置完整
  //     errText: '' // 配置失败的原因
  //   }
  // },
  // creative_follow_up: {
  //   id: 'creative_follow_up',
  //   label: '创意跟拍',
  //   settingPage: markRaw(followUpSetting),
  //   previewPage: markRaw(followUpPreview),
  //   infoKey: 'followUpInfo',
  //   infoValue: {
  //     switch: '0', // 创意跟拍开关
  //     title: '', // 标题栏
  //     defaultTitle: 'https://tagvv-1256030678.file.myqcloud.com/20230809q9f1p.png', // 默认标题栏的图片
  //     err: false, // 是否设置完整
  //     errText: '' // 配置失败的原因
  //   }
  // },
  task_recommend: {
    id: 'task_recommend',
    label: '热门活动',
    settingPage: markRaw(taskSetting),
    previewPage: markRaw(taskPreview),
    infoKey: 'taskInfo',
    infoValue: {
      switch: '1', // 热门活动开关
      list: [], // 选中的视频
      title: '', // 标题栏
      view: '1', // 试图设置 1卡片 2引导
      defaultTitle: 'https://tagvv-1256030678.file.myqcloud.com/20230616emto0.png', // 默认标题栏的图片
      err: false, // 是否设置完整
      errText: '' // 配置失败的原因
    }
  },
  // creation_open: {
  //   id: 'creation_open',
  //   label: '素材宝典',
  //   settingPage: markRaw(materialSetting),
  //   previewPage: markRaw(materialPreview),
  //   infoKey: 'materialInfo',
  //   infoValue: {
  //     switch: '0', // 素材宝典开关
  //     title: '', // 标题栏
  //     defaultTitle: 'https://tagvv-1256030678.file.myqcloud.com/20240511bcvyf.png', // 默认标题栏的图片
  //     err: false, // 是否设置完整
  //     errText: '' // 配置失败的原因
  //   }
  // },
  creative_inspiration: {
    id: 'creative_inspiration',
    label: '创意灵感',
    settingPage: markRaw(inspirationSetting),
    previewPage: markRaw(inspirationPreview),
    infoKey: 'inspirationInfo',
    infoValue: {
      switch: '0', // 创意灵感开关
      title: '', // 标题栏
      defaultTitle: 'https://tagvv-1256030678.file.myqcloud.com/20230809bq72z.png', // 默认标题栏的图片
      err: false, // 是否设置完整
      errText: '' // 配置失败的原因
    }
  },
  current_version_recommend: {
    id: 'current_version_recommend',
    label: '本期推荐',
    settingPage: markRaw(recommendSetting),
    previewPage: markRaw(recommendPreview),
    infoKey: 'recommendInfo',
    infoValue: {
      switch: '1', // 本期推荐开关
      list: [], // 选中的视频
      title: '', // 标题栏
      defaultTitle: 'https://tagvv-1256030678.file.myqcloud.com/20230616gyd18.png', // 默认标题栏的图片
      err: false, // 是否设置完整
      errText: '' // 配置失败的原因
    }
  }
}
// 标准版的配置
const configListMajor = {
  'mission:banner': {
    id: 'mission:banner',
    label: 'Banner',
    settingPage: markRaw(bannerSetting),
    previewPage: markRaw(bannerPreview),
    infoKey: 'bannerInfo', // 存储信息的key
    infoValue: {
      list: [], // 轮播图列表
      err: false, // 是否设置完整
      errText: '' // 配置失败的原因
    } // 存储信息的value
  },

  rank_major: {
    // 写死的没有配置的
    id: 'rank_major',
    label: '',
    settingPage: null,
    previewPage: markRaw(rankMajorPreview),
    infoKey: 'rankMajorInfo',
    infoValue: {
      switch: '0',
      err: '',
      errText: ''
    }
  },
  'mission:rank': {
    id: 'mission:rank',
    label: '转发视频设置',
    settingPage: markRaw(forwardVideoSetting),
    previewPage: markRaw(forwardVideoPreview),
    infoKey: 'rankInfo',
    infoValue: {
      switch: '1', // 功能区开关
      info: {}, // 功能区选中的信息
      title: '',
      defaultTitle: 'https://tagvv-1256030678.file.myqcloud.com/20240529rhfq2.png'
    }
  }
}

const configList =
  systemVersion.value === 1 || systemVersion.value === 4 ? configListMajor : configListFirst

export { configList }
