<template>
    <div>
        <el-link :underline="false" class="icon-return" @click="$router.back()"> &nbsp;{{ $t('common.back') }}</el-link>
        <div class="session" v-loading="loading">
            <div class="sever-title">
                ▍ {{ $route.params.typeName + $t('route.approvalProcessSet')}}
            </div>
            <div class="approval-process">
                <div class="inner">
                    <template v-for="(item, index) in flows">
                        <div class="plus"
                             v-if="index >= 1"
                             :key="index"
                             @click="handleAddFlow(index)">
                            <i class="el-icon-circle-plus"></i>
                        </div>
                        <div class="node">
                            <div class="head" :class="index ? 'clearfix' : '' ">
                                <div class="head-title" :title="item.auditStepName">{{ item.auditStepName }}</div>
                                <span
                                    @click="handleDeleteFlow(index)"
                                    v-show="index > 0 && flows.length > 3 && item.auditType !== 99"
                                    class="el-icon-close margin-small-right cursor"></span>
                            </div>
                            <div class="content cursor" @click="handleSetApprover(item, index)">
                                <span v-if="item.auditType == -1 || item.auditType == 99">{{ $t('labDevice.copyUser') }}：{{ item.ccUsersNames }}</span>
                                <span v-else>{{ $t('labDevice.auditor') }}： {{ item.auditorNames }}</span>
                                <i class="el-icon-arrow-right"></i>
                            </div>
                        </div>
                    </template>
                </div>
                <div class="footer-button">
                    <el-button :disabled="disabled" @click="$router.back()">{{ $t('common.cancel') }}</el-button>
                    <el-button :disabled="disabled" :loading="disabled" type="primary" @click="handleKeepIssue">{{ $t('labDevice.save') }}</el-button>
                </div>
            </div>
            <SetApproverDrawer @handle="handleAuditors" ref="setApproverDrawer"/>
        </div>
    </div>
</template>

<script>
import SetApproverDrawer from "./SetApproverDrawer";
import {getModelGetLatest, listProcessNodeField, postModelSaveAndDeploy} from "@/api/activiti";
import {deepCopyObject, numStringListToNumList} from "@/utils/QuickUtils";
import i18n from "@/i18n";
const flowObj = {
    auditStepName: i18n.t('labDevice.setAudit'), // 审核步骤名称
    auditType: 0, // 节点类型 -1:开始；0：或签；1：会签；99：结束
    auditors: "", // 审核人员逗号分割
    currentNode: "",
    modelCode: "", // 模型编号
    modelName: "", // 模型名称
    nextNode: "", // 下一个节点
    previousNode: "", // 上一个节点
    proSetCode: "", // 流程设置编号
    auditorNames: "",
    ccUsers: "",
    processFormConfigInstList: []
}
export default {
    name: "ApprovalProcessSet",
    components: {
        SetApproverDrawer
    },
    data() {
        return {
            nodeFields: [],
            proSetType: 4,
            flows: [],
            no: "",
            loading: false,
            flowIndex: 0,
            disabled: false,
        }
    },
    watch: {
      flows: {
          handler(obj) {
              this.$nextTick(() => {
                  this.flows = obj;
              })

          },
          deep: true
      }
    },
    created() {
        flowObj.proSetCode = this.no = this.$route.params.id;
        flowObj.modelName = this.$route.params.typeName;
        this.proSetType = this.$route.params.type;
        if (this.proSetType === undefined) {
            this.$router.back();
        }
        this.handleGetNodeField();
        this.handleGetModelLatest();
    },
    methods: {
        handleSetApprover(item, index) {
            console.log(item)
            this.flowIndex = index;
            let userArray;
            let ccUserArray = [];
            if (item.auditors && item.auditorNames) {
                const auditors = numStringListToNumList(item.auditors.split(","));
                const users = item.auditorNames.split(",");
                userArray = auditors.map((item, index) => {
                    return {id: item, name: users[index]}
                })
            } else {
                userArray = [];
            }
            if (item.ccUsers && item.ccUsersNames) {
                const auditors = numStringListToNumList(item.ccUsers.split(","));
                const users = item.ccUsersNames.split(",");
                ccUserArray = auditors.map((item, index) => {
                    return {id: item, name: users[index]}
                })
            }
            console.log(this.nodeFields)
            this.$refs.setApproverDrawer.open(userArray, item, ccUserArray);
        },
        /**
         *
         * @param auditors 审核人
         * @param items 节点数据
         * @param ccUsers 抄送人
         */
        handleAuditors(auditors, items, ccUsers) {
            const users = Array.from(auditors, ({id}) => id);
            const userNames = Array.from(auditors, ({name}) => name).toString();
            const ccUserIds = Array.from(ccUsers, ({id}) => id);
            const ccUserNames = Array.from(ccUsers, ({name}) => name).toString();
            const thisFlow = this.flows[this.flowIndex];
            thisFlow.auditors = users.toString();
            thisFlow.auditType = items.auditType;
            thisFlow['auditorNames'] = userNames;
            thisFlow.ccUsers = ccUserIds.toString();
            thisFlow['ccUsersNames'] = ccUserNames;
            thisFlow.auditStepName = items.auditStepName;
            thisFlow.requireComments = items.requireComments;
            thisFlow.requireSignature = items.requireSignature;
        },
        handleStart() {
            const startObj = JSON.parse(JSON.stringify(flowObj));
            startObj.auditStepName = this.$t('labDevice.initiator');
            startObj.auditType = -1;
            startObj.currentNode = 'TASK_0';
            this.flows.push(startObj);
        },
        handleEnd() {
            const endObj = JSON.parse(JSON.stringify(flowObj));
            endObj.auditStepName = this.$t('labDevice.finish');
            endObj.auditType = 99;
            endObj.currentNode = 'TASK_100';
            this.flows.push(endObj);
        },
        handleDefault() {
            const defaultObj = JSON.parse(JSON.stringify(flowObj));
            this.flows.push(defaultObj);
        },
        handleGetNodeField() {
            listProcessNodeField(this.proSetType).then(res => {
                if (res.code) {
                    this.nodeFields = res.items;
                }
            })
        },
        handleGetModelLatest() {
            this.loading = true;
            this.flows = [];
            getModelGetLatest({
                proSetCode: this.no
            }).then(res => {
                this.loading = false;
                if (res.code) {
                    if (res.items.length === 0) {
                        this.handleStart();
                        this.handleDefault();
                        this.handleEnd();
                    } else {
                        this.flows = res.items;
                    }
                }
            })
        },
        // 新增审批步骤节点
        handleAddFlow(index) {
            /** this.flows.length >= this.nodeFields.length + 2 */
            if (this.flows.length >= 99) {
                return;
            }
            const arr = [deepCopyObject(flowObj)];
            // 往数组中间插入流程
            this.flows = [...this.flows.slice(0, index), ...arr, ...this.flows.slice(index)];
        },
        // 删除某个审批步骤
        handleDeleteFlow(index) {
            this.flows.splice(index, 1);
        },

        machFlows() {
            console.log(this.flows)
            this.flows.forEach((flow, index) => {
                flow.currentNode = 'TASK_' + index;
            });
            this.flows.forEach((flow, index) => {
                if (index > 0) {
                    flow.previousNode = this.flows[index - 1].currentNode;
                }
                if (index < this.flows.length - 1) {
                    flow.nextNode = this.flows[index + 1].currentNode;
                }
            });
        },
        async handleKeepIssue() {
            this.machFlows();
            this.disabled = true;
            const res = await postModelSaveAndDeploy(this.flows);
            this.disabled = false;
            if (res.code) {
                this.$message.success(this.$t('labDevice.saveSuccess'));
                this.$router.back();
            } else {
                this.$message.error(res.message)
            }
        }
    },
}
</script>

