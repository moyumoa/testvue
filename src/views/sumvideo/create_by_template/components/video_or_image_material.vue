<template>
  <div class="storyboard_material_box">
    <div class="material_box">
      <div
        class="one_material"
        @click.stop="previewFun(item)"
        v-for="(item, index) in chooseList"
        :key="index"
      >
        <!-- 封面 -->
        <img
          class="material_cover"
          :src="
            item.thumbUrl && item.url ? item.thumbUrl : item.coverUrl || item.url || item.mediaUrl
          "
          alt=""
        />
        <!-- 时间-->
        <div class="action_time" v-if="mediaType == 1">
          {{ conversionTime(item.duration) }}
        </div>
        <!-- 云原料标志 -->
        <img
          v-if="item.source === 6"
          class="item_xm"
          src="https://tagvv-1256030678.file.myqcloud.com/202405134bhlq.png"
          alt=""
        />
        <!-- 云资源标志 -->
        <img
          v-if="showXMICON && item.brandId == '0'"
          class="xm_icon"
          src="https://tagvv-1256030678.file.myqcloud.com/202410218dz9v.png"
          alt=""
        />
        <!-- 实拍图的替换标识 -->
        <img
          v-if="showMarkICON && item.markUrl"
          class="item_mark"
          src="https://tagvv-1256030678.file.myqcloud.com/202410210h1pp.png"
          alt=""
        />
        <!-- 播放按钮 -->
        <img
          v-if="mediaType == 1"
          class="action_play"
          src="https://tagvv-1256030678.file.myqcloud.com/20240329lnttj.png"
          alt=""
        />
        <!-- 批量删除 -->
        <div
          :style="hideName ? 'padding-bottom:8px' : ''"
          class="material_action material_action_batch"
          @click.stop="checkChange(item)"
          v-if="origin == 'createByTemplate'"
        >
          <div class="action_right">
            <div class="xm_check_box_round" style="margin-right: 8px">
              <div
                :class="
                  checkList.includes(item.tagvvMediaId || item.id || item.materialId)
                    ? 'check_box check_box_active'
                    : 'check_box'
                "
              ></div>
            </div>
          </div>
        </div>
        <!-- 下载+删除 -->
        <div class="material_action" :style="hideName ? 'bottom:8px' : ''" v-else>
          <!-- 单个删除+下载 -->
          <div class="action_right">
            <img
              @click.stop="
                materialDelFun(
                  item,
                  index,
                  pipelineId,
                  templateId,
                  creativeReplaceId,
                  showMore,
                  chooseList,
                  listTotal,
                  emits,
                  null,
                  origin
                )
              "
              class="action_icon"
              src="https://tagvv-1256030678.file.myqcloud.com/2024032998kkl.png"
              alt=""
            />
            <img
              @click.stop="downFun(item)"
              src="https://tagvv-1256030678.file.myqcloud.com/20240329p1fwu.png"
              alt=""
              class="action_icon"
            />
          </div>
        </div>
        <!-- 名称 -->
        <div v-if="!hideName" class="material_name line-hidden1" :title="item.name">
          {{ item.name || '--' }}
        </div>
      </div>
    </div>
    <!-- 查看全部 -->
    <div class="show_all_box" v-if="showMore && listTotal > 20" @click="showMaterialAllFun">
      查看全部（共{{ listTotal || 0 }}个）
      <img src="https://tagvv-1256030678.file.myqcloud.com/20240409k5lng.png" alt="" />
    </div>
  </div>
</template>
<script setup>
import { downLoadFile } from '@/utils/exportFile.js'
import { MEDIA_TYPE } from '@/utils/dictionary/sumvideo'
// import { removeMaterial } from '@/api/sumvideo/create_by_template.js'

