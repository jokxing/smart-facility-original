<template>
    <el-dialog
        :title="$t('transport.inputData')"
        :close-on-click-modal="false"
        :visible.sync="dialogVisible"
        :before-close="close"
        width="30%"
        append-to-body>
        <div>
            {{ $t('transport.dataInterval') }}：
            <el-input-number
                v-model="param.historyTimeInterval"
                :min="1"
                style="width: 80px;"
                :controls="false"/>
            {{ $t('common.minute') }}
        </div>
        <div style="height: 0;overflow: hidden;">
            <div ref="printWaybillMonitorData" id="printWaybillMonitorData">
                <br>
                <br>
                <h3>{{ $t('transport.transportData') }}</h3>
                <template v-for="data in datas">
                    <div
                        style="height: 3px;
                            margin-bottom: 20px;
                            margin-top: 20px;
                            border-bottom: dimgray solid 1px;
                            border-top: dimgray solid 1px;"
                    />
                    {{ $t('transport.transportNo') }}：{{ data.transportNo }}<br>
                    {{ $t('transport.professionNo') }}：{{ data.professionNo }}<br>
                    <br>
                    {{ $t('transport.printDate') }}：{{ data.printDate }}<br>
                    <br>
                    {{ $t('transport.beginTime') }}：{{ data.beginTime }}<br>
                    {{ $t('transport.completeTime') }}：{{ data.completeTime }}<br>
                    <br>
                    {{ $t('transport.alarmScope') }}：{{ data.alarmMin }}&nbsp;
                    ~&nbsp;
                    {{ data.alarmMax }}&nbsp;
                    ℃
                    <br>

                    {{ $t('transport.maxTemperature') }}：<br>
                    <span>
                    <template v-if="data.maxTemperature">
                        {{ data.maxTemperatureDate }}&nbsp;&nbsp;
                        {{ data.maxTemperature }}&nbsp;
                        ℃
                    </template>
                    <template v-else>
                        {{ $t('transport.notData') }}
                    </template>
                </span>
                    <br>

                    {{ $t('transport.minTemperature') }}：<br>
                    <span>
                    <template v-if="data.minTemperature">
                        {{ data.minTemperatureDate }}&nbsp;&nbsp;
                        {{ data.minTemperature }}&nbsp;
                        ℃
                    </template>
                    <template v-else>
                        {{ $t('transport.notData') }}
                    </template>
                </span>
                    <br>

                    <br>

                    {{ $t('transport.detailData') }}：<br>
                    <el-row style="border-bottom: darkgray solid 1px;">
                        <el-col :span="12">{{ $t('transport.time') }}</el-col>
                        <template v-for="(item, index) in data.sensorData[0].values">
                            <el-col :span="6" :key="index">{{ item }}</el-col>
                        </template>

                    </el-row>
                    <template v-for="(item, index) in data.sensorData">
                        <el-row v-if="index > 0" :key="index">
                            <el-col :span="12">{{ item.key }}</el-col>
                            <el-col :span="6" v-for="(i, k) in item.values" :key="k">{{ i }}</el-col>
                        </el-row>
                    </template>
                    <div style="height: 10px">
                    </div>
                </template>
                <div
                    style="height: 3px;
                            margin-bottom: 20px;
                            margin-top: 20px;
                            border-bottom: dimgray solid 1px;
                            border-top: dimgray solid 1px;"
                />
                <h3>{{ $t('transport.printed') }}</h3>
                <br>
                <br>
            </div>
        </div>
        <span slot="footer" class="dialog-footer">
            <el-button
                @click="close">
                {{ $t('common.cancel') }}
            </el-button>
            <el-button
                type="primary"
                @click="confirm">
                {{ $t('transport.print') }}
            </el-button>
            <el-button
                v-show="false"
                ref="printClick"
                v-print="printObj"/>

        </span>
    </el-dialog>
</template>

<script>
import Print from 'vue-print-nb';
import {batchPrintTransportOrderData} from "@/api/transport";

export default {
    name: "PrintWaybillMonitor",
    directives: {
        Print
    },
    data() {
        const _this = this;
        return {
            dialogVisible: false,
            param: {
                orderIds: [],
                historyTimeInterval: 15,
            },
            datas: [],
            printObj: {
                id: 'printWaybillMonitorData',
                popTitle: _this.$t('transport.printTransport'),
                beforeOpenCallback(vue) {
                },
                openCallback(vue) {
                },
                closeCallback(vue) {
                },
            },
        }
    },
    methods: {
        open(orderIds) {
            this.param.orderIds = orderIds;
            this.dialogVisible = true;
        },

        confirm() {
            batchPrintTransportOrderData(this.param).then(res => {
                if (res.code) {
                    this.datas = res.items;
                    setTimeout(() => {
                        this.$refs.printClick.$el.click();
                    }, 100)

                } else {
                    this.$message.error(this.$t('transport.printError'));
                }
            }).catch(res => {
                this.$message.error(this.$t('transport.printError'));
            });
        },
        close() {
            this.dialogVisible = false;
        }
    },
    computed: {

    }
}
</script>

<style scoped>

</style>
<style media="print">
@page {
    size: auto;
    margin: 3mm;
}
</style>