<style lang="less" scoped>
@blue: #3078F0;
.approval-process {
    margin-top: 50px;

    .inner {
        display: flex;
        flex-direction: column;
        align-items: center;

        .node {
            width: 230px;
            height: 100px;
            background-color: #fff;
            box-shadow: 0px 1px 5px 0px rgba(67, 88, 123, 0.1000);
            border-radius: 10px;
            overflow: hidden;

            .head {
                width: 100%;
                height: 40px;
                color: #fff;
                line-height: 40px;
                padding-left: 30px;
                background-color: @blue;
                margin-top: 0;

                .head-title {
                    width: 80%;
                    text-overflow: ellipsis;
                    overflow: hidden;
                    white-space: nowrap;
                }
            }

            .content {
                width: 100%;
                height: 100%;
                line-height: 60px;
                padding-left: 30px;
                color: #555;
                text-overflow: ellipsis;
                overflow: hidden;
                white-space: nowrap;
                position: relative;

                i {
                    position: absolute;
                    right: 8px;
                    top: 20px;
                }

                &.cursor {
                    cursor: pointer;
                }
            }
        }


        .plus {
            position: relative;

            &::after {
                content: "";
                width: 1px;
                height: 34px;
                border-left: 1px #B6B9C9 dashed;
                position: absolute;
                top: 0;
                left: 16px;
            }

            &::before {
                content: "";
                width: 1px;
                height: 34px;
                border-left: 1px #B6B9C9 dashed;
                position: absolute;
                bottom: 0;
                left: 16px;
            }

            i {
                font-size: 32px;
                color: @blue;
                margin: 34px 0;
            }
        }

        .end {
            padding-top: 118px;
            position: relative;

            &::before {
                content: "";
                width: 12px;
                height: 12px;
                background-color: #BBC4D4;
                border-radius: 50%;
                position: absolute;
                top: 0px;
                left: 50%;
                transform: translateX(-50%);
            }

            p {
                color: #666;
                font-size: 16px;
            }
        }
    }

    .footer-button {
        text-align: right;
    }
}
</style>