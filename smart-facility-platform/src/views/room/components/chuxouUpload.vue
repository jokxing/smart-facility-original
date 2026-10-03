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
import {putDemoMediaFile, isDemoMediaKey, peekDemoMediaUrl} from '@/utils/demoMediaStore';

const UPLOAD_UNAVAILABLE_HINT = "文件上传未接入本副本，当前不可用。";
const isDemo = process.env.VUE_APP_DEMO === 'true';

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
        /** Demo: allow local IndexedDB media (PNG/JPEG). */
        demoLocal: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            dialogVisible: false,
            dialogImageUrl: "",
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
            uploading: false,
        }
    },
    computed: {
        fileList() {
            const fileList = [];
            if (this.value.length > 0) {
                for (let i = 0; i < this.value.length; i++) {
                    const item = {...this.value[i]};
                    if (isDemo && isDemoMediaKey(item.name) && !item.url) {
                        item.url = peekDemoMediaUrl(item.name);
                    }
                    fileList.push(item)
                }
                this.hide = fileList.length >= this.limit;
            } else {
                this.hide = false;
            }
            return fileList;
        }
    },
    methods: {
        handleChange(file, fileList) {
            this.hide = fileList.length >= this.limit;
        },
        handlePictureCardPreview(file) {
            this.dialogVisible = true;
            this.dialogImageUrl = file.url;
        },
        handleRemove(file, fileList) {
            const next = (this.value || []).filter(item => String(item.uid) !== String(file.uid));
            this.hide = next.length >= this.limit;
            this.handleReturnUrl(next);
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
            if (isDemo && this.demoLocal) {
                if (this.uploading) return false;
                this.uploading = true;
                putDemoMediaFile(file).then(stored => {
                    const item = {
                        name: stored.id,
                        uid: String(Date.now()),
                        url: stored.url
                    };
                    const next = (this.value || []).concat([item]).slice(0, this.limit);
                    this.hide = next.length >= this.limit;
                    this.handleReturnUrl(next);
                    this.$message.success('底图已保存到本地。');
                }).catch(err => {
                    this.$message.error((err && err.message) || '底图保存失败。');
                }).finally(() => {
                    this.uploading = false;
                });
                return false;
            }
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
