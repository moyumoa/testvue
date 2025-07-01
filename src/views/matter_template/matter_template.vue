<template>
  <div class="home_wrapper">
    <div class="head_wrap">
      <h4 class="name">{{ userPhone }}</h4>
      <img class="logo" src="@/assets/imgs/video-icon.png" alt="" />
    </div>
    <!-- 主体区域 -->
    <div class="matter-container">
      <!-- 选择 -->
      <div class="matter-select">
        <div class="matter-select-top">
          <div class="matter-select-btn">
            <input
              ref="fileInput"
              type="file"
              :accept="matterAccept"
              multiple
              style="display: none"
              @change="handleFileInputChange"
            />
            <el-button
              class="matter-btn-item"
              type="primary"
              style="margin-right: 60px"
              @click="triggerFileInput"
              :disabled="
                !allowSelectAfterStop &&
                (uploadBtnLoading || (isUploading && !isPaused))
              "
              >选择素材</el-button
            >
            <input
              ref="folderInput"
              type="file"
              webkitdirectory
              multiple
              style="display: none"
              @change="handleFolderChange"
            />
            <el-button
              class="matter-btn-item"
              type="primary"
              @click="triggerFolderInput"
              :loading="folderLoading"
              :disabled="
                folderLoading ||
                (!allowSelectAfterStop &&
                  (uploadBtnLoading || (isUploading && !isPaused)))
              "
              >选择文件夹</el-button
            >
          </div>
          <div class="matter-select-right">
            <span>上传到</span>
            <div>
              <ElementTreeSelect
                ref="treeSelect"
                v-model="treeSelectedId"
                :options="treeOptions"
                placeholder="请选择节点"
                @change="onTreeChange"
                @request-node-label="handleRequestNodeLabel"
                :loadNode="loadTreeNode"
                :disabled="
                  !allowSelectAfterStop &&
                  (uploadBtnLoading || (isUploading && !isPaused))
                "
              />
            </div>
            <!-- <div>
              <el-switch v-model="tagSwitch"> </el-switch>
              <span>智能打标</span>
            </div> -->
          </div>
        </div>
        <div class="matter-select-btm">
          支持批量添加，图片支持：jpg/jpeg/png/gif，视频支持：mp4/mov，音频支持：mp3。
        </div>
      </div>
      <!-- 列表有数据 -->
      <div class="matter-list" v-if="list.length > 0">
        <!-- 上传列表 -->
        <div class="matter-table">
          <!-- 进度条 -->
          <div class="progress" v-if="showProgress && !isUploadStopped">
            <!-- <span>上传中</span> -->
            <el-progress
              :text-inside="true"
              :stroke-width="15"
              :percentage="percentage"
            ></el-progress>

            <div class="progress-switch">
              <span
                class="progress-switch-item"
                @click="pauseUpload"
                v-if="
                  !isUploadStopped &&
                  !isPaused &&
                  !isAllUploadCompleted &&
                  !isProgressComplete
                "
                >暂停</span
              >
              <span
                class="progress-switch-item"
                style="color: #0052d9"
                @click="continueUpload"
                v-if="
                  !isUploadStopped &&
                  isPaused &&
                  !isAllUploadCompleted &&
                  !isProgressComplete
                "
                >继续</span
              >
              <span
                class="progress-switch-item"
                @click="stopUpload"
                v-if="!isUploadStopped && !isProgressComplete"
                >终止</span
              >
            </div>
          </div>
          <!-- 列表 -->
          <div class="matter-table-list">
            <el-table :data="pagedList" style="width: 100%" height="280">
              <el-table-column prop="name" label="名称" align="center" />
              <el-table-column
                prop="catalogue"
                label="文件目录"
                align="center"
              />
              <el-table-column prop="type" label="类型" align="center" />
              <el-table-column prop="size" label="文件大小" align="center" />
              <el-table-column
                prop="status"
                label="状态"
                width="108"
                align="center"
              >
                <template slot-scope="{ row }">
                  <div v-if="row.status == null" class="status-pending">
                    待上传
                  </div>
                  <div v-if="row.status == '0'" class="status-uploading">
                    上传中
                  </div>
                  <div v-if="row.status == '1'" class="status-failed">
                    上传失败
                  </div>
                  <div v-if="row.status == '2'" class="status-success">
                    上传成功
                  </div>
                  <div v-if="row.status == '3'" class="status-tag-required">
                    需要打标而未打标
                  </div>
                  <div v-if="row.status == '4'" class="status-tag-failed">
                    打标失败
                  </div>
                  <div v-if="row.status == '5'" class="status-tag-complete">
                    打标完成
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="操作" align="center">
                <template slot-scope="scope">
                  <div
                    :style="{
                      color:
                        uploadBtnLoading ||
                        (isUploading && !isPaused) ||
                        (isPaused &&
                          scope.row.hasAssociatedSubTask &&
                          scope.row.status !== null) ||
                        ([0, 1, 2, 5].includes(scope.row.status) &&
                          !(isPaused && scope.row.status === null))
                          ? '#ccc'
                          : '#bd3124',
                      cursor:
                        uploadBtnLoading ||
                        (isUploading && !isPaused) ||
                        (isPaused &&
                          scope.row.hasAssociatedSubTask &&
                          scope.row.status !== null) ||
                        ([0, 1, 2, 5].includes(scope.row.status) &&
                          !(isPaused && scope.row.status === null))
                          ? 'not-allowed'
                          : 'pointer',
                    }"
                    @click="
                      !(
                        uploadBtnLoading ||
                        (isUploading && !isPaused) ||
                        (isPaused &&
                          scope.row.hasAssociatedSubTask &&
                          scope.row.status !== null) ||
                        ([0, 1, 2, 5].includes(scope.row.status) &&
                          !(isPaused && scope.row.status === null))
                      ) && delItem(scope.row, scope.$index)
                    "
                  >
                    移除
                  </div>
                </template>
              </el-table-column>
            </el-table>
            <el-pagination
              style="margin-top: 16px; text-align: right"
              background
              layout="total , prev, pager, next"
              :page-size="pageSize"
              :current-page.sync="currentPage"
              :total="list.length"
            />
          </div>
        </div>
      </div>
      <!-- 全部上传成功时显示 -->
      <!-- <div class="matter-empty" v-if="uploadAllSuccess">
        <img src="@/assets/imgs/upload-success.png" alt="" />
        <p>上传成功</p>
      </div> -->
      <!-- 按钮 -->
      <div class="matter-btn">
        <el-button class="matter-btn-item" @click="goback">返回</el-button>
        <el-button
          class="matter-btn-item"
          type="primary"
          @click="uploadList"
          :disabled="
            pagedList.length === 0 ||
            (!allowSelectAfterStop &&
              (uploadBtnLoading || 
               (isPaused && hasActuallyStartedUpload) || 
               (isUploading && !isPaused)))
          "
          :loading="uploadBtnLoading"
          >上传</el-button
        >
      </div>
    </div>
  </div>
