<template>
    <div class="home_wrapper" @click="hidden">
        <div class="head_wrap">
            <h4 class="name">{{userPhone}}</h4>
            <!-- <div class="brand_wrap" @click.stop="showBrand">
                <span>{{selectedBrand.brandName}}</span>
                <img src="@/assets/imgs/brand-select.png" alt="">
            </div>
            <div class="brand_select" v-if="isChangeBrand">
                <span v-for="brandItem in brandList" :key="brandItem.brandId"
                :class="selectedBrand.brandId===brandItem.brandId?'brand_item_active':''"
                @click="changeBrand(brandItem)">
                {{brandItem.brandName}}
                </span>
            </div> -->
            <img class="logo" src="@/assets/imgs/video-icon.png" alt="">
            <img class="name_logo" src="@/assets/imgs/name-logo.png" alt="">
        </div>
        <div class="home_container">
            <div class="form_wrap">
                <div class="form_item">
                    <div class="input_wrap">
                        <span>品牌</span>
                        <b></b>
                        <!-- 下拉框 -->
                        <el-select
                        v-model="selectedBrandId"
                        @change="changeBrand"
                        placeholder="请选择品牌"
                        >
                            <el-option
                            v-for="option in brandList"
                            :key="option.brandId"
                            :label="option.brandName"
                            :value="option.brandId"
                            ></el-option>
                        </el-select>
                        <img src="@/assets/imgs/select-icon.png" alt="">
                    </div>
                </div>
                <div v-if="belongValue===1" class="form_item" :class="showPipeline?'form_item_active':''" @click.stop="clickPipeline">
                    <div class="input_wrap">
                        <span>流水线</span>
                        <b></b>
                        <h4>{{pipelineName?pipelineName:'请选择流水线'}}</h4>
                        <img src="@/assets/imgs/select-icon.png" alt="">
                    </div>
                    <div v-if="showPipeline" class="pipeline_wrap" @click.stop>
                        <div class="search_wrap">
                            <img class="search_img" src="@/assets/imgs/search-icon.png" alt="">
                            <el-input @input="seachPipeline" v-model="searchName" maxlength="14"></el-input>
                            <img class="clear_img" src="@/assets/imgs/clear-icon.png" alt="">
                        </div>
                        <div class="pipeline_list">
                            <h4 v-for="item in pipelineList" :key="item.id" @click="selectPipeline(item)">{{item.name}}</h4>
                        </div>
                    </div>
                </div>
                <div class="form_item" :class="showCreat?'form_item_active':''" @click.stop="clickCreat">
                    <div class="input_wrap">
                        <span>创意</span>
                        <b></b>
                        <h4>{{createList.length>0?`已添加${createList.length}条创意`:'请添加创意'}}</h4>
                        <img src="@/assets/imgs/select-icon.png" alt="">
                    </div>
                    <div v-if="showCreat" class="create_wrap" @click.stop>
                        <div class="create_list">
                            <div class="create_item" v-for="(item,index) in createList" :key="item.id">
                                <h4 class="name">{{item.name}}</h4>
                                <img @click="delCreate(item,index)" src="@/assets/imgs/clear-icon.png" alt="">
                            </div>
                        </div>
                        <div class="add_create" @click="addCreate" v-debounce>
                            <div class="add_icon">
                                <span class="h_line"></span>
                                <span class="v_line"></span>
                            </div>
                            <span>添加创意文档</span>
                        </div>
                    </div>
                </div>
                <div class="upload_btn" @click="uploadFile" v-debounce>上传</div>
            </div>
            <!-- 上传过程 -->
            <div class="loading_dialog" v-if="loadingShow">
                <div class="progress_loading" v-if="loadingStep===1">
                    <div class="progress_wrap">
                        <el-progress type="circle" color="rgba(35, 136, 255, 1)" :show-text="false" :percentage="loadingPercent" :stroke-width="8" :width="130"></el-progress>
                        <span>{{loadingPercent+'%'}}</span>
                    </div>
                    <p>首次上传会慢一点，之后会快很多…</p>
                </div>
                <div class="progress_loading" v-else>
                    <svg>
                        <circle class="circle" fill="none" stroke="#46C684" stroke-width="5" cx="50" cy="50" r="40"
                            stroke-linecap="round" transform="rotate(-90,50,50)" />
                        <polyline class="tick" fill="none" stroke="#46C684" stroke-width="6" points="34,48 46,60 66,37"
                            stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    <span class="sucess_tip">上传成功，返回web端查看</span>
                    <div class="successBack_btn" @click="successBack">返回</div>
                </div>

            </div>
        </div>
        <!-- 设置 -->
        <div class="set_wrap" @click.stop="clickSet">
            <img class="set_img" src="@/assets/imgs/set-icon.png" alt="">
            <div v-if="showSet" class="setInfo_wrap">
                <div class="setInfo_list" @click.stop>
                    <span class="name">{{userName}}</span>
                    <!-- <span v-if="userPhone" class="phone">{{userPhone}}</span> -->
                    <span class="line"></span>
                    <span class="version">版本 {{version}}</span>
                    <span class="logout" @click="logout">退出登录</span>
                </div> 
                <div class="icon"></div>
            </div>
        </div>
        <!-- 弹框 -->
        <div v-if="showTipDialog" class="tip_dialog" @click.stop>
            <div class="dialog_head">
                <span>提示</span>
                <img src="@/assets/imgs/del-dialog.png" alt="" @click="showTipDialog=false">
            </div>
            <p>存在已上传创意是否新增当前创意？</p>
            <div class="btn_wrap">
                <div class="cancle_btn" @click="showTipDialog=false">取消</div>
                <div class="confirm_btn" @click="comfirnAdd" v-debounce>确定</div>
            </div>
        </div>
    </div>
