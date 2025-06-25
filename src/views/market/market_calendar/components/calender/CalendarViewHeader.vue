<template>
  <div class="cv-header">
    <div class="cv-header-nav">
      <div class="periodLabel">
        <slot name="label">{{ headerProps.periodLabel }}</slot>
      </div>
      <!-- <button
        :disabled="!headerProps.previousYear"
        class="previousYear"
        aria-label="Previous Year"
        @click.prevent="onInput(headerProps.previousYear)"
      >
        {{ previousYearLabel }}
      </button> -->
      <!-- <button
        :disabled="!headerProps.previousPeriod"
        class="previousPeriod"
        aria-label="Previous Period"
        @click.prevent="onInput(headerProps.previousPeriod)"
        v-html="previousPeriodLabel"
      />
      <button
        class="currentPeriod"
        aria-label="Current Period"
        @click.prevent="onInput(headerProps.currentPeriod)"
      >
        {{ headerProps.currentPeriodLabel }}
      </button>
      <button
        :disabled="!headerProps.nextPeriod"
        class="nextPeriod"
        aria-label="Next Period"
        @click.prevent="onInput(headerProps.nextPeriod)"
      >
        {{ nextPeriodLabel }}
      </button> -->
      <!-- <button
        :disabled="!headerProps.nextYear"
        class="nextYear"
        aria-label="Next Year"
        @click.prevent="onInput(headerProps.nextYear)"
      >
        {{ nextYearLabel }}
      </button> -->
      <div class="top_btn">
        <el-button-group>
          <el-button
            size="small"
            type="primary"
            @click.prevent="newActivity"
            style="
              margin-right: 24px;
              border-top-right-radius: 4px;
              border-bottom-right-radius: 4px;
              border-right: unset;
            "
          >
            创建活动
          </el-button>
          <el-button
            size="small"
            type="primary"
            @click.prevent="toActivityList"
            style="
              margin-right: 24px;
              border-radius: 4px;
              border-right: unset;
            "
          >
            全部活动
          </el-button>
          <el-button
            size="small"
            type="goo"
            @click.prevent="onInput(headerProps.previousPeriod)"
            style="border-top-left-radius: 4px; border-bottom-left-radius: 4px"
          >
            上个月
          </el-button>
          <el-button size="small" type="goo" @click.prevent="onInput(headerProps.currentPeriod)">
            今天
          </el-button>
          <el-button
            size="small"
            type="goo"
            @click.prevent="onInput(headerProps.nextPeriod)"
            style="border-top-right-radius: 4px; border-bottom-right-radius: 4px"
          >
            下个月
          </el-button>
          <el-button
            size="small"
            type="goo"
            @click.prevent="fullScreen"
            style="margin-left: 24px; border-radius: 4px"
          >
            {{ isFullscreen ? '退出全屏' : '全屏' }}
          </el-button>
        </el-button-group>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'CalendarViewHeader',
  props: {
    headerProps: {
      type: Object,
      required: true
    },
    previousYearLabel: { type: String, default: '<<' },
    previousPeriodLabel: { type: String, default: '<' },
    nextPeriodLabel: { type: String, default: '>' },
    nextYearLabel: { type: String, default: '>>' }
  },
  data() {
    return {
      isFullscreen: false
    }
  },
  methods: {
    onInput(d) {
      this.$emit('input', d)
    },
    // 创建活动
    newActivity() {
      this.$emit('createActivity')
    },
    // 全部活动list
    toActivityList() {
      this.$router.push({ path: '/content_market/market_calendar/activityList' })
    },
    // 全屏
    fullScreen() {
      this.isFullscreen = !this.isFullscreen
      this.$emit('changeFull', this.isFullscreen)
    }
    // judegIsFullScreen() {
    //   const _this = this
    //   window.onresize = function () {
    //     // 可视区域的高度
    //     const clientHeight = document.documentElement.clientHeight || document.body.clientHeight
    //     // screen是window的属性方法，window.screen可省略window，指的是窗口
    //     const isFullscreen = screen.height === clientHeight
    //     _this.$emit('changeFull', isFullscreen)
    //   }
    // }
  }
  // mounted() {
  //   this.judegIsFullScreen()
  // }
}
</script>
<style>
.cv-header-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
}
.top_btn{
  flex-shrink: 0;
}
.el-button--primary {
  font-size: 14px;
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  color: #ffffff;
}
.el-button--goo {
  font-size: 14px;
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  color: #595959;
}
.el-button--goo:focus {
  color: #364fcd !important;
}

/* .cv-header {
  display: flex;
  flex: 0 1 auto;
  flex-flow: row nowrap;
  align-items: center;
  min-height: 2.5em;
  border-width: 1px 1px 0 1px;
}

.cv-header .periodLabel {
  display: flex;
  flex: 1 1 auto;
  flex-flow: row nowrap;
  min-height: 1.5em;
  line-height: 1;
  font-size: 1.5em;
}

.cv-header,
.cv-header button {
  border-style: solid;
  border-color: #ddd;
}

.cv-header-nav,
.cv-header .periodLabel {
  margin: 0.1em 0.6em;
}

.cv-header-nav button,
.cv-header .periodLabel {
  padding: 0.4em 0.6em;
}

.cv-header button {
  box-sizing: border-box;
  line-height: 1em;
  font-size: 1em;
  border-width: 1px;
} */
</style>
