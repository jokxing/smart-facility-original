<!--安装确认-->
<template>
    <div>
        <el-drawer
            :before-close="handleClose"
            :modal="false"
            :visible.sync="isDrawer"
            :withHeader="false"
            destroy-on-close
            size="50%">
            <div class="detail-padding" v-loading="loading">
                <DrawerNav :is-width="false" :name="$t('route.purchaseRequest')" @handle="handleClose"/>
                <el-descriptions :column="2" :title="$t('common.basicInformation')" v-if="detail.task['expandFields']">
                    <el-descriptions-item :label="$t('labDevice.applyUserName')">{{ detail.applyUserName }}</el-descriptions-item>
                    <el-descriptions-item :label="$t('labDevice.applyDate')">
                        <span>{{ detail.applyDate }}</span>
                    </el-descriptions-item>
                    <el-descriptions-item :label="$t('labDevice.applyNo')">
                        <span>{{ detail.procOrderNo }}</span>
                    </el-descriptions-item>
                    <el-descriptions-item
                        :label="$t('labDevice.sopsituationReport')"
                        :span="2"
                        v-if="detail.task.expandFields['sOPSituationReportShow'] === 1">
                        <a target="_blank" :href="BASE_URL + form.sopsituationReport"
                           v-if="detail.task.expandFields['sOPSituationReportEdit'] !==1 || detail.task.finished !== 0">{{ form.sopsituationReport ? "查看报告" : "-" }}</a>
                        <chuxou-upload
                            v-else
                            :accept="'file'"
                            class="upload"
                            :disabled="detail.task.expandFields['sOPSituationReportEdit'] !==1"
                            :acceptTips="'文件支持扩展名：.rar,.zip,.pdf……'"
                            :dir="'file'"
                            :limit="1"
                            :value="verifiedReport"
                            @handleUploadSuccess="handleUploadSuccess($event, 'verifiedReport')"
                        />
                    </el-descriptions-item>
                    <el-descriptions-item :span="2" :label="$t('labDevice.measurementDate')" v-if="detail.task.expandFields['measurementDateShow'] === 1">
                        <el-date-picker
                            v-model="form.measurementDate"
                            type="datetime"
                            :disabled="detail.task.expandFields['measurementDateEdit'] !== 1 || detail.task.finished !== 0"
                            class="input-with-select"
                            format="yyyy-MM-dd HH:mm:ss"
                            value-format="yyyy-MM-dd HH:mm:ss"
                            :placeholder="$t('labDevice.selectDate')">
                        </el-date-picker>
                    </el-descriptions-item>
                    <el-descriptions-item :span="2" :label="$t('labDevice.accessoryUrl')"
                                          v-if="detail.task.expandFields['accessoryUrlShow'] === 1">
                        <a target="_blank" :href="BASE_URL + detail.task.expandFields.accessoryUrl"
                           v-if="detail.task.finished !== 0">{{ detail.task.expandFields.accessoryUrl ? "查看报告" : "-" }}</a>
                        <chuxou-upload
                            v-else
                            :accept="'file'"
                            class="upload"
                            :disabled="detail.task.expandFields['accessoryUrlEdit'] !==1"
                            :acceptTips="'文件支持扩展名：image/png,image/jpeg,.pdf……'"
                            :dir="'file'"
                            :limit="1"
                            :value="accessoryUrl"
                            @handleUploadSuccess="handleUploadSuccess($event, 'accessoryUrl')"
                        />
                    </el-descriptions-item>
                    <el-descriptions-item :span="1" :label="$t('common.remark')" v-if="detail.task.expandFields['remarksShow'] == 1">
                        <span
                            v-if="detail.task.expandFields['remarksEdit'] !== 1 || detail.task.finished !== 0">{{ detail.task.expandFields.remarks }}</span>
                        <el-input v-else v-model="form.remarks"/>
                    </el-descriptions-item>
                </el-descriptions>

                <el-descriptions :column="3" :title="$t('labDevice.assetMessage')"/>
                <Table
                    v-loading="loading"
                    :tableData="tableData"
                    :data="list">
                </Table>
                <el-descriptions class="margin-center" :column="1" :title="$t('labDevice.approvalProcess')"></el-descriptions>
                <div class="steps">
                    <el-steps direction="vertical" finish-status="success" :active="active">
                        <el-step
                            v-for="item in detail.taskList"
                            :key="item.id"
                            :title="item.auditStepName">
                            <template #description>
                                <div class="step-description" v-for="(comment, index) in item.commentList" :key="index">
                                    <span class="step-name">{{ comment.userName }}</span>
                                    <span class="step-message" :class="handleStatusColor(item.finished)">{{
                                            flowActive(comment.message, comment.auditOpinion, item.auditType)
                                        }}</span>
                                    <span class="step-time margin-small-right">{{ dateFormat(comment.time) }}</span>
                                    <img v-if="comment.signatureUrl" class="img" :src="BASE_URL + comment.signatureUrl"
                                         alt="">
                                </div>
                            </template>
                        </el-step>
                    </el-steps>
                </div>

                <el-row type="flex" justify="end">
                    <div v-if="detail.task.finished == 0">
                        <el-button
                            :type="item.type"
                            v-for="item in butList"
                            @click="handleTransfer(item.label)"
                            :key="item.label">
                            {{ item.text }}
                        </el-button>
                    </div>
                </el-row>
            </div>
        </el-drawer>
        <transfer ref="transfer" @handle="handleInit"/>
    </div>
