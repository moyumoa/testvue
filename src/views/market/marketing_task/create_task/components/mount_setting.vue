<template>
  <div class="setting_block">
    <div class="setting_title">{{ mountConfig.name }}</div>
    <div class="setting_main">
      <el-form-item label="挂载方式：" prop="mountType">
        <div class="tip">
          您可以设置小程序挂载，设置后系统可以实现小程序自动挂载，企业号经营工具和抖音小黄车需员工手动挂载
        </div>
        <div class="mount_list">
          <div class="mount_item" v-for="(item, index) in data.mountList" :key="index">
            <div class="title">
              <div class="icon" :style="{ 'background-image': `url(${item.icon}` }"></div>
              <div class="text">{{ item.title }}</div>
            </div>
            <div class="mount_tip">{{ item.tip }}</div>
          </div>
        </div>
      </el-form-item>
      <el-form-item label="小程序页面链接：" prop="mountContent" v-if="data.showMountForm">
        <div class="mount_content" v-if="false">
          <choose-microapp-link
            @choose="onChooseLink"
            :disabled="disabled"
            :type="data.mountType"
            :taskType="taskType"
            :mountInfo="data.mountInfo"
          ></choose-microapp-link>
        </div>
      </el-form-item>
    </div>
  </div>
</template>

<script setup>
import chooseMicroappLink from '@/views/market/components/choose_microapp_link.vue'

const props = defineProps({
  mountConfig: Object,
  disabled: Boolean,
  taskType: Number
})
const { mountConfig, disabled, taskType } = toRefs(props)

const data = reactive({
  mountList: [
    {
      title: '小程序工具',
      icon: 'https://tagvv-1256030678.file.myqcloud.com/20220110knzs4.png',
      tip: '所有账号都可挂载，支持电商、留资场景。订单和线索归因到任务执行者，订单无法归因到任务，线索能归因到任务。'
    },
    {
      title: '企业号经营工具',
      icon: 'https://tagvv-1256030678.file.myqcloud.com/20220110z1exy.png',
      tip: '抖音企业号、企业渠道号、企业员工号、抖音员工号（飞书）才能挂载，支持留资场景。留资线索能归因到执行者，无法归因到任务。'
    },
    {
      title: '抖音小黄车',
      icon: 'https://tagvv-1256030678.file.myqcloud.com/20220110ct61g.png',
      tip: '有抖音小黄车权限即可挂载，支持电商交易场景。订单能归因到执行者和任务。'
    }
  ],
  mountType: 1,
  mountInfo: null,
  showMountForm: false
})

function onChooseLink(mountType, mountInfo) {
  mountConfig.value.children.forEach(config => {
    if (config.ckey === 'mount_type') {
      config.cvalue = mountType
    }
    if (config.ckey === 'mount_info') {
      config.cvalue = mountInfo ? JSON.stringify(mountInfo) : null
    }
    if (config.ckey === 'mount_tool') {
      config.cvalue = mountInfo ? 1 : null
    }
  })
}

// const mountConfig =computed(()=>{

// })

onMounted(() => {
  mountConfig.value.children.forEach(config => {
    if (config.cvalue) {
      if (config.ckey === 'mount_type') {
        data.mountType = Number(config.cvalue)
      }
      if (config.ckey === 'mount_info') {
        data.mountInfo = JSON.parse(config.cvalue)
      }
    }
  })
  data.showMountForm = true
})
</script>

<style lang="scss" scoped>
.mount_list {
  display: flex;
  align-items: center;
  margin-top: 10px;
  > div {
    flex-shrink: 0;
  }
  .mount_item {
    width: 280px;
    margin-right: 16px;
    padding: 8px 16px 14px 12px;
    background: #fff;
    box-shadow: 0px 2px 6px 0px rgba(95, 104, 147, 0.1);
    border-radius: 2px;
    height: 113px;
    box-sizing: border-box;
    .title {
      display: flex;
      align-items: center;
      .icon {
        flex-shrink: 0;
        width: 28px;
        height: 28px;
        margin-right: 8px;
        background-size: cover;
      }
      .text {
        font-size: 14px;
        font-weight: bold;
        color: #333;
      }
    }
    .mount_tip {
      margin-top: 8px;
      font-size: 12px;
      color: #909399;
      line-height: 17px;
    }
  }
}

:deep .el-form-item__content {
  flex: 1 !important;
}
</style>
