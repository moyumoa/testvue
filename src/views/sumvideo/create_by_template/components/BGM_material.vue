<template>
  <div class="storyboard_material_box">
    <div class="material_box">
      <div class="one_audio" v-for="(item, index) in chooseList" :key="index">
        <div class="audio_left" @click.stop="previewFun(item)">
          <img
            class="audio_icon"
            src="https://tagvv-1256030678.file.myqcloud.com/20231108x525v.png"
            alt=""
          />
          <img
            v-if="item.source === 6"
            class="item_xm"
            src="https://tagvv-1256030678.file.myqcloud.com/202405134bhlq.png"
            alt=""
          />
          <!-- 播放按钮 -->
          <img
            class="action_play"
            src="https://tagvv-1256030678.file.myqcloud.com/20240329lnttj.png"
            alt=""
          />
        </div>
        <div class="audio_right" @click.stop="checkChange(item)">
          <div class="right_top">
            <div class="audio_title line-hidden2" :title="item.name">{{ item.name || '--' }}</div>
            <!-- <div class="audio_tip line-hidden2">xinxi</div> -->
          </div>
          <div class="audio_time">{{ conversionTime(item.duration) }}</div>
          <!-- 批量删除 -->
          <div
            class="material_action material_action_batch_audio"
            v-if="origin == 'createByTemplate'"
          >
            <div class="action_right">
              <div class="xm_check_box_round" style="margin-right: 8px">
                <div
                  :class="
                    checkList.includes(item.tagvvMediaId || item.id)
                      ? 'check_box check_box_active'
                      : 'check_box'
                  "
                ></div>
              </div>
            </div>
          </div>
          <!-- 单个删除 -->
          <img
            v-else
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
            class="audio_del"
            src="https://tagvv-1256030678.file.myqcloud.com/20240401iwqjq.png"
            alt=""
          />
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
import { MEDIA_TYPE } from '@/utils/dictionary/sumvideo'
import { throttle, secToMin } from '@/utils/tools'
// import { removeMaterial } from '@/api/sumvideo/create_by_template.js'
import { materialAction } from './js/material.js'
const { materialDelFun } = materialAction()
const props = defineProps({
  origin: {
    type: String,
    default: '' //   templateEdit 模板分镜详情的规则里过来的
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
  }
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
  checkList
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
//         // message.success('刪除成功')
//         // chooseList.value.splice(index, 1)
//         // if (listTotal.value > 0) {
//         //   emits('update:listTotal', listTotal.value - 1)
//         // }
//         // emits('delFun')
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
  emits(
    'previewFun',
    '查看' + MEDIA_TYPE.getCN(mediaType.value),
    item.url || item.mediaUrl,
    'audio',
    ''
  )
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
</style>
