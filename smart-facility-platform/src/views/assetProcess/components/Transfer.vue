<template>
    <el-dialog
        :before-close="handleClose"
        :close-on-click-modal="false"
        :title="title"
        :visible.sync="dialogVisible"
        append-to-body>
        <el-form v-model="form" label-width="90px">
            <el-form-item v-if="type === 0" :label="$t('labDevice.personOfTransfer')" required>
                <div>
                    <el-tag
                        v-for="tag in tags"
                        :key="tag.id"
                        closable
                        type="info"
                        @close="handleCloseTag(tag)">
                        {{ tag.name }}
                    </el-tag>
                    <el-button
                        v-if="!tags.length"
                        icon="el-icon-plus"
                        class="add-membe"
                        @click="$refs.selectMember.open(JSON.stringify(tags))">
                        {{ $t('labDevice.addMember') }}
                    </el-button>
                </div>
            </el-form-item>
            <el-form-item :label="formLabelName" :required="requireComments">
                <el-input
                    type="textarea"
                    v-model.trim="form.comment"
                    :placeholder="$t('common.inputComment')"></el-input>
            </el-form-item>
            <el-form-item v-if="type === 2 && requireSignature" :label="$t('labDevice.signature')" required>
                <div class="flex">
                    <div class="weima">
                        <img class="er-weima" :src="$BASE64 + img" alt="">
                        <div>
                            {{ $t('labDevice.notSignature') }}
                        </div>
                        <div>{{ $t('labDevice.toWeChat') }}</div>
                    </div>
                    <!--                    <el-button type="text">重签</el-button>-->
                </div>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer" v-if="submitShow">
          <el-button :disabled="disabled" @click="handleClose">{{ $t('common.cancel') }}</el-button>
          <el-button :disabled="disabled" :loading="disabled" type="primary" @click="handleSubmit">{{ $t('common.confirm') }}</el-button>
        </span>
        <SelectMember ref="selectMember" :limit="1" @handle="handleSelectMember"/>
    </el-dialog>
</template>

<script>
import {postActivitiTransferTask, postTerminateTask, postTransferTask} from "@/api/activiti";
import SelectMember from "@c/SelectMember";
import {getActivitiDetailsQRCode} from "../../../api/activiti";

export default {
    name: "Transfer",
    components: {
        SelectMember
    },
    data() {
        return {
            title: "",
            dialogVisible: false,
            form: {
                comment: ""
            },
            formLabelName: "",
            type: 0,
            tags: [],
            disabled: false,
            requireSignature: false,
            requireComments: false,
            img: ""
        }
    },
    computed: {
        submitShow() {
            if (this.type !== 2) {
                return true
            } else {
                return !this.requireSignature
            }
        }
    },
    methods: {
        handleClose() {
            this.dialogVisible = false;
            this.form = {
                comment: ""
            }
        },
        open(type, item) {
            const {processOrderNo, taskId, modelNodeId, expValue, requireComments, requireSignature} = item;
            this.form.processOrderNo = processOrderNo;
            this.form.taskId = taskId;
            this.form.modelNodeId = modelNodeId;
            this.form.expValue = expValue;
            this.dialogVisible = true;
            this.requireSignature = requireSignature;
            this.requireComments = requireComments;
            this.type = type;
            switch (type) {
                case 0:
                    this.title = this.$t('labDevice.turnHold');
                    this.formLabelName = this.$t('labDevice.turnHoldCause');
                    break
                case 1:
                    this.title = this.$t('labDevice.reject');
                    this.formLabelName = this.$t('labDevice.rejectCause');
                    break
                case 2:
                    this.title = this.$t('labDevice.consent');
                    this.formLabelName = this.$t('labDevice.auditOpinion');
                    break
            }
            if (type === 2 && this.requireSignature) {
                this.handleGetQRCode(processOrderNo);
            }
        },
        // 获取二维码
        handleGetQRCode(processOrderNo) {
            getActivitiDetailsQRCode({processOrderNo}).then(res => {
                if (res.code) {
                    this.img = res.items;
                }
            })
        },
        handleSubmit() {
            console.log(this.type)
            switch (this.type) {
                case 0:
                    this.submitTransfer();
                    break;
                case 1:
                    this.submitTerminate();
                    break;
                case 2:
                    this.submitConsent();
                    break;
            }
        },
        // 同意
        submitConsent() {
            if (this.requireComments && !this.form.comment) {
                return this.$message.error("审核意见不能为空");
            }
            this.disabled = true;
            postActivitiTransferTask(this.form).then(res => {
                this.handleMessage(res, this.$t('labDevice.consented'))
            }).catch(e =>{
                this.disabled = false;
            })
        },
        // 转让
        submitTransfer() {
            if (!this.tags.length) {
                return this.$message.error(this.$t('labDevice.changeTurnHold'));
            }
            this.disabled = true;
            this.form['assignee'] = this.tags[0].id;
            postTransferTask(this.form).then(res => {
                this.handleMessage(res, this.$t('labDevice.turnHolded'))
            }).catch(e =>{
                this.disabled = false;
            })
        },
        // 驳回
        submitTerminate() {
            if (!this.form.comment) {
                return this.$message.error(this.$t('labDevice.notTurnHoldCause'));
            }
            this.disabled = true;
            postTerminateTask(this.form).then(res => {
                this.handleMessage(res, this.$t('labDevice.rejected'));
            }).catch(e =>{
                this.disabled = false;
            })
        },
        handleMessage(res, message) {
            this.disabled = false;
            if (res.code) {
                this.$emit("handle");
                this.$message.success(message);
                this.handleClose();
            } else {
                this.$message.error(res.message);
            }
        },
        handleSelectMember(array) {
            this.tags = array;
        },
        handleCloseTag(tag) {
            this.tags.splice(this.tags.indexOf(tag), 1);
        },
    }
}
</script>

<style lang="less" scoped>
.add-membe {
    height: 40px;
    background: #EFF5FF;
    border: 1px dashed #448AFF !important;
    color: #448AFF !important;
    float: left;
    display: flex;
    align-items: center;
}

.weima {
    font-size: 12px;
    line-height: 1.5;
    margin-right: 10px;
    text-align: center;

    .er-weima {
        width: 100px;
        height: 100px;
        background: #777777;
    }
}
</style>