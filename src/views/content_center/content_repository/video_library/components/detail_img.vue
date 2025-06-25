<template>
  <div class="detail_img">
    <el-image
      class="left_img"
      :src="urlList[imgIndex]"
      fit="contain"
      :preview-src-list="urlList"
      :initial-index="imgIndex"
    >
      <template #placeholder>
        <div class="image_placeholder_loading">
          <div class="image_placeholder_icon"></div>
        </div>
      </template>
    </el-image>
    <template v-if="urlList.length > 1">
      <!-- 上一张 -->
      <div
        :class="{ pre_img: true, active_img: imgIndex > 0, dis_img: imgIndex == 0 }"
        @click="changeImg(2)"
      >
        <img src="https://tagvv-1256030678.file.myqcloud.com/202504276tq6n.png" />
      </div>

      <!-- 下一张 -->
      <div
        :class="{
          next_img: true,
          active_img: imgIndex < urlList.length - 1,
          dis_img: imgIndex == urlList.length - 1
        }"
        @click="changeImg(1)"
      >
        <img src="https://tagvv-1256030678.file.myqcloud.com/20250427w5ojd.png" />
      </div>

      <!-- 总数 -->
      <div class="change_num">{{ imgIndex + 1 }}/{{ urlList.length }}</div>
    </template>
  </div>
</template>
<script setup>
import { throttle } from '@/utils/tools'

const props = defineProps({
  pictures: String
})
const urlList = ref([])
onMounted(() => {
  console.log('图片列表', props.pictures)
  if (props.pictures) {
    urlList.value = JSON.parse(props.pictures).map(x => x.url)
  }
})
// const { urlList } = toRefs(props.previewDialog)
const imgIndex = ref(0)
// 切换图片
const changeImg = throttle(e => {
  console.log('changeImg', imgIndex.value, e)
  if (e === 1) {
    // 下一张
    if (imgIndex.value < urlList.value.length - 1) {
      imgIndex.value += 1
    }
  } else {
    // 上一张
    if (imgIndex.value >= 1) {
      imgIndex.value -= 1
    }
  }
}, 300)
</script>
<style lang="scss" scoped>
.detail_img {
  width: 100%;
  height: 100%;
  display: flex;
  position: relative;
  .left_img {
    width: 100%;
    height: 100%;
    display: flex;
  }
}
.change_num {
  position: absolute;
  bottom: 12px;
  right: 50%;
  transform: translateX(50%);
  width: max-content;
  padding: 1px 6px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  font-weight: 600;
  font-size: 12px;
  color: #ffffff;
  line-height: 18px;
}
.pre_img {
  width: 48px;
  height: 48px;
  display: flex;
  border-radius: 100%;
  position: absolute;
  left: 4px;
  top: calc((100% - 48px) / 2);
  background: rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  img {
    display: flex;
    width: 36px;
    height: 36px;
    display: flex;
    object-fit: contain;
  }
}
.next_img {
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  right: 4px;
  top: calc((100% - 48px) / 2);
  width: 48px;
  height: 48px;
  display: flex;
  border-radius: 100%;
  background: rgba(0, 0, 0, 0.1);
  img {
    display: flex;
    width: 36px;
    height: 36px;
    display: flex;
    object-fit: contain;
  }
}
.active_img {
  cursor: pointer;
  &:hover {
    background: rgba(0, 0, 0, 0.2);
  }
}
.dis_img {
  cursor: not-allowed;
}
</style>
