<template>
  <div>
    <el-dialog
      ref="dialog"
      :close-on-click-modal="false"
      destroy-on-close
      v-model="show"
      title="分类管理"
      width="820px"
      custom-class="info_dialog"
      @close="handleClose"
    >
      <div class="dialog_content" v-loading="$data.loading">
        <div class="content_left" v-loading="$data.leftLoading">
          <div class="list_box">
            <!-- 全部分类的数量 -->
            <div
              @click="openCategoryGroupFun(null, null, true)"
              :class="[
                'one_list',
                $data.chooseCategoryGroupInfo.id === null ? 'one_list_choose' : ''
              ]"
            >
              <div class="one_list_left">
                <div class="one_list_name">全部分类</div>
                <div class="one_list_num">（{{ $data.allCategory.length }}）</div>
              </div>
            </div>
            <!-- 全部分类组的数量 -->
            <div class="one_list2">
              <div class="one_list_left">
                <div class="one_list_name">分类组</div>
                <div class="one_list_num">
                  （{{
                    $data.categoryGroupList && $data.categoryGroupList.length > 0
                      ? $data.categoryGroupList.length
                      : 0
                  }}）
                </div>
              </div>
              <img
                @click="addCategoryGroupFun"
                class="one_list_right_icon"
                src="https://tagvv-1256030678.file.myqcloud.com/20230306lfzug.png"
                alt=""
              />
            </div>
            <div class="one_list_group">
              <!-- 已经有的分类组列表 -->

              <div v-for="(item, index) in $data.categoryGroupList" :key="index">
                <div
                  :class="[
                    'one_list',
                    $data.chooseCategoryGroupInfo.id === item.id ? 'one_list_choose' : ''
                  ]"
                  @click="openCategoryGroupFun(item, index)"
                  v-if="!item.isEdit"
                  :key="'a' + index"
                >
                  <div class="one_list_left">
                    <div class="one_list_name line-hidden1">
                      {{ item.categoryName || '' }}
                    </div>
                    <div class="one_list_num">（{{ item.childCategoryList.length }}）</div>
                  </div>
                  <div class="one_list_right">
                    <el-dropdown trigger="click">
                      <span>
                        <img
                          class="one_list_right_icon"
                          src="https://tagvv-1256030678.file.myqcloud.com/20230306kjpod.png"
                          alt=""
                        />
                      </span>
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item @click="editCategoryGroupFun(item, index)">
                            重命名
                          </el-dropdown-item>
                          <el-dropdown-item @click="delCategoryGroupFun(item, 1)">
                            删除分类组
                          </el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                  </div>
                </div>
                <div class="one_list_input" v-if="item.isEdit" :key="'c' + index">
                  <el-input
                    :ref="editCategoryGroupRef"
                    v-model.trim="$data.editCategoryGroupInfo.name"
                    maxlength="15"
                    placeholder="请输入分类组名称"
                    @blur="saveEditCategoryGroupFun($event)"
                  ></el-input>
                </div>
              </div>

              <!-- 新建分类组 -->
              <div class="one_list_input" v-if="$data.addCategoryGroupInfo.show">
                <el-input
                  ref="addCategoryGroupRef"
                  v-model.trim="$data.addCategoryGroupInfo.name"
                  maxlength="15"
                  placeholder="请输入分类组名称"
                  @blur="saveAddCategoryGroupFun($event)"
                ></el-input>
              </div>
            </div>
          </div>
        </div>
        <div class="content_right" v-loading="$data.rightLoading">
          <div class="right_title">
            <div class="right_title_title">{{ $data.chooseCategoryGroupInfo.name || '' }}</div>
            <img
              @click="addCategoryFun"
              class="right_title_add"
              src="https://tagvv-1256030678.file.myqcloud.com/20230306lfzug.png"
              alt=""
            />
          </div>
          <div class="right_content">
            <div class="one_right_box" v-if="$data.categoryList && $data.categoryList.length > 0">
              <!-- <div class="one_right_mark">#</div> -->
              <!--有数据 -->
              <div
                class="has_right_content"
                v-if="$data.categoryList && $data.categoryList.length > 0"
              >
                <div
                  class="one_right_content"
                  v-for="(item, index) in $data.categoryList"
                  :key="item.id"
                >
                  <div class="one_right_title">{{ item.categoryName || '' }}</div>

                  <div class="one_right_right">
                    <div class="one_right_num">{{ item.markNum || 0 }}</div>
                    <!-- 编辑入口 -->
                    <div class="one_right_action">
                      <el-dropdown trigger="click">
                        <span>
                          <img
                            class="one_right_right_icon"
                            src="https://tagvv-1256030678.file.myqcloud.com/20230306kjpod.png"
                            alt=""
                          />
                        </span>
                        <template #dropdown>
                          <el-dropdown-menu>
                            <el-dropdown-item @click="editCategoryFun(item, index)">
                              重命名
                            </el-dropdown-item>
                            <el-dropdown-item @click="delCategoryGroupFun(item, 2)">
                              删除分类
                            </el-dropdown-item>
                          </el-dropdown-menu>
                        </template>
                      </el-dropdown>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- 无数据 -->
            <div class="none_right_content" v-else>
              <img
                class="none_icon"
                src="https://tagvv-1256030678.file.myqcloud.com/20230306ha99g.png"
                alt=""
              />
              <div class="none_mark">
                <el-link @click="addCategoryFun" class="none_mark_link" type="primary">
                  添加模板分类
                </el-link>
                <div class="none_mark_mark">方便管理和查找</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
    <!-- 删除分类的弹窗 -->
    <infoDialog
      v-if="$data.delDialogInfo.show"
      :asyncFunc="delGroupFun"
      :infoDialog="$data.delDialogInfo"
    ></infoDialog>
    <!-- 新建分类的弹窗 -->
    <addCategoryDOM
      v-if="$data.addCategoryInfo.show"
      :addDialog="$data.addCategoryInfo"
      :categoryGroupList="$data.categoryGroupList"
      @getAllCategory="getAllCategory"
    ></addCategoryDOM>
  </div>
