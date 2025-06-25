import homePreview from './home/preview.vue'
import homeSetting from './home/setting.vue'


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

const configList = {
  'mission:KOC': {
    id: 'mission:KOC',
    label: 'KOC',
    settingPage: markRaw(homeSetting),
    previewPage: markRaw(homePreview),
    infoKey: 'KOCInfo', // 存储信息的key
    infoValue: {
      bannerList: [], // 轮播图
      themeInfo:{}, // 主题信息
      logo:'', // 企业logo 
      err: false, // 是否设置完整
      errText: '' // 配置失败的原因
    } // 存储信息的value
  },


}


export { configList }
