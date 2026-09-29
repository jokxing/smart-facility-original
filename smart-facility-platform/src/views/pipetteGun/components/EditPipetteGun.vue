<template>
    <el-dialog
        :title="$t('common.edit')"
        :visible.sync="dialogVisible"
        :close-on-click-modal="false"
        destroy-on-close
        append-to-body
        width="28%"
        custom-class="pipetteGun-dialog"
        @close="$refs.ruleForm.resetFields()">
        <el-form :model="ruleForm" label-width="auto" label-position="left" ref="ruleForm" class="demo-ruleForm">
            <el-form-item :label="$t('common.name')" required v-if="!isBatch">
                <el-input class="select-change-p" v-model="ruleForm.name" :placeholder="$t('common.inputName')"></el-input>
            </el-form-item>
            <el-form-item :label="$t('common.owningDepartment')" required>
                <SelectDepartment
                    class="select-change-p"
                    :departmentId.sync="ruleForm.departmentId"
                    :is-company="true"
                    :select-tree-value.sync="selectTreeValue"/>
            </el-form-item>
            <el-form-item :label="$t('common.remark')" v-if="!isBatch">
                <el-input class="select-change-p" v-model="ruleForm.remark" :placeholder="$t('common.inputRemark')"></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="cancel('ruleForm')">{{ $t('common.cancel') }}</el-button>
            <el-button type="primary" :loading="loading" @click="submitForm">{{ $t('common.confirm') }}</el-button>
        </span>
    </el-dialog>
</template>

<script>
    import SelectDepartment from "@c/SelectdePartment";
    import { postGunPipetteEdit, postGunPipetteUpdateDepartment } from "@/api/gun";
    export default {
        components: {
            SelectDepartment
        },
        data() {
            return {
                isBatch: false,
                loading: false,
                dialogVisible: false,
                ruleForm: {
                    name: '',
                    departmentId: "",
                    gunId: "",
                    remark: ""
                },
                ids: [],
                selectTreeValue: ""
            }
        },
        methods: {
            open(item, type) {
                this.isBatch = type;
                if(!this.isBatch){
                    this.selectTreeValue = item.departmentId = item.departmentId.toString() || null;
                    this.ruleForm.name = item.name;
                    this.ruleForm.departmentId = item.departmentId;
                    this.ruleForm.gunId = item.pipetteGunId;
                    this.ruleForm.remark = item.remark
                }else{
                    this.ids = item;
                    this.selectTreeValue = "";
                    this.ruleForm.departmentId = ""
                }
                this.dialogVisible = true;
            },
            submitForm(formName) {
                if(!this.ruleForm.name && !this.isBatch){
                    return this.$message.error(this.$t('common.isNotName'))
                }
                if(!this.ruleForm.departmentId){
                    return this.$message.error(this.$t('common.isNotDepartment'))
                }
                if(this.isBatch){
                    var data = {
                        departmentId: this.ruleForm.departmentId,
                        gunIdList: this.ids
                    }
                    postGunPipetteUpdateDepartment(data).then(res => {
                        this.handleMessage(res)
                    })
                }else{
                    postGunPipetteEdit(this.ruleForm).then(res => {
                        this.handleMessage(res)
                    })
                }
            },
            handleMessage(res){
                if(res.code){
                    if(res.code === 1){
                        this.$message.success(this.$t('common.editSuccess'));
                        this.cancel();
                        this.$emit("handle")
                    }else{
                        this.$message.error(res.message)
                    }
                }else{
                    this.$message.error(res.message)
                }
            },
            cancel() {
                this.dialogVisible = false;
                this.selectTreeValue = "";
                this.$refs.ruleForm.resetFields();
            }
        },
    }
</script>