</template>
<script setup>
// 分类管理的弹窗
import addCategoryDOM from './addCategory_dialog.vue'
import infoDialog from '@/components/info_dialog/index.vue'
import { saveCategory, templateArray, deleteCategory } from '@/api/sumvideo/category.js'

import { throttle } from '@/utils/tools.js'
const message = inject('$message')
const props = defineProps({
  categoryDialog: {
    type: Object,
    default: () => {
      return {
        show: true // 是否显示弹窗
      }
    },
    required: true
  }
})
const dialog = ref()
const show = toRef(props.categoryDialog, 'show')
const $data = reactive({
  allNum: 0,
  allCategory: [], // 所有分类
  loading: false, // 整个动画
  leftLoading: false, // 左侧的动画
  rightLoading: false, // 右侧的动画
  searchInput: '', // 搜索的关键字
  categoryGroupList: [], // 分类组列表
  addCategoryGroupInfo: {
    name: '',
    show: false
  }, // 新建的一级分类名
  editCategoryGroupInfo: {
    name: '', // 名称
    id: null, // ID
    index: null // 下标
  }, // 编辑的一级分类信息
  delDialogInfo: {
    show: false
  }, // 删除分组的信息

  chooseCategoryGroupInfo: {
    id: null,
    name: '全部分类'
  }, // 选中展开的分类组信息
  categoryList: [], // 分类列表
  addCategoryInfo: {
    show: false // 新建分类的弹窗
  }
})
// 获取所有的分类组和分类信息 showLoading 显示全局的loading
function init(showLoading) {
  if (showLoading) {
    $data.loading = true
  }
  const data = {
    brandId: JSON.parse(localStorage.getItem('brandInfo')).brandId,
    categoryName: $data.searchInput || ''
  }
  templateArray(data)
    .then(res => {
      if (res.code === 0) {
        const list = res.data || []
        let allNum = 0
        const allCategory = []
        let chooseCategoryGroup = null
        let chooseCategoryGroupI = null
        list.forEach((x, i) => {
          allNum = allNum + parseInt(x.childrenCnt || 0)
          x.isEdit = false
          if (x.childCategoryList && x.childCategoryList.length > 0) {
            x.childCategoryList.forEach(y => {
              y.isEdit = false
              y.parentId = x.id
              allCategory.push(y)
            })
          }
          if (x.id === $data.chooseCategoryGroupInfo.id) {
            chooseCategoryGroup = x
            chooseCategoryGroupI = i
          }
        })
        $data.allCategory = allCategory
        $data.categoryGroupList = list
        if ($data.chooseCategoryGroupInfo.id) {
          openCategoryGroupFun(chooseCategoryGroup, chooseCategoryGroupI)
        } else {
          openCategoryGroupFun(null, null, true)
        }
        $data.allNum = allNum
      }

      $data.loading = false
      $data.leftLoading = false
      $data.rightLoading = false
    })
    .finally(() => {
      $data.loading = false
      $data.leftLoading = false
      $data.rightLoading = false
    })
}
init(true)
const editCateGroupRef = ref([])
const editCategoryGroupRef = el => {
  editCateGroupRef.value.push(el)
}
const addCategoryGroupRef = ref(null)
// 新建分类组
const addCategoryGroupFun = throttle(() => {
  $data.addCategoryGroupInfo = {
    name: '',
    show: true
  }
  nextTick(() => {
    addCategoryGroupRef.value.focus()
  })
}, 500)
// 保存新建的分类组
const saveAddCategoryGroupFun = e => {
  const reg =
    /[^a-zA-Z0-9_\u4e00-\u9fa5\u3002\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\u3001\uff1f\u300a\u300b/\s,.!！:()?/_""-——]/g
  $data.addCategoryGroupInfo.name = e.target.value.replace(reg, '')
  if (!$data.addCategoryGroupInfo.name) {
    $data.addCategoryGroupInfo.show = false
    return
  }
  saveCategory({
    categoryName: $data.addCategoryGroupInfo.name,
    level: 1,
    parentId: 0
  })
    .then(res => {
      if (res.code === 0) {
        message({
          type: 'success',
          message: '创建成功'
        })
      }
      $data.leftLoading = true
      init(false)
      $data.addCategoryGroupInfo.show = false
    })
    .catch(() => {
      $data.addCategoryGroupInfo.show = false
    })
}
// 编辑分类组
const editCategoryGroupFun = throttle((item, index) => {
  $data.editCategoryGroupInfo = {
    name: item.categoryName || '', // 名称
    id: item.id, // ID
    index: index // 下标
  }
  $data.categoryGroupList[index].isEdit = true
  nextTick(() => {
    console.log(editCateGroupRef)
    editCateGroupRef.value[editCateGroupRef.value.length - 1].focus()
  })
}, 500)
// 保存编辑的分类组
const saveEditCategoryGroupFun = e => {
  const reg =
    /[^a-zA-Z0-9_\u4e00-\u9fa5\u3002\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\u3001\uff1f\u300a\u300b/\s,.!！:()?/_""-——]/g
  $data.editCategoryGroupInfo.name = e.target.value.replace(reg, '')
  if (
    !$data.editCategoryGroupInfo.name ||
    $data.editCategoryGroupInfo.name ===
      $data.categoryGroupList[$data.editCategoryGroupInfo.index].categoryName
  ) {
    $data.categoryGroupList[$data.editCategoryGroupInfo.index].isEdit = false
    return
  }
  saveCategory({
    categoryName: $data.editCategoryGroupInfo.name,
    level: 1,
    id: $data.editCategoryGroupInfo.id,
    parentId: 0
  })
    .then(res => {
      if (res.code === 0) {
        message({
          type: 'success',
          message: '重命名成功'
        })
        init(false)
        $data.categoryGroupList[$data.editCategoryGroupInfo.index].isEdit = false
      } else {
        $data.categoryGroupList[$data.editCategoryGroupInfo.index].isEdit = false
      }
    })
    .catch(() => {
      $data.categoryGroupList[$data.editCategoryGroupInfo.index].isEdit = false
    })
}
// 删除分类组/分类
const delCategoryGroupFun = throttle((item, level) => {
  $data.delDialogInfo = {
    id: item.id,
    level: level,
    show: true, // 是否显示弹窗
    title: level === 1 ? '删除分类组' : '删除分类', // 弹窗的标题
    content:
      level === 1
        ? '确定要删除分类组吗？删除后，组内的分类也会一并删除'
        : '确定要删除分类吗？删除后，也会一并删除模板上的分类', // 弹窗的内容
    cancelBtnText: '取消', // 取消按钮的显示文字
    confirmBtnText: '确定' // 确定按钮的显示文字
  }
}, 500)
function delGroupFun(id, level) {
  return deleteCategory({
    id: $data.delDialogInfo.id,
    factory: 0
  })
    .then(res => {
      if (res.code === 0) {
        message({
          type: 'success',
          message: $data.delDialogInfo.level === 1 ? '分类组已删除' : '分类已删除'
        })
        if ($data.delDialogInfo.level === 1) {
          // $data.leftLoading = true
          $data.chooseCategoryGroupInfo.id = null
          init(true)
        } else {
          init(true)
        }
      }
    })
    .catch(() => {})
}
// 打开分类组显示对应的分类
const openCategoryGroupFun = throttle((item, index, isAll) => {
  if (isAll) {
    $data.chooseCategoryGroupInfo = {
      id: null,
      name: '全部分类',
      index: null
    }
    $data.categoryList = $data.allCategory
  } else {
    $data.chooseCategoryGroupInfo = {
      id: item.id,
      name: item.categoryName || '',
      index: index
    }
    $data.categoryList = item.childCategoryList || []
  }
}, 500)
// 新建分类
const addCategoryFun = throttle(() => {
  $data.addCategoryInfo = {
    show: true,
    type: 'add',
    showSelect: !$data.chooseCategoryGroupInfo.id,
    parentId: $data.chooseCategoryGroupInfo.id || null
  }
})
// 编辑分类
const editCategoryFun = throttle((item, index) => {
  $data.addCategoryInfo = {
    show: true,
    type: 'edit',
    showSelect: false,
    id: item.id,
    name: item.categoryName,
    index: index,
    parentId: item.parentId
  }
}, 500)
// 新建/编辑分类成功
function getAllCategory(e) {
  init(true)
  // if (e.type === 'add') {
  //   init(true, $data.chooseCategoryGroupInfo.id)
  // } else {
  //   init(true, $data.chooseCategoryGroupInfo.id)
  //   // $data.categoryList[e.index].categoryName = e.name
  // }
}
// 弹窗关闭
const emits = defineEmits(['updateCategory'])
function handleClose() {
  emits('updateCategory')
}
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}