</template>
<script>
import electronStore from 'electron-store'
import api from '../../api';
// import store from '../../store'
const _store = new electronStore();
const fs = require('fs')
const { dialog } = require('electron').remote
export default {
    inject: ['reload'],
    data(){
        return{
            pipelineList: [],
            pipelineName: '',
            pipelineId: '',
            createList: [],
            searchName: '',
            showPipeline: false,
            showCreat: false,
            showTipDialog: false,
            showSet: false,
            userName: '',
            // userPhone: '',
            version: '',
            userPhone: _store.get('USERPHONE'),
            jsonUrl: '',
            fileFormData: null,
            uploadList: [],
            // 加载
            loadingShow: false,
            loadingPercent: 0,
            loadingStep: 1,
            // 品牌
            brandList: [],
            selectedBrand: {},
            selectedBrandId: null,
            isChangeBrand: false,
            // 归属
            belongList: [{label:'流水线',value:1},{label:'企业创意',value:2},],
            belongValue: null,
        }
    },
    methods:{
        // 隐藏
        hidden(){
            this.showPipeline = false
            this.showCreat = false
            this.showSet = false
            this.isChangeBrand = false
        },
        // 展示流水线
        clickPipeline(){
            this.showPipeline = !this.showPipeline
            this.showCreat = false
            this.showSet = false
            if(this.showPipeline){
                this.getPipelineList()
            }
        },
        // 展示创意
        clickCreat(){
            this.showPipeline = false
            this.showSet = false
            this.showCreat = !this.showCreat
        },
        // 展示设置
        clickSet(){
            this.showSet = !this.showSet
            this.showPipeline = false
            this.showCreat = false
        },
        // 流水线列表
        getPipelineList(){
            let data = {
                name: this.searchName
            }
            api.getPipelineList(data).then(res=>{
                // console.log(res)
                this.pipelineList = res.data
            })
        },
        // 搜索
        seachPipeline(){
            this.getPipelineList()
        },
        // 选择流水线
        selectPipeline(item){
            this.pipelineId = item.id
            this.pipelineName = item.name
            this.showPipeline = false
            this.getPipelineCreate()
        },
        // 获取流水线创意列表
        getPipelineCreate(){
            // let data = {
            //     pipelineId: this.pipelineId
            // }
            api.getPipelineCreate(this.pipelineId).then(res=>{
                this.createList = res.data
            })
        },
        // 判断创意是否存在，添加创意
        addCreate(){
            // if(!this.pipelineId){
            //     this.$message({
            //         message: '请选择流水线',
            //         type: 'error',
            //         duration: 3000
            //     })
            //     return;
            // }
            let _this = this
            dialog.showOpenDialog({
                defaultPath: _this.jsonUrl,
                properties: ['openFile'],
                filters:[{name:'json',extensions: ['json']}]
            }).then(file=>{
                // console.log(file.filePaths[0])
                if(!file.filePaths[0]){
                    return
                }
                console.log("#######")
                let isSystem = navigator.userAgent.indexOf("Window") != -1 ?1:2;
                let relativeFilePath = "";
                if(isSystem === 2){//mac文件前缀获取
                    let fileIndex = file.filePaths[0].lastIndexOf("/");
                    relativeFilePath = file.filePaths[0].substring(0,fileIndex)
                }else{
                    let fileIndex = file.filePaths[0].lastIndexOf("\\");
                    relativeFilePath = file.filePaths[0].substring(0,fileIndex)
                }
                console.log(file.filePaths[0])
                console.log(relativeFilePath)
                console.log(navigator.userAgent)
                fs.readFile(file.filePaths[0],async(err,data)=>{
                    if(err){
                        _this.$message({
                            message: err,
                            type: 'error',
                            duration: 3000
                        })
                        return;
                    }
                    let jsonFile = new Blob([new Int8Array(data)])
                    const isLt2M = jsonFile.size / 1024 / 1024 < 50;
                    if (!isLt2M) {
                        this.$message.error('上传文件大小不能超过 50MB!');
                        return;
                    }
                    const fileFormData = new FormData();
                    fileFormData.append("file", jsonFile);
                    fileFormData.append("filePath", relativeFilePath);
                    // if(this.pipelineId&&this.belongValue===1){
                    //     fileFormData.append("pipelineId", this.pipelineId);
                    // }
                    this.fileFormData = fileFormData
                    api.checkCreate(fileFormData).then((res)=>{
                        this.showTipDialog = res.data
                        if(!res.data){
                            api.addCreate(fileFormData).then(res=>{
                                // console.log(res)
                                // fs.readFile(res.data.path,(err,data)=>{
                                //     if(err){
                                        
                                //     }
                                // })
                                // console.log(res.data)
                                this.createList.push(res.data)
                            })
                        }
                    })
                })
            })
        },
        // 确定添加重复创意
        comfirnAdd(){
            api.addCreate(this.fileFormData).then(res=>{
                // console.log(res)
                this.createList.push(res.data)
                this.showTipDialog = false
            }) 
        },
        // 删除创意
        delCreate(item,index){
            api.delCreate(item.id).then(()=>{
                this.createList.splice(index,1)
            })
        },
        // 退出登录
        logout(){
            this.$confirm('确认退出?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                _store.clear()
                this.$router.replace({
                    name: 'login'
                })
            })
        },
        // 上传文件
        uploadFile(){
            // if(this.belongValue===1&&(!this.pipelineId)){
            //     this.$message({
            //         message: '请选择流水线',
            //         type: 'error',
            //         duration: 3000
            //     })
            //     return;
            // }else 
            if(this.createList.length<=0){
                this.$message({
                    message: '请添加创意',
                    type: 'error',
                    duration: 3000
                })
                return;
            }
            this.loadingShow = true
            this.loadingPercent = 0
            let allLength = 0
            let factoryIdList = []
            this.createList.forEach(item=>{
                allLength = allLength + item.materialPathVo.length
                factoryIdList.push(item.id)
            })
            let _this = this
            let uploadIndex = 0
            this.createList.forEach(item=>{
                item.materialPathVo.forEach(sItem=>{
                    fs.readFile(sItem.path,(err,data)=>{
                        if(err){
                            if(sItem.mediaType==3){
                                // _this.$message({
                                //     message: '字体文件不存在',
                                //     type: 'warning',
                                //     duration: 3000
                                // })
                            }else{
                                 _this.$message({
                                    message: '文件不存在',
                                    type: 'error',
                                    duration: 3000
                                })
                                _this.loadingStep = 1
                                _this.loadingShow = false
                                _this.loadingPercent = 0
                                return;
                            }
                        }
                        let blob = new Blob([new Int8Array(data)])
                        const uploadFormData = new FormData();
                        uploadFormData.append("file", blob);
                        uploadFormData.append("ids", sItem.ids.join(','));
                        uploadFormData.append("mediaTypes",sItem.mediaTypes.join(','))
                        api.uploadFile(uploadFormData).then(()=>{
                            uploadIndex = uploadIndex +1
                            this.loadingPercent = Math.round((uploadIndex/allLength).toFixed(2)*100)
                            if(this.loadingPercent==100){
                                factoryIdList.forEach(item=>{
                                    api.isFiniteWebsdkAdd({factoryId:item}).then(()=>{})
                                })
                                setTimeout(() => {
                                    // this.loadingShow = false
                                    this.loadingStep = 2
                                    this.loadingPercent = 0
                                }, 1000);
                            }
                        }).catch(()=>{
                            _this.loadingStep = 1
                            _this.loadingPercent = 0
                            _this.loadingShow = false
                        })
                    })
                })
            })
        },
        // 成功返回
        successBack(){
            this.loadingShow = false
            this.loadingStep = 2
            this.reload()
        },
        // 获取品牌列表
        getBrandList(){
            // if(!_store.get('brandInfo')){
            //     api.getBrandList().then(res=>{
            //         // console.log(res)
            //         this.brandList = res.data
            //         _store.set('brandInfo', res.data[0]);
            //         this.selectedBrand = res.data[0]
            //         this.selectedBrandId = this.selectedBrand.brandId
            //         this.getBrandUser(this.selectedBrand)
            //     })
            // }else{
            //     api.getBrandList().then(res=>{
            //         // console.log(res)
            //         this.brandList = res.data
            //         this.selectedBrand = _store.get('brandInfo')
            //         this.selectedBrandId = this.selectedBrand.brandId
            //         this.getBrandUser(this.selectedBrand)
            //     })
            // }
          this.brandList = _store.get('userInfo.loginBrandVos')
          this.selectedBrandId = _store.get('USERBRANDID')
          this.userName= _store.get('USERNAME')
        },
        // 获取品牌登录信息
        getBrandUser(item){
            let _this = this
            let data = {
                brandId: item.brandId,
                compannyCode: item.companyCode,
                loginType: 2
            }
            api.selectBrand(data).then(res=>{
                // console.log(res)
                _this.userName = res.data.userBrandName
            })
        },
        // 
        showBrand(){
            if(!this.loadingShow){
                this.isChangeBrand = !this.isChangeBrand
            }
        },
        // 
        changeBrand(){
          let userId = ''
            this.brandList.forEach(item=>{
                if(item.brandId===this.selectedBrandId){
                  userId = item.userId
                }
            })
          const param={
            brandId: this.selectedBrandId,
            loginType: 2,
            userId: userId   // userId都一样
          }
          api.loginAccount(param).then(res=>{
            console.log(res)
            // 过滤品牌
            this.brandList.forEach(item=>{
                if(item.brandId===this.selectedBrandId){
                    _store.set('brandInfo', item);
                    this.selectedBrand = item
                    this.getBrandUser(this.selectedBrand)
                }
            })
          }).catch(res=>{
            this.$message.error(res.msg)
          })
        }
    },
    mounted(){
        const os = require ('os');
        
        if(process.platform=='win32'){
            this.jsonUrl = os.homedir+'\\AppData\\Local\\JianyingPro\\User Data\\Projects\\com.lveditor.draft'
        }else if(process.platform=='darwin'){
            this.jsonUrl = os.homedir+'/library/containers/com.lemon.lvpro/data/movies/jianyingpro/user data/projects/com.lveditor.draft'
        }
        var packageA = require("../../../package.json")
        this.version = packageA.version
        // console.log(packageA.version)
        this.getBrandList()
    }
}
</script>
<style lang="less" scoped>
    @import './home.less';
</style>