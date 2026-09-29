<!-- 消息中心 -->
<template>
    <transition appear name="overturn">
        <div class="schedule">
            <div class="trigon"></div>
            <el-button type="primary" class="timeout-configuration" @click="$refs.timeOutSetting.open()">{{ $t('hardware.timeOutSetting') }}
            </el-button>
            <el-tabs tab-position="left" v-model="activitiItems.taskStatus" @tab-click="handleLeftTab">
                <el-tab-pane :label="$t('hardware.taskStatus1')" name="0"></el-tab-pane>
                <el-tab-pane :label="$t('hardware.taskStatus2')" name="1"></el-tab-pane>
                <el-tab-pane :label="$t('hardware.taskStatus3')" name="2"></el-tab-pane>
                <el-tab-pane :label="$t('hardware.taskStatus4')" name="3"></el-tab-pane>

                <el-tabs class="top-tab margin-left" v-if="activitiItems.taskStatus == 0" v-model="items.timeOptions"
                         @tab-click="handleTopTab">
                    <el-tab-pane :label="$t('hardware.taskStatus5')+'(' + statisticalVO.pendingCount + ')'" name="-1"></el-tab-pane>
                    <el-tab-pane :label="$t('hardware.taskStatus6')+'(' + statisticalVO.aboutTimeOut + ')'" name="0"></el-tab-pane>
                    <el-tab-pane :label="$t('hardware.taskStatus7')+'('+ statisticalVO.timeOut +')'" name="1"></el-tab-pane>
                </el-tabs>
                <div class="center flex margin-left" :class="activitiItems.taskStatus == 0 ? '' : 'm-top'">
                    <el-input
                        class="margin-small-right"
                        :placeholder="$t('common.inputKeyword')"
                        v-model="items.key"
                        maxlength="20"
                        @change="handleBackLogList"
                        @input="handleInputQuery"
                        suffix-icon="icon-search1"/>
                    <el-select
                        v-model="value"
                        class="select margin-small-right"
                        :placeholder="$t('common.placeholder')">
                        <el-option :label="$t('hardware.allType')" value="0"></el-option>
                    </el-select>
                    <el-date-picker
                        v-model="date"
                        :end-placeholder="$t('common.endDate')"
                        :range-separator="$t('common.most')"
                        :start-placeholder="$t('common.startDate')"
                        type="daterange">
                    </el-date-picker>
                </div>
                <div class="margin-left">
                    <ul class="table-content" v-loading="loading" v-if="dataList.length > 0">
                        <li class="content-list cursor" v-for="(item,index) in dataList" :key="index" @click="handleShowInstallConfirm(item)">
                            <div class="content-massage">{{ item.title }}</div>
                            <div class="content-other">
                                <span>{{ $t('labDevice.applyDate') }}：{{ item.taskStartDate ? item.taskStartDate : item.applyDate }}</span>
                                <span>{{ $t('labDevice.handleUser') }}：{{ item.applyUserName }}</span>
                                <span>{{ $t('labDevice.assetName') }}：{{ item.procOrderNo }}</span>
                            </div>
                        </li>
                    </ul>
                    <el-empty v-else :description="$t('common.notMessage1')"  v-loading="loading"></el-empty>
                </div>
                <div class="paging">
                    <pagination
                        v-show="total"
                        :limit.sync="items.pageSize"
                        :page.sync="items.currentPage"
                        :total="total"
                        :layout="'prev, pager, next'"
                        :pageCount="5"
                        :is-but="false"
                        @pagination="init"/>
                </div>
            </el-tabs>
            <time-out-setting @close="$emit('close', true)" ref="timeOutSetting"/>
            <install-confirm ref="installConfirm"/>
        </div>
    </transition>
</template>

<script>
import {getActivitiTaskList, getActivitiTaskQuery, getNotifyMessageQuery} from "@/api/activiti";
import TimeOutSetting from "@c/Schedule/TimeOutSetting";
import Pagination from "@c/Pagination";
import InstallConfirm from "@/views/assetProcess/components/InstallConfirm";

let time = null;
export default {
    name: "Schedule",
    components: {
        InstallConfirm,
        TimeOutSetting,
        Pagination,
    },
    props: {
      show: {
          type: Boolean,
          default: false
      }
    },
    data() {
        return {
            activeName: "-1",
            value: "",
            dataList: [],
            date: "",
            items: {
                currentPage: 1,
                endTime: "",
                key: "",
                pageSize: 10,
                startTime: "",
                timeOptions: "-1",
                type: 4
            },
            statisticalVO: {
                aboutTimeOut: 0,
                pendingCount: 0,
                timeOut: 0
            },
            activitiItems: {
                currentPage: 1,
                pageSize: 10,
                taskStatus: "0",//  1 已处理，2 我申请的，3 抄送我的
                type: 4,
                endTime: "",
                startTime: "",
                key: ""
            },
            total: 0,
            loading: false
        };
    },
    mounted() {
        this.handleBackLogList();
    },
    watch: {
        date: {
            handler(arr) {
                if (arr) {
                    if (this.activitiItems.taskStatus != 0) {
                        this.activitiItems.endTime = arr[1];
                        this.activitiItems.startTime = arr[0];
                    } else {
                        this.items.endTime = arr[1];
                        this.items.startTime = arr[0];
                    }
                } else {
                    if (this.activitiItems.taskStatus != 0) {
                        this.activitiItems.endTime = arr[1];
                        this.activitiItems.startTime = arr[0];
                    } else {
                        this.items.endTime = arr[1];
                        this.items.startTime = arr[0];
                    }
                }
                if (this.activitiItems.taskStatus != 0) {
                    this.handleGetTaskQuery();
                } else {
                    this.handleBackLogList();
                }
            },
            deep: true
        }
    },
    methods: {
        init() {
            if (this.activitiItems.taskStatus != 0) {
                this.handleGetTaskQuery();
            } else {
                this.handleBackLogList();
            }
        },
        handleInputQuery() {
            if (time) {
                clearTimeout(time);
            }
            time = setTimeout(() => {
                this.handleBackLogList();
            }, 500)
        },
        handleLeftTab(e) {
            if (Number(e.index) === 0) {
                this.activitiItems.taskStatus = e.index;
                this.handleBackLogList();
            } else {
                this.handleGetTaskQuery();
            }
        },
        handleTopTab(tab, event) {
            this.handleBackLogList();
        },
        handleBackLogList() {
            this.loading = true;
            getActivitiTaskList(this.items).then(res => {
                this.loading = false;
                if (res.code) {
                    this.statisticalVO = res.items.statisticalVO;
                    this.dataList = res.items.list;
                    this.total = res.items.total;
                }
            })
        },
        handleGetTaskQuery() {
            this.loading = true;
            this.total = 0;
            getActivitiTaskQuery(this.activitiItems).then(res => {
                this.loading = false;
                if (res.code) {
                    this.dataList = res.items;
                }
            })
        },
        handleShowInstallConfirm(item) {
            this.$refs.installConfirm.open(item.procOrderNo);
        }
    },
};
</script>

<style lang="less" scoped>
@import "./popover.less";
.m-top {
    margin-top: 60px;
}
.paging {
    margin-top: 10px;
}
</style>