.dialog_content {
  height: 540px;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;

  .content_left {
    width: 212px;
    height: 100%;
    border-right: 1px solid #e3e4e6;

    padding: 12px 0px 12px 16px;

    .list_box {
      width: 100%;
      padding-right: 16px;
      height: 100%;

      .one_list_right_icon {
        width: 24px;
        height: 24px;
        object-fit: contain;
        cursor: pointer;
        border-radius: 2px;

        &:hover {
          background: #e9e9e9;
        }
      }

      .one_list {
        cursor: pointer;
        width: 100%;
        min-height: 36px;

        border-radius: 4px;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        padding: 0 12px;

        .one_list_left {
          height: 36px;
          width: calc(100% - 24px);
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
          align-items: center;
          font-size: 14px;
          font-weight: 600;
          color: #303133;
          line-height: 20px;

          .one_list_name {
            max-width: calc(100% - 40px);
          }

          .one_list_num {
            color: #909399;
          }
        }
      }

      .one_list:hover {
        background: #f6f8fa;
      }

      .one_list_choose {
        background: #f2f2f2;
      }

      .one_list_input {
        min-height: 36px;

        :deep(.el-input__inner) {
          line-height: 36px;
          height: 36px;
        }
      }

      .one_list2 {
        margin-top: 4px;

        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        padding: 0 12px;
        font-size: 12px;
        font-weight: 400;
        color: #909399;
        line-height: 18px;

        .one_list_left {
          height: 24px !important;

          width: calc(100% - 24px);
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
          align-items: center;
          font-size: 14px;
          font-weight: 400;
          color: #909399;
          line-height: 20px;

          .one_list_name {
            max-width: calc(100% - 40px);
          }

          .one_list_num {
            color: #909399;
          }
        }
      }

      .one_list_group {
        width: 100%;
        height: calc(100% - 64px);
        overflow-y: auto;
      }
    }
  }

  .content_right {
    width: calc(100% - 213px);
    height: 100%;
    padding: 20px 0px 16px 16px;

    .right_title {
      margin-bottom: 8px;
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;

      .right_title_title {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
        line-height: 22px;
      }

      .right_title_add {
        cursor: pointer;
        margin-left: 8px;
        width: 24px;
        height: 24px;
        object-fit: contain;
      }
    }

    .right_content {
      width: 100%;
      height: calc(100% - 56px);
      overflow-y: auto;

      .none_right_content {
        padding-right: 16px;
        width: 100%;
        height: 100%;

        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        .none_icon {
          width: 70px;
          height: 70px;
          object-fit: contain;
          margin-bottom: 16px;
        }

        .none_mark {
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;
          font-size: 14px;
          font-weight: 400;
          line-height: 20px;

          .none_mark_mark {
            margin-left: 8px;
            color: #909399;
          }
        }
      }

      .has_right_content {
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: flex-start;
        flex-wrap: wrap;
      }

      .one_right_mark {
        margin-top: 12px;
        font-size: 12px;
        font-weight: 400;
        color: #909399;
        line-height: 18px;
      }

      .one_right_content {
        margin-right: 12px;
        margin-top: 12px;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: flex-start;
        padding: 2px 10px;
        width: max-content;
        border-radius: 12px;
        border: 1px solid #dcdee0;

        .one_right_title {
          font-size: 14px;
          font-weight: 400;
          color: #303133;
          line-height: 20px;
        }

        .one_right_right {
          margin-left: 4px;
          position: relative;
          min-width: 16px;
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;

          .one_right_num {
            min-width: 16px;

            font-size: 14px;
            font-weight: 400;
            color: #909399;
            line-height: 20px;
          }

          .one_right_action {
            background: #f6f8fa;
            opacity: 0;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: center;

            .one_right_right_icon {
              width: 16px;
              height: 16px;
              object-fit: contain;
              cursor: pointer;
            }
          }
        }
      }

      .one_right_content:hover {
        background: #f6f8fa;

        .one_right_action {
          opacity: 1;
        }
      }
    }
  }
}
</style>
