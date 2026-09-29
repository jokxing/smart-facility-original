<template>
    <el-dialog
        title="修改绑定的网关"
        :visible.sync="dialogVisible"
        :close-on-click-modal="false"
        @close="handleCancel">
        <SubmitForm
            v-if="dialogVisible"
            ref="SubmitForm"
            :formData="formData" 
            :data="form">
            <template>
                <el-select
                    class="select-change-p"
                    v-model="form.gatewayId">
                    <el-option
                        v-for="item in options"
                        :key="item.id"
                        :label="item.name + (item.roomName ? '（' + item.roomName + '）' : '')"
                        :value="item.id">
                    </el-option>
                </el-select>
            </template>
        </SubmitForm>
        <span slot="footer" class="dialog-footer">
            <el-button :disabled="loading" @click="handleCancel">取 消</el-button>
            <el-button type="primary" :loading="loading" @click="handleSubmit">确 定</el-button>
        </span>
    </el-dialog>
</template>

<script>
    import SubmitForm from "@c/SubmitForm/index";
    import { getDeviceGatewayList, postLabelUpdateGateway } from "@/api/assetTag";
    export default {
        components: {
            SubmitForm
        },
        data() {
            return {
                loading: false,
                dialogVisible: false,
                form: {
                    gatewayId: null,
                    labelIdList: []
                },
                formData: [
                    {
                        label: "选择网关",
                        prop: "gatewayId",
                        type: "slot",
                        isRequired: true,
                    },
                ],
                options: []
            }
        },
        methods: {
            open(ids) {
                this.dialogVisible = true;
                this.form.labelIdList = ids

                // 获取网关
                getDeviceGatewayList().then(res => {
                    if(res.code === 1){
                        this.options = res.items
                    }
                })
            },
            handleSubmit() {
                if(!this.form.gatewayId){
                    return this.$message.error("请选择网关")
                }
                this.loading = true;
                postLabelUpdateGateway(this.form).then(res => {
                    this.loading = false;
                    if(res.code === 1){
                        this.$message.success('修改成功');
                        this.dialogVisible = false;
                        this.$emit('handle')
                    }else{
                        this.$message.error(res.message)
                    }
                })
            },
            handleCancel() {
                this.dialogVisible = false;
                this.form = {
                    gatewayId: null,
                },
                this.$refs.SubmitForm.$refs.form.resetFields();
            }
        },
    }
</script>