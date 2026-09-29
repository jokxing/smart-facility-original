<template>
    <el-dialog
        :before-close="handleClose"
        :close-on-click-modal="false"
        :title="$t('labDevice.checkInterval')"
        :visible.sync="dialogVisible"
        append-to-body
        destroy-on-close
        width="434px">
        <el-form label-width="auto" label-position="left">
            <el-form-item :label="$t('labDevice.checkInterval') + '：'">
                12 {{ $t('labDevice.host') }}   *
                <el-input-number 
                    v-model="interval" 
                    size="small" 
                    :min="1" 
                    :max="10" 
                    @change="handleChange">
                </el-input-number>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button :disabled="btnLoading" @click="handleClose">{{ $t('common.cancel') }}</el-button>
            <el-button  type="primary" :loading="btnLoading" @click="handleSubmit">{{ $t('common.confirm') }}</el-button>
        </span>
    </el-dialog>
</template>

<script>
    import { getPropertyInventoryIntervalSet } from "@/api/property"
    export default {
        data() {
            return {
                dialogVisible: false,
                btnLoading: false,
                interval: ""
            }
        },
        methods: {
            open(item){
                this.dialogVisible = true;
                this.interval = item;
            },
            handleChange() {

            },
            handleClose() {
                this.dialogVisible = false
            },
            handleSubmit() {
                this.btnLoading = true;
                getPropertyInventoryIntervalSet({interval: this.interval}).then(res => {
                    this.btnLoading = false;
                    if(res.code){
                        if(res.code === 1){
                            this.$message.success(this.$t('labDevice.checkSetSuccess'));
                            this.handleClose();
                            this.$emit('handle')
                        }else{
                            this.$message.error(res.message)
                        }
                    }else{
                        this.$message.error(res.message)
                    }
                })
            }
        },
    }
</script>

<style lang="less" scoped>
    /deep/ .el-input-number{
        .el-input__inner{
            border: 1px solid #C0C4CC!important;
        }
    }
</style>