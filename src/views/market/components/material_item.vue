<template>
  <div class="cover" @click="showMaterial">
    <img
      v-if="MATERIAL_TYPE.get('text') == materialType"
      src="https://tagvv-1256030678.file.myqcloud.com/202203251p292.png"
    />
    <img
      v-if="MATERIAL_TYPE.get('audio') == materialType"
      src="https://tagvv-1256030678.file.myqcloud.com/20220325ici8x.png"
    />
    <img v-if="MATERIAL_TYPE.get('image') == materialType" :src="materialInfo.materialUrl" />
    <template v-if="MATERIAL_TYPE.get('video') == materialType">
      <img :src="materialInfo.cover" />
      <img class="play_icon" src="https://tagvv-1256030678.file.myqcloud.com/20220325a6shx.png" />
    </template>
  </div>

  <el-dialog
    custom-class="material_dialog"
    v-model="data.showDialog"
    append-to-body
    destroy-on-close
    :width="dialogWidth[MATERIAL_TYPE.getEN(materialType)]"
    :title="MATERIAL_TYPE.getCN(materialType)"
  >
    <div class="dialog_content">
      <div class="material_text" v-if="MATERIAL_TYPE.get('text') == materialType">
        {{ materialInfo.materialUrl }}
      </div>
      <div class="material_video" v-if="MATERIAL_TYPE.get('video') == materialType">
        <video :src="materialInfo.materialUrl" controls="controls"></video>
      </div>
      <div class="material_audio" v-if="MATERIAL_TYPE.get('audio') == materialType">
        <!-- <audio :src="materialInfo.materialUrl" controls="controls"></audio> -->
        <img
          class="audio_cover"
          src="https://tagvv-1256030678.file.myqcloud.com/20220325ici8x.png"
        />
        <div class="audio_play">
          <music-player
            :bgm="{
              url: materialInfo.materialUrl
            }"
          ></music-player>
        </div>
      </div>
      <div class="material_image" v-if="MATERIAL_TYPE.get('image') == materialType">
        <img :src="materialInfo.materialUrl" />
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { MATERIAL_TYPE } from '@/utils/dictionary/task'
import musicPlayer from './music_player.vue'

const props = defineProps({
  materialInfo: Object,
  type: String
})
const { materialInfo, type } = toRefs(props)

const data = reactive({
  showDialog: false
})

const dialogWidth = {
  text: '320px',
  video: '400px',
  audio: '360px',
  image: '400px'
}

// 素材类型
const materialType = computed(() => {
  if (type.value) {
    return MATERIAL_TYPE.get(type.value)
  }
  return materialInfo.value.type
})

function showMaterial() {
  data.showDialog = true
  switch (Number(materialType.value)) {
    case MATERIAL_TYPE.get('text'):
      break
    case MATERIAL_TYPE.get('audio'):
      break
    case MATERIAL_TYPE.get('image'):
      break
    case MATERIAL_TYPE.get('video'):
      break
  }
}
</script>

<style lang="scss" scoped>
.cover {
  position: relative;
  cursor: pointer;
  width: 60px;
  height: 80px;
  border-radius: 4px;
  overflow: hidden;
  > img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .play_icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 24px;
    height: 24px;
  }
}
.dialog_content {
  min-height: 100px;
  .material_text {
    font-size: 14px;
    line-height: 20px;
    color: #303133;
  }
  .material_audio {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100px;
    .audio_cover {
      width: 60px;
      height: 80px;
      border-radius: 0;
    }
    .audio_play {
      margin-top: 20px;
      width: 100%;
    }
  }
  video,
  img {
    width: 100%;
  }
}

:deep .el-dialog__footer {
  display: none !important;
}
</style>

<style>
.material_dialog .el-dialog__header {
  border-bottom: 1px solid #dcdee0;
}
</style>
