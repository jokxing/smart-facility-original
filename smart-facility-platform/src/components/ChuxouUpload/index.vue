<template>
    <div>
        <div v-if="dir === 'image'">
            <el-upload
                :accept="accept"
                :action="httpRequest"
                :before-upload="beforeAvatarUpload"
                :data="ossData"
                :file-list="fileList"
                :limit="limit"
                :disabled="disabled"
                :on-exceed="handleExceed"
                :on-preview="handlePictureCardPreview"
                :on-remove="handleRemove"
                :on-success="handleSuccess"
                :on-change="handleChange"
                class="avatar-uploader editor-slide-upload"
                :class="{'hide': hide,}"
                list-type="picture-card">
                <i class="icon-addto"></i>
            </el-upload>

            <el-dialog :visible.sync="dialogVisible">
                <img :src="dialogImageUrl" :alt="$t('labDevice.notImg')" width="100%" />
            </el-dialog>

            <div v-show="acceptTips" :class="disabled ? 'cursor-noe' : 'cursor'">
                {{ acceptTips }}
            </div>
        </div>
        <div v-else>
            <el-upload
                class="enclosure"
                :action="httpRequest"
                :accept="accept"
                :disabled="disabled"
                :before-upload="beforeAvatarUpload"
                :data="ossData"
                :limit="limit"
                :on-exceed="handleExceed"
                :on-success="handleSuccess"
                :on-remove="handleRemove"
                :file-list="fileList">
                <el-button size="small" :disabled="disabled" :class="{'hide': hide}" type="primary">{{$t('common.chilckUp')}}</el-button>
                <div v-show="acceptTips"  :class="disabled ? 'cursor-noe' : 'cursor'">
                    {{ acceptTips }}
                </div>
            </el-upload>
        </div>
    </div>
</template>

<script>
    const UPLOAD_UNAVAILABLE_HINT = "文件上传未接入本副本，当前不可用。";

    export default {
        name: "chuxouUpload",
        props: {
            // 规定上传文件
            accept: {
                type: String,
                default: "image/png,image/jpeg",
            },
            // 一次允许上传的最大数
            limit: {
                type: Number,
                default: 5,
            },
            // 指定上传的的文件夹
            dir: {
                type: String,
                default: "image",
            },
            // 是否是oss服务器
            useOss: {
                type: Boolean,
                default: true,
            },
            // 是否显示提示
            acceptTips: {
                type: String,
                default: "",
            },
            // 预览数据
            value: {
                type: Array,
                required: true,
            },
            /***** 文件最大值 *****/
            max: {
                type: Number,
                default: 4,
            },
            disabled: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                dialogVisible: false,
                dialogImageUrl: "",
                // No hardcoded external upload host; action stays empty until a local demo upload is wired.
                httpRequest: "",
                ossData: {
                    policy: "",
                    signature: "",
                    OSSAccessKeyId: "",
                    dir: "",
                    host: "",
                    callback: "",
                    key: "",
                },
                hide: false,
            };
        },
        computed: {
            fileList() {
                const fileList = [];
                if (this.value.length > 0) {
                    for (let i = 0; i < this.value.length; i++) {
                        fileList.push(this.value[i]);
                    }
                  this.hide = fileList.length = this.limit;
                }
                return fileList;
            },
        },
        methods: {
            handleChange(file, fileList) {
                this.hide = fileList.length = this.limit;
            },
            handlePictureCardPreview(file) {
                this.dialogVisible = true;
                this.dialogImageUrl = file.url;
            },
            handleRemove(file, fileList) {
                let indexFlag = null;
                this.fileList.map((item, index) => {
                    if (item.uid === file.uid) {
                    indexFlag = index;
                    } else {
                    indexFlag = null;
                    }
                });
                if (indexFlag !== null) {
                    this.fileList.splice(indexFlag, 1);
                }
                this.handleReturnUrl(fileList);
            },
            handleReturnUrl(fileList) {
                let array = [];
                for (let i = 0; i < fileList.length; i++) {
                    array.push({
                    name: fileList[i].name,
                    uid: fileList[i].uid.toString(),
                    url: fileList[i].url,
                    });
                }
                this.hide = false;
                this.$emit("handleUploadSuccess", array);
            },
            handleSuccess(res, file) {
                // Upload is not wired; never treat an empty/local failure as success.
                this.$message.warning(UPLOAD_UNAVAILABLE_HINT);
            },
            beforeAvatarUpload(file) {
                this.$message.warning(UPLOAD_UNAVAILABLE_HINT);
                return false;
            },
            handleExceed(files, fileList) {
                if(this.dir === 'image'){
                    this.$message.warning(this.$t('labDevice.updatedLength1') + this.limit + this.$t('labDevice.updatedLength2'));
                }else{
                    this.$message.warning(this.$t('labDevice.updatedLength1') + this.limit + this.$t('labDevice.updatedLength3'));
                }
            },
        },
    };
</script>

<style lang="less" scoped>
    /deep/ .avatar-uploader .el-upload {
        border: 1px dashed #d9d9d9;
        border-radius: 6px;
        cursor: pointer;
        position: relative;
        overflow: hidden;
    }

    /deep/ .enclosure .el-upload{
        display: flex;
        flex-wrap: wrap;
        .el-button{
            margin-right: 10px;
        }
    }

    /deep/ .avatar-uploader .el-upload:hover {
        border-color: #409eff;
    }

    /deep/ .avatar-uploader-icon {
        font-size: 28px;
        color: #8c939d;
        width: 178px;
        height: 178px;
        line-height: 178px;
        text-align: center;
    }

    /deep/ .avatar {
        width: 178px;
        height: 178px;
        display: block;
    }

    .editor-slide-upload {
        ::v-deep .el-upload--picture-card {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 80px;
            height: 80px;
        }
    }
    /deep/ .el-upload-list--picture-card .el-upload-list__item{
        width: 80px;
        height: 80px;
    }
    .hide {
        /deep/ .el-upload {
            display: none;
        }
    }
</style>
