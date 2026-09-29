<template>
    <el-dialog
        title="提示"
        :visible.sync="updateVisible"
        :show-close="false"
        destroy-on-close
        append-to-body
        :close-on-click-modal="false"
        :modal-append-to-body="false"
        width="950px"
        top="8vh">
        <Table :tableData="tableData" :data="list" :rowClassName="tableRowClassName">
            <template slot-scope="data">
                <div v-if="data.prop === 'no'">{{ data.data.no || '-' }}</div>
                
                <template v-if="data.prop === 'data'">
                    <div v-for="item in data.data.data" :key="item.id">
                        <p v-if="!deviceId[item.type]">
                            {{ item.name }}
                            <!-- <span v-if="item.switchOff">预警范围：{{ item.warningMin + " ~ " + item.warningMax + " " + item.sensorUnit }}&nbsp; </span> -->
                            {{ item.monitorSensorName }} 
                            <span v-if="item.normalCat === 1">{{ item.normalOpen === 1 ? $t('common.open') : $t('common.close1') }}</span>
                            <span v-else>
                                <span v-if="item.normalMin !== undefined  && item.normalMax !== undefined">
                                    {{ item.alarmLevel != 0 ? $t('hardware.alarmScoped') : $t('hardware.waringScope') }}: {{ item.normalMin + " ~ " + item.normalMax + " " + (item.sensorUnit ? item.sensorUnit : '') }}
                                </span>
                            </span>
                        </p>
                    </div>
                </template>

                <div v-if="data.prop === 'result'">
                    {{ data.data.name && data.data.no ? data.data.result : '-' }}
                </div>

                <div v-if="data.prop === 'status'">{{ data.data.status === 0 ? $t('hardware.systemSuccess') : $t('hardware.systemError') }}</div>
            </template>
        </Table>
        <span slot="footer" class="dialog-footer">
            <el-button @click="handleOff">{{ $t('common.close') }}</el-button>
        </span>
    </el-dialog>
</template>

<script>
    import Table from "@c/Tables";
    import { DEVICE_ID } from "@/utils/constant";
    export default {
        components: {
            Table
        },
        data() {
            const _this = this;
            return{
                deviceId: DEVICE_ID,
                updateVisible: false,
                gridData: [],
                list: [],
                tableData: [
                    {
                        label: "#",
                        type: "index"
                    },
                    {
                        label: _this.$t('hardware.devciceName'),
                        prop: "name"
                    },
                    {
                        label: _this.$t('hardware.devciceNo'),
                        prop: "no",
                        isSlot: true,
                    },
                    {
                        label: _this.$t('hardware.devciceStatus'),
                        prop: "data",
                        isSlot: true,
                        width: "240"
                    },
                    {
                        label: _this.$t('hardware.issueResult'),
                        prop: "result",
                        isSlot: true,
                    },
                    {
                        label: _this.$t('hardware.informResult'),
                        prop: "status",
                        isSlot: true,
                        width: "130"
                    },
                ]
            }
        },
        methods: {
            open(item){
                this.updateVisible = true;
                this.list = item;
            },
            //标红table指定行
            tableRowClassName({row, rowIndex}) {
                if(row.status !== 0 && row.name && row.no){
                    return 'warning-row';
                }
            },
            handleOff() {
                this.updateVisible = false;
            }
        },
    }
</script>

<style lang="less" scoped>
    @import '../../style/variable.less';
    /deep/ .el-table .warning-row {
        color: @abnormal;
    }
</style>