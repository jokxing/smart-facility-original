<template>
    <el-dialog
            :close-on-click-modal="false"
            :title="title"
            :visible.sync="dialogVisible"
            :before-close="handleClose"
            append-to-body>
        <el-form :model="form" :rules="rules" ref="ruleForm" label-position="left" label-width="auto">
            <el-form-item :label="$t('common.no')" prop="modelNo">
                <el-input
                        v-model.trim="form.modelNo"
                        maxlength="10"
                        class="select-change-p"
                        :placeholoder="$t('common.pleaseInput')"/>
            </el-form-item>
            <el-form-item :label="$t('transport.modelName1')" prop="modelName">
                <el-input
                        v-model.trim="form.modelName"
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
        addCommonModel,
        updateCommonModel
    } from "@/api/transport";

    export default {
        name: "CreateCarModel",
        components: {},
        emits:['handle'],
        data() {
            const _this = this;
            return {
                title: _this.$t('transport.addModelName'),
                dialogVisible: false,
                loading: false,
                form: {
                    modelNo: "",
                    modelName: ""
                },
                type: 0,
                rules: {
                    modelNo: [
                        {required: true, message: _this.$t('common.inputNo'), trigger: 'blur'},
                        {min: 1, max: 10, message: _this.$t('transport.inputNoRule'), trigger: 'blur'}
                    ],
                    modelName: [
                        {required: true, message: _this.$t('common.inputName'), trigger: 'blur'},
                        {min: 1, max: 20, message: _this.$t('transport.inputNameRule'), trigger: 'blur'}
                    ]
                }
            }
        },
        methods: {
            handleClose() {
                this.dialogVisible = false;
                this.$refs.ruleForm.resetFields();
                this.form = {
                    modelNo: "",
                    modelName: ""
                };
            },
            open(type, row) {
                if (type) {
                    this.title = this.$t('transport.editModelName');
                    let {id, modelNo, modelName} = row;
                    this.form = {
                        id,
                        modelNo,
                        modelName
                    }
                } else {
                    this.title = this.$t('transport.addModelName');
                }
                this.type = type;
                this.dialogVisible = true;
            },
            handleSubmit() {
                this.$refs.ruleForm.validate((valid) => {
                    if (valid) {
                        this.loading = true;
                        if (this.type) {
                            updateCommonModel(this.form).then(res => {
                                this.handleMessage(res);
                            }).catch(() => {
                                this.loading = false;
                            })
                        } else {
                            addCommonModel(this.form).then(res => {
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

