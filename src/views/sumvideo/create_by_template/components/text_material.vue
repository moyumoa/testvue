<template>
  <div class="storyboard_material_box">
    <div class="material_box">
      <div
        :class="{ one_text: true, one_text_xm: item.source === 6 }"
        v-for="(item, index) in chooseList"
        :key="index"
        @click.stop="checkChange(item)"
      >
        <div
          class="text_text_box"
          :style="origin == 'createByTemplate' ? 'width: calc(100% - 32px)' : ''"
        >
          <img
            v-if="item.source == 6"
            class="text_xm_icon"
            src="https://tagvv-1256030678.file.myqcloud.com/20240415o85vr.png"
            alt=""
          />
          <div class="text_text line-hidden1" :title="item.content" v-html="item.content"></div>
        </div>
        <!-- 批量删除 -->
        <div class="material_action material_action_batch_text" v-if="origin == 'createByTemplate'">
          <div class="action_right">
            <div class="xm_check_box_round" style="margin-right: 0px">
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
          class="text_del"
          src="https://tagvv-1256030678.file.myqcloud.com/20240401o62qu.png"
          alt=""
        />
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
// import { removeMaterial } from '@/api/sumvideo/create_by_template.js'

import { throttle } from '@/utils/tools'
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
  showMore,
  listTotal,
  pipelineId,
  templateId,
  creativeReplaceId,
  checkList
} = toRefs(props)
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
  'showMaterialAllFun',
  'update:clickStoryboardId',
  'update:uploadLoading',
  'onCheckChangeFun'
])

const showMaterialAllFun = throttle(() => {
  emits('showMaterialAllFun')
}, 500)

// 设置选中/非选中
const checkChange = throttle(item => {
  if (origin.value === 'createByTemplate') {
    emits('onCheckChangeFun', item, creativeReplaceId.value)
  }
})
</script>
<style lang="scss" scoped>
@import './scss/step.scss';
.storyboard_material_box {
  // margin-bottom: 12px;
  .material_box {
    margin: 0;
  }
}
</style>
