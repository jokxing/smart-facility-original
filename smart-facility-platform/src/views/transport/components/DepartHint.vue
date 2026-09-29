<template>
    <el-dialog
        :before-close="handleClose"
        :close-on-click-modal="false"
        :title="$t('common.hint')"
        :visible.sync="dialogVisible"
        width="38%"
        append-to-body>
        <div class="depart-hint-status">
            {{ $t('transport.departHintMessage') }}
            <span class="normal">{{ $t('transport.inTransit') }}</span>
            {{ $t('transport.departHintMessage1') }}
        </div>
        <div v-loading="lodaing">
            <div class="depart-hint-title margin-center">{{ $t('common.basicInformation') }}</div>
            <div class="depart-hint-center">
                <div class="left">
                    <div class="message-left">
                        <div class="w160">{{$t('transport.carBoard')}}：</div>
                        <div class="w160">{{$t('transport.driver')}}：</div>
                        <div class="w160">{{$t('transport.telNo')}}：</div>
                    </div>
                    <div class="message-right">
                        <div>{{ departInfo.carBoard }}</div>
                        <div>{{ departInfo.driverName }}</div>
                        <div>{{ departInfo.driverTel }}</div>
                    </div>
                </div>
                <div class="right">
                    <div>{{ $t('hardware.alarmScoped') }}：</div>
                    <div >
                        <div v-for="item in departInfo.simpleEquipmentVO" :key="item.id">
                            <span v-if="!DEVICE_ID[item.monitorSensorId]">{{ item.sensorAlias }}： {{ item.normalMin + "~" + item.normalMax + item.unit }}</span>
                            <span v-else>{{ item.sensorAlias }}：{{ sensorsType(item) }}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="depart-hint-title margin-center">{{ $t('transport.relevancyWaybill') }}</div>
            <el-table
                stripe
                class="margin-center"
                :data="departInfo.transportOrderStartListVos"
            >
                <el-table-column type="index" label="#" width="70"></el-table-column>
                <el-table-column :label="$t('transport.transportNo1')" prop="transportNo" min-width="200"></el-table-column>
                <el-table-column :label="$t('transport.consigner')" prop="deliverName" width="160"></el-table-column>
                <el-table-column :label="$t('transport.consignee')" prop="receiveName" width="160"></el-table-column>
            </el-table>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button :disabled="lodaing" @click="handleClose">{{ $t('common.cancel') }}</el-button>
          <el-button :disabled="lodaing" type="primary" @click="handleSubmit()">{{ $t('common.confirm') }}</el-button>
        </span>
    </el-dialog>
</template>

<script>
import {getTransportOrderGetStateInfo} from "@/api/transport";
import {DATAZOOM, DEVICE_ID} from "@/utils/constant";

export default {
    name: "DepartHint",
    data() {
        return {
            dialogVisible: false,
            departInfo: {},
            disabled: false,
            DATAZOOM,
            DEVICE_ID,
            waybillId: "",
            lodaing: false
        }
    },
    methods: {
        open(carId, waybillId) {
          this.dialogVisible = true;
          this.waybillId = waybillId;
          this.getDepartInfo(carId);
        },
        // 获取发车时运单信息
        async getDepartInfo(carId) {
            this.lodaing = true;
            try {
                const res = await getTransportOrderGetStateInfo({carId});
                this.lodaing =false;
                if (res.code) {
                    this.departInfo = res.items;
                } else {
                    this.$message.error(res.message);
                }
            } catch (e) {
                this.lodaing =false;
                console.log(e);
            }
        },
        handleClose() {
            this.dialogVisible = false;
            this.departInfo = {};
        },
        handleSubmit() {
            const arr = Array.from(this.departInfo.transportOrderStartListVos, ({id}) => id);
            this.$emit("confirm", arr, 2);
            this.handleClose();
        }
    },
    computed: {
        sensorsType() {
            return function (items) {
                const sensor = DATAZOOM[items.monitorSensorId];
                if (items.normalCat) {
                    return this.$t('common.open1');
                } else {
                    return this.$t('common.close2');
                }
            }
        }
    }
}
</script>

<style lang="less" scoped>
.depart-hint-status {
    text-align: center;
    line-height: 1.5;
    padding: 0 60px 20px;
    border-bottom: 1px solid #EEEEEE;
}
.depart-hint-title {
    font-size: 14px;
    font-weight: bold;
    color: #333333;
    line-height: 1.5;
}
.depart-hint-center {
    display: flex;
    padding: 20px 0 20px 10px ;
    .left {
        line-height: 1.5;
        display: flex;
        width: 45%;
        .message-left {
            text-align: right;
        }
    }
    .right {
        line-height: 1.5;
        display: flex;
    }
}
</style>