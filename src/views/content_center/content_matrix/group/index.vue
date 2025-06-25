<template>
  <div class="matrix_wrap">
    <!-- 左侧 -->
    <!-- <div class="matrix_left" v-if="false"> -->
    <!-- 新建按钮 -->
    <!-- <el-button class="add_grouping" type="primary" @click="toAddGrouping">
        + 新建矩阵号分组
      </el-button> -->

    <!-- 搜索框 -->
    <!-- <div class="search_wrap">
        <el-input
          v-model.trim="searchValue"
          :prefix-icon="transElIconName('Search')"
          placeholder="请输入分组名/矩阵号昵称"
          clearable
          @input="getSearch"
        />
      </div> -->
    <!-- 矩阵号分类 -->
    <!-- <div class="matrixClass_wrap" v-if="searchValue">
        <div class="searchType_wrap">
          <div class="searchType_item">
            <span class="name">相关矩阵号</span>
            <span class="num">{{ tableState.page.total }}</span>
          </div>
          <span class="line_bot"></span>
        </div>
      </div> -->
    <!-- <div class="matrixClass_wrap" v-loading="groupLoading"> -->
    <!-- <div class="matrix_all_wrap">
          <div
            class="matrix_all"
            :class="groupId === matrixTypeData.allType.id ? 'matrix_selected' : ''"
            @click="selectedMatrix(matrixTypeData.allType)"
          >
            <span class="title">
              {{
                matrixTypeData.allType.groupName ? matrixTypeData.allType.groupName : '全部矩阵号'
              }}
            </span>
            <span class="num" v-if="false">
              {{
                matrixTypeData.allType.groupAccountCount
                  ? matrixTypeData.allType.groupAccountCount
                  : 0
              }}
            </span>
          </div>
          <span class="line_bot"></span>
        </div> -->
    <!-- 分组 -->
    <!-- <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick"> -->
    <!-- <el-tab-pane label="矩阵号" name="first"></el-tab-pane> -->
    <!-- <el-tab-pane label="运营者" name="second"></el-tab-pane> -->
    <!-- </el-tabs> -->
    <!-- 矩阵号 -->
    <!-- <div class="matrixType_wrap" v-if="activeName === 'first'">
          <div
            class="new_group_item"
            :class="groupId === item.id ? 'matrix_selected' : ''"
            v-for="item in newGroupList"
            :key="item"
          >
            <div class="name" @click="selectedMatrix(item, 2)">
              <el-tooltip
                v-if="item.groupName.length > 7"
                class="box-item"
                effect="dark"
                :content="item.groupName"
                placement="top"
              >
                <div class="line-hidden1" style="max-width: 100%; width: max-content">
                  {{ item.groupName }}
                </div>
              </el-tooltip>
              <div v-else class="line-hidden1">{{ item.groupName }}</div>
            </div>
            <div class="num" @click="selectedMatrix(item, 2)"> -->
    <!-- {{ item.groupAccountCount ? item.groupAccountCount : 0 }} -->
    <!-- </div>
            <el-dropdown class="ml_16">
              <img src="@/assets/images/content_center/operation.png" alt="" />
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="rename(item)">重命名</el-dropdown-item>
                  <el-dropdown-item @click="modification(item.id)">修改</el-dropdown-item>
                  <el-dropdown-item @click="delGroup(item.id)">删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div> 
          <div class="matrixType_item">-->
    <!-- <h4 class="title">品牌标记</h4> -->
    <!-- <div
              class="type_item"
              v-for="item in matrixTypeData.brandType"
              :key="item.id"
              :class="groupId === item.id ? 'matrix_selected' : ''"
              @click="selectedMatrix(item)"
            >
              <img
                v-if="item.groupValue === 'BRAND'"
                src="@/assets/images/content_center/matrix_typez1.png"
                alt=""
              />
              <img v-else src="@/assets/images/content_center/matrix_typea1.png" alt="" />
              <div>
                <div class="name">{{ item.groupName ? item.groupName : '' }}</div>
                <div class="type">品牌标记</div>
              </div> -->
    <!-- <span class="num">{{ item.groupAccountCount ? item.groupAccountCount : 0 }}</span> -->
    <!-- </div> -->
    <!-- <div class="type_item">
              <img src="@/assets/images/content_center/matrix_typea.png" alt="" />
              <span class="name">全员</span>
              <span class="num">14</span>
            </div> -->
    <!-- </div>
          <div class="matrixType_item"> -->
    <!-- <h4 class="title">内容类型</h4> -->
    <!-- <div
              class="type_item"
              v-for="item in matrixTypeData.contentType"
              :key="item.id"
              :class="groupId === item.id ? 'matrix_selected' : ''"
              @click="selectedMatrix(item)"
            >
              <img
                v-if="item.groupValue === 'VIDEO'"
                src="@/assets/images/content_center/matrix_typev1.png"
                alt=""
              />
              <img v-else src="@/assets/images/content_center/matrix_typel1.png" alt="" />
              <div>
                <div class="name">{{ item.groupName ? item.groupName : '' }}</div>
                <div class="type">内容类型</div>
              </div> -->
    <!-- <span class="num">{{ item.groupAccountCount ? item.groupAccountCount : 0 }}</span> -->
    <!-- </div> -->
    <!-- <div class="type_item">
              <img src="@/assets/images/content_center/matrix_typel.png" alt="" />
              <span class="name">直播</span>
              <span class="num">14</span>
            </div> -->
    <!-- </div> -->
    <!-- <div class="matrixType_item"> -->
    <!-- <h4 class="title">矩阵号类型</h4> -->
    <!-- <div
              class="type_item"
              v-for="item in matrixTypeData.xuserType"
              :key="item.id"
              :class="groupId === item.id ? 'matrix_selected' : ''"
              @click="selectedMatrix(item)"
            >
              <img :src="getTypeImg(item.groupValue)" alt="" />
              <div>
                <div class="name">{{ item.groupName ? item.groupName : '' }}</div>
                <span class="type">矩阵号类型</span>
              </div> -->
    <!-- <span class="num">{{ item.groupAccountCount ? item.groupAccountCount : 0 }}</span> -->
    <!-- </div> -->
    <!-- <div class="type_item">
              <img src="@/assets/images/content_center/matrix_typep.png" alt="" />
              <span class="name">普通企业号</span>
              <span class="num">14</span>
            </div>
            <div class="type_item">
              <img src="@/assets/images/content_center/matrix_typer.png" alt="" />
              <span class="name">认证企业号</span>
              <span class="num">14</span>
            </div>
            <div class="type_item">
              <img src="@/assets/images/content_center/matrix_typer.png" alt="" />
              <span class="name">品牌企业号</span>
              <span class="num">14</span>
            </div>
            <div class="type_item">
              <img src="@/assets/images/content_center/matrix_typef.png" alt="" />
              <span class="name">员工号</span>
              <span class="num">14</span>
            </div> -->
    <!-- </div>
          <div
            class="none_data"
            v-if="
              !(
                (newGroupList && newGroupList.length > 0) ||
                (matrixTypeData.xuserType && matrixTypeData.xuserType.length > 0) ||
                (matrixTypeData.brandType && matrixTypeData.brandType.length > 0) ||
                (matrixTypeData.contentType && matrixTypeData.contentType.length > 0)
              )
            "
          >
            <img src="@/assets/images/content_center/no_data.png" />
            暂无分组
          </div> -->
    <!-- <span class="line_bot"></span> -->
    <!-- </div> -->
    <!-- 运营者 -->
    <!-- <div class="matrixOperator_wrap" v-if="activeName === 'second'">
          <h4 class="title">运营者</h4>
          <el-tree
            :data="treeData.value"
            :props="defaultProps"
            @node-click="handleNodeClick"
            :icon="transElIconName('CaretRight')"
          >
            <template #default="{ node }">
              <div class="custom-tree-node">
                <span class="name">{{ node.label }}</span>
                <span class="num"> -->
    <!-- {{ data.staffCount }} -->
    <!-- </span>
              </div>
            </template>
          </el-tree>
          <div
            class="type_item"
            :class="groupId === matrixTypeData.notBind.id ? 'matrix_selected' : ''"
            @click="selectedMatrix(matrixTypeData.notBind)"
          >
            <img src="@/assets/images/content_center/matrix_typeu.png" alt="" />
            <span class="name">
              {{ matrixTypeData.notBind.groupName ? matrixTypeData.notBind.groupName : '未绑定' }}
            </span>
            <span class="num">
              {{ matrixTypeData.notBind.groupAccountCount || '' }}
            </span>
          </div>
        </div>
      </div>
    </div> -->
    <div class="matrix_left_2">
      <selectMatrix origin="content_center" @updateTableInfo="updateTableInfo" />
    </div>

    <!-- 右侧 -->
    <div class="matrix_right">
      <div class="table_title">
        <template v-if="titleName">
          <span>{{ titleName || ' ' }}</span>
          <div class="count" v-if="titleName">
            约
            <span>{{ tableState.page.total || 0 }}</span>
            个
            <span v-if="createUserName" style="color: #303133; font-size: 12px; margin-left: 5px">
              创建人：{{ createUserName }}
            </span>
          </div>
        </template>
        <div class="count" v-else></div>
        <el-link
          class="xm_linkHasIcon"
          style="line-height: 32px"
          type="primary"
          @click="toAuthorize"
        >
          授权管理
          <img src="@/assets/images/content_center/right_blue.png" alt />
        </el-link>
      </div>
      <xm_table
        :maxTableHeight="tableHeight"
        class="matrix_table"
        tableType="avatar"
        v-loading="tableState.loading"
        :data="tableState.listData"
        v-model:page="tableState.page"
        @getTableData="getTableList"
        ref="matrixTable"
      >
        <el-table-column label="矩阵号" prop="name" min-width="40%">
          <!-- <template #default="scope"> -->
          <!-- <router-link :to="toDetails(scope.row.openId)"> -->
          <!-- <div class="account_wrap">
              <div class="avatar_wrap">
                <liveAnimation v-if="scope.row.roomStatus === 1"></liveAnimation>
                <img
                  class="avatar_icon"
                  :src="scope.row.dyHeadUrl ? scope.row.dyHeadUrl : avatarImg"
                  alt=""
                />
                <el-tooltip
                  effect="dark"
                  v-if="scope.row.dyAuth == 2 || scope.row.byAuth == 2"
                  placement="top-start"
                >
                  <template #content>
                    <div style="max-width: 300px">
                      {{ scope.row.byAuth == 2 ? '百应授权失效' : '' }}
                      {{ scope.row.byAuth == 2 && scope.row.dyAuth == 2 ? ',' : '' }}
                      {{ scope.row.dyAuth == 2 ? '抖音授权失效' : '' }}
                    </div>
                  </template>
                  <img
                    class="expired_img"
                    src="@/assets/images/content_center/warning_icon.png"
                    alt=""
                  />
                </el-tooltip>
              </div>
              <div class="account_info">
                <div>
                  <span>{{ scope.row.dyNickname ? scope.row.dyNickname : '--' }}</span> -->
          <!--                  <img-->
          <!--                    class="brand_img"-->
          <!--                    v-if="scope.row.accountType != 1"-->
          <!--                    :src="brandIcon"-->
          <!--                    alt=""-->
          <!--                  />-->
          <!-- <template v-if="scope.row.eaccountRole">
                    <img
                      v-if="scope.row.eaccountRole === 'LarkStaff'"
                      src="../../../../assets/images/content_center/fs.png"
                      alt=""
                    />
                    <template v-else>
                      <el-tooltip effect="dark" placement="top">
                        <template #content>
                          <div style="max-width: 300px">
                            {{
                              scope.row.eaccountRole === 'EAccountM'
                                ? '普通企业号'
                                : scope.row.eaccountRole === 'EAccountS'
                                ? '认证企业号'
                                : '认证企业号'
                            }}
                          </div>
                        </template>
                        <img :src="getTypeImg(scope.row.eaccountRole)" alt="" />
                      </el-tooltip>
                    </template>
                  </template>
                  <template v-else>
                    <el-tooltip v-if="scope.row.enterpriseType" effect="dark" placement="top">
                      <template #content>
                        <div style="max-width: 300px">
                          {{
                            scope.row.enterpriseType === 'EAccountS'
                              ? '员工号-认证企业号'
                              : '员工号-认证企业号'
                          }}
                        </div>
                      </template>
                      <img
                        :src="
                          getTypeImg(
                            scope.row.enterpriseType === 'EAccountS'
                              ? 'EAccountEmployeeS'
                              : 'EAccountEmployeeK'
                          )
                        "
                        alt=""
                      />
                    </el-tooltip>
                  </template>
                </div>
              </div>
            </div> -->
          <!-- </router-link> -->
          <!-- </template> -->
          <template #default="scope">
            <div class="account_wrap" style="padding: 10px 0">
              <div class="avatar_wrap">
                <img
                  class="avatar_icon"
                  :src="scope.row.dyHeadUrl ? scope.row.dyHeadUrl : avatarImg"
                  alt=""
                />
                <table_column_private_account
                  style="z-index: 10"
                  v-if="scope.row.privacyAccountStatus === 1"
                ></table_column_private_account>
                <el-tooltip
                  effect="dark"
                  v-if="scope.row.dyAuth == 2 || scope.row.wxAuth == 2 || scope.row.xhsAuth == 2"
                  placement="top-start"
                >
                  <template #content>
                    <div style="max-width: 300px">
                      <span v-if="scope.row.dyAuth == 2 && scope.row.platform == 1">
                        {{ scope.row.dyAuth == 2 ? '抖音授权失效' : '' }}
                      </span>
                      <span v-if="scope.row.wxAuth == 2 && scope.row.platform == 2">
                        {{ scope.row.wxAuth == 2 ? '视频号授权失效' : '' }}
                      </span>
                      <span v-if="scope.row.xhsAuth == 2 && scope.row.platform == 3">
                        {{ scope.row.xhsAuth == 2 ? '小红书授权失效' : '' }}
                      </span>
                      <span v-if="scope.row.dyAuth == 2 && scope.row.platform == 4">
                        {{ scope.row.dyAuth == 2 ? '快手授权失效' : '' }}
                      </span>
                    </div>
                  </template>
                  <img
                    class="expired_img"
                    src="@/assets/images/content_center/warning_icon.png"
                    alt=""
                  />
                </el-tooltip>
                <!-- 平台icon -->
                <div :class="`xm_platformIcon_${scope.row.platform}`"></div>
              </div>
              <div class="account_info">
                <div>
                  <span>{{ scope.row.dyNickname ? scope.row.dyNickname : '--' }}</span>

                  <template v-if="scope.row.eaccountRole">
                    <el-tooltip effect="dark" placement="top">
                      <template #content>
                        <div style="max-width: 300px">
                          {{
                            scope.row.eaccountRole === 'EAccountM'
                              ? '普通企业号'
                              : scope.row.eaccountRole === 'EAccountS'
                              ? '认证企业号'
                              : '认证企业号'
                          }}
                        </div>
                      </template>
                      <img :src="getTypeImg(scope.row.eaccountRole)" alt="" />
                    </el-tooltip>
                  </template>
                  <template v-else>
                    <el-tooltip v-if="scope.row.enterpriseType" effect="dark" placement="top">
                      <template #content>
                        <div style="max-width: 300px">
                          {{
                            scope.row.enterpriseType === 'EAccountS'
                              ? '员工号-认证企业号'
                              : '员工号-认证企业号'
                          }}
                        </div>
                      </template>
                      <img
                        :src="
                          getTypeImg(
                            scope.row.enterpriseType === 'EAccountS'
                              ? 'EAccountEmployeeS'
                              : 'EAccountEmployeeK'
                          )
                        "
                        alt=""
                      />
                    </el-tooltip>
                  </template>

                  <!-- 分组名 -->
                  <div class="group_list">
                    <template v-for="(item, index) in scope.row.accountGroupList">
                      <template v-if="index < 3">
                        <!-- v-if="DYEmployeeType.indexOf(item.groupValue) == -1" -->
                        <div class="new_group_name line-hidden1" :key="index">
                          {{ item.groupName }}
                        </div>
                        <!-- <el-tooltip
                          v-else
                          class="box-item"
                          effect="dark"
                          placement="top"
                          :key="index + 'x'"
                        >
                          <template #content>
                            <div style="max-width: 300px">
                              所属企业号：{{ scope.row.enterpriseOpenNickname || '--' }}
                            </div>
                          </template>
                          <div class="new_group_name line-hidden1">
                            {{ item.groupName }}
                          </div>
                        </el-tooltip> -->
                      </template>
                    </template>
                  </div>
                  <el-tooltip
                    class="box-item"
                    effect="dark"
                    placement="top"
                    v-if="scope.row.accountGroupList && scope.row.accountGroupList.length > 3"
                  >
                    <!-- popper-class="tooltip-class" -->

                    <template #content>
                      <div class="group_box">
                        <span
                          v-for="(item, index) in scope.row.accountGroupList"
                          :key="index"
                          class="new_group_name"
                        >
                          {{ item.groupName }}
                        </span>
                      </div>
                    </template>
                    <div style="margin-left: 8px">...</div>
                  </el-tooltip>
                </div>
                <!-- 各个平台显示对应的账号 -->
                <p v-if="scope.row.platform != 1">
                  <span>
                    {{
                      `${PLATFORM.getCN(scope.row.platform)}${
                        scope.row.platform == 2 || scope.row.platform == 3 ? '' : '号'
                      }`
                    }}：{{ scope.row.dyDisplayId ? scope.row.dyDisplayId : '--' }}
                  </span>
                  <!-- 小红书增加专业号标识 -->
                  <span
                    class="xm_xhsZYH"
                    v-if="
                      scope.row.platform == 3 &&
                      scope.row.customerUserType &&
                      scope.row.customerUserType == 'BUSINESS'
                    "
                  ></span>
                </p>
                <p v-else>
                  <span>抖音号：{{ scope.row.dyDisplayId ? scope.row.dyDisplayId : '--' }}</span>
                </p>
                <!-- 绑定poi -->
                <p class="poi_warp">
                  <el-tooltip
                    effect="dark"
                    placement="right-start"
                    :content="scope.row.poiName"
                    :disabled="!scope.row.poiName"
                  >
                    <span class="poi_name">绑定POI：{{ scope.row.poiName || '-' }}</span>
                  </el-tooltip>
                </p>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="运营者" prop="phone" min-width="60%">
          <template #default="scope">
            <div v-if="scope.row.operatorId" class="user_wrap">
              <img v-if="scope.row.operatorHead" :src="scope.row.operatorHead" alt="" />
              <default-photo v-else :name="scope.row.operatorName || '--'" />
              <span>{{ scope.row.operatorName || '--' }}</span>
              <img
                v-if="scope.row.iconType === 2"
                class="fs_icon"
                src="@/assets/images/user/weChat.png"
                alt=""
              />
              <img
                v-if="scope.row.iconType === 1"
                class="fs_icon"
                src="@/assets/images/content_center/fs.png"
                alt=""
              />
              <div
                class="xm_depart"
                v-if="scope.row.staffStatus && scope.row.staffStatus == 2"
              ></div>
            </div>
            <div v-else>--</div>
          </template>
        </el-table-column>
      </xm_table>
    </div>
    <!-- 重命名分组弹窗 -->
    <!-- <el-dialog v-model="dialogFormVisible" destroy-on-close title="重新命名分组" width="580px">
      <el-form
        :model="groupForm"
        ref="groupFormRef"
        :rules="groupFormRules"
        style="padding: 15px 0"
      >
        <el-form-item label="分组名" label-width="80px" prop="name">
          <el-input v-model="groupForm.name" @blur="retEmit($event)" style="width: 300px" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmAmendName">确定</el-button>
        </span>
      </template>
    </el-dialog> -->
  </div>
