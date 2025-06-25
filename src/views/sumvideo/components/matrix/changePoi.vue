<template>
  <div>
    <el-dialog
      v-model="show"
      title="POI管理"
      custom-class="info_dialog "
      width="560px"
      destroy-on-close
      @close="close"
    >
      <div class="content">
        <el-input
          style="width: 100%; margin-top: 16px"
          v-model.trim="$data.searchValue"
          placeholder="请输入地点名称搜索"
          clearable
          @input="getSearch"
        />
        <div
          class="poi_list"
          :class="{ poi_list_none: $data.poiList.length === 0 }"
          v-loading="$data.loading"
        >
          <template v-if="$data.poiList.length > 0">
            <div
              class="poi_item"
              v-for="(item, index) in $data.poiList"
              :key="index"
              @click="selectOne(item)"
            >
              <div class="item_content">
                <div class="name">{{ item.poiName }}</div>
                <div class="addr" v-if="info.platform == 1">
                  {{ item.province }}{{ item.city }}{{ item.district }}{{ item.simpleAddr }}
                </div>
                <div class="addr" v-else>{{ item.subname }}</div>
                <div class="select_warp">
                  <img
                    src="https://tagvv-1256030678.file.myqcloud.com/202404073uh8v.png"
                    alt=""
                    class="select_icon"
                    v-if="$data.chooseInfo.poi && $data.chooseInfo.poi === item.poi"
                  />
                  <img
                    src="https://tagvv-1256030678.file.myqcloud.com/202404078x7eq.png"
                    alt=""
                    class="select_icon"
                    v-else
                  />
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="close">取消</el-button>
          <el-button type="primary" @click="handleConfirm" :disabled="!$data.chooseInfo.poi">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { debounce } from '@/utils/tools.js'
import { poiLocation, xhsLocation } from '@/api/market/store'
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  info: {
    type: Object,
    default: () => {
      return {}
    }
  }
})
const { show, info } = toRefs(props)
const emits = defineEmits(['close', 'updatePoi'])
console.log('修改POI信息', info.value)
const $data = reactive({
  loading: false,
  searchValue: '', // 输入
  chooseInfo: {}, // 选择的poi信息
  poiList: []
})
// 选择poi
function selectOne(item) {
  $data.chooseInfo = item
}
// 搜索poi
const getSearch = debounce(val => {
  $data.loading = true
  if (info.value.platform === 1) {
    getDy(val)
  }
  if (info.value.platform === 3) {
    getXhs(val)
  }
}, 500)

function handleConfirm() {
  emits('updatePoi', $data.chooseInfo, info.value)
}
function close() {
  $data.loading = false
  emits('close')
}
// 默认选中
function defaultSelection() {
  const firstData = ($data.poiList || [])[0]
  console.log('firstData', firstData)
  if (firstData?.poi) {
    $data.chooseInfo = firstData
  } else {
    $data.chooseInfo = {}
  }
}

// 获取抖音poi位置
function getDy(name) {
  poiLocation({
    keyword: name || ''
  })
    .then(res => {
      if (res.code === 0 && res.data) {
        const list = res.data || []
        $data.poiList = list.map(item => {
          const {
            simplePoiInfo: { addressInfo, poiId, poiName }
          } = item
          return {
            poi: poiId,
            poiName,
            storeName: poiName,
            province: addressInfo.province,
            city: addressInfo.city,
            district: addressInfo.district,
            simpleAddr: addressInfo.simpleAddr,
            cityCode: addressInfo.cityCode
          }
        })
        defaultSelection()
      } else {
        $data.poiList = []
        defaultSelection()
      }
      $data.loading = false
    })
    .catch(() => {
      $data.poiList = []
      $data.loading = false
      defaultSelection()
    })
}
// 获取小红书poi位置
function getXhs(name) {
  if (!name) {
    $data.poiList = []
    $data.loading = false
    defaultSelection()
    return
  }
  xhsLocation({
    keyword: name || ''
  })
    .then(res => {
      if (res.code === 0 && res.data) {
        const list = res.data || []
        $data.poiList = list.map(item => {
          return {
            poi: item.poiOid,
            poiName: item.name,
            subname: item.subname,
            source: item.source
          }
        })
        defaultSelection()
      } else {
        $data.poiList = []
        defaultSelection()
      }
      $data.loading = false
    })
    .catch(() => {
      $data.poiList = []
      $data.loading = false
      defaultSelection()
    })
}
</script>

<style lang="scss" scoped>
.content {
  padding-bottom: 18px;
  padding: 0 16px;
  .poi_list {
    height: 178px;
    min-height: 178px;
    overflow-y: auto;
    margin-top: 12px;
    box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.1);
    border-radius: 2px;
    .poi_item {
      cursor: pointer;
      height: max-content;
      padding: 0 16px;
      &:hover {
        background: #f6f8fa;
      }

      .item_content {
        height: 56px;
        border-bottom: 1px solid #e8e8e8;
        box-sizing: border-box;
        padding: 8px 0;
        position: relative;
        &:last-child {
          border-bottom: unset;
        }
        .name {
          font-family: PingFangSC, PingFang SC;
          font-weight: 600;
          font-size: 14px;
          color: #333333;
          line-height: 20px;
          width: calc(100% - 32px);
        }
        .addr {
          font-family: PingFangSC, PingFang SC;
          font-weight: 400;
          font-size: 12px;
          color: #909399;
          line-height: 18px;
          margin-top: 2px;
          width: calc(100% - 32px);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .select_warp {
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          .select_icon {
            width: 16px;
            height: 16px;
            object-fit: cover;
          }
        }
      }
    }
  }
  .poi_list_none {
    box-shadow: none;
  }
}
</style>
