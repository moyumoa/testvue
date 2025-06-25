<template>
  <div
    class="choose_text_page"
    v-loading="delLoading && creativeReplaceId === delChooseTextInfo.creativeReplaceId"
  >
    <div class="page_top" style="padding: 0 !important">
      <img
        class="top_icon"
        src="https://tagvv-1256030678.file.myqcloud.com/202404017pevl.png"
        alt=""
      />
      <div class="top_title">
        建议字数：
        <span v-if="duration > 0">
          {{ parseInt((duration / 1000) * 4.2) }}~{{ parseInt((duration / 1000) * 5.5) }}
        </span>
        <span v-else>0</span>
      </div>
      <div class="top_btn">
        <slot name="topBtn"></slot>
      </div>
    </div>
    <div class="page_center sumvideo_page">
      <template v-if="chooseList && chooseList.length > 0">
        <div
          class="one_text"
          @click.stop="checkChange(item)"
          v-for="(item, index) in chooseList"
          :key="index"
        >
          <div class="text_text_box">
            <img
              v-if="item.source == 6"
              class="text_xm_icon"
              src="https://tagvv-1256030678.file.myqcloud.com/20240415o85vr.png"
              alt=""
            />
            <div class="text_text line-hidden1" :title="item.content" v-html="item.content"></div>
          </div>
          <!-- 批量删除 -->
          <div class="material_action" v-if="origin == 'createByTemplate'">
            <div class="action_right">
              <div class="xm_check_box_round" style="margin-right: 4px">
                <div
                  style="margin-left: 12px"
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
                true,
                origin
              )
            "
            class="text_del"
            src="https://tagvv-1256030678.file.myqcloud.com/20240401o62qu.png"
            alt=""
          />
        </div>
        <div class="show_all_box" v-if="showMore && listTotal > 20" @click="showMaterialAllFun">
          查看全部（共{{ listTotal || 0 }}个）
          <img src="https://tagvv-1256030678.file.myqcloud.com/20240409k5lng.png" alt="" />
        </div>
      </template>
      <div v-else class="no_echart" style="height: 160px !important">
        <img src="@/assets/images/content_center/no_activity.png" alt />
        暂无数据
      </div>
    </div>
    <!--<div class="page_bottom">
      共
      <span>{{ chooseList.length || 0 }}</span>
      条
    </div> -->
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
  textIndex: {
    type: Number,
    default: null
  },
  duration: {
    type: Number || String,
    default: null
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
  delLoading: {
    type: Boolean,
    default: false
  },
  delChooseTextInfo: {
    type: Object,
    default: () => {
      return {}
    }
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
  duration,
  showMore,
  listTotal,
  pipelineId,
  templateId,
  creativeReplaceId,
  delLoading,
  delChooseTextInfo,
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
  'changeDelInfo',
  'update:listTotal',
  'showMaterialAllFun',
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
.choose_text_page {
  width: 100%;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  .page_top {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    .top_icon {
      width: 24px;
      height: 24px;
      object-fit: contain;
      display: flex;
      margin-right: 16px;
    }
    .top_title {
      margin-right: 18px;
      text-align: left;
      width: calc(100% - 340px);
      font-weight: 400;
      font-size: 14px;
      color: #909399;
      line-height: 20px;
      span {
        font-weight: 600;
        color: rgba(54, 79, 205, 1);
      }
    }
  }
  .page_center {
    width: 100%;
    margin-top: 20px;
    height: 184px;
    overflow-y: auto;
    .one_text {
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      .text_xm_icon {
        width: 41px;
        height: 18px;
        object-fit: contain;
        display: flex;
        margin-right: 8px;
      }
      .text_text_box {
        width: calc(100% - 32px);
        background: #ffffff;
        height: 32px;
        background: #f7f8fa;
        border-radius: 2px;
        padding: 0 12px;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
      }
      .text_text {
        width: 100%;
        height: 100%;
        font-weight: 400;
        font-size: 12px;
        color: #606266;
        line-height: 32px;
      }
      .text_del {
        cursor: pointer;
        width: 24px;
        height: 24px;
        object-fit: contain;
        display: flex;
        margin-left: 8px;
      }
    }
    .one_text + .one_text {
      margin-top: 1px;
    }
  }
  .page_bottom {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    font-weight: 400;
    font-size: 14px;
    color: #909399;
    line-height: 20px;
    margin-top: 8px;
    width: 100%;
    color: #364fcd;
    span {
      font-weight: 600;
      color: rgba(54, 79, 205, 1);
    }
    img {
      width: 14px;
      height: 14px;
      object-fit: contain;
      margin-left: 4px;
    }
  }
}
.top_btn {
  width: 300px;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
}
</style>