</template>
<script>
import electronStore from "electron-store";
import ElementTreeSelect from "@/components/ElementTreeSelect.vue";
import api from "../../api";

import {
  ALLOWED_EXTS,
  filterFiles,
  createFileInfo,
} from "@/utils/uploadHelper";

const _store = new electronStore();
const { ipcRenderer } = window.require("electron");

export default {
  components: {
    ElementTreeSelect,
  },
  data() {
    return {
      statusTime: null,
      tagId: "0", // 素材分类id
      taskId: undefined, //父任务id
      taskIdHistory: {}, // 保存每个文件对应的taskId，格式: { ossUrl: taskId }
      matterAccept: ALLOWED_EXTS.join(","), // 允许的上传格式
      percentage: 0, //进度条百分比
      tagSwitch: false, //打标开关
      userPhone: _store.get("USERPHONE"),
      brandId: _store.get("USERBRANDID"),
      userId: _store.get("USERID"),
      treeSelectedId: "0", // 默认选中根节点
      treeOptions: [], // 初始为空，在mounted中动态加载
      // 新增列表和分页数据
      list: [],
      pageSize: 5, //条数
      currentPage: 1, //当前页
      folderLoading: false,
      uploadBtnLoading: false, // 上传按钮 loading
      isPaused: false, // 是否暂停
      finished: 0, // 已处理文件数
      uploadAllSuccess: false, // 是否全部上传成功
      allowSelectAfterStop: false, // 终止后允许选择
      isUploadStopped: false, // 终止后隐藏进度条和操作按钮
      polledUrls: [], // 用于轮询的 ossUrl
    };
  },
  computed: {
    pagedList() {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.list.slice(start, start + this.pageSize);
    },
    showProgress() {
      // 只要有未完成的文件（不是全部上传成功），就显示进度条
      return this.list.length > 0 && !this.isAllUploadCompleted;
    },
    // 新增：只要有已上传但未成功的文件，或者 uploadBtnLoading 为 true，就认为正在上传
    isUploading() {
      return (
        this.uploadBtnLoading ||
        this.list.some((item) => item.ossUrl && item.status !== 2)
      );
    },
    // 判断是否全部上传完成
    isAllUploadCompleted() {
      return (
        this.list.length > 0 && this.list.every((item) => item.status === 2)
      );
    },
    // 判断进度是否达到100%
    isProgressComplete() {
      return this.percentage >= 100;
    },
    // 判断是否实际开始过上传（有文件已上传到OSS或关联了子任务）
    hasActuallyStartedUpload() {
      return this.list.some(item => 
        item.ossUrl || item.hasAssociatedSubTask || item.status !== null
      );
    },
  },    mounted() {
    // 在组件加载完成后发送事件到主进程调整窗口大小
    ipcRenderer.send("resize-window", { width: 1000, height: 600 });
    // 初始化树形结构数据
    this.initializeTreeData();
    // 恢复上传状态
    this.restoreUploadState();
    
    // 确保当前选中节点的标签正确显示
    this.$nextTick(() => {
      if (this.treeSelectedId && this.treeSelectedId !== "0") {
        this.handleRequestNodeLabel(this.treeSelectedId);
      }
    });
  },
  beforeDestroy() {
    // 组件销毁前恢复窗口大小
    ipcRenderer.send("resize-window", { width: 440, height: 460 });
    // 清除定时器
    if (this.statusTime) {
      clearInterval(this.statusTime);
      this.statusTime = null;
    }
    // 保存上传状态
    this.saveUploadState();
  },
  beforeRouteLeave(to, from, next) {
    // 离开页面时自动暂停并保存状态
    // 但如果从未实际开始上传，则不设置暂停状态
    if (this.hasActuallyStartedUpload) {
      this.isPaused = true;
      console.log('离开页面时设置暂停状态');
    } else {
      console.log('从未实际开始上传，不设置暂停状态');
    }
    this.saveUploadState();
    next();
  },
  methods: {
    // 初始化树形结构数据
    async initializeTreeData() {
      try {
        // 在懒加载模式下，只需要确保根节点存在
        this.treeOptions = [{
          id: "0",
          label: "素材库",
          isLeaf: false
        }];
        
        console.log('懒加载模式下初始化根节点完成');
      } catch (error) {
        console.error('初始化树形数据失败:', error);
        // 即使加载失败，也保证根节点存在
        this.treeOptions = [{
          id: "0",
          label: "素材库", 
          isLeaf: false
        }];
      }
    },
    
    // 加载节点的子节点数据
    async loadNodeChildren(nodeId) {
      try {
        const res = await api.listTagFolder({ id: nodeId });
        if (res && res.code === 0 && Array.isArray(res.data)) {
          return res.data.map(item => ({
            id: item.id,
            label: item.name,
            isLeaf: !item.hasChildren,
            children: item.hasChildren ? [] : undefined
          }));
        }
        return [];
      } catch (error) {
        console.error(`加载节点 ${nodeId} 的子节点失败:`, error);
        return [];
      }
    },
    
    // 确保指定节点的路径在树中可见（懒加载模式下简化处理）
    async ensureNodePathVisible(nodeId) {
      try {
        console.log('懒加载模式下确保节点路径可见:', nodeId);
        // 在懒加载模式下，树会根据需要自动加载节点
        // 这里主要是确保选中状态正确
        this.$nextTick(() => {
          if (this.$refs.treeSelect && this.$refs.treeSelect.$refs.tree) {
            this.$refs.treeSelect.$refs.tree.setCurrentKey(nodeId);
          }
        });
      } catch (error) {
        console.error('确保节点路径可见失败:', error);
      }
    },
    
    // 保存上传状态到本地存储
    saveUploadState() {
      const uploadState = {
        list: this.list.map((item) => {
          const rest = { ...item };
          delete rest.file;
          return rest;
        }),
        taskId: this.taskId,
        percentage: this.percentage,
        finished: this.finished,
        isPaused: this.isPaused,
        uploadBtnLoading: this.uploadBtnLoading,
        isUploadStopped: this.isUploadStopped,
        allowSelectAfterStop: this.allowSelectAfterStop,
        tagId: this.tagId,
        treeSelectedId: this.treeSelectedId,
        currentPage: this.currentPage,
        uploadAllSuccess: this.uploadAllSuccess,
        polledUrls: this.polledUrls,
        taskIdHistory: this.taskIdHistory, // 保存taskId历史
        hasActiveUpload:
          this.list.some((item) => item.status === 0) &&
          !this.isAllUploadCompleted,
      };
      
      _store.set("UPLOAD_STATE", uploadState);
    },

    // 从本地存储恢复上传状态
    async restoreUploadState() {
      const uploadState = _store.get("UPLOAD_STATE");

      if (uploadState && uploadState.list && uploadState.list.length > 0) {
        // 恢复状态
        this.list = uploadState.list.map((item) => ({
          ...item,
          file: undefined,
        }));
        this.taskId = uploadState.taskId;
        this.percentage = uploadState.percentage || 0;
        this.finished = uploadState.finished || 0;
        this.isPaused = uploadState.isPaused || false;
        this.uploadBtnLoading = uploadState.uploadBtnLoading || false;
        this.isUploadStopped = uploadState.isUploadStopped || false;
        this.allowSelectAfterStop = uploadState.allowSelectAfterStop || false;
        this.tagId = uploadState.tagId || "0";
        this.treeSelectedId = uploadState.treeSelectedId || "0";
        this.currentPage = uploadState.currentPage || 1;
        this.uploadAllSuccess = uploadState.uploadAllSuccess || false;
        this.polledUrls = uploadState.polledUrls || [];
        this.taskIdHistory = uploadState.taskIdHistory || {}; // 恢复taskId历史
        
        // 确保根节点在选项中
        await this.initializeTreeData();
        
        // 如果选中的不是根节点，需要确保该节点路径在树中可见
        if (this.treeSelectedId && this.treeSelectedId !== "0") {
          await this.ensureNodePathVisible(this.treeSelectedId);
          // 确保选中节点的标签正确显示
          this.$nextTick(() => {
            this.handleRequestNodeLabel(this.treeSelectedId);
          });
        }
        if (
          this.list.length > 0 &&
          this.list.every((item) => item.status === 2)
        ) {
          this.isPaused = false;
          this.uploadAllSuccess = true;
        }
        
        // 如果从未实际开始上传（没有任何文件有ossUrl或关联的子任务），
        // 则不应该保持暂停状态，允许重新上传
        if (!this.hasActuallyStartedUpload) {
          this.isPaused = false;
          console.log('检测到从未实际开始上传，重置暂停状态');
        }
        
        // 只要 polledUrls 有 status=0 的文件就自动轮询
        if (
          this.polledUrls.some((url) => {
            const item = this.list.find((i) => i.ossUrl === url);
            return item && item.status === 0;
          })
        ) {
          this.startStatusPolling();
        }
        
        // 确保树形组件正确显示，特别是在恢复非根节点状态时
        this.$nextTick(() => {
          if (this.$refs.treeSelect && this.treeSelectedId !== "0") {
            console.log('恢复状态后，刷新树形组件显示，当前选中:', this.treeSelectedId);
            // 触发树形组件刷新，确保根节点可见
            this.$refs.treeSelect.$forceUpdate();
          }
        });
        
        // if (this.isPaused && this.list.some((item) => item.status === 0)) {
        //   this.$message.info('检测到暂停的上传任务，点击"继续"按钮恢复上传');
        // }
      } else {
        console.log("[restoreUploadState] 没有需要恢复的上传状态");
      }
    },

    // 开始状态轮询
    startStatusPolling() {
      if (this.statusTime) return; // 已有轮询任务，避免重复启动

      const poll = () => {
        // 按taskId分组需要轮询的URLs
        const taskGroups = {};
        
        this.polledUrls.forEach(url => {
          const item = this.list.find(i => i.ossUrl === url);
          if (item && item.status !== 2 && item.status !== '2') {
            // 获取该文件对应的taskId
            const fileTaskId = this.taskIdHistory[url] || this.taskId;
            if (!taskGroups[fileTaskId]) {
              taskGroups[fileTaskId] = [];
            }
            taskGroups[fileTaskId].push(url);
          }
        });

        const taskIds = Object.keys(taskGroups);
        if (taskIds.length > 0) {
          // 为每个taskId分别查询状态
          const promises = taskIds.map(taskId => 
            this.getStatusByTaskId(taskGroups[taskId], taskId)
          );
          
          Promise.all(promises).finally(() => {
            this.statusTime = setTimeout(poll, 2000); // 递归调用
          });
        } else {
          // 没有需要轮询的，清除状态
          this.statusTime = null;
        }
      };

      poll(); // 启动首次轮询
    },

    // 停止状态轮询
    stopStatusPolling() {
      if (this.statusTime) {
        clearTimeout(this.statusTime);
        this.statusTime = null;
      }
    },

    // 动态加载树节点
    async loadTreeNode(node, resolve) {      
      try {
        // 如果是根节点（level === 0），加载第一级子节点
        const nodeId = node.level === 0 ? "0" : node.data.id;
        
        const res = await api.listTagFolder({ id: nodeId });
        console.log('API响应:', res);
        
        if (res && res.code === 0 && Array.isArray(res.data)) {
          const children = res.data.map(item => ({
            id: item.id,
            label: item.name,
            isLeaf: !item.hasChildren,
          }));
          console.log('解析后的子节点:', children);
          resolve(children);
        } else {
          console.log('API返回无数据或格式错误');
          resolve([]);
        }
      } catch (e) {
        console.error("加载树节点失败", e);
        resolve([]);
      }
    },

    // 获取节点标签（用于懒加载回显）
    async fetchNodeLabel(nodeId) {
      try {
        // 立即设置加载状态
        if (this.$refs.treeSelect) {
          this.$refs.treeSelect.setNodeLabel('加载中...');
        }
        
        // 尝试通过递归查找获取节点名称
        const nodeName = await this.findNodeNameById(nodeId);
        
        if (nodeName && this.$refs.treeSelect) {
          this.$refs.treeSelect.setNodeLabel(nodeName);
        } else if (this.$refs.treeSelect) {
          // 如果找不到，显示默认标签
          this.$refs.treeSelect.setNodeLabel('加载中...');
        }
      } catch (error) {
        console.error('获取节点标签失败:', error);
        if (this.$refs.treeSelect) {
          this.$refs.treeSelect.setNodeLabel('加载失败');
        }
      }
    },
    
    // 通过ID查找节点名称（递归查找）
    async findNodeNameById(targetId, parentId = '0', depth = 0) {
      try {
        // 防止递归过深
        if (depth > 10) {
          return null;
        }
        
        const res = await api.listTagFolder({ id: parentId });
        
        if (res && res.code === 0 && Array.isArray(res.data)) {
          // 在当前层级查找目标节点
          const targetNode = res.data.find(item => item.id === targetId);
          if (targetNode) {
            return targetNode.name;
          }
          
          // 如果当前层级没找到，递归查找有子节点的节点
          for (const item of res.data) {
            if (item.hasChildren) {
              const result = await this.findNodeNameById(targetId, item.id, depth + 1);
              if (result) {
                return result;
              }
            }
          }
        }
        
        return null;
      } catch (error) {
        console.error('查找节点名称失败:', error);
        return null;
      }
    },
    
    // 获取节点路径（从根节点到目标节点）
    async getNodePath(targetId, callback) {
      try {        
        const path = await this.findNodePath(targetId);
        
        if (callback) {
          callback(path);
        }
        return path;
      } catch (error) {
        console.error('获取节点路径失败:', error);
        if (callback) {
          callback([]);
        }
        return [];
      }
    },
    
    // 递归查找节点路径
    async findNodePath(targetId, parentId = '0', currentPath = ['0'], depth = 0) {
      try {
        // 防止递归过深
        if (depth > 10) {
          console.warn('递归查找深度过深，停止查找');
          return null;
        }
        const res = await api.listTagFolder({ id: parentId });
        
        if (res && res.code === 0 && Array.isArray(res.data)) {
          // 在当前层级查找目标节点
          const targetNode = res.data.find(item => item.id === targetId);
          if (targetNode) {
            // 找到目标节点，返回完整路径
            const fullPath = [...currentPath, targetId];
            return fullPath;
          }
          
          // 如果当前层级没找到，递归查找有子节点的节点
          for (const item of res.data) {
            if (item.hasChildren) {
              const newPath = [...currentPath, item.id];
              const result = await this.findNodePath(targetId, item.id, newPath, depth + 1);
              if (result) {
                return result;
              }
            }
          }
        }
        
        return null;
      } catch (error) {
        console.error('查找节点路径失败:', error);
        return null;
      }
    },

    // 清空列表方法
    clearList() {
      if (this.isAllUploadCompleted) {
        this.list = [];
        this.uploadAllSuccess = false;
        this.percentage = 0;
        this.finished = 0;
        this.currentPage = 1;
        // 清除存储的状态
        _store.delete("UPLOAD_STATE");
        // 清理taskId历史记录
        this.taskIdHistory = {};
        // 注意：不重置 treeSelectedId 和 tagId，保持当前选中的素材库节点
        console.log('清空列表后，保持素材库选择:', this.treeSelectedId, this.tagId);
      }
    },
    // 选择素材或文件夹
    triggerFileInput() {
      if (this.isUploadStopped || this.isAllUploadCompleted) {
        this.list = [];
        this.isUploadStopped = false;
        this.uploadAllSuccess = false;
        this.percentage = 0;
        this.finished = 0;
        this.currentPage = 1;
        // 清理taskId历史记录
        this.taskIdHistory = {};
        this.polledUrls = [];
        // 终止后重新选择文件时，重置为根节点
        this.treeSelectedId = "0";
        this.tagId = "0";
        this.taskId = undefined;
        // 重新初始化树形数据
        this.initializeTreeData();
        console.log('终止后重新选择文件，重置为根节点:', this.treeSelectedId, this.tagId);
      }
      this.$refs.fileInput && this.$refs.fileInput.click();
    },
    // 合并新文件到 this.list，去重（按 name+size）
    mergeNewFiles(newFiles) {
      const existingKeys = new Set(this.list.map((f) => f.name + "_" + f.size));
      newFiles.forEach((file) => {
        const key = file.name + "_" + file.size;
        if (!existingKeys.has(key)) {
          this.list.push(file);
        }
      });
    },
    handleFileInputChange(e) {
      const files = filterFiles(e.target.files);
      const newFiles = files.map(createFileInfo);

      this.mergeNewFiles(newFiles);
      e.target.value = "";
      this.currentPage = Math.ceil(this.list.length / this.pageSize) || 1;
      this.isUploadStopped = false;
    },
    // 上传文件夹改变
    onTreeChange(node) {     
      // 检查是否有正在处理中的文件
      const hasProcessingFiles = this.list.some(item => 
        item.ossUrl && (item.status === '0' || item.status === 0)
      );
      
      if (hasProcessingFiles) {
        if (this.isPaused) {
          this.$message.warning('检测到有文件正在处理中，切换素材库后将无法获取这些文件的最新状态，建议等待处理完成后再切换');
        } else {
          this.$message.warning('有文件正在处理中，切换素材库可能影响状态查询，建议暂停后再切换');
        }
      }
      
      // 保存旧的taskId（如果有的话）
      const oldTaskId = this.taskId;
      console.log('保存旧taskId:', oldTaskId);
      
      // 不清空原有未上传和已上传的文件
      this.tagId = node.id;
      this.initTask();
    },
    
    // 处理节点标签请求
    async handleRequestNodeLabel(nodeId) {
      try {
        console.log('请求节点标签:', nodeId);
        
        // 根节点直接返回
        if (nodeId === '0') {
          if (this.$refs.treeSelect) {
            this.$refs.treeSelect.setNodeLabel('素材库');
          }
          return;
        }
        
        // 尝试通过API获取节点信息
        const label = await this.fetchNodeLabelById(nodeId);
        if (label && this.$refs.treeSelect) {
          this.$refs.treeSelect.setNodeLabel(label);
        }
      } catch (error) {
        console.error('获取节点标签失败:', error);
      }
    },
    
    // 根据节点ID获取节点标签
    async fetchNodeLabelById(nodeId) {
      try {
        // 尝试从已有的树结构中查找
        const findLabelInTree = (nodes, targetId) => {
          for (const node of nodes) {
            if (node.id === targetId) {
              return node.label;
            }
            if (node.children && node.children.length > 0) {
              const label = findLabelInTree(node.children, targetId);
              if (label) return label;
            }
          }
          return null;
        };
        
        let label = findLabelInTree(this.treeOptions, nodeId);
        if (label) {
          return label;
        }
        
        // 如果在现有树结构中找不到，通过递归查找
        label = await this.findNodeNameById(nodeId);
        return label;
        
      } catch (error) {
        console.error('获取节点标签失败:', error);
        return null;
      }
    },
    // 终止上传
    stopUpload() {
      // 打开弹窗时立即暂停进度
      this.isPaused = true;
      this.$confirm(
        "终止上传将清空剩余未上传文件，已上传文件不受影响，是否确认终止上传？",
        "终止上传",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).then(() => {
        this.isPaused = false;
        this.uploadBtnLoading = false;
        this.percentage = 0;
        this.allowSelectAfterStop = true;
        this.isUploadStopped = true;
        // 移除待上传的项
        const removedItems = this.list.filter((item) => item.status === null);
        this.list = this.list.filter((item) => item.status !== null);
        
        // 清理被移除项的taskId记录
        removedItems.forEach(item => {
          if (item.ossUrl) {
            delete this.taskIdHistory[item.ossUrl];
            const urlIndex = this.polledUrls.indexOf(item.ossUrl);
            if (urlIndex > -1) {
              this.polledUrls.splice(urlIndex, 1);
            }
          }
        });
        
        // 不清空 this.list，不删除 UPLOAD_STATE，保留所有历史
        this.saveUploadState();
      });
    },
    pauseUpload() {
      this.isUploadStopped = false;
      this.allowSelectAfterStop = false;
      this.isPaused = true;
      // 不再清除定时器
      this.saveUploadState();
    },
    continueUpload() {
      if (this.isPaused) {
        this.isUploadStopped = false;
        this.allowSelectAfterStop = false;
        this.isPaused = false;

        this.uploadList();
      }
    },
    // 移除项
    delItem(row, index) {
      this.$confirm(`确认移除${row.name}这一项？`, "移除", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        const actualIndex = (this.currentPage - 1) * this.pageSize + index;
        const removedItem = this.list[actualIndex];
        
        // 清理相关数据
        if (removedItem && removedItem.ossUrl) {
          // 从taskId历史中移除
          delete this.taskIdHistory[removedItem.ossUrl];
          
          // 从轮询列表中移除
          const urlIndex = this.polledUrls.indexOf(removedItem.ossUrl);
          if (urlIndex > -1) {
            this.polledUrls.splice(urlIndex, 1);
          }
        }
        
        this.list.splice(actualIndex, 1);
      });
    },
    // 返回
    goback() {
      // 离开页面时自动暂停并保存状态
      this.isPaused = true;
      this.saveUploadState();
      this.$router.push({ name: "template_select" });
    },

    async initTask() {
      const configJson = JSON.stringify({ tagId: this.tagId });
      const res = await api.initUploadTask({
        brandId: this.brandId,
        configJson,
        userId: this.userId,
      });
      if (res.code === 0) {
        this.taskId = res.data;
        return true;
      } else {
        this.$message.error("初始化上传任务失败: " + res.msg);
        return false;
      }
    },

    async uploadBatchFiles(batch, fs, total) {
      for (const fileInfo of batch) {
        if (this.isPaused) {
          this.uploadBtnLoading = false;
          this.saveUploadState();
          return false;
        }
        if (!fileInfo.ossUrl) {
          try {
            let fileContent;
            if (fileInfo.file) {
              fileContent = fileInfo.file;
            } else if (fileInfo.path) {
              fileContent = fs.readFileSync(fileInfo.path);
            } else {
              this.$message.error("文件信息丢失，请重新选择");
              continue;
            }
            const { uploadToOss } = await import("@/libs/ossUploadUtil");
            const result = await uploadToOss(fileContent, fileInfo.name);
            fileInfo.ossUrl = result.url;
          } catch (e) {
            console.log(e);
          }
        }
        this.finished++;
        this.percentage = Math.round((this.finished / total) * 100);
        
      }
      return true;
    },

    buildSubtasks(batch) {
      return batch
        .filter((item) => item.ossUrl)
        .map((item) => {
          let typeNum = 0;
          if (item.type) {
            if (item.type.startsWith("video/")) typeNum = 1;
            else if (item.type.startsWith("image/")) typeNum = 2;
            else if (item.type.startsWith("audio/")) typeNum = 3;
          }
          return {
            mediaName: item.name,
            url: item.ossUrl,
            type: typeNum,
          };
        });
    },

    // 上传按钮
    async uploadList() {
      this.isUploadStopped = false;
      this.allowSelectAfterStop = false;
      // 只上传 status=null 的新文件，保留已上传的文件
      const uploadList = this.list.filter(
        (item) => item.status === null && (item.file || item.path)
      );
      if (uploadList.length === 0) {
        this.$message.error("请重新选择要上传的文件");
        this.uploadBtnLoading = false;
        return;
      }
      this.uploadBtnLoading = true;
      const batchSize = 5;
      // 总文件数用于计算上传进度
      const total = this.list.length;
      // 实际需要上传的文件数量
      const totalToUpload = uploadList.length;
      let start = 0;
      if (!this.isPaused) {
        this.finished = 0;
        this.percentage = 0;
      }
      // 统计已完成数（ossUrl存在或status==1为失败）
      this.finished = this.list.filter(
        (item) => item.ossUrl || item.status === 1
      ).length;

      try {
        if (!this.taskId) {
          // 如果没有 taskId，先初始化任务
          const ok = await this.initTask();
          if (!ok) {
            this.list = [];
            this.uploadBtnLoading = false;
            return;
          }
        }

        const fs = window.require("fs");
        while (start < totalToUpload) {
          if (this.isPaused) {
            this.uploadBtnLoading = false;
            this.saveUploadState();
            return;
          }
          const batch = uploadList.slice(start, start + batchSize);
          const uploaded = await this.uploadBatchFiles(batch, fs, total);
          if (!uploaded) return;
          const subtasks = this.buildSubtasks(batch);
          if (subtasks.length > 0) {
            await api.addAssociatedSubTask({ taskId: this.taskId, subtasks });
            batch.forEach((item) => {
              if (item.ossUrl) {
                const realItem = this.list.find((f) => f.file === item.file);
                if (realItem) this.$set(realItem, "hasAssociatedSubTask", true);
                
                // 保存该文件对应的taskId
                this.taskIdHistory[item.ossUrl] = this.taskId;
              }
            });
            const batchUrls = batch.map((item) => item.ossUrl).filter(Boolean);
            this.polledUrls = Array.from(
              new Set([...this.polledUrls, ...batchUrls])
            );
            this.startStatusPolling();
          }
          start += batchSize;
        }
      } catch (err) {
        this.$message.error("初始化上传任务异常");
        this.list = [];
      }
      this.uploadBtnLoading = false;
      // 保存状态
      this.saveUploadState();
    },
    async getStatus(urls) {
      // 使用当前的taskId查询状态（保持向后兼容）
      return this.getStatusByTaskId(urls, this.taskId);
    },
    
    async getStatusByTaskId(urls, taskId) {
      try {
        const statusRes = await api.getSubtaskStatus({
          taskId: taskId,
          urls: urls,
        });
        
        if (statusRes.code === 0) {
          statusRes.data.forEach((item) => {
            const idx = this.list.findIndex((f) => f.ossUrl === item.url);
            if (idx !== -1) {
              this.list[idx].status = item.status;
              console.log(`更新文件状态: ${item.url} -> ${item.status}`);
            }
          });
          
          // 检查所有已上传文件是否都成功
          if (
            this.list
              .filter((item) => item.ossUrl)
              .every((item) => item.status === 2 || item.status === '2')
          ) {
            if (this.statusTime) {
              clearInterval(this.statusTime);
              this.statusTime = null;
            }
            this.uploadAllSuccess = true;
            this.isPaused = false;
            _store.delete("UPLOAD_STATE");
          }
        } else {
          console.error(`查询状态失败 - taskId: ${taskId}, 错误: ${statusRes.msg}`);
        }
      } catch (error) {
        console.error(`查询状态异常 - taskId: ${taskId}:`, error);
      }
    },
    async handleFolderChange(e) {
      this.folderLoading = true;

      const files = filterFiles(e.target.files);
      const newFiles = files.map(createFileInfo);

      this.mergeNewFiles(newFiles);
      e.target.value = "";
      this.folderLoading = false;
      this.currentPage = Math.ceil(this.list.length / this.pageSize) || 1;
      this.isUploadStopped = false;
    },
    triggerFolderInput() {
      if (this.isUploadStopped || this.isAllUploadCompleted) {
        this.list = [];
        this.isUploadStopped = false;
        this.uploadAllSuccess = false;
        this.percentage = 0;
        this.finished = 0;
        this.currentPage = 1;
        // 清理taskId历史记录
        this.taskIdHistory = {};
        this.polledUrls = [];
        // 终止后重新选择文件时，重置为根节点
        this.treeSelectedId = "0";
        this.tagId = "0";
        this.taskId = undefined;
        // 重新初始化树形数据
        this.initializeTreeData();
        console.log('终止后重新选择文件，重置为根节点:', this.treeSelectedId, this.tagId);
      }
      this.$refs.folderInput && this.$refs.folderInput.click();
    },
  },
};
</script>
<style lang="less" scoped>
@import "./matter_template.less";
</style>
