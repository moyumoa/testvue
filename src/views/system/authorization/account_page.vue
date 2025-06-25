<template>
  <div class="account_page_wrapper">
    <!--<xm_search class="">
      <div class="search_item">
        <label class="item_label">抖音号</label>
        <div class="item_content">
          <el-input v-model="searchForm.authName" placeholder="请输入抖音号、抖音昵称" clearable />
        </div>
      </div>
      <div class="search_item">
        <label class="item_label">矩阵号部门</label>
        <div class="item_content">
          <choose_dept_search
            ref="chooseDeptSearchRef"
            @updateDeptIds="updateDeptIds"
            :multiple="true"
            :isUsePermission="true"
            searchLabel="矩阵号部门"
          />
        </div>
      </div>
      <div class="search_item">
        <label class="item_label">抖音号类型</label>
        <div class="item_content">
          <el-select
            v-model="searchForm.dyAccountType"
            placeholder="请选择抖音号类型"
            clearable
            style="width: 100%"
          >
            <el-option
              v-for="item in dyAccountType"
              :label="item.label"
              :value="item.id"
              :key="item.id"
            />
          </el-select>
        </div>
      </div>
      <div class="search_item">
        <label class="item_label">抖音授权状态</label>
        <div class="item_content">
          <el-select
            v-model="searchForm.dyAuthStatus"
            placeholder="请选择抖音授权状态"
            clearable
            style="width: 100%"
          >
            <el-option
              v-for="item in dyStatusList"
              :label="item.label"
              :value="item.id"
              :key="item.id"
            />
          </el-select>
        </div>
      </div>
      <div class="search_item">
        <label class="item_label">发布能力授权状态</label>
        <div class="item_content">
          <el-select
            v-model="searchForm.dyWebAuthStatus"
            placeholder="请选择发布能力授权状态"
            clearable
            style="width: 100%"
          >
            <el-option
              v-for="item in statusList"
              :label="item.label"
              :value="item.id"
              :key="item.id"
            />
          </el-select>
        </div>
      </div>
      <div class="search_item" v-if="systemVersion == 3">
        <label class="item_label">百应授权状态</label>
        <div class="item_content">
          <el-select
            v-model="searchForm.buyinAuthStatus"
            placeholder="请选择百应授权状态"
            clearable
            style="width: 100%"
          >
            <el-option
              v-for="item in statusList"
              :label="item.label"
              :value="item.id"
              :key="item.id"
            />
          </el-select>
        </div>
      </div>
      <div class="search_item" v-if="systemVersion == 3">
        <label class="item_label">线索授权状态</label>
        <div class="item_content">
          <el-select
            v-model="searchForm.dyClueAuthStatus"
            placeholder="请选择线索授权状态"
            clearable
            style="width: 100%"
          >
            <el-option
              v-for="item in statusList"
              :label="item.label"
              :value="item.id"
              :key="item.id"
            />
          </el-select>
        </div>
      </div>
      <div class="search_item">
        <label class="item_label">是否有运营者</label>
        <div class="item_content">
          <el-select
            v-model="searchForm.isBindOperator"
            placeholder="请选择是否有运营者"
            clearable
            style="width: 100%"
          >
            <el-option
              v-for="item in bindOperatorList"
              :label="item.label"
              :value="item.id"
              :key="item.id"
            />
          </el-select>
        </div>
      </div>
      <div class="search_item">
        <label class="item_label">运营者</label>
        <div class="item_content">
          <el-input v-model="searchForm.operator" placeholder="请输入手机号、姓名" clearable />
        </div>
      </div>
      <div class="search_item">
        <el-button type="primary" @click="_getList">查询</el-button>
        <el-button @click="reset">重置</el-button>
        <exp_button :asyncFunc="exportFiles">导出</exp_button>
      </div>
    </xm_search>
     -->
    <xm_search
      :searchComponents="searchComponents"
      @getData="_getList"
      :useOwnReset="true"
      @reset="reset"
    >
      <template #searchBtn>
        <exp_button :asyncFunc="exportFiles">导出</exp_button>
      </template>
    </xm_search>
    <div class="page_main g_bg mt_16">
      <!-- 系统设置配置了高级数据权限，才显示 -->
      <div class="xm_promptAboveTheTable" v-if="allowDyMcnAuth">
        管理人员将抖音机构号授权到系统后，成员通过申请高级数据权限，可以获得准确抖音播放量。已授权自有抖音机构号：{{
          mcnInfo.num || 0
        }}个，
        <span @click="showMcnFun">去管理 ></span>
      </div>
      <div class="g_bw">
        <el-button type="primary" @click="startAuth(1, 2, false)">新增抖音授权</el-button>
        <!-- <el-dropdown popper-class="xm_dropDown">
          <el-button type="primary">
            新增抖音授权
            <el-icon class="el-icon--right">
              <i-arrow-down />
            </el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="startAuth(1, 2, false)">
                授权认证企业号（蓝V）
              </el-dropdown-item>
              <el-dropdown-item @click="startAuth(1, 1, false)">
                授权个人号/普通企业号（非蓝V）
              </el-dropdown-item>
              <el-dropdown-item @click="startAuth(1, 3, true, addAuthEmployee)">
                授权员工号
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown> -->
        <!-- <el-button type="primary" @click="showCode">邀请码</el-button>
        <span class="tip">
          抖音号授权管理支持多个，根据自己所需新增不同抖音号，主要目的是更清晰方便管理。
        </span> -->

        <div class="num_warp">
          <!-- 批量操作 -->
          <div class="one_area" v-show="$data.showBatch">
            <!-- 选择数量 -->
            <span>
              已选中
              <span style="color: #364fcd">
                {{ $data.isAll ? $data.isAllTotal : $data.chooseList.length || 0 }}
              </span>
              个矩阵号
            </span>
            <!--  全选/取消全选按钮 -->
            <el-button style="margin-left: 16px" @click="allChooseFun">
              {{ $data.isAll ? '取消全选' : '全选' }}
            </el-button>
            <!-- 操作 -->
            <el-button @click="batchOpFun(1)">授权所选矩阵号</el-button>
            <el-button @click="batchOpFun(0)">解除所选矩阵号授权</el-button>
          </div>
          <div class="batch_box">
            <el-switch
              v-model="$data.showBatch"
              inline-prompt
              :width="45"
              :disabled="loading"
              :before-change="batchHandelBefore"
            ></el-switch>
            批量操作
            <el-tooltip placement="top">
              <template #content>
                <div style="max-width: 360px">
                  批量授权仅针对星力值不足自动失效的矩阵号进行自动授权
                </div>
              </template>
              <img
                style="width: 14px; height: 14px; margin-left: 8px; vertical-align: middle"
                src="@/assets/images/operate/tip_line.png"
                alt
              />
            </el-tooltip>
          </div>
        </div>
      </div>
      <xm_table
        rowKey="openId"
        class="pic_table"
        tableType="avatar"
        v-loading="loading"
        :data="listData"
        v-model:page="page"
        @getTableData="getList"
        ref="userTable"
        :showSelection="!!$data.showBatch"
        @selection-change="handleSelectionChange"
        :checkSelectable="handleCheckSelectable"
        :select="$data.chooseList"
      >
        <el-table-column label="矩阵号" prop="minProgram" min-width="330px">
          <template #default="{ row }">
            <div class="table_photo">
              <img :src="row.authAccountPhoto" alt />
              <div class="table_photo_right">
                <div class="photo_right_top">
                  <div>{{ row.authAccountName }}</div>
                  <img
                    v-if="row.platform == 1"
                    src="@/assets/images/content_center/dy.png"
                    alt
                    class="platform_img"
                  />
                </div>
                <div class="account_id">
                  <span>抖音号：{{ row.orginUid || '--' }}</span>
                </div>
                <div class="photo_right_top">
                  <table_column_department_info
                    className="blue_department_info"
                    :departmentName="row.xuserDeptName"
                    connectStr="/"
                    divisionStr=";"
                    trigger="hover"
                    tipPlacement="right"
                  ></table_column_department_info>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="类型" prop="type" min-width="150px">
          <template #default="{ row }">
            <template v-if="row.enterpriseType">
              <span v-if="row.enterpriseType === 'EAccountM'">员工号-认证企业号</span>
              <span v-if="row.enterpriseType === 'EAccountS'">员工号-认证企业号</span>
            </template>
            <template v-else>
              <span v-if="row.type === 'EAccountM'">普通企业号</span>
              <span v-if="row.type === 'EAccountS'">认证企业号</span>
              <span v-if="row.type === 'EAccountK'">认证企业号</span>
              <span v-if="row.type === 'LarkStaff'">员工号</span>
              <span v-if="!row.type">个人号</span>
            </template>
          </template>
        </el-table-column>
        <el-table-column label="粉丝数" prop="fansNum" min-width="120px" />
        <el-table-column label="抖音授权" min-width="120px">
          <template #header>
            <div class="column_header">
              <span>抖音授权</span>
              <el-tooltip
                popper-class="tooltip-class"
                placement="top"
                content="<div>授权后将自动获取数据</div>
                <div>1、获取数据将消耗1星力值/矩阵号/天</div><div>2、成功接入的矩阵号长期有效，可手动解除授权，授权失效状态下停止扣除星力值</div>"
                raw-content
                :style="{ 'margin-left': '4px' }"
              >
                <img
                  src="@/assets/images/operate/tip_line.png"
                  style="width: 12px; height: 12px; margin-left: 8px"
                />
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            <div style="display: flex; white-space: nowrap; align-items: center">
              <span :class="{ g_blue: row.dyAuth === 1, g_red: row.dyAuth === 2 }">
                {{ convertStatus(row.dyAuth) }}
              </span>
              <el-tooltip
                v-if="row.dyAuth == 1 || row.dyAuth == 2"
                class="item"
                effect="dark"
                placement="top"
              >
                <img
                  style="width: 14px; height: 14px; margin-left: 8px; vertical-align: middle"
                  src="@/assets/images/operate/tip_line.png"
                  alt
                />
                <template #content>
                  <!-- 授权时间 -->
                  <div v-if="row.dyAuthValidDateTime">授权时间：{{ row.dyAuthValidDateTime }}</div>
                  <!-- 上一次失效时间 授权失效才显示 -->
                  <div v-if="row.dyAuth == 2">
                    上一次失效时间：{{ row.dyAuthInvalidDateTime || '--' }}
                  </div>
                  <!-- 累计有效授权时长 -->
                  <div style="max-width: 300px">
                    累计有效授权时长：{{
                      row.syncTotalDays != null ? (row.syncTotalDays || 0) + '天' : '--'
                    }}
                  </div>
                  <!-- 失效原因 授权失效才显示 -->
                  <div v-if="row.dyAuth == 2" style="width: 230px; display: flex">
                    <div style="white-space: nowrap">失效原因：</div>
                    <div>{{ dyAuthInvalidTypeEnum[row.dyAuthInvalidType] || '--' }}</div>
                  </div>
                </template>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <!-- 授权模式配置里如果没有勾选高级数据，那就不显示 -->
        <el-table-column label="高级数据权限" v-if="allowDyMcnAuth" min-width="150px">
          <template #header>
            <div class="column_header">
              <span>高级数据权限</span>
              <el-tooltip
                popper-class="tooltip-class"
                placement="top"
                content=""
                raw-content
                :style="{ 'margin-left': '4px' }"
              >
                <template #content>
                  <div style="max-width: 300px">
                    通过授权MCN机构可获取准确播放量和更丰富维度数据，如果抖音授权失效，将停止更新所有高级数据
                  </div>
                </template>
                <img
                  src="@/assets/images/operate/tip_line.png"
                  style="width: 12px; height: 12px; margin-left: 8px"
                />
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            <div style="display: flex; white-space: nowrap; align-items: center">
              <span :class="{ g_blue: row.mcnAuth === 1, g_red: row.mcnAuth != 1 }">
                {{ convertStatus2(row.mcnAuth) }}
              </span>
              <!-- 除了未开启并且是未授权MCN以外，其余都显示提示信息 -->
              <el-tooltip
                v-if="row.mcnAuth == 1 || row.mcnAuth == 2"
                class="item"
                effect="dark"
                placement="top"
              >
                <img
                  style="width: 14px; height: 14px; margin-left: 8px; vertical-align: middle"
                  src="@/assets/images/operate/tip_line.png"
                  alt
                />
                <template #content>
                  <!-- 开启时间 -->
                  <div v-if="row.mcnAuthValidTime">开启时间：{{ row.mcnAuthValidTime }}</div>
                  <!-- 到期时间 -->
                  <div>到期时间：{{ row.mcnAuthInvalidTime || '--' }}</div>
                  <!-- 原因 未开启才显示 -->
                  <div v-if="row.mcnAuth != 1" style="width: 230px; display: flex">
                    <div style="white-space: nowrap">原因：</div>
                    <div>{{ dyAuthInvalidTypeEnum[row.mcnAuthInvalidType] || '--' }}</div>
                  </div>
                </template>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <!-- 授权模式配置里如果没有勾选线索数据，那就不显示 -->
        <el-table-column label="线索数据权限" min-width="150px" v-if="allowCluesAuth">
          <template #header>
            <div class="column_header">
              <span>线索数据权限</span>
              <el-tooltip
                popper-class="tooltip-class"
                placement="top"
                content=""
                raw-content
                :style="{ 'margin-left': '4px' }"
              >
                <template #content>
                  <div style="max-width: 400px">如果抖音授权失效，将停止更新所有线索数据</div>
                </template>
                <img
                  src="@/assets/images/operate/tip_line.png"
                  style="width: 12px; height: 12px; margin-left: 8px"
                />
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            <div style="display: flex; white-space: nowrap; align-items: center">
              <span :class="{ g_blue: row.clueAuth === 1, g_red: row.clueAuth != 1 }">
                {{ convertStatus2(row.clueAuth) }}
              </span>
              <!-- 除了未开启并且是未授权线索版以外，其余都显示提示信息 -->
              <el-tooltip v-if="row.clueAuth != 0" class="item" effect="dark" placement="top">
                <img
                  style="width: 14px; height: 14px; margin-left: 8px; vertical-align: middle"
                  src="@/assets/images/operate/tip_line.png"
                  alt
                />
                <template #content>
                  <!-- 开启时间 -->
                  <div v-if="row.clueAuthValidTime">开启时间：{{ row.clueAuthValidTime }}</div>
                  <!-- 到期时间 -->
                  <div v-if="row.clueAuth == 2">
                    到期时间：{{ row.clueAuthInvalidTime || '--' }}
                  </div>
                  <!-- 原因 未开启才显示 -->
                  <div v-if="row.clueAuth == 2" style="width: 230px; display: flex">
                    <div style="white-space: nowrap">原因：</div>
                    <div>{{ dyAuthInvalidTypeEnum[row.clueAuthInvalidType] || '--' }}</div>
                  </div>
                </template>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="运营者" min-width="150px">
          <template #default="{ row }">
            <span>{{ row.opeName || '--' }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          :width="systemVersion == 3 ? '250px' : '200px'"
          align="right"
          fixed="right"
        >
          <template #default="{ row }">
            <div class="operate_box">
              <!-- 授权抖音/解除抖音授权 -->
              <el-link type="primary" class="ml_16">
                <!-- <span v-if="row.dyAuth === 0" @click="addAuthBefore(1, row)">授权抖音</span> -->
                <span v-if="row.dyAuth === 2" @click="reAuth(1, row)">重新授权</span>
                <span v-if="row.dyAuth === 1" @click="cancelAuth(1, row)">解除授权</span>
              </el-link>
              <!-- 权限记录 -->
              <el-link type="primary" class="ml_16" @click="openEmpowerRecords(row.openId, true)">
                权限记录
              </el-link>
              <!-- 更多 -> 矩阵号详情&设置运营者 -->
              <el-dropdown>
                <span class="btn_txt ml_16 default_color">更多</span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <!-- 授权模式配置里如果没有勾选线索数据，那就不显示 -->
                    <el-dropdown-item v-if="allowCluesAuth">
                      <!-- 线索授权/解除线索授权  -->
                      <el-link
                        v-if="(row.clueAuth === 0 || row.clueAuth === null) && systemVersion == 3"
                        type="primary"
                        @click="openAuthClueDialog(row)"
                      >
                        开启线索权限
                      </el-link>
                      <el-link
                        v-if="row.clueAuth === 2 && systemVersion == 3"
                        type="primary"
                        @click="openAuthClueDialog(row)"
                      >
                        开启线索权限
                      </el-link>
                      <el-link
                        v-if="row.clueAuth === 1 && systemVersion == 3"
                        type="danger"
                        @click.stop="removeAuthClueFun(row)"
                      >
                        关闭线索权限
                      </el-link>
                    </el-dropdown-item>
                    <el-dropdown-item v-if="systemVersion == 3">
                      <el-link type="primary" @click="toAccontDetail(row.openId, systemModule)">
                        矩阵号详情
                      </el-link>
                    </el-dropdown-item>
                    <!--                    <el-dropdown-item>-->
                    <!--                      <el-link type="primary" style="margin-left: unset" @click="setOperators(row)">-->
                    <!--                        设置运营者-->
                    <!--                      </el-link>-->
                    <!--                    </el-dropdown-item>-->
                    <el-dropdown-item>
                      <el-link type="primary" style="margin-left: unset" @click="setAccount(row)">
                        编辑矩阵号
                      </el-link>
                    </el-dropdown-item>
                    <el-dropdown-item v-if="row.dyAuth != 1">
                      <el-link type="danger" style="margin-left: unset" @click="delFun(row.openId)">
                        删除矩阵号
                      </el-link>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
      </xm_table>
    </div>
    <!-- 邀请码 -->
    <el-dialog
      v-model="codeVisible"
      custom-class="hide_footer_line hide_header_line"
      title="邀请码"
      width="490px"
    >
      <div class="invite_code">
        <div class="code">
          <p style="margin-bottom: 10px">将下方二维码发送给达人，达人扫码后即可加入</p>
          <qrcode-vue v-if="link" :value="link" size="180" level="H" />
          <p class="text">抖音扫码加入</p>
          <el-button type="primary" @click="downloadImg">保存二维码</el-button>
        </div>
      </div>
      <template #footer></template>
    </el-dialog>
    <el-dialog
      v-model="byCodeVisible"
      custom-class="hide_footer_line hide_header_line"
      title="授权码"
      width="344px"
      :before-close="handleClose"
      destroy-on-close
    >
      <div class="invite_code">
        <div class="code">
          <p style="margin-bottom: 8px">请使用抖音扫码加入</p>

          <div
            class="code_loading"
            style="width: 140px; height: 140px; margin: 0 auto"
            v-loading="showAuthReqLoading"
            element-loading-background="rgba(0,0,0,0.05)"
          >
            <div
              v-if="byCode"
              class="code_img"
              v-loading="scan"
              element-loading-text="账号验证中"
              custom-class="loading_box"
            >
              <img v-if="byCode" :src="byCode" alt />
              <div v-if="(count === 0 || authErr) && !scan" class="mask flex_center">
                <img src="../../../assets/images/auth/refresh.png" alt @click="refreshCode" />
              </div>
              <div v-if="scan" class="mask">
                <div class="success flex_center">
                  <i class="iconfont icon-wancheng wc_icon"></i>
                  <p>扫码成功</p>
                </div>
              </div>
            </div>
          </div>
          <div class="text" style="margin-bottom: 0" v-if="!scan && byCode">
            <template v-if="authErr">
              <div>授权失败，点击重新加载</div>
              <div style="color: red; margin-top: 10px" v-if="authErrReason">
                {{ authErrReason || '' }}
              </div>
            </template>
            <template v-else>
              <template v-if="count > 0">
                <span style="color: #364fcd">{{ count }}S</span>
                后失效
              </template>
              <template v-else>已失效，点击重新加载</template>
            </template>
          </div>
        </div>
      </div>
      <template #footer></template>
    </el-dialog>
    <confirm-dialog
      v-model:visible="dialog.confirmVisible"
      tip="确认是否已授权?"
      @confirm="operationSuccessFun"
    />
    <!-- 设置运营者 -->
    <set-operator
      v-model:visible="dialog.setVisible"
      :data="dialog.current"
      @updateList="getList"
    />
    <!--获客互动能力授权弹窗 抖音web端-->
    <AuthDyWebDialog
      :info="authDyWebDialog.info"
      v-if="authDyWebDialog.show"
      v-model="authDyWebDialog.show"
      @success="getList"
    ></AuthDyWebDialog>

    <!-- 抖音web端授权提醒 -->
    <authDyWebRemindDialog
      v-if="remindDialog.show"
      :remindDialog="remindDialog"
      @updateRemindFun="authDyWebDialog.show = true"
    />
    <!-- 权限记录 -->
    <empowerRecordsDialog
      :platform="1"
      :empowerRecords="empowerRecords"
      v-if="empowerRecords.show"
      @close="empowerRecordsDialogClose"
    />
    <!-- 编辑矩阵号信息   -->
    <AccountAuth
      v-if="accountAuthInfo.show"
      v-model="accountAuthInfo.show"
      :info="accountAuthInfo.info"
      :isConfigPermission="true"
      @update="_getList"
    ></AccountAuth>
    <!-- 授权员工号弹窗 -->
    <authDOM v-if="authDialog.show" :authDialog="authDialog" @updateFun="updateFun" />
    <!-- 线索授权弹窗 -->
    <authClueDOM v-if="authClueDialog.show" :authDialog="authClueDialog" @updateFun="_getList" />
    <!--解除授权弹框  -->
    <CancelAuthDialog
      v-if="state.cancelAuthDialog.show"
      :cancelAuthDialog="state.cancelAuthDialog"
      @auth="singleOpFun(0, state.cancelAuthDialog.row)"
    />

    <!--授权消耗弹框  -->
    <AuthCostDialog v-if="state.costDialog.show" :dialogInfo="state.costDialog" @auth="auth" />
  </div>
</template>

<script setup>
import { ElMessageBox } from 'element-plus'
import AuthCostDialog from './components/accountCostWarn_dialog.vue'
import CancelAuthDialog from './components/cancelAuth_dialog.vue'
// import authPublishDOM from './components/authPublish_dialog.vue'
import authClueDOM from './components/authClue_dialog.vue'
import authDOM from './components/authEmployee_dialog.vue'
import authDyWebRemindDialog from '@/views/system/authorization/components/authDyWeb_remind_dialog.vue'
import qrcodeVue from 'qrcode.vue'
import ConfirmDialog from './components/confirm_dialog.vue'
import SetOperator from './components/set_operator_new.vue'
import { useAccountAuth } from './model/use_account_auth'
// import sectionChoice from '@/views/system/components/section_choice/index.vue'
import {
  accountByAuthLink,
  // accountAuthLink,
  accountByAuthFresh,
  listWxMcnAuths
  // dyWebAuthAllow
} from '@/api/system_setting/authorization'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'
import { debounce, throttle } from '@/utils/tools.js'
import AuthDyWebDialog from '@/views/system/authorization/components/authDyWeb_dialog.vue'
// import { ElMessage } from 'element-plus'
import empowerRecordsDialog from './components/empower_records.vue'
import AccountAuth from '@/views/system/authorization/components/account_auth.vue'
const emits = defineEmits(['updateTotal'])
const route = useRoute()
const router = useRouter()
// 列表的授权/重新授权抖音区分个人号和企业号
function addAuthBefore(to, row) {
  // 员工号就掉其他的
  // if (row.enterpriseType) {
  //   addAuthEmployee()
  //   return
  // }
  // row.type: * `EAccountM` - 普通企业号 * `EAccountS` - 认证企业号 * `EAccountK` - 品牌企业号 这几个都算企业号
  // const allRowType = ['EAccountM', 'EAccountS', 'EAccountK']
  // if (allRowType.includes(row.type)) {
  addAuth(to, 2)
  // } else {
  //   addAuth(to, 1)
  // }
}
const {
  searchComponents,
  state,
  getList,
  _getList,
  reset,
  exportFiles,
  addAuth,
  removeAuth,
  delFun,
  // setOperators,
  // sectionShow,
  // setSection,
  openEmpowerRecords,
  empowerRecordsDialogClose,
  toAccontDetail,
  // chooseDeptSearchRef,
  // updateDeptIds,
  operationSuccessFun,
  // costWarn,
  reAuth,
  cancelAuth,
  $data,
  batchHandelBefore,
  allChooseFun,
  userTable,
  handleCheckSelectable,
  handleSelectionChange,
  batchOpFun,
  startAuth,
  singleOpFun,
  singleAccountOp
} = useAccountAuth(emits, 1, addAuthBefore)
const {
  // searchForm,
  // bindOperatorList,
  // dyAccountType,
  // dyStatusList,
  // statusList,
  loading,
  listData,
  page,
  dialog,
  empowerRecords
} = toRefs(state)

//  邀请码相关数据
const codeInfo = reactive({
  link: null,
  codeVisible: false,
  byCodeVisible: false,
  byCode: null,
  codeOrigin: null // by 百应授权 dyWeb获客互动能力授权
})
const { link, codeVisible, byCodeVisible, byCode, codeOrigin } = toRefs(codeInfo)
const timer = ref(null)
const count = ref(180)
const operationId = ref(0)
const scan = ref(false)

const store = useStore()
const systemModule = store.getters.systemModule
// 基础版不显示矩阵号详情
const systemVersion = computed(() => store.state.user.systemVersion)
// 显示抖音高级数据权限
const allowDyMcnAuth = computed(() => store.state.user.allowDyMcnAuth)
// 显示抖音线索权限
const allowCluesAuth = computed(() => store.state.user.allowCluesAuth)

const authErr = ref(false)
const authErrReason = ref('')

const dyAuthInvalidTypeEnum = {
  1: '后台手动解除',
  2: '自动过期',
  3: '矩阵号接入余额不足',
  4: 'APP主动解除',
  5: '用户禁用自动解除',
  6: '该用户授权矩阵号数量超出限制',
  7: '机构号授权失效',
  8: '抖音号与机构号合作到期',
  9: '星力值不足'
}

// 授权状态转换
const convertStatus = status => {
  if (status === 0 || status === null) {
    return '未授权'
  } else if (status === 1) {
    return '已授权'
  } else if (status === 2) {
    return '授权失效'
  } else {
    return ''
  }
}
// 授权状态转换
const convertStatus2 = status => {
  if (status === 1) {
    return '已开启'
  } else {
    return '未开启'
  }
}
const downloadImg = () => {
  const canvas = document.getElementById('app').getElementsByTagName('canvas')
  const a = document.createElement('a')
  a.href = canvas[0].toDataURL('img/png')
  a.download = '邀请码'
  a.click()
  a.remove()
}
const message = inject('$message')
const setTimer = token => {
  timer.value = setInterval(() => {
    if (count.value === 0) {
      scan.value = false
      clearTimer()
    } else {
      count.value--
      if (count.value % 3 === 0) {
        accountByAuthFresh({ token }).then(res => {
          // 0 初始化 1 扫码成功 2 授权成功 3授权错误
          if (res.data === '2') {
            message.success('授权成功')
            clearTimer()
            byCodeVisible.value = false
            getList()
          }
          if (res.data === '1') {
            scan.value = true
          }
          if (res.data === '3' || res.data === '4') {
            scan.value = false
            clearTimer()
            count.value = 180
            authErrReason.value = res.msg || ''
            authErr.value = true
          }
        })
      }
    }
  }, 1000)
}
const clearTimer = () => {
  clearInterval(timer.value)
  timer.value = null
}
// function showCode() {
//   accountAuthLink({}).then(({ data }) => {
//     link.value = data
//     codeVisible.value = true
//   })
// }

// 百应、获客互动能力请求接口的Loading
const showAuthReqLoading = ref(false)
// 显示授权弹窗 id origin：by 授权百应 dyWeb 授权获客互动能力
// const showAuthPoup = debounce((id, origin, e) => {
//   getAuthReq(id, origin)
// }, 700)

// function getAuthReq(id, origin) {
//   showAuthReqLoading.value = true
//   operationId.value = id
//   authErr.value = false
//   authErrReason.value = ''
//   clearTimer()
//   byCode.value = ''
//   scan.value = false
//   byCodeVisible.value = true
//   accountByAuthLink({
//     id: operationId.value
//   })
//     .then(res => {
//       if (res.code === 0) {
//         const data = res.data
//         byCode.value = 'data:image/jpeg;base64,' + data.qrCode
//         count.value = 180
//         setTimer(data.token)
//         codeOrigin.value = origin
//       } else {
//         byCodeVisible.value = false
//       }
//       showAuthReqLoading.value = false
//     })
//     .catch(err => {
//       if (origin !== 'by') {
//         message.error(err.msg)
//       }
//       byCodeVisible.value = false
//       showAuthReqLoading.value = false
//     })
// }
const refreshCode = debounce(() => {
  byCode.value = ''
  scan.value = false
  showAuthReqLoading.value = true
  clearTimer()
  accountByAuthLink({
    id: operationId.value
  })
    .then(res => {
      if (res.code === 0) {
        const data = res.data
        byCode.value = 'data:image/jpeg;base64,' + data.qrCode
        count.value = 180
        setTimer(data.token)
        authErrReason.value = ''
        authErr.value = false
      } else {
        byCodeVisible.value = false
      }
      showAuthReqLoading.value = false
    })
    .catch(err => {
      if (origin !== 'by') {
        message.error(err.msg)
      }
      byCodeVisible.value = false
      showAuthReqLoading.value = false
      authErrReason.value = ''
      authErr.value = false
    })
}, 700)
onMounted(() => {
  if (route.query.id) {
    searchComponents.value.forEach(item => {
      if (item.filed === 'authName') {
        item.val = route.query.id
      }
    })
  }
  state.platform = 1
  getList()
  getWxMcnNum()
})
onBeforeUnmount(clearTimer)
// 百应授权弹窗关闭时，清空定时器
function handleClose(done) {
  clearTimer()
  count.value = codeOrigin.value === 'by' ? 180 : 60
  done()
}
// 没有UID提示
const remindDialog = reactive({
  show: false,
  info: {}
})
// 抖音web--抖音获客互动能力授权
const authDyWebDialog = reactive({
  show: false,
  info: {}
})
// const openAuthDyWebDialog = debounce(item => {
//   authDyWebDialog.info = item
//   remindDialog.info = item
//   dyWebAuthAllow({ id: item.operationId })
//     .then(res => {
//       if (res.code === 0) {
//         if (res.data) {
//           authDyWebDialog.show = true
//         } else {
//           remindDialog.show = true
//         }
//       }
//     })
//     .catch(err => {
//       ElMessage.error(err.msg)
//     })
// }, 500)

// 线索授权
const authClueDialog = reactive({
  show: false,
  info: {}
})
const openAuthClueDialog = debounce(item => {
  authClueDialog.info = item
  authClueDialog.show = true
}, 500)

// 编辑矩阵号信息
const accountAuthInfo = reactive({
  show: false,
  info: {}
})
const setAccount = row => {
  accountAuthInfo.show = true
  accountAuthInfo.info = row
}
// 授权员工号
const authDialog = reactive({
  show: false
})
const addAuthEmployee = debounce(() => {
  authDialog.show = true
}, 700)
function updateFun(isRefresh) {
  if (isRefresh) {
    operationSuccessFun(true)
  }
  authDialog.show = false
}

function auth() {
  // 如果是重新授权
  if (state.costDialog.refreshAuth) {
    // 如果是星力值不足导致的，直接调接口该状态，否则出二维码弹窗
    if (state.costDialog.refreshAccountInfo.dyAuthInvalidType === 9) {
      singleAccountOp(1, state.costDialog.refreshAccountInfo)
    } else {
      addAuthBefore(1, state.costDialog.refreshAccountInfo)
    }
    return
  }
  if (state.costDialog.isEmployeeAuth) {
    addAuthEmployee()
  } else {
    addAuth(state.costDialog.type, state.costDialog.target)
  }
}

// 解除线索授权弹窗
function removeAuthClueFun(row) {
  ElMessageBox.confirm(`确定关闭该线索权限?`, '系统提醒', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    removeAuth(row.openId, 5)
  })
}
// 解除发布能力授权弹窗
// function removeAuthPublishFun(row) {
//   ElMessageBox.confirm(`确定解除该发布授权吗?`, '系统提醒', {
//     confirmButtonText: '确认',
//     cancelButtonText: '取消',
//     type: 'warning'
//   }).then(() => {
//     removeAuth(row.openId, 7)
//   })
// }

