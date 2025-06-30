<template>
    <el-dialog
    :title="UpdateInfo.title"
    :visible.sync="UpdateInfo.show"
    :show-close="false"
    :close-on-press-escape="false"
    :close-on-click-modal="false"
    center
    width="50%"
    top="45vh">
        <div class="conten">
            <el-progress :percentage="UpdateInfo.percentage" :color="UpdateInfo.colors" :status="UpdateInfo.progressStaus"></el-progress>
        </div>
    </el-dialog>
</template>
 
<script>
export default {
    data() {
        return {
            UpdateInfo:{
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
            ]},
        }
    },
    created: function () {
    },
    mounted: function () {
        this.checkForUpdate();
 
         /**
     * 主进程返回的检测状态
     */
        this.$ipcRenderer.on('updateAppMessage', (event, data) => {
            let _this = this
            console.log("updateAppMessage" + data);
            switch (data.status) {
                case -1:
                console.log("updateAppMessage-error:" + data.msg);
                    //this.$Message.error(data.msg);
                    break;
                case 0:
                    console.log("updateAppMessage-loading:" + data.msg);
                    //this.$Message.loading(data.msg);
                    break;
                case 1:
                    _this.updateApp();
                    break;
            }
        });
    },
    methods: {
        downloadUpdate () {
            let _this = this;
            let _isHotUpdate = false;
            this.$ipcRenderer.on('beginUpdate', () => {
                _isHotUpdate = true;
                _this.UpdateInfo.show = true;     
            });
            //更新进度
            this.$ipcRenderer.on('updateAppProgress', (event, data) => {
                _this.UpdateInfo.percentage =  data.percent.toFixed(0);//(data.percent).toFixed(2);
                console.log("data.percent =" + data.percent);
                if (data.percent >= 100) {
                    console.log("isUpdateNow =");
                    _this.UpdateInfo.title = "下载完成，即将自动重启应用";
                    if(_isHotUpdate){              
                    //_this.UpdateInfo.show = false;   

                    }else{
                    setTimeout(() => {   
                        _this.$ipcRenderer.send('isUpdateNow')
                    }, 1000);
                    }            
        
                }
            });      
        },
        updateApp () {
            let _this = this;
            _this.$confirm('版本有更新，是否立即更新！').then(()=> {
                _this.UpdateInfo.show = true;
            }).catch(() => {
                
            })
        },
        checkForUpdate () {
            this.$ipcRenderer.send('checkForUpdate', 'a')
            this.downloadUpdate();
        },
    }
 
}
 
</script>