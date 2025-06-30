<template>
  <div id="app">
    <myHeader />
    <div class="main">
        <router-view v-if="isRouterAlive"></router-view>
    </div>
    <el-dialog
    :title="title"
    :visible.sync="show"
    :show-close="false"
    :close-on-press-escape="false"
    :close-on-click-modal="false"
    center
    width="50%"
    top="45vh">
        <div class="conten">
            <el-progress :percentage="percentage" :color="colors" :status="progressStaus"></el-progress>
        </div>
    </el-dialog>
  </div>
</template>

<script>
import myHeader from "@/components/myHeader.vue";
const {ipcRenderer} = require('electron')

// const fs = require('fs');

export default {
    name: 'App',
    provide(){
        return{
            reload: this.reload
        }
    },
    components: {
        myHeader,
    },
    data() {
        return {
            isRouterAlive: true,
            // 
            isHidden: false,
            // dialog
            show:false,
            percentage: 0,
            title:"下载进度",
            progressStaus :null,
            colors: [ 
                { color: "#f56c6c", percentage: 20 }, 
                { color: "#e6a23c", percentage: 40 },
                { color: "#6f7ad3", percentage: 60 },
                { color: "#1989fa", percentage: 80 }, 
                { color: "#5cb87a", percentage: 100 }
            ]
        }
    },
    methods: {
        reload(){
            this.isRouterAlive = false
            this.$nextTick(()=>{
                this.isRouterAlive = true
            })
        },
        // 
        updateApp () {
            let _this = this;
            _this.$confirm('版本有更新，是否立即更新！').then(()=> {
                _this.show = true;
                ipcRenderer.send('confirm-downloadUpdate')     
            }).catch(() => {
                console.log('no')
            })
        }
    },
    created(){
        // console.log('fs',fs);
        
    },
    mounted: function () {
        // 检测更新
        ipcRenderer.send('checkForUpdate', 'a')
        //  主进程返回的检测状态
        ipcRenderer.on('updateAppMessage', (event, data) => {
            let _this = this
            // console.log("updateAppMessage" + JSON.stringify(data));
            switch (data.state) {
                case -1:
                    // console.log("updateAppMessage-error:" + data.msg);
                    break;
                case 0:
                    // console.log("updateAppMessage-loading:" + data.msg);
                    break;
                case 1:
                    ipcRenderer.send('confirm-downloadUpdate')
                    break;
                case 3:
                    _this.percentage = data.msg.percent.toFixed(1)
                    break;
                case 4:
                    _this.show = false
                    _this.$confirm('发现新版本，是否立即安装').then(()=> {
                        ipcRenderer.send("isUpdateNow")
                    }).catch(() => {
                        console.log('no')
                    })
                    break;
            }
        });
    },
}
</script>

<style>
html,
body {
  height: 100%;
  margin: 0;
  padding: 0;
}
#app {
  height: 100%;
  background: rgba(255, 255, 255, 1);
  position: relative;
}
.main{
    height: calc(100% - 32px);
}
</style>