// 机构号管理信息--
const mcnInfo = reactive({
  num: null, // 机构号数量
  show: false
})

const showMcnFun = throttle(() => {
  router.push('/system_manage/system_setting?type=mcn')
}, 500)

// 获取机构号数量
function getWxMcnNum() {
  listWxMcnAuths({
    authStatus: 0,
    pageNo: 1,
    pageSize: 10,
    platform: 1,
    showDefaultMcn: false
  })
    .then(res => {
      if (res.code === 0) {
        mcnInfo.num = res.data?.total
      } else {
        mcnInfo.num = 0
      }
    })
    .catch(() => {
      mcnInfo.num = 0
    })
}
</script>

<style lang="scss" scoped>
@import './scss/page.scss';
.tip {
  color: #909399;
  margin-left: 24px;
}
.invite_code {
  .code {
    text-align: center;
    .code_img {
      position: relative;
      margin: 0 auto;
      width: 140px;
      height: 140px;
      > img {
        width: 100%;
      }
      .mask {
        width: 100%;
        height: 100%;
        background-color: rgba($color: #fff, $alpha: 0.9);
        position: absolute;
        left: 0;
        top: 0;
        > img {
          width: 36px;
          height: 36px;
          cursor: pointer;
        }
        > .success {
          height: 100%;
          flex-direction: column;
          color: #7fe2a1;
          > .wc_icon {
            margin-bottom: 8px;
            font-size: 36px;
          }
        }
      }
    }
    .text {
      color: #909399;
      font-size: 14px;
      margin: 10px 0 22px 0;
    }
  }
}
.table_photo {
  .table_photo_right {
    width: calc(100% - 52px);
    .photo_right_top {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
    }
  }
}
:deep(.el-link.el-link--primary.is-disabled) {
  color: #bfc4cd;
}
.account_id {
  white-space: nowrap;
  overflow: hidden;
  height: 17px;
  font-size: 12px;
  font-weight: 400;
  color: #909399;
  line-height: 17px;
  margin-top: 4px;
}
:deep(.xm_promptAboveTheTable) {
  &::before {
    display: none;
  }
  span {
    color: #364fcd;
    cursor: pointer;
  }
}
.g_bw {
  display: flex;
  align-items: center;
  margin-bottom: 20px !important;
  .num_warp {
    flex: 1;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    color: #606266;
    .one_area {
      display: flex;
      align-items: center;
    }
  }
}
</style>
