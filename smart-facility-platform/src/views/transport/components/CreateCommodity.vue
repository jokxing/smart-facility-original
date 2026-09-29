<template>
    <el-dialog
        :close-on-click-modal="false"
        append-to-body
        @opened="opened"
        :before-close="handleClose"
        :title="titles[type]"
        :visible.sync="dialogFormVisible">
        <el-form ref="formEl" :model="form" :rules="rules" label-position="left" label-width="auto">
            <el-form-item :label="$t('common.no')" prop="sampleNo">
                <el-input
                    class="select-change-p"
                    v-model.trim="form.sampleNo"
                    :placeholder="$t('common.inputNo')"/>
            </el-form-item>
            <el-form-item :label="$t('transport.commodity')" prop="sampleName">
                <el-input
                    class="select-change-p"
                    v-model.trim="form.sampleName"
                    :placeholder="$t('transport.inputCommodity')"/>
            </el-form-item>
            <el-form-item :label="$t('transport.unit')" prop="unitId">
                <el-select
                    filterable
                    remote
                    :remote-method="remoteUnits"
                    class="select-change-p"
                    v-model="form.unitId"
                    :placeholder="$t('transport.changeUnit')">
                    <el-option label="" :value="null" disabled>{{ $t('common.placeholder') }}</el-option>
                    <el-option
                        v-for="unit in units"
                        :key="unit.id"
                        :label="unit.unitName"
                        :value="unit.id"/>
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('labDevice.specification')">
                <el-input
                    class="select-change-p"
                    v-model.trim="form.specification"
                    :placeholder="$t('common.pleaseInput')"/>
            </el-form-item>
            <el-form-item :label="$t('transport.productionBatch')">
                <el-input
                    class="select-change-p"
                    v-model.trim="form.productionBatch"
                    :placeholder="$t('common.pleaseInput')"/>
            </el-form-item>
            <el-form-item :label="$t('transport.yieldCompany')">
                <el-input
                    class="select-change-p"
                    v-model.trim="form.productionCompany"
                    :placeholder="$t('common.pleaseInput')"/>
            </el-form-item>
            <el-form-item :label="$t('common.remark')">
                <el-input
                    class="select-change-p"
                    type="textarea"
                    v-model.trim="form.comment"
                    :placeholder="$t('common.pleaseInput')"/>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button
                :disabled="buttonLoading"
                @click="handleClose">{{ $t('common.cancel') }}</el-button>
            <el-button
                :disabled="buttonLoading"
                :loading="buttonLoading"
                type="primary"
                @click="handleSubmit">{{ $t('common.confirm') }}
            </el-button>
        </div>
    </el-dialog>
</template>

<script>

import {createSampleInfo, getAllCommonUnitList, updateSampleInfo} from "@/api/transport";
import {throttle} from "@/utils/methods";
const defaultForm = () => ({
    sampleNo: '',
    sampleName: '',
    unitId: null,
    specification: '',
    productionBatch: '',
    comment: '',
    productionCompany: '',
});
export default {
    name: "CreateCommodity",
    emits:['created','updated'],
    data() {
        const _this = this;
        return {
            dialogFormVisible: false,
            titles: [ _this.$t('transport.addCommodity'), _this.$t('transport.editCommodity')],
            type: 0,
            units: [],
            searchUnitKey: '',
            form: defaultForm(),
            rules:{
                sampleNo:[
                    {required:true, message:_this.$t('common.inputNo'), trigger:'blur' }
                ],
                sampleName:[
                    {required:true, message:_this.$t('transport.inputCommodity'), trigger:'blur' }
                ],
                unitId:[
                    {required:true, message:_this.$t('transport.changeUnit'), trigger:'blur' }
                ],
            },
            buttonLoading:false,
        }
    },
    methods: {
        handleClose() {
            this.dialogFormVisible = false;
            this.$refs.formEl.resetFields();
        },
        /**
         *
         * @param type 0：新增，1：编辑
         * @param form
         */
        open(type, form) {
            this.type = type;
            if (type === 1) {
                this.form = {...form};
            } else {
                this.form = defaultForm();
            }
            this.getUnits();
            this.dialogFormVisible = true;
        },
        opened(){
            if(this.type===1) {
                this.$refs.formEl.validate();
            }
        },
        remoteUnits(key) {
            this.searchUnitKey = key;
            this.getUnits();
        },
        getUnits() {
            let that = this;
            that.getUnits = throttle(() => {
                that.getUnits_();
            }, 1000);
            that.getUnits();
        },
        getUnits_() {
            getAllCommonUnitList({key: this.searchUnitKey}).then(res => {
                if (res.code) {
                    this.units = res.items;
                }else{
                    this.$message.error(res.message);
                }
            })
        },
        handleSubmit() {
            this.$refs.formEl.validate(ok=>{
                if(ok){
                    this.buttonLoading = true;
                    if (this.type === 1) {
                        this.updateData();
                    } else {
                        this.createData();
                    }
                }else {
                }
            })

        },
        updateData() {
            updateSampleInfo(this.form).then(res=>{
                if(res.code){
                    this.$message.success(this.$t('labDevice.editSuccess'));
                    this.handleClose();
                    this.$emit('updated');
                }else {
                    this.$message.error(res.message);
                }
            }).catch(res=>{
                this.$message.error(res.message);
            }).finally(()=>{
                this.buttonLoading = false;
            })
        },
        createData() {
            createSampleInfo(this.form).then(res=>{
                if(res.code){
                    this.$message.success(this.$t('common.addSuccess'));
                    this.handleClose();
                    this.$emit('created');
                }else {
                    this.$message.error(res.message);
                }
            }).catch(res=>{
                this.$message.error(res.message);
            }).finally(()=>{
                this.buttonLoading = false;
            })
        },
    }
}
</script>

<style scoped>

</style>
