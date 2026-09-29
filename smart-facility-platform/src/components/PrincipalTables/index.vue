<template>
    <div v-loading="loading">
        <Table :tableData="tableData" :data="list">
            <template slot-scope="data">
                <div v-if="data.prop === 'names'">
                    <span v-for="(item,index) in data.data.names" :key="index">
                        <span>{{ item }}</span>
                        <span v-if="index !== (data.data.names.length - 1)">，</span>
                    </span>
                </div>

                <div v-if="data.prop === 'noticeWeixin' || data.prop === 'noticeSms' || data.prop === 'noticeCall'">
                    <el-tag
                        v-if="data.data[data.prop] !== null && data.data[data.prop] !== undefined"
                        :type="data.data[data.prop] === -1 ? 'info' : 'success'"
                        v-html="alarmType(data.data[data.prop])">
                    </el-tag>
                </div>

                <div v-if="data.prop === 'timeSlot'">
                    {{ data.data.startTime }} - {{ data.data.endTime }}
                </div>

                <div v-if="data.prop === 'restoreNotice'">
                    {{ data.data.restoreNotice === 1 ? $t('hardware.alarmArray13') : $t('hardware.alarmArray14') }}
                </div>

                <div v-if="data.prop === 'noticeGroupStrategyItem'">
                    <p v-for="(item,index) in data.data.noticeGroupStrategyItem" :key="item.id">
                        <span v-if="index === 0">{{ item.startAlarmTime }} - {{ item.endAlarmTime }}</span>
                        <span v-if="index === 1">> {{ item.startAlarmTime }}</span>
                        &nbsp;&nbsp;
                        <span>{{ item.noticePeriod }}{{ $t('hardware.int2') }}</span>
                    </p>
                </div>
            </template>
        </Table>
        <div class="paging">
            <pagination
                v-show="total > pageSize"
                :limit.sync="pageSize"
                :page.sync="pageNum"
                :total="total"
                @pagination="getList"/>
        </div>
    </div>
</template>

<script>
    import Table from "@c/Tables";
    import Pagination from "@/components/Pagination/index";
    import { postNoticeGroupStrategyGetAdministrator } from "@/api/monitorIndicator"
    export default {
        components: {
            Table,
            Pagination
        },
        props: {
            objId: {
                type: Number,
                default: null
            },
            // 设备2，房间3
            objType: {
                type: Number,
                default: null
            }
        },
        data() {
            const _this = this;
            return {
                loading: false,
                tableData: [
                    {
                        label: "#",
                        type: "index",
                        width: "60"
                    },
                    {
                        label: _this.$t('system.name'),
                        prop: "names",
                        isSlot: true
                    },
                    {
                        label: _this.$t('system.noticeWeixin'),
                        prop: "noticeWeixin",
                        isSlot: true
                    },
                    {
                        label: _this.$t('system.noticeSms'),
                        prop: "noticeSms",
                        isSlot: true
                    },
                    {
                        label: _this.$t('system.noticeCall'),
                        prop: "noticeCall",
                        isSlot: true
                    },
                    {
                        label: _this.$t('common.timeFrame'),
                        prop: "timeSlot",
                        isSlot: true,
                        width: "160"
                    },
                    {
                        label: _this.$t('system.restoreNotice'),
                        prop: "restoreNotice",
                        isSlot: true,
                        width: "150"
                    },
                    {
                        label: _this.$t('system.informInt'),
                        prop: "noticeGroupStrategyItem",
                        isSlot: true,
                        width: "200"
                    }
                ],
                list: [],
                pageNum: 1,
                pageSize: 10,
                total: 0,
            }
        },
        mounted() {
            this.getList()
        },
        methods: {
            getList() {
                var data = {
                    objId: this.objId,
                    objType: this.objType,
                    pageNum: this.pageNum,
                    pageSize: this.pageSize
                }
                this.loading = true;
                postNoticeGroupStrategyGetAdministrator(data).then(res => {
                    this.loading = false;
                    if(res.code === 1){
                        this.list = res.items.list;
                        if(res.items.total){
                            this.total = res.items.total
                        }
                    }
                })
            },
            alarmType(index) {
                if (index === -1) {
                    return this.$t('hardware.alarmArray00');
                }
                if (index === 0) {
                    return this.$t('hardware.alarmArray0');
                }
                if (index > 0) {
                    return this.$t('hardware.alarm2') + index + this.$t('hardware.alarm3');
                }
            },
        }
    }
</script>