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
            <el-button
              class="matter-btn-item"
              type="primary"
              @click="selectMaterial"
              >选择素材</el-button
            >
            <el-button
              class="matter-btn-item"
              type="primary"
              @click="selectFolder"
              >选择文件夹</el-button
            >
          </div>
          <div class="matter-select-right">
            <span>上传到</span>
            <div>
              <ElementTreeSelect
                v-model="treeSelectedId"
                :options="treeOptions"
                placeholder="请选择节点"
                @change="onTreeChange"
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
          <div class="progress">
            <span>上传中</span>
            <el-progress
              :text-inside="true"
              :stroke-width="15"
              :percentage="percentage"
            ></el-progress>

            <div class="progress-switch">
              <span class="progress-switch-item">暂停</span>
              <span class="progress-switch-item" style="color: #0052d9"
                >继续</span
              >
              <span class="progress-switch-item" @click="stopUpload">终止</span>
            </div>
          </div>
          <!-- 列表 -->
          <div class="matter-table-list">
            <el-table :data="pagedList" style="width: 100%" height="280">
              <el-table-column prop="name" label="名称" />
              <el-table-column prop="catalogue" label="文件目录" />
              <el-table-column prop="type" label="类型" />
              <el-table-column prop="size" label="文件大小" />
              <el-table-column prop="status" label="状态" />
              <el-table-column label="操作">
                <template slot-scope="scope">
                  <div
                    style="color: #0052d9; cursor: pointer"
                    @click="delItem(scope.row,scope.$index)"
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
      <!-- 无上传数据 -->
      <div class="matter-empty" v-else>
        <img src="@/assets/imgs/upload-success.png" alt="" />
        <p>上传成功</p>
      </div>
       <!-- 按钮 -->
        <div class="matter-btn">
          <el-button class="matter-btn-item" @click="goback">返回</el-button>
          <el-button class="matter-btn-item" type="primary" :disabled="pagedList.length === 0">上传</el-button>
          <ossOpload></ossOpload>
        </div>
    </div>
  </div>
</template>
<script>
import electronStore from "electron-store";
import ElementTreeSelect from "@/components/ElementTreeSelect.vue";
import api from "../../api";
import ossOpload from "@/components/ossOpload.vue";

const _store = new electronStore();
const { ipcRenderer } = window.require("electron");

export default {
  components: {
    ElementTreeSelect,
    ossOpload
  },
  data() {
    return {
      percentage: 70, //进度条百分比
      tagSwitch: false, //打标开关
      userPhone: _store.get("USERPHONE"),
      treeSelectedId: 'root', // 默认选中根节点
      treeOptions: [
        {
          id: 'root',
          label: '素材库',
          children: []
        }
      ],
      // 新增列表和分页数据
      list: [],
      pageSize: 5, //条数
      currentPage: 1, //当前页
    };
  },
  computed: {
    pagedList() {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.list.slice(start, start + this.pageSize);
    },
  },
  mounted() {
    // 在组件加载完成后发送事件到主进程调整窗口大小
    ipcRenderer.send("resize-window", { width: 1000, height: 600 });
    this.loadRootTree();
  },
  beforeDestroy() {
    // 组件销毁前恢复窗口大小
    ipcRenderer.send("resize-window", { width: 440, height: 460 });
  },
  methods: {
    // 加载第一级"素材库"下的子节点
    loadRootTree() {
      this.loadTreeChildren('0', this.treeOptions[0]);
    },
    // 递归加载树节点
    async loadTreeChildren(id, parentNode) {
      try {
        const res = await api.listTagFolder({ id });
        if (res && res.code === 0 && Array.isArray(res.data)) {
          parentNode.children = [];
          for (const item of res.data) {
            const node = {
              id: item.id,
              label: item.name,
              hasChildren: item.hasChildren,
              children: []
            };
            parentNode.children.push(node);
            if (item.hasChildren) {
              await this.loadTreeChildren(item.id, node);
            }
          }
        }
      } catch (e) {
        console.error('加载树节点失败', e);
      }
    },
    // 新增：选择素材
    selectMaterial() {
      const input = document.createElement("input");
      input.type = "file";
      input.multiple = true;
      input.accept = ".jpg,.jpeg,.png,.gif,.mp4,.mov,.mp3";
      input.onchange = (e) => {
        const files = Array.from(e.target.files);
        const allowedTypes = [
          "image/jpeg",
          "image/png",
          "image/gif",
          "video/mp4",
          "video/quicktime",
          "audio/mp3",
          "audio/mpeg",
        ];
        const newFiles = files.filter((f) => allowedTypes.includes(f.type));
        console.log(newFiles);

        const mapped = newFiles.map((f) => ({
          name: f.name,
          size: (f.size / 1024 / 1024).toFixed(2) + "MB",
          type: f.type,
          status: "待上传",
          catalogue: f.path,
          file: f,
        }));
        this.list = this.list.concat(mapped);
      };
      input.click();
    },
    // 新增：选择文件夹
    selectFolder() {
      const input = document.createElement("input");
      input.type = "file";
      input.webkitdirectory = true;
      input.multiple = true;
      input.accept = "";
      input.onchange = (e) => {
        const files = Array.from(e.target.files);
        const allowedTypes = [
          "image/jpeg",
          "image/png",
          "image/gif",
          "video/mp4",
          "video/quicktime",
          "audio/mp3",
          "audio/mpeg",
        ];
        const notAllowedExtensions = [".zip", ".rar", ".7z"];
        const filtered = files.filter((f) => {
          // 过滤压缩包
          const lowerName = f.name.toLowerCase();
          const isCompressed = notAllowedExtensions.some((ext) =>
            lowerName.endsWith(ext)
          );
          return allowedTypes.includes(f.type) && !isCompressed;
        });
        console.log(filtered);

        const mapped = filtered.map((f) => ({
          name: f.name,
          size: (f.size / 1024 / 1024).toFixed(2) + "MB",
          type: f.type,
          status: "待上传",
          catalogue: f.path,
          file: f,
        }));
        this.list = this.list.concat(mapped);
      };
      input.click();
    },
    // 上传文件夹改变
    onTreeChange(node) {
      this.$message && this.$message.success("选中节点: " + node.label);
    },
    // 终止上传
    stopUpload() {
      this.$confirm(
        "终止上传将清空剩余未上传文件，已上传文件不受影响，是否确认终止上传？",
        "终止上传",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).then(() => {});
    },
    // 移除项
    delItem(row,index) {
      this.$confirm(`确认移除${row.name}这一项？`, "移除", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        this.list.splice((this.currentPage - 1) * this.pageSize + index, 1);
      });
    },
    // 返回
    goback() {
      this.$router.push({ name: "template_select" });
    },
  },
};
</script>
<style lang="less" scoped>
@import "./matter_template.less";
</style>
