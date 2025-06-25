<template>
  <div class="levelRules_page">
    <!-- 标题 -->
    <!-- <div class="page_title">
      <div class="title1">矩阵号账号等级规则设置</div>
      <div class="title2">
        系统将根据设定的规则每天定时计算账号指数和账号等级，每天凌晨2点计算，只计算授权有效的账号。系统默认使用{{
          judgeOEA() ? 'OEA矩阵获客内置账号' : '星麦云账号'
        }}指数规则，企业也可以根据自身情况，设置自己的规则。
      </div>
      <div class="title3">规则更新后需等待下次统计，账号等级和指数数据才会更新（一般是第二天）</div>
    </div> -->
    <!-- 内容 -->
    <div class="page_content" v-loading="$data.loading">
      <!-- <el-button type="primary" @click="showRuleDialog('add')">新增账号等级规则</el-button> -->
      <div class="xm_promptAboveTheTable">
        系统将根据规则每日凌晨 2 点计算有效矩阵号的账号指数和账号等级
      </div>
      <!-- 规则列表 -->
      <div class="rules_list">
        <div
          class="one_rules"
          v-for="(item, index) in $data.ruleList"
          :key="index"
          :style="item.setupEffect === 1 ? 'border-color:#00aa2f' : ''"
        >
          <div class="rule_top">
            <!-- 规则标题 -->
            <div class="rules_title">
              <div class="title_left">
                <div class="title4">矩阵号等级规则</div>
              </div>

              <div
                class="title_right"
                v-if="!(item.setupEffect === 1 || item.realityEffect === 1) && item.isDefault !== 1"
              >
                <img
                  @click="showRuleDialog('edit', item)"
                  src="https://tagvvcloud-brandapp-1256030678.cos.ap-guangzhou.myqcloud.com/1d5ab7dd7944466ca16573a8920da746矩形@2x(3).png"
                />
                <img
                  @click="delRule(item)"
                  src="https://tagvvcloud-brandapp-1256030678.cos.ap-guangzhou.myqcloud.com/1d9e0a57e2324395a687c7fd8ec97377矩形@2x(4).png"
                />
              </div>
            </div>
            <!-- 备注 -->
            <div class="rules_mark">根据近30天矩阵号的综合表现情况，对矩阵号进行诊断和等级分层</div>
            <!-- 账号等级 -->
            <el-table class="rules_table" :data="item.accountGrade" style="width: 100%">
              <el-table-column prop="gradeName" label="账号级别" />
              <el-table-column prop="gradeValue" label="账号指数" width="150">
                <template #default="scope">
                  {{ exponentRuleList[scope.$index] }}
                </template>
              </el-table-column>
            </el-table>
            <!-- 账号指数 -->
            <div class="calc_box">
              <div class="calc_title">账号指数</div>
              <div class="calc_content">
                <div class="one_calc">
                  <p class="add_calc">=</p>
                  <p>（账号基础诊断得分</p>
                </div>
                <div class="one_calc">
                  <p class="add_calc">+</p>
                  <p style="padding-left: 14px">账号作品权重得分</p>
                </div>
                <div class="one_calc">
                  <p class="add_calc">+</p>
                  <p style="padding-left: 14px">账号活跃得分）/ 3</p>
                </div>
                <!-- <template v-for="(x, y) in getOpen(item.exponentRule)" :key="y">
                  <div class="one_calc" v-if="x.isOpen === 1">
                    <p class="add_calc">{{ y > 0 ? '+' : '=' }}</p>
                    <p>
                      {{ x.exponentName }} {{ x.factor ? '/ ' + x.factor : '' }} *
                      {{ x.exponentValue }}
                    </p>
                  </div>
                </template> -->
              </div>
            </div>
          </div>
          <!-- 按钮 -->
          <div class="btn_box">
            <div v-if="item.setupEffect === 1" class="btn_success">
              <el-icon class="title_icon"><i-circle-check-filled /></el-icon>
              当前生效规则
            </div>
            <el-button
              v-else
              type="primary"
              :disabled="item.setupEffect === 1"
              @click="setRule(item)"
            >
              设为生效规则
            </el-button>
          </div>
        </div>
      </div>
    </div>
    <addRuleDialog
      v-if="$data.ruleDialog.show"
      :ruleDialog="$data.ruleDialog"
      @updateList="getList"
    ></addRuleDialog>
  </div>
