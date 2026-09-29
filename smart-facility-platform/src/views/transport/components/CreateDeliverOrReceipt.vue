<template>
    <el-dialog
        :close-on-click-modal="false"
        append-to-body
        @opened="opened"
        :before-close="handleClose"
        :title="title"
        :visible.sync="dialogFormVisible">
        <el-form :model="form" ref="formEl" :rules="rules" label-position="left" label-width="auto">
            <el-form-item :label="$t('transport.unitNo')" prop="receiptDeliverNo">
                <el-input
                    class="select-change-p"
                    v-model.trim="form.receiptDeliverNo"
                    maxlength="20"
                    oninput="value=value.replace(/[^A-Za-z0-9]/g, '')"
                    :placeholder="$t('common.inputNo')"/>
            </el-form-item>

            <el-form-item :label="$t('transport.unitName')" prop="receiptDeliverName">
                <el-input
                    class="select-change-p"
                    maxlength="50"
                    v-model.trim="form.receiptDeliverName"
                    :placeholder="$t('common.inputName')"/>
            </el-form-item>
            <el-form-item :label="$t('transport.unitAddress')" prop="address">
                <el-input
                    class="select-change-p"
                    v-model.trim="form.address"
                    maxlength="50"
                    :placeholder="$t('common.pleaseInput')"/>
            </el-form-item>
            <el-form-item :label="type ? $t('transport.consignee') : $t('transport.consigner')" prop="receiptDeliverUserName">
                <el-input
                    class="select-change-p"
                    maxlength="20"
                    v-model.trim="form.receiptDeliverUserName"
                    :placeholder="$t('common.pleaseInput')"/>
            </el-form-item>

            <el-form-item :label="$t('system.phone')" prop="tel">
                <el-input
                    class="select-change-p"
                    v-model.number.trim="form.tel"
                    oninput="value=value.replace(/[^0-9]/g, '')"
                    maxlength="11"
                    :placeholder="$t('common.pleaseInput')"/>
            </el-form-item>
            <el-form-item :label="$t('common.remark')" prop="comment">
                <el-input
                    class="select-change-p"
                    type="textarea"
                    maxlength="200"
                    v-model.trim="form.comment"
                    :placeholder="$t('common.pleaseInput')"/>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button :disabled="submitDisable" @click="handleClose">{{ $t('common.cancel') }}</el-button>
            <el-button
                :disabled="submitDisable"
                :loading="submitDisable"
                type="primary"
                @click="handelSubmit">
                {{ $t('common.confirm') }}
            </el-button>
        </div>
    </el-dialog>
</template>

<script>

import {
    addReceiptDeliverAddress,
    updateReceiptDeliverAddress
} from "@/api/transport";
import {PHONEREGEXP} from "@/utils/regExp";

function defaultForm(type) {
    return {
        address: '',
        comment: '',
        id: null,
        receiptDeliverName: '',
        receiptDeliverNo: '',
        receiptDeliverUserName: '',
        tel: '',
        types: type,
    }
}

export default {
    name: "CreateDeliverAndReceipt",
    data() {
        return {
            dialogFormVisible: false,
            type: 0,
            model: 0,
            form: {},
            submitDisable: false,
            title: ""
        }
    },
    computed: {
        rules() {
            const _this = this;
            return {
                receiptDeliverNo: [
                    {required: true, message: _this.$t('common.isNotNo'), trigger: 'blur'}
                ],
                receiptDeliverName: [
                    {required: true, message: _this.$t('common.isNotName'), trigger: 'blur'}
                ],
                tel: [
                    {required: true, message: _this.$t('system.inputLinkMan'), trigger: 'blur'},
                    {pattern: PHONEREGEXP, message: _this.$t('system.telRule'), trigger: 'blur'},
                ],
                address: [
                    {required: true, message: _this.$t('transport.unitAddressNot'), trigger: 'blur'}
                ],
                receiptDeliverUserName: [
                    {required: true, message: this.type ? _this.$t('transport.notConsignee') : _this.$t('transport.notConsigner'), trigger: 'blur'}
                ],
            }
        }
    },
    methods: {
        /**
         *
         * @param type 0: 发货， 1: 收货
         * @param model 0: 新增； 1: 编辑
         * @param formData
         */
        open(type, model, formData) {
            this.type = type;
            this.model = model;
            if (type === 1) {
                this.title = this.model ? this.$t('transport.editReceiving') : this.$t('transport.addReceiving');
            } else {
                this.title = this.model ? this.$t('transport.editShipping') : this.$t('transport.addShipping');
            }
            if (model === 1) {
                this.form = {...formData};
            } else {
                this.form = defaultForm(type);
            }
            this.dialogFormVisible = true;
        },
        opened() {
            if (this.model === 1) {
                this.$refs.formEl.validate();
            }
        },
        handelSubmit() {
            this.$refs.formEl.validate((valid) => {
                if (valid) {
                    this.submitDisable = true;
                    if (this.model) {
                        this.updataData();
                    } else {
                        this.createData();
                    }
                } else {
                    this.$message.error(this.$t('transport.inputCorrect'));
                    return false;
                }
            });
        },
        handleClose() {
            this.dialogFormVisible = false;
            this.$refs.formEl.resetFields();
        },

        updataData() {
            updateReceiptDeliverAddress(this.form).then(res => {
                if (res.code) {
                    this.$message.success(this.$t('labDevice.editSuccess'));
                    this.handleClose();
                    this.$emit('updated');
                }
            }).catch(res => {
                this.$message.error(res.message);
            }).finally(() => {
                this.submitDisable = false;
            });
        },
        createData() {
            addReceiptDeliverAddress(this.form).then(res => {
                if (res.code) {
                    this.$message.success(this.$t('common.addSuccess'));
                    this.handleClose();
                    this.$emit('created');
                }
            }).catch(res => {
                this.$message.error(res.message);
            }).finally(() => {
                this.submitDisable = false;
            });
        },
    }
}
</script>

<style scoped>

</style>