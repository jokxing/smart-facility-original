<template>
    <el-dialog
        :before-close="handleModalClose"
        :close-on-click-modal="false"
        :title="$t('common.setPrincipal')"
        :visible.sync="dialogVisible"
        append-to-body
        class="update-modal"
        destroy-on-close>
        <el-form>
            <el-form-item :label="$t('common.principal')">
                <UserCompanySelect @getVal="handleUserId" />
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="handleModalClose">{{ $t('common.cancel') }}</el-button>
            <el-button
                :loading="submitLoading"
                type="primary"
                @click="handleSubmit">
                {{ $t('common.confirm') }}
            </el-button>
        </span>
    </el-dialog>
</template>

<script>
    import UserCompanySelect from "@/components/UserCompanySelect";
    import {postDeviceUser} from "@/api/device"
    export default {
        components:{
            UserCompanySelect
        },
        data() {
            return {
                dialogVisible: false,
                submitLoading: false,
                deviceIdList: [],
                userId: null
            }
        },
        methods: {
            open(ids) {
                this.dialogVisible = true;
                this.deviceIdList = ids;
            },
            handleUserId(id){
                this.userId = id
            },
            handleSubmit() {
                postDeviceUser({
                    deviceIdList: this.deviceIdList,
                    userId: this.userId
                }).then(res => {
                    if(res.code === 1){
                        this.$message.success(this.$t('common.editSuccess'));
                        this.handleModalClose();
                        this.$emit("handle")
                    }
                })
            },
            handleModalClose() {
                this.dialogVisible = false
            }
        },
    }
</script>