</template>
<script setup>
import { getGradeRules, saveGradeRules } from '@/api/system_setting/setting.js'
import { ElMessageBox } from 'element-plus'
import addRuleDialog from './components/addRule_dialog.vue'
import { throttle } from '@/utils/tools.js'
const $data = reactive({
  loading: false,
  ruleList: [],
  ruleDialog: {
    type: '', // add edit
    show: false
  }
})
const exponentRuleList = ref([
  '9≤账号指数',
  '7.5≤账号指数<9',
  '6≤账号指数<7.5',
  '4≤账号指数<6',
  '0≤账号指数<4'
])
// 添加规则
const showRuleDialog = throttle((type, data) => {
  if (type === 'add') {
    $data.ruleDialog = {
      type: type,
      show: true
    }
  } else {
    sessionStorage.setItem('levelRule', JSON.stringify(data))
    $data.ruleDialog = {
      type: type,
      show: true
    }
  }
}, 500)
// 刷新规则
function getList() {
  console.log('getlist')
  getGradeRules({
    brandId: localStorage.getItem('brandInfo')
      ? JSON.parse(localStorage.getItem('brandInfo')).brandId
      : '',
    setupEffect: 1
  })
    .then(res => {
      if (res.code === 0) {
        console.log(res)
        $data.ruleList = res.data || []
      }
    })
    .finally(() => {
      $data.loading = false
    })
}

