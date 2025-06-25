import { ElMessage } from 'element-plus'
import squareSetting from './square/setting.vue'
import squarePreview from './square/preview.vue'
import myActivityPreview from './my_activity/preview.vue'
// import inspirationSetting from './creative_inspiration/setting.vue'
// import inspirationPreview from './creative_inspiration/preview.vue'
import materialPreview from './material_encyclopedia/preview.vue'
import materialSetting from './material_encyclopedia/setting.vue'
/**
 * 配置介绍----将所有的配置信息存在一个对象里面,key就是对应的属性[由后端定义]
 * id：属性名
 * label：该属性对应的中文名[暂时只在tab上显示用]
 * settingPage: 该属性对应的配置页面
 * previewPage：该属性对应的预览页面
 * info：该属性对应的存储信息 对象格式的 infoKey:infoValue
 *  -- err：【固定信息】如果未配置完整(配置失败)就是true
 *  -- errText：【固定信息】存储配置失败的原因
 *  -- list：如果配置属性里有数组格式的数据(当前都是存放内容设置的信息)都放在这里 //数据和对象格式的分开放是为了后续判断方便
 *  -- info：如果配置属性里有对象格式的数据(当前都是存放内容设置的信息)都放在这里
 *  -- title：配置属性里有标题栏的就放在这里
 *  -- defaultTitle：可以动态配置标题栏，那就会有默认的标题栏信息
 *  -- switch：配置属性有开关的就用这个。字符串 '1'是开 '0'是关
 */
// 所有的配置
export const configList = {
  // creative_inspiration: {
  //   id: 'creative_inspiration',
  //   label: '创意灵感',
  //   settingPage: markRaw(inspirationSetting),
  //   previewPage: markRaw(inspirationPreview),
  //   infoKey: 'inspirationInfo',
  //   infoValue: {
  //     switch: '0', // 创意灵感开关
  //     title: '', // 标题栏
  //     defaultTitle: 'https://tagvv-1256030678.file.myqcloud.com/20230809bq72z.png', // 默认标题栏的图片
  //     err: false, // 是否设置完整
  //     errText: '' // 配置失败的原因
  //   }
  // },  
  my_activity: {
    // 写死的没有配置的
    id: 'my_activity',
    label: '我的活动',
    settingPage: null,
    previewPage: markRaw(myActivityPreview),
    infoKey: 'myActivityInfo',
    infoValue: {
      switch: '0',
      err: '',
      errText: ''
    }
  },
  activity_square: {
    id: 'activity_square',
    label: '活动广场',
    settingPage: markRaw(squareSetting),
    previewPage: markRaw(squarePreview),
    infoKey: 'squareInfo', // 存储信息的key
    infoValue: {
      switch: '1', // 活动广场开关
      list: [], // 专区列表
      err: false, // 是否设置完整
      errText: '' // 配置失败的原因
    } // 存储信息的value
  },
  creation_open: {
    id: 'creation_open',
    label: '素材宝典',
    settingPage: markRaw(materialSetting),
    previewPage: markRaw(materialPreview),
    infoKey: 'materialInfo',
    infoValue: {
      switch: '0', // 素材宝典开关
      title: '', // 标题栏
      defaultTitle: 'https://tagvv-1256030678.file.myqcloud.com/20240511bcvyf.png', // 默认标题栏的图片
      err: false, // 是否设置完整
      errText: '' // 配置失败的原因
    }
  }
}

export function beforeOpenSwitchChange(switchOpenNumber) {
  console.log("beforeOpenSwitchChange",switchOpenNumber)
  if (switchOpenNumber >= 2) {
    ElMessage.warning('活动页最多同时开启2个功能区，请至少关闭1个后再次开启')
    return false
  } else {
    return true
  }
}