// import { use } from '@/api/content_center/material_library.js'
import { throttle, secToMin } from '@/utils/tools'
import { materialAction } from './js/material.js'
const { materialDelFun } = materialAction()
const props = defineProps({
  origin: {
    type: String,
    default: '' //   templateEdit 模板分镜详情的规则里过来的 createByTemplate 模板式生成过来的
  },
  chooseList: {
    type: Object,
    default: () => {
      return []
    }
  },
  showMore: {
    type: Boolean,
    default: false
  }, // 是否显示查看更多
  listTotal: {
    type: Number,
    default: null
  }, // 总数
  mediaType: {
    type: Number,
    default: null
  },
  pipelineId: {
    type: Number || String,
    default: null
  },
  templateId: {
    type: Number || String,
    default: null
  },
  creativeReplaceId: {
    type: Number || String,
    default: null
  },
  checkList: {
    type: Array,
    default: () => {
      return []
    }
  },
  hideName: Boolean, // 是否隐藏文件名
  showMarkICON: Boolean, // 是否要显示左上角的标识图片
  showXMICON: Boolean // 是否要显示左上角的云资源图片
})
const {
  origin,
  chooseList,
  mediaType,
  showMore,
  listTotal,
  pipelineId,
  templateId,
  creativeReplaceId,
  checkList,
  hideName,
  showMarkICON,
  showXMICON
} = toRefs(props)

// 将毫秒转换成分秒
function conversionTime(time) {
  return secToMin((time || 0) / 1000)
}
// const message = inject('$message')
// const delFun = throttle((item, index) => {
//   removeMaterial({
//     pipelineId: pipelineId.value,
//     scriptId: templateId.value,
//     scriptReplaceId: creativeReplaceId.value,
//     tagvvMediaIds: [item.id || item.tagvvMediaId]
//   })
//     .then(res => {
//       if (res.code === 0) {
//         // 在步骤二直接删除，如果总数小于20或者当前列表的总数小于20，就去请求接口获取最新的20条数据 因为我们初始化只返回20条数据
//         if (showMore.value) {
//           // 直接删除
//           if (chooseList.value.length < 20 || listTotal.value < 20) {
//             emits('delFun')
//           } else {
//             chooseList.value.splice(index, 1)
//             if (listTotal.value > 0) {
//               emits('update:listTotal', listTotal.value - 1)
//             }
//             message.success('刪除成功')
//           }
//         } else {
//           chooseList.value.splice(index, 1)
//           if (listTotal.value > 0) {
//             emits('update:listTotal', listTotal.value - 1)
//           }
//           emits('delFun')
//           message.success('刪除成功')
//         }
//       }
//     })
//     .catch(() => {})
// }, 300)

const downFun = throttle(item => {
  // use({
  //   id: item.id
  // })
  downLoadFile(item.url, item.name || '原料', 'material_library')
}, 500)

const emits = defineEmits([
  'delFun',
  'update:listTotal',
  'previewFun',
  'showMaterialAllFun',
  'update:clickStoryboardId',
  'update:uploadLoading',
  'onCheckChangeFun'
])
const previewFun = throttle(item => {
  let url = ''
  let cover = ''
  let type = ''
  switch (mediaType.value) {
    case 1:
      url = item.url || item.mediaUrl
      type = 'video'
      cover = item.coverUrl || null
      break

    case 8:
      url = item.url || item.coverUrl || item.mediaUrl
      cover = item.url || item.coverUrl || item.mediaUrl
      type = 'image'
      break
  }
  emits('previewFun', '查看' + MEDIA_TYPE.getCN(mediaType.value), url, type, cover)
})
const showMaterialAllFun = throttle(() => {
  emits('showMaterialAllFun')
}, 500)

// 设置选中/非选中
const checkChange = throttle(item => {
  emits('onCheckChangeFun', item, creativeReplaceId.value)
})
</script>
<style lang="scss" scoped>
@import './scss/step.scss';
:deep(.material_action) {
  justify-content: flex-end !important;
}
:deep(.action_icon) {
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.2);
}
:deep(.one_material:hover) {
  .action_play {
    opacity: 1 !important;
  }
  .action_time {
    z-index: 1;
  }
}
.item_mark {
  position: absolute;
  top: 6px;
  left: 6px;
  width: 20px;
  height: 20px;
  object-fit: contain;
  display: flex;
}
.xm_radio_box {
  z-index: 5;
  position: absolute;
  right: 8px;
  bottom: 0px;
}
</style>