onMounted(() => {
  $data.loading = true
  sessionStorage.removeItem('levelRule')
  getList()
})
const message = inject('$message')
// 使用规则
const setRule = throttle(item => {
  ElMessageBox.confirm(
    '是否确认将此规则设置为生效规则？<br/><span style="line-height: 30px;font-size:13px;color:#ff0000">注：设置后账号指数和等级数据隔天才会更新</span>',
    '提示',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: '',

      dangerouslyUseHTMLString: true
    }
  )
    .then(() => {
      saveGradeRules({
        gradeRuleId: item.gradeRuleId,
        setupEffect: 1
      })
        .then(res => {
          if (res.code === 0) {
            message.success('修改成功')
            getList()
          }
        })
        .finally(() => {
          $data.loading = false
        })
    })
    .catch(() => {})
}, 500)
// 删除规则
const delRule = throttle(item => {
  ElMessageBox.confirm('是否确认删除此规则？', '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: ''
  })
    .then(() => {
      saveGradeRules({
        gradeRuleId: item.gradeRuleId,
        isDel: 1
      })
        .then(res => {
          if (res.code === 0) {
            message.success('删除成功')
            getList()
          }
        })
        .finally(() => {
          $data.loading = false
        })
    })
    .catch(() => {})
}, 500)
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.levelRules_page {
  .page_title {
    width: 100%;
    min-height: 139px;
    background: #ffffff;
    border-radius: 4px;
    padding: 22px 24px 24px;
    .title1 {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
      line-height: 25px;
    }
    .title2 {
      margin: 16px 0 12px;
      font-size: 14px;
      font-weight: 400;
      color: #606266;
      line-height: 20px;
    }
    .title3 {
      font-size: 14px;
      font-weight: 400;
      color: #364fcd;
      line-height: 20px;
    }
  }
  .page_content {
    // margin-top: 16px;
    padding: 22px 24px 24px;
    background: #ffffff;
    border-radius: 4px;
    min-height: 200px;
    .rules_list {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: flex-start;
      flex-wrap: wrap;
      .one_rules {
        margin: 4px 20px 0 0;
        width: 340px;
        height: 636px;
        border-radius: 2px;
        border: 1px solid #dcdee0;

        .rules_title {
          width: 100%;
          display: flex;
          justify-content: space-between;
          flex-direction: row;
          align-items: center;
          .title_left {
            width: 100%;
            display: flex;
            justify-content: flex-start;
            flex-direction: row;
            align-items: center;
            .title_type1 {
              text-align: center;
              width: 44px;
              height: 20px;
              background: #eaedfa;
              border-radius: 2px;
              border: 1px solid #364fcd;
              font-size: 12px;
              font-weight: 400;
              color: #364fcd;
              line-height: 18px;
            }
            .title_type2 {
              width: 44px;
              text-align: center;
              height: 20px;
              background: #fff4ed;
              border-radius: 2px;
              border: 1px solid #ed6a0c;
              font-size: 12px;
              font-weight: 400;
              color: #ed6a0c;
              line-height: 18px;
            }
            .title4 {
              max-width: calc(100% - 124px);
              font-size: 14px;
              font-weight: 600;
              color: #303133;
              line-height: 20px;
              // margin-top: 2px;
            }
            .title_status {
              margin-left: 8px;
              width: 64px;
              height: 20px;
              background: #edfbf1;
              border-radius: 2px;
              display: flex;
              justify-content: center;
              flex-direction: row;
              align-items: center;
              font-size: 12px;
              font-weight: 600;
              color: #00aa2f;
              line-height: 18px;
              .title_icon {
                font-size: 12px;
                margin-right: 4px;
              }
            }
          }
          .title_right {
            flex: 1;
            display: flex;
            justify-content: flex-end;
            flex-direction: row;
            align-items: center;
            img {
              cursor: pointer;
              width: 24px;
              height: 24px;
              &:hover {
                background: rgba(0, 0, 0, 0.2);

                border-radius: 2px;
              }
            }
            img + img {
              margin-left: 8px;
            }
          }
        }
        .rules_mark {
          margin: 12px 0 16px;
          font-size: 12px;
          font-weight: 400;
          color: #909399;
          line-height: 17px;
        }
        .calc_box {
          margin-top: 20px;
          .calc_title {
            width: 308px;
            height: 36px;
            background: #f7f8fa;
            padding-left: 12px;

            font-size: 14px;
            font-weight: 500;
            color: #303133;
            line-height: 36px;
            margin-bottom: 12px;
          }
          .calc_content {
            width: 100%;
            .one_calc {
              width: 100%;
              display: flex;
              flex-direction: row;
              justify-content: flex-start;
              align-items: center;
              font-size: 14px;
              font-weight: 400;
              color: #303133;
              line-height: 20px;
              .add_calc {
                width: 22px;
                height: 20px;
                text-align: center;
                font-weight: 500;
                padding-left: 7px;
              }
            }
            .one_calc + .one_calc {
              margin-top: 8px;
            }
          }
        }
        .rule_top {
          width: 100%;
          height: calc(100% - 84px);
          overflow-y: auto;
          padding: 16px 16px 0px;
        }
        .btn_box {
          padding: 0px 16px 24px;
          margin-top: 28px;
          width: 100%;
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;
          .btn_success {
            border: 1px solid #00aa2f;
            padding: 8px 20px;
            border-radius: 4px;
            display: flex;
            justify-content: center;
            flex-direction: row;
            align-items: center;
            font-size: 14px;
            font-weight: 600;
            color: #00aa2f;
            line-height: 18px;
            .title_icon {
              font-size: 14px;
              margin-right: 4px;
            }
          }
        }
      }
    }
  }
}
:deep(.rules_table .el-table__body .el-table__row .el-table__cell) {
  height: 36px;
}
:deep(.rules_table .el-table__header-wrapper .el-table__cell, .rules_table
    .el-table__fixed-header-wrapper
    .el-table__cell, .rules_table .el-table__footer-wrapper .el-table__cell) {
  height: 36px;
}
:deep(.el-button.is-disabled) {
  background: rgba(247, 248, 250, 1);
  border-color: rgba(235, 237, 240, 1);
  color: #bfc4cd;
}
</style>
