<template>
  <!-- table 矩阵号信息 -->
  <!-- 更新：适合所有左头像右信息的 table_column，可后续扩展 -->
  <div class="dy_account_info">
    <img v-if="showAvatar" :src="info.dyAvatar || info.avatar || avatarImg" class="avatar" />
    <div v-if="showPlatform && info.platform" class="platform_icon_box">
      <div :class="[`xm_platformIcon_${info.platform}`]"></div>
    </div>
    <div class="right">
      <div class="top_box">
        <div
          class="name"
          :style="showLeaving || showDel ? 'max-width:calc(100% - 52px)' : 'max-width:100%'"
        >
          <slot name="name">
            {{ name ? info[name] || '--' : info.dyName || info.name || '--' }}
          </slot>
        </div>
        <div class="xm_depart" v-if="showLeaving"></div>
        <!-- 矩阵号被删除 -->
        <div class="xm_delClass" v-if="showDel"></div>
      </div>
      <div class="dy_num" v-if="showDyNum">
        {{
          info.platform
            ? PLATFORM.getCN(info.platform) + (info.platform == 2 || info.platform == 3 ? '' : '号')
            : numText
        }}：{{ info.dyNum || '--' }}
      </div>
      <table_column_phone
        v-if="showPhone"
        :phone="info[phoneKey]"
        size="small"
      ></table_column_phone>
      <div class="dy_num" v-if="showDepart">
        <table_column_department_info
          :departmentName="departmentName"
          connectStr="/"
          divisionStr=";"
          trigger="hover"
          :className="[' depart_info', departClassName].join(' ')"
          tipPlacement="right"
          :showDpeartTitle="true"
        ></table_column_department_info>
      </div>
      <!-- 业务主体 -->
      <div class="business_box">
        <table_column_business_entity
          v-if="showBusiness"
          :list="info.businessNameList || businessNameList"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { PLATFORM } from '@/utils/dictionary/company.js'
import avatarImg from '@/assets/images/content_center/default_user.png'
const props = defineProps({
  info: {
    type: Object,
    default: () => {
      return {
        dyAvatar: '', // 头像
        dyName: '', // 昵称
        dyNum: '', // 抖音号
        // 新增用字段，兼容非抖音号信息
        name: '', // 头像
        avatar: '', // 昵称
        phone: '' // 手机号
      }
    }
  },
  showPlatform: Boolean, // 是否显示平台
  showDel: Boolean, // 是否显示被删除
  showPhone: Boolean, // 是否显示手机号
  // 是否显示抖音号
  showDyNum: {
    type: Boolean,
    default: true
  },
  showAvatar: {
    // 是否显示头像
    type: Boolean,
    default: true
  },
  numText: {
    // 显示账号文案
    type: String,
    default: '抖音号'
  },
  // name应该取哪个字段
  name: {
    type: String,
    default: ''
  },
  phoneKey: {
    type: String,
    default: 'phone' // 手机号读取字段
  },
  showDepart: {
    type: Boolean,
    default: false // 是否显示矩阵号部门
  },
  showBusiness: {
    type: Boolean,
    default: false // 是否显示业务主体
  },
  businessNameList: {
    type: Array,
    default() {
      return []
    }
  }, // 业务主体列表
  departClassName: {
    type: String,
    default: '' // 部门的class
  },
  departmentName: {
    type: String,
    default: '' // 部门的信息
  },
  showLeaving: {
    type: Boolean,
    default: false
  } // 是否显示离职
})
const { info, name } = toRefs(props)
</script>

<style lang="scss" scoped>
.dy_account_info {
  display: flex;
  align-items: center;
  .avatar {
    flex-shrink: 0;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    margin-right: 8px;
    object-fit: cover;
  }
  .platform_icon_box {
    position: absolute;
    flex-shrink: 0;
    width: 48px;
    height: 48px;
  }
  .right {
    width: calc(100% - 56px);
    .top_box {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      width: 100%;
    }
    .name {
      @include mult_line(1);
      color: #303133;
      font-size: 14px;
      line-height: 20px;
      max-width: calc(100% - 56px);
    }
    .dy_num {
      color: #909399;
      font-size: 12px;
      margin-top: 4px;
    }
  }
}

:deep .phone {
  margin-top: 4px;
}
:deep .business_box .businessEntity_tag_box {
  display: flex !important;
  max-width: 100%;
  width: max-content;
}
</style>
