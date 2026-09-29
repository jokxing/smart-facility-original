<template>
    <el-dialog
            :close-on-click-modal="false"
            :title="title"
            :visible.sync="dialogVisible"
            :before-close="handleClose"
            append-to-body>
        <el-form :model="form" :rules="rules" ref="ruleForm" label-position="left" label-width="auto">
            <el-form-item :label="$t('transport.unitNo')" prop="brandNo">
                <el-input
                        v-model.trim="form.brandNo"
                        maxlength="10"
                        class="select-change-p"
                        :placeholoder="$t('common.pleaseInput')"/>
            </el-form-item>
            <el-form-item :label="$t('transport.unitName')" prop="brandName">
                <el-input
                        v-model.trim="form.brandName"
                        maxlength="20"
                        class="select-change-p"
                        :placeholoder="$t('common.pleaseInput')"/>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button :disabled="loading" @click="handleClose">{{ $t('common.cancel') }}</el-button>
            <el-button :loading="loading" :disabled="loading" type="primary" @click="handleSubmit()">{{ $t('common.confirm') }}</el-button>
        </span>
    </el-dialog>
</template>

<script>
    import {
        addCommonBrand,
        updateCommonBrand
    } from "@/api/transport";

    export default {
        name: "CreateCarBrand",
        components: {},
        emits:['handle'],
        data() {
            const _this = this;
            return {
                title: _this.$t('transport.addBrandName'),
                dialogVisible: false,
                loading: false,
                form: {
                    id: null,
                    brandNo: "",
                    brandName: ""
                },
                type: 0,
                rules: {
                    brandNo: [
                        {required: true, message: _this.$t('common.inputNo'), trigger: 'blur'},
                        {min: 1, max: 10, message: _this.$t('transport.inputNoRule'), trigger: 'blur'}
                    ],
                    brandName: [
                        {required: true, message: _this.$t('common.inputName'), trigger: 'blur'},
                        {min: 1, max: 20, message: _this.$t('transport.inputNameRule'), trigger: 'blur'}
                    ]
                },

            }
        },
        methods: {
            handleClose() {
                this.dialogVisible = false;
                this.$refs.ruleForm.resetFields();
                this.form = {
                    brandNo: "",
                    brandName: ""
                };
            },
            open(type, row) {
                if (type) {
                    this.title = this.$t('transport.editBrandName');
                    let {id, brandNo, brandName} = row;
                    this.form = {
                        id,
                        brandNo,
                        brandName
                    }
                } else {
                    this.title = this.$t('transport.addBrandName');
                }
                this.type = type;
                this.dialogVisible = true;
            },
            handleSubmit() {
                this.$refs.ruleForm.validate((valid) => {
                    if (valid) {
                        this.loading = true;
                        if (this.type) {
                            updateCommonBrand(this.form).then(res => {
                                this.handleMessage(res);
                            }).catch(() => {
                                this.loading = false;
                            })
                        } else {
                            addCommonBrand(this.form).then(res => {
                                this.handleMessage(res);
                            }).catch(() => {
                                this.loading = false;
                            })
                        }
                    } else {
                        this.$message.error(this.$t('transport.inputCorrect'));
                        return false;
                    }
                });
            },
            handleMessage(res) {
                this.loading = false;
                if (res.code) {
                    this.$message.success(this.title + this.$t('common.success'));
                    this.$emit("handle",this.type);
                    this.handleClose();
                } else {
                    this.$message.error(res.message);
                }
            }
        }
    }
</script>

