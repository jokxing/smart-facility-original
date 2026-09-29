<template>
    <div>
        <el-upload
            :accept="accept"
            :action="httpRequest"
            :before-upload="beforeAvatarUpload"
            :data="ossData"
            :file-list="fileList"
            :limit="limit"
            :on-exceed="handleExceed"
            :on-preview="handlePictureCardPreview"
            :on-remove="handleRemove"
            :on-change="handleChange"
            :on-success="handleSuccess"
            :class="{'hide': hide,}"
            class="avatar-uploader editor-slide-upload"
            list-type="picture-card">
            <i class="icon-addto"></i>
        </el-upload>
        <el-dialog :visible.sync="dialogVisible">
            <img :src="dialogImageUrl" alt="" width="440px">
        </el-dialog>
        <div v-show="show">{{ $t('other.updateImport') }} <span class="abnormal">{{ accept }}</span>
            {{ $t('other.updateImportMessage') }} <span class="abnormal">{{ limit }}</span>
            {{ $t('other.updateImportMessage1') }}
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
            default: "image/png,image/jpeg"
        },
        // 一次允许上传的最大数
        limit: {
            type: Number,
            default: 5
        },
        // 指定上传的的文件夹
        dir: {
            type: String,
            default: "image"
        },
        // 是否是oss服务器
        useOss: {
            type: Boolean,
            default: true
        },
        // 是否显示提示
        show: {
            type: Boolean,
            default: true
        },
        // 预览数据
        value: {
            type: Array,
            required: true
        },
        /***** 文件最大值 *****/
        max: {
            type: Number,
            default: 4
        },
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
                key: ""
            },
            hide: false,
        }
    },
    computed: {
        fileList() {
            const fileList = [];
            if (this.value.length > 0) {
                for (let i = 0; i < this.value.length; i++) {
                    fileList.push(this.value[i])
                }
                this.hide = fileList.length = this.limit;
            }
            return fileList;
        }
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
            })
            if (indexFlag !== null) {
                this.fileList.splice(indexFlag, 1)
            }
            this.hide = false;
            this.handleReturnUrl(fileList);
        },
        handleReturnUrl(fileList) {
            let array = [];
            for (let i = 0; i < fileList.length; i++) {
                array.push({name: fileList[i].name, uid: fileList[i].uid.toString(), url: fileList[i].url});
            }
            this.$emit("handleUploadSuccess", array);
        },
        handleSuccess(res, file) {
            this.$message.warning(UPLOAD_UNAVAILABLE_HINT);
        },
        beforeAvatarUpload(file) {
            this.$message.warning(UPLOAD_UNAVAILABLE_HINT);
            return false;
        },
        handleExceed(files, fileList) {
            this.$message.warning(this.$t('labDevice.updatedLength1') + this.limit + this.$t('labDevice.updatedLength2'))
        },
    }
}
</script>

<style lang="less" scoped>
/deep/ .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
}

/deep/ .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
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
    margin-bottom: 20px;

    ::v-deep .el-upload--picture-card {
        display: flex;
        justify-content: center;
        align-items: center;
    }
}

.hide {
    /deep/ .el-upload {
        display: none;
    }
}
</style>