</template>

<script>
import {getProcessOrderDetails, getQueryAssetInformation, postActivitiProcessOrderUpdate} from "@/api/activiti";
import DrawerNav from "@c/DrawerNav";
import Table from "@c/Tables";
import {BASE_URL, TIME_FORMAT} from "@/utils/constant";
import moment from "moment";
import Transfer from "@/views/assetProcess/components/Transfer";
import ChuxouUpload from "@c/ChuxouUpload";

const obj = {
    1: "已同意",
    "-1": "已驳回",
    0: "审批中",
    2: "已转办"
}
export default {
    name: "InstallConfirm",
    components: {
        Transfer,
        DrawerNav,
        Table,
        ChuxouUpload,
    },
    data() {
        const _this = this;
        return {
            isDrawer: false,
            loading: false,
            detail: {
                expandFields: {},
                task: {}
            },
            BASE_URL,
            form: {
                measurementDate: "",
                sopsituationReport: "",
                accessoryUrl: "",
                id: "",
                remarks: ""
            },
            accessoryUrl: [],
            verifiedReport: [],
            tableData: [
                {
                    label: _this.$t('labDevice.assetName'),
                    prop: "instrumentName",
                },
                {
                    label: _this.$t('labDevice.assetNo'),
                    prop: "instrumentNo",
                },
                {
                    label:  _this.$t('labDevice.instrumentModel'),
                    prop: "instrumentModel",
                },
                {
                    label: _this.$t('common.owningRoom'),
                    prop: "storageLocation",
                },
                {
                    label: _this.$t('labDevice.manager'),
                    prop: "manageUserName",
                },
                {
                    label: _this.$t('labDevice.type'),
                    prop: "assetCategoryName",
                },
                {
                    label: _this.$t('common.owningDepartment'),
                    prop: "departmentName",
                }
            ],
            list: [],
            items: {
                currentPage: 1,
                pageSize: 10,
                processOrderNo: ""
            },
            butList: [
                {
                    label: 0,
                    text: _this.$t('labDevice.turnHold')
                },
                {
                    label: 1,
                    text: _this.$t('labDevice.reject')
                },
                {
                    label: 2,
                    text: _this.$t('labDevice.primary'),
                    type: "primary"
                },
            ]
        }
    },
    computed: {
        dateFormat() {
            return function (value) {
                if (value) {
                    return moment(Number(value)).format(TIME_FORMAT);
                }
            }
        },
        active() {
            let active = 0;
            if (this.detail["taskList"] && this.detail.taskList.length) {
                this.detail.taskList.map((item, index) => {
                    if (item.finished) {
                        active = index + 1;
                    }
                })
            }
            return active;
        },
        url() {
            return function (value) {
                try {
                    if (value) {
                        const arr = value.split(",");
                        return arr.map(item => {
                            return BASE_URL + item
                        })
                    }
                } catch (e) {
                    console.log(e)
                    this.loading = false;
                }

            }
        },
        flowActive() {
            return function (message, status, type) {
                if (message) {
                    if (type == -1) {
                        return message
                    }
                    return status + " ( " + message + " )";
                }
                if (status) {
                    return status;
                }
            }
        }
    },
    methods: {
        handleUploadSuccess(e, key) {
            this[key] = e;
        },
        handleStatusColor(value) {
            let color;
            switch (value) {
                case 0:
                    color = "blueColor";
                    break
                case 1:
                    color = "normal";
                    break
                case -1:
                    color = 'abnormal';
                    break
                default:
                    color = ""
                    break
            }
            return color
        },
        handleClose() {
            this.isDrawer = false;
            this.detail = {
                expandFields: {},
                task: {}
            }
        },
        handleTransfer(value) {
            console.log(value)
            const obj = {
                processOrderNo: this.detail.procOrderNo,
                taskId: this.detail.task.taskId,
                modelNodeId: this.detail.task.id,
                expValue: this.detail.task.expandFields,
                requireComments: this.detail.task.requireComments,
                requireSignature: this.detail.task.requireSignature
            }
            if (this.verifiedReport.length) {
                this.form.sopsituationReport = this.verifiedReport[0].name;
            }
            if (this.accessoryUrl.length) {
                this.form.accessoryUrl = this.accessoryUrl[0].name;
            }
            if (value === 2) {
                postActivitiProcessOrderUpdate(this.form).then(res => {
                    if (res.code) {

                    }
                })
            }
            this.$refs.transfer.open(value, obj);
        },
        open(processOrderNo) {
            this.isDrawer = true;
            this.items.processOrderNo = processOrderNo;
            this.handleInit(processOrderNo);
        },
        handleInit() {
            this.handleGetFlowInformation();
            this.handleGetInformation();
        },
        // 获取流程信息
        handleGetFlowInformation() {
            this.loading = true
            getProcessOrderDetails({processOrderNo: this.items.processOrderNo}).then(res => {
                this.loading = false;
                this.accessoryUrl = [];
                this.verifiedReport = [];
                if (res.code) {
                    this.detail = {
                        ...res.items.processOrderHistory,
                        task: res.items.task,
                        taskList: res.items.taskList
                    }
                    this.form.id = this.detail.id;
                    this.form.remarks = this.detail.remarks;
                    if (this.detail.task.expandFields.accessoryUrl) {
                        this.accessoryUrl.push({name: this.detail.task.expandFields.accessoryUrl, url: BASE_URL + this.detail.task.expandFields.accessoryUrl, uid: "02221"})
                    }
                    if (this.detail.task.expandFields.sOPSituationReport) {
                        this.verifiedReport.push({name: this.detail.task.expandFields.sOPSituationReport, url: BASE_URL + this.detail.task.expandFields.sOPSituationReport, uid: "0226621"})
                    }
                    this.form.measurementDate = this.detail.task.expandFields["measurementDate"] ?? "";
                    if (this.detail.expandFields.meteringDate) {
                        this.detail.expandFields.meteringDate = this.detail.expandFields.meteringDate.split(",")
                    }

                } else {
                    this.$message.error(res.message)
                }
            }).catch(() => {
                this.loading = false;
            })
        },
        handleGetInformation() {
            getQueryAssetInformation(this.items).then(res => {
                if (res.code) {
                    this.list = res.items.list;
                }
            })
        }
    }
}
</script>

<style lang="less" scoped>
.steps {
    height: 380px;
    margin-bottom: 60px;

    .step-description {
        margin-top: 10px;
        margin-bottom: 20px;
        display: flex;
        align-items: center;
    }

    .step-name {
        margin-right: 20px;
    }

    .step-message {
        margin-right: 40px;
    }

    .img {
        width: 60px;
        height: 100px;
        background: #FFFFFF;
        border: 1px solid #EEEEEE;
        border-radius: 4px;
        margin-right: 8px;
        transform: rotate(-90deg);
        margin-left: 40px;
    }
}

/deep/ .el-descriptions-item__label:not(.is-bordered-label) {
    width: 120px !important;
}

/deep/ .el-step.is-vertical .el-step__line {
    width: 1px !important;
}

/deep/ .el-step__title.is-success {
    font-size: 16px !important;
    font-weight: 400 !important;
    color: #555555 !important;
    line-height: 16px !important;
}

/deep/ .el-step__description.is-success {
    font-size: 14px !important;
    font-weight: 400 !important;
    color: #777777 !important;
    line-height: 16px !important;
}

/deep/.el-step:last-of-type {
    padding-bottom: 40px;
}

</style>