</template>
<script setup>
import DefaultPhoto from '../../../system/components/default_photo/index.vue'
// import liveAnimation from '../../components/live_animation.vue'
import api from '@/api/content_center/content_matrix.js'
import avatarImg from '@/assets/images/content_center/default_user.png'
// import brandIcon from '@/assets/images/content_center/brand_icon.png'
// 图片
import matrixTyped from '@/assets/images/content_center/matrix_typed1.png'
import matrixTypep from '@/assets/images/content_center/matrix_typep1.png'
import matrixTyper from '@/assets/images/content_center/matrix_typer1.png'
import matrixEmployee from '@/assets/images/content_center/matrix_employee.png'
// 图片end
// import { transElIconName, throttle, debounce } from '@/utils/tools.js'
// import { ElMessageBox, ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

import selectMatrix from '@/views/sumvideo/components/matrix/select_matrix.vue'
import { PLATFORM } from '@/utils/dictionary/company.js'

const router = useRouter()
// 标题
const titleName = ref('')
// 创建人
const createUserName = ref('')
const platform = ref(null) // 平台筛选项
// 搜索
// const searchValue = ref('')
// const searchList = reactive([])
// const getSearch = debounce(() => {
//   tableState.loading = true
//   getNewGroupList(true)
//   // tableState.page.index = 1
//   // if (!searchValue.value) {
//   //   groupId.value = matrixTypeData.allType.id
//   //   areaId.value = null
//   //   titleName.value = matrixTypeData.allType.groupName
//   // } else {
//   //   groupId.value = null
//   //   areaId.value = null
//   //   titleName.value = '相关矩阵号'
//   // }
//   // createUserName.value = ''
//   // getTableList()
// }, 500)
// 员工号的类型数组
// const DYEmployeeType = ['EAccountEmployeeS', 'EAccountEmployeeK']
// 选中id
const groupId = ref(null)
const areaId = ref(null)
// 更新信息
function updateTableInfo(info) {
  console.log('更新信息', info)
  createUserName.value = info.createUserName || ''
  areaId.value = info.areaId || null
  groupId.value = info.groupId || null
  tableState.page.index = info.tableState?.page?.index || 1
  tableState.page.total = info.tableState?.page?.total || 0
  tableState.loading = info.tableState?.loading || false
  platform.value = info.platform || null

  if (info.tableState.listData) {
    tableState.listData = info.tableState.listData
  }
  titleName.value = info.titleName || ''
  if (info.getTableList) {
    getTableList(info.getTableType)
  }
}

