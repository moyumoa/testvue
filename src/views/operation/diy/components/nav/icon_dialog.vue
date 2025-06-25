<template>
  <el-dialog
    v-model="show"
    ref="dialog"
    title="选择底部导航图标"
    width="834px"
    :before-close="close"
    destroy-on-close
  >
    <div class="select_item" style="border-bottom: 1px solid #e8e8e8">
      <div class="label">选择颜色</div>
      <div class="content">
        <template v-for="item in colorList" :key="item.label">
          <div class="color_item">
            <div
              class="box_wrapper"
              :style="{ border: `1px solid ${item.color}` }"
              @click="toggleColor(item.label)"
            >
              <div class="box" :style="{ backgroundColor: `${item.color}` }"></div>
              <img
                v-if="item.label === color"
                class="img"
                src="@/assets/images/diy/ok.png"
                alt=""
              />
            </div>
            <span>{{ item.color }}</span>
          </div>
        </template>
      </div>
    </div>
    <div class="select_item" style="margin-top: 20px">
      <div class="label">选择图标</div>
      <div class="content">
        <template v-for="item in iconList" :key="item.icon">
          <div class="icon_item">
            <div
              class="icon_wrapper"
              @click="toggleIcon(item.icon)"
              :style="{ border: `1px solid ${item.icon === icon ? '#364FCD' : '#E8E8E8'}` }"
            >
              <i :class="['iconfont', `icon-${item.icon}_weixuanzhong`]"></i>
              <i
                :class="['iconfont', `icon-${item.icon}_xuanzhong`]"
                :style="{
                  color: item.icon === icon ? colorList.find(i => i.label === color).color : ''
                }"
              ></i>
              <img v-if="item.icon === icon" class="img" src="@/assets/images/diy/ok2.png" alt="" />
            </div>
          </div>
        </template>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="close">取消</el-button>
        <el-button type="primary" @click="confirm">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
const props = defineProps({
  modal: {
    type: Object,
    default: () => {
      return {
        iconShow: false,
        colorText: '',
        icon: ''
      }
    }
  }
})

const emits = defineEmits(['select'])
const message = inject('$message')
const dialog = ref(null)
const show = toRef(props.modal, 'iconShow')
const color = ref('black')
const colorList = reactive([
  { label: 'black', color: '#2f363f' },
  { label: 'red', color: '#eb5050' },
  { label: 'blue', color: '#4498ed' },
  { label: 'orange', color: '#e28c42' }
])
const toggleColor = val => {
  color.value = val
}
const icon = ref('')
const iconList = reactive([
  { icon: 'shouye' },
  { icon: 'shangcheng' },
  { icon: 'gerenzhongxin' },
  { icon: 'gouwuche' },
  { icon: 'VIP' },
  { icon: 'tuijian' },
  { icon: 'faxian' },
  { icon: 'huiyuan' },
  { icon: 'haowuyouxuan' },
  { icon: 'qingdan' },
  { icon: 'erweima' }
])
const toggleIcon = val => {
  icon.value = val
}

const close = () => {
  dialog.value.close()
}
const confirm = () => {
  if (!icon.value) {
    return message.warning('请选择图标')
  }
  if (!color.value) {
    return message.warning('请选择颜色')
  }
  const item = colorList.find(i => i.label === color.value)
  emits('select', { colorText: color.value, color: item.color, icon: icon.value })
  close()
}
watch(
  () => props.modal,
  val => {
    color.value = val.colorText
    icon.value = val.icon
    console.log(color.value)
    console.log(icon.value)
  },
  { immediate: true }
)
</script>

<style lang="scss" scoped>
.select_item {
  display: flex;
  align-items: center;
  padding-bottom: 20px;
  .label {
    margin-right: 24px;
    width: 60px;
  }
  .content {
    flex: 1;
    display: flex;
    flex-wrap: wrap;
    .color_item {
      margin-right: 48px;
      display: flex;
      align-items: center;
      > .box_wrapper {
        margin-right: 12px;
        border-radius: 2px;
        position: relative;
        .img {
          width: 16px;
          height: 11px;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
        .box {
          width: 32px;
          height: 32px;
        }
        &:hover {
          padding: 3px;
          > .box {
            width: 26px;
            height: 26px;
          }
        }
      }
      > span {
        color: #303133;
        font-size: 12px;
      }
    }
    .icon_item {
      margin: 0 40px 28px 0;
      > .icon_wrapper {
        width: 64px;
        height: 64px;
        border-radius: 2px;
        border: 1px solid #e8e8e8;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        position: relative;
        .img {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 19px;
          height: 19px;
        }
        > .iconfont {
          font-size: 24px;
        }
      }
    }
  }
}
</style>
