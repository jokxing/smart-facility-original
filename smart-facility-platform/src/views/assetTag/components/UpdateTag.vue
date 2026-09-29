<template>
    <el-dialog
        :title="title"
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
                    class="select-change"
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
    import { postLabelSave, getDeviceGatewayList, postLabelEdit } from "@/api/assetTag";
    export default {
        components: {
            SubmitForm
        },
        data() {
            const _this = this;
            return {
                title: _this.$t('common.add1'),
                loading: false,
                dialogVisible: false,
                form: {
                    remark: "",
                    labelNo: "",
                    gatewayId: null
                },
                formData: [
                    {
                        label: _this.$t('hardware.labelNo'),
                        prop: "labelNo",
                        type: "text",
                        isRequired: true,
                        disabled: false,
                        placeholder: _this.$t('hardware.inputAssetTagNo'),
                    },
                    {
                        label: _this.$t('hardware.selectassetGateway'),
                        prop: "gatewayId",
                        type: "slot",
                        // options: [],
                        // optionObj: {
                        //     label: "name",
                        //     value: "id"
                        // },
                        isRequired: true,
                        // placeholder: "请选择网关",
                    },
                    {
                        label: _this.$t('common.remark'),
                        prop: "remark",
                        type: "textarea",
                    },
                ],
                type: 1,
                options: []
            }
        },
        methods: {
            open(index, row) {
                // 1新增，2编辑
                this.dialogVisible = true;
                this.type = index;
                this.title = index === 1 ? this.$t('common.add1') : this.$t('common.edit');
                this.formData[0].disabled = this.type === 1 ? false : true;
                if(index === 2){
                    this.form.labelNo = row.labelNo;
                    this.form.remark = row.remark;
                    this.form.gatewayId = row.propertyGateId;
                    this.form['labelId'] = row.id
                }

                // 获取网关
                getDeviceGatewayList().then(res => {
                    if(res.code === 1){
                        this.options = res.items
                    }
                })
            },
            handleSubmit() {
                if(!this.form.labelNo){
                    return this.$message.error(this.$t('hardware.isNotAssetTagNo'))
                }
                if(!this.form.gatewayId){
                    return this.$message.error(this.$t('hardware.selectassetGateway'))
                }
                if(!this.form.remark){
                    this.form.remark = null
                }
                this.loading = true;
                if(this.type === 1){
                    postLabelSave(this.form).then(res => {
                        this.handleMessage(res)
                    })
                }else{
                    postLabelEdit(this.form).then(res => {
                        this.handleMessage(res)
                    })
                }
            },
            handleMessage(res){
                this.loading = false;
                if(res.code){
                    if(res.code === 1){
                        this.$message.success(this.type === 1 ? this.$t('common.addSuccess') : this.$t('common.editSuccess'));
                        this.dialogVisible = false;
                        this.$emit('handleInit')
                    }else{
                        this.$message.error(res.message)
                    }
                }else{
                    this.$message.error(res.message)
                }
            },
            handleCancel() {
                this.dialogVisible = false;
                this.form = {
                    labelNo: "",
                    gatewayId: null,
                    remark: "",
                },
                this.$refs.SubmitForm.$refs.form.resetFields();
            }
        },
    }
</script>