// function selectedMatrix(item, type) {
//   tableState.loading = true
//   console.log('触发选择', item)
//   tableState.page.index = 1
//   groupId.value = item.id
//   areaId.value = null
//   titleName.value = item.groupName
//   tableState.page.total = 0
//   if (type === 2) {
//     createUserName.value = item.createUserName
//   } else {
//     createUserName.value = ''
//   }
//   getTableList(type)
// }
// 根据分组名/矩阵号昵称搜索不到分组时，直接就显示用户类型的第一个
// function selectedMatrix2(type) {
//   if (matrixTypeData.xuserType && matrixTypeData.xuserType.length > 0) {
//     tableState.loading = true
//     tableState.page.index = 1
//     tableState.page.total = 0
//     areaId.value = null
//     createUserName.value = ''
//     groupId.value = matrixTypeData.xuserType[0].id
//     titleName.value = matrixTypeData.xuserType[0].groupName

//     getTableList(type)
//   } else {
//     tableState.loading = false
//     createUserName.value = ''
//     groupId.value = null
//     titleName.value = ''
//     tableState.listData = []
//     tableState.page.total = 0
//   }
// }
// 运营者
// const treeData = reactive([])
// const defaultProps = {
//   children: 'children',
//   label: 'name',
//   class: customNodeClass
// }
// function customNodeClass(data, node) {
//   if (data.id === areaId.value) {
//     return 'is-selected'
//   }
//   return null
// }
// const handleNodeClick = data => {
//   // console.log(data.id)
//   if (areaId.value !== data.id) {
//     tableState.page.index = 1
//     areaId.value = data.id
//     groupId.value = null
//     titleName.value = data.name
//     createUserName.value = ''
//     getTableList()
//   }
// }
// 授权管理
// 是否在飞书客户端
const isFlyBook = ref(true)
const isWeChat = ref(true)
isFlyBook.value = localStorage.getItem('isFlyBook') === '1'
isWeChat.value = localStorage.getItem('isWeChat') === '1'
const isBrowser = localStorage.getItem('is_browser') === '1'
function toAuthorize() {
  if (isBrowser) {
    router.push({ path: '/system_manage/matrixNumber_auth', query: { type: 'account' } })
  } else {
    window.open(`${location.origin}/system_manage/matrixNumber_auth?type=account`)
  }
}
// table列表
const tableState = reactive({
  loading: true,
  listData: [],
  page: {
    index: 1,
    size: 10,
    total: 0
  }
})
// 获取列表
function getTableList(type) {
  tableState.loading = true
  const data = {
    pageSize: tableState.page.size,
    pageNo: tableState.page.index,
    name: '',
    areaId: areaId.value,
    groupId: groupId.value
  }
  // if (type) {
  //   data.groupType = 2
  // }
  if (platform.value) {
    data.platform = platform.value
  }
  api
    .getGroupTable(data)
    .then(res => {
      tableState.listData = res.data.records
      tableState.page.total = res.data.total
      tableState.loading = false
    })
    .catch(() => {
      tableState.listData = []
      tableState.page.total = 0
      tableState.loading = false
    })
}
// 跳转详情
// function toDetails(item) {
//   return `/content_center/content_matrix/details?openId=${item}`
// }
// 获取对应类型的图片
function getTypeImg(type) {
  let img = ''
  switch (type) {
    case 'PERSONAL':
      img = matrixTyped
      break
    case 'EAccountM':
      img = matrixTypep
      break
    case 'EAccountS':
      img = matrixTyper
      break
    case 'EAccountK':
      img = matrixTyper
      break
    case 'EAccountEmployeeS':
    case 'EAccountEmployeeK':
      img = matrixEmployee
      break
  }
  return img
}
// 获取矩阵号分组
// const matrixTypeData = reactive({
//   allType: {}, // 全部矩阵号
//   brandType: [], // 品牌矩阵号
//   contentType: [], // 内容矩阵号
//   notBind: {}, // 未绑定矩阵号
//   xuserType: [], // 矩阵号类型
//   oldXuseType: []
// })
// const getGroupList = () => {
//   api.getGroupList({}).then(res => {
//     console.log('getGroupList res', res)
//     matrixTypeData.allType = res.data.all
//     matrixTypeData.brandType = res.data.brandType
//     console.warn('getGroupList res', matrixTypeData.brandType)

//     matrixTypeData.contentType = res.data.contentType
//     matrixTypeData.notBind = res.data.notBind
//     matrixTypeData.oldXuseType = JSON.parse(JSON.stringify(res.data.xuserType))
//     const xuserType = res.data.xuserType
//     xuserType.forEach(x => (x.show = true))
//     matrixTypeData.xuserType = xuserType
//     if (res.data.all.id) {
//       groupId.value = res.data.all.id
//       titleName.value = res.data.all.groupName
//     }
//     createUserName.value = ''
//     // getTableList()
//     // selectedMatrix(matrixTypeData.allType)
//   })
// }
// 获取组织架构树形结构
// function getTreeData() {
//   api.getGroupTree().then(res => {
//     console.log('getTreeData res', res)
//     treeData.value = res.data
//   })
// }
// tab切换（矩阵号、运营者）
// const activeName = ref('first')
// function handleClick(tab, event) {
//   console.log(tab, event)
// }
// 获取所有新增的矩阵号分组
// const newGroupList = ref([])
// const groupLoading = ref(false)
// const getNewGroupList = useSearch => {
//   groupLoading.value = true
//   api
//     .getNewGroupList({ groupType: searchValue.value ? null : 2, name: searchValue.value || '' })
//     .then(res => {
//       // api.getNewGroupList().then(res => {
//       console.log('getNewGroupList res', res)
//       if (res.success) {
//         // 有筛选条件--返回值里带了固定分组，所以要区分开
//         if (searchValue.value) {
//           const list = res.data.filter(x => x.groupType === 2)
//           newGroupList.value = list
//           const list2 = res.data.filter(x => x.groupType === 1)
//           const newList = []
//           matrixTypeData.oldXuseType.forEach(x => {
//             list2.forEach(y => {
//               if (x.groupValue === y.groupValue) {
//                 newList.push(x)
//               }
//             })
//           })
//           matrixTypeData.xuserType = JSON.parse(JSON.stringify(newList))
//           // 右边默认显示第一个对应的列表
//           if (list && list.length > 0) {
//             const item = list[0]
//             selectedMatrix(item, 2)
//           } else {
//             selectedMatrix2()
//           }
//         } else {
//           matrixTypeData.xuserType = JSON.parse(JSON.stringify(matrixTypeData.oldXuseType))
//           newGroupList.value = res.data
//           // 右边默认显示第一个对应的列表
//           if (res.data && res.data.length > 0) {
//             const item = res.data[0]
//             selectedMatrix(item, 2)
//           } else {
//             selectedMatrix2()
//           }
//         }
//       }
//     })
//     .finally(() => {
//       groupLoading.value = false
//     })
// }
// 跳转到新建分组页面
// const toAddGrouping = throttle(function () {
//   router.push({
//     path: `/content_center/content_matrix_group/add_grouping`
//   })
// }, 500)
// 分组的相关操作
// 重命名
// const dialogFormVisible = ref(false)
// const groupForm = reactive({
//   name: '', // 分组名
//   id: '' // 分组id
// })
// 表单校验规则
// const groupFormRules = reactive({
//   name: [{ required: true, message: '请输入分组名', trigger: 'blur' }]
// })
// const rename = throttle(function (item) {
//   console.log('重命名', item)
//   groupForm.name = item.groupName
//   groupForm.id = item.id
//   dialogFormVisible.value = true
// }, 500)
// function retEmit(e, index) {
//   const reg =
//     /[^a-zA-Z0-9_\u4e00-\u9fa5\u3002\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\u3001\uff1f\u300a\u300b/\s,.!！:()?/_""-——]/g
//   groupForm.name = e.target.value.replace(reg, '')
// }
// 确定重命名分组
// const confirmAmendName = throttle(async function () {
//   const res = await api.saveNewGroup({
//     id: groupForm.id ? groupForm.id : null,
//     groupName: groupForm.name,
//     groupType: 2
//   })
//   if (res.success) {
//     ElMessage({ type: 'success', message: '修改成功' })
//     dialogFormVisible.value = false
//     getNewGroupList()
//   }
//   console.log(res)
// }, 300)
// 修改
// const modification = throttle(function (id) {
//   console.log('修改')
//   router.push({
//     path: `/content_center/content_matrix_group/add_grouping`,
//     query: { id }
//   })
// }, 500)
// 删除
// const delGroup = throttle(function (id) {
//   console.log('删除')
//   ElMessageBox.confirm('删除后不可恢复，是否确认?', '删除分组', {
//     confirmButtonText: '确定',
//     cancelButtonText: '取消',
//     type: '',
//     customClass: 'drawer_systemBox'
//   }).then(async () => {
//     const res = await api.delNewGroupList({ groupIds: [id] })
//     if (res.success) {
//       ElMessage({ type: 'success', message: '删除成功' })
//       getNewGroupList()
//       selectedMatrix(matrixTypeData.allType)
//     }
//   })
// }, 500)
const tableHeight = ref(null)
function onResize() {
  tableHeight.value = parseInt(document.body.clientHeight) - 278
}
// onMounted
onMounted(() => {
  // console.log('getGroupList', getGroupList)
  // getGroupList()
  // getTreeData()
  // getNewGroupList()
  onResize()
  window.addEventListener('resize', onResize)
})
onUnmounted(() => {
  window.removeEventListener('resize', onResize)
})
</script>

<style lang="scss" scoped>
@import './index.scss';
.search_wrap {
  margin-top: 12px;
}
.add_grouping {
  width: 216px;
  height: 32px;
  margin: 0px 0 0 7px;
}
:deep(.el-tabs__nav-scroll) {
  padding: 0 36px;
  margin-top: 12px;
}
// :deep(.el-tabs--top .el-tabs__item.is-top:last-child) {
//   padding: 0 0 14px 40px;
// }
:deep(.el-tabs__header) {
  margin: 0;
}
:deep(.el-dropdown-menu.el-dropdown-menu--default) {
  border: none;
  box-shadow: 0px 2px 6px 0px rgb(35 41 68 / 15%) !important;
  background: rgba(66, 76, 127, 0.76) !important;
}
:deep(.el-dropdown-menu__item) {
  color: #303133;
  justify-content: center;
}
:deep(el-popper is-pure is-light el-dropdown__popper) {
  left: 411px;
  top: 319px;
}

.none_data {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  font-weight: 400;
  color: #8f939a;
  line-height: 20px;
  text-align: center;
  img {
    width: 72px;
    height: 52px;
    margin-bottom: 8px;
  }
}
</style>
