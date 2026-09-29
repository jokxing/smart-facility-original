<template>
    <el-dialog
        :before-close="handleModalClose"
        :close-on-click-modal="false"
        :title="$t('labDevice.notScanHint')"
        :visible.sync="dialogVisible"
        append-to-body
        class="gun-voiceReminder-set"
        destroy-on-close>
        <el-form label-width="80px" v-loading="loading">
            <el-form-item :label="$t('labDevice.gunRack')" v-if="type !== 1">
                <div class="select-people">
                    <el-tag
                        v-for="tag in selectArr"
                        :key="tag.id"
                        type="info"
                        closable
                        @close="handleCloseTag(tag)">
                        {{ tag.name }}
                    </el-tag>
                </div>
            </el-form-item>
            <el-form-item :label="$t('labDevice.voiceNum')">
                <el-select class="select-change" v-model="voiceNum">
                    <el-option
                        v-for="v in BROADCAST"
                        :key="v.num"
                        :label="v.name"
                        :value="v.num">
                        
                    </el-option>
                </el-select>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button :disabled="loading" @click="handleModalClose">{{ $t('common.cancel') }}</el-button>
            <el-button type="primary" :loading="loading" @click="handleSubmit">{{ $t('common.confirm') }}</el-button>
        </span>
    </el-dialog>
</template>

<script>
    import { BROADCAST } from "@/utils/constant";
    import { postDeviceOpenGunRemind } from "@/api/device";
    export default {
        props: {
            selectArr: {
                type: Array,
                default: []
            },
            // 1单个
            type: {
                type: Number,
                default: null
            },
        },
        data() {
            return {
                BROADCAST,
                dialogVisible: false,
                loading: false,
                voiceNum: 1
            }
        },
        methods: {
            open(detail) {
                this.dialogVisible = true;
                if(this.type === 1){
                    this.voiceNum = detail.broadcastNum
                }
            },
            handleCloseTag(tag) {
                for (let i = 0; i < this.selectArr.length; i++) {
                    if (this.selectArr[i].id === tag.id) {
                        this.selectArr.splice(i, 1)
                    }
                }
            },
            handleSubmit() {
                var data = [];
                for(var i = 0; i < this.selectArr.length; i++){
                    data.push({no: this.selectArr[i].no, voiceNum: this.voiceNum})
                }
                this.loading = true;
                postDeviceOpenGunRemind(data).then(res => {
                    this.loading = false;
                    if(res.code){
                        if(res.code === 1){
                            this.$message.success(this.$t('hardware.systemSuccess'));
                            this.dialogVisible = false;
                            this.$emit('handle')
                        }else{
                            this.$message.error(res.message)
                        }
                    }else{
                        this.$message.error(res.message)
                    }
                }).catch(err => {
                    this.$message.error(this.$t('hardware.systemError'));
                })
            },
            handleModalClose() {
                this.dialogVisible = false;
            }
        },
    }
</script>

<style lang="less" scoped>
    .gun-voiceReminder-set{
        .select-people {
            width: 380px;
            min-height: 40px;
            background-color: #F4F4F9;
            border-radius: 4px;
            padding-top: 2px;
            padding-right: 40px;
            position: relative;
            cursor: pointer;

            .el-tag {
                margin-left: 10px;
                background-color: #fff;
            }

            i {
                position: absolute;
                top: 50%;
                right: 10px;
                transform: translateY(-50%);
            }
        }
    }
</style>