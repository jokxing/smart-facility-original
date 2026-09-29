<template>
    <el-dialog
        :title="$t('labDevice.sensorEdit')"
        :visible.sync="modalVisible"
        :before-close="handleModalClose"
        :close-on-click-modal="false"
        append-to-body
        custom-class="modal-probeName"
        width="900px">
        <el-button
            v-if="$store.state.level"
            class="margin-small-right"
            icon="icon-add-to"
            @click="$refs.sensorTable.open(0, type, {id, no})"> {{ $t('labDevice.addSensor') }}
        </el-button>
        <el-table
            class="margin-center"
            :data="probeName"
            v-loading="loading"
            style="width: 100%">
            <el-table-column
                type="index"
                label="#"
                width="60px">
            </el-table-column>
            <el-table-column
                prop="monitorSensorName"
                :label="$t('hardware.sensorName')"
                width="100px">
            </el-table-column>
            <el-table-column
                prop="equipmentName"
                :label="$t('hardware.owningDevice')">
            </el-table-column>
            <el-table-column
                :label="$t('hardware.sensorAlias1')">
                <template slot-scope="scope">
                    <div>
                        <el-input v-model.trim="scope.row.sensorAlias" maxlength="12" v-if="scope.row.isEdit"></el-input>
                        <el-button type="text" v-else @click="handleEdit(scope.row)">{{ scope.row.sensorAlias }}<i class="icon-edit el-icon--right"></i></el-button>
                    </div>
                </template>
            </el-table-column>
            <el-table-column prop="" :label="$t('hardware.showSwitch')" width="120px">
                <template v-slot="scope">
                    <el-switch v-model="scope.row.showMonitorFlag" 
                        :active-value="1"
                        :inactive-value="2"
                        >
<!--                        @change="scope.row.monitorFlag = scope.row.showMonitorFlag"-->
                    </el-switch>
                </template>
            </el-table-column>
<!--            <el-table-column prop="" :label="$t('hardware.senseSwitch')" width="80px">-->
<!--                <template v-slot="scope">-->
<!--                    <el-switch v-model="scope.row.monitorFlag" -->
<!--                        :active-value="1"-->
<!--                        :inactive-value="2"-->
<!--                        @change="scope.row.showMonitorFlag = scope.row.monitorFlag">-->
<!--                    </el-switch>-->
<!--                </template>-->
<!--            </el-table-column>-->
            <el-table-column
                :label="$t('common.handle')"
                min-width="130">
                <template v-slot="scope">
                    <el-button type="text" @click="handleReplace(scope.row)">{{ $t('hardware.change') }}</el-button>
                    <el-button type="text" @click="handlePreservation(scope.row)">{{ $t('system.save') }}</el-button>
                    <el-button type="text" @click="handleDelete(scope.row)" :disabled="scope.row.deleteFlag == 1">{{ scope.row.deleteFlag ? $t('hardware.unbinded') : $t('common.unBind') }}</el-button>
                    <el-button type="text" @click="handleMove(scope.row, scope.$index, 1)" v-if="scope.$index !== 0">{{ $t('system.turnUp') }}</el-button>
                    <el-button type="text" @click="handleMove(scope.row, scope.$index, 2)" v-if="scope.$index !== probeName.length -1">{{ $t('system.turnDown') }}</el-button>
                </template>
            </el-table-column>
        </el-table>
        <SensorTable
            ref="sensorTable"
            @handle="getList"
            @handleProbeNameEdit="handleSensorChange(1)"/>
    </el-dialog>
</template>

<script>
    import { getSensorEditList, postSensorChange } from "@/api/monitorIndicator"
    import {HINT_DEFAULT, HINT_DELETE} from "@/utils/constant";
    import {removeRoom} from "@/api/room";
    import SensorTable from "@c/SensorTable";
    import {postSensorBindLogadjustOrder} from "@/api/labDevice";
    export default {
        props:{
            changeId: {
                type: Number,
                default: null
            }
        },
        components: {

            SensorTable,
        },
        data() {
            return {
                loading: false,
                modalVisible: false,
                probeName: [],
                type: null,
                id: null,
                replaceData: {},
                originalData: [],
                no: null
            }
        },
        methods: {
            handleMove(item, index ,sortType) {
                const obj = {
                    sensorBindId: item.sortId,
                    sortType
                }
                this.loading = true;
                postSensorBindLogadjustOrder(obj).then(res => {
                    if (res.code) {
                        let i = sortType == 1 ? (index -1) : (index + 1);
                        const current = this.probeName[i];
                        this.$set(this.probeName, index, current);
                        this.$set(this.probeName, i, item);
                    } else {
                        this.$message.error(res.message);
                    }
                }).finally(() => {
                    this.loading = false;
                })
            },
            open(items,type) {
                // type 设备2,房间3
                this.type = type;
                this.id = items.id;
                this.no = items.no;
                this.modalVisible = true;
                this.getList()
            },
            getList() {
                this.loading = true;
                this.originalData = null;
                getSensorEditList({objId: this.id, objType: this.type}).then(res => {
                    this.loading = false;
                    if(res.code == 1){
                        for(var i = 0; i < res.items.length; i++){
                            res.items[i]['isEdit'] = false
                        }
                        this.probeName = res.items;
                        const arr = JSON.parse(JSON.stringify(res.items));
                        this.originalData = arr.reduce((prev, current) => {
                            prev[current.id] = current;
                            return prev
                        }, {});
                    }
                })
            },
            handleEdit(row){
                row.isEdit = true;
            },
            // 更换
            handleReplace(row){
                let str = "";
                if (row.deleteFlag == 1) {
                    str = this.$t('labDevice.replaceSensor1')
                } else {
                    str = this.$t('labDevice.replaceSensor')
                }
                this.$confirm(str, this.$t('common.hint'),{
                    confirmButtonText: this.$t('common.confirm'),
                    cancelButtonText: this.$t('common.cancel'),
                    type: "warning",
                }).then(() => {
                    this.$refs.sensorTable.open(1, this.type, row);
                    this.replaceData = row;
                }).catch(() => {

                })
            },
            // 保存
            handlePreservation(row){
                row.isEdit = false;
                this.replaceData = row;
                this.handleSensorChange()
            },
            // 删除
            handleDelete(row){
                this.$confirm(this.$t('hardware.deleteSensorMessage') + row.monitorSensorName + ">?", this.$t('hardware.deleteSensor'), {
                    type: "warning",
                    confirmButtonText: this.$t('common.confirm'),
                    cancelButtonText: this.$t('common.cancel')
                }).then(() => {
                    this.deleteComfirm(row);
                }).catch(() => {
                    this.$message.info(this.$t('common.deleteCanceled'))
                })
            },
            deleteComfirm(row){
                row.isEdit = false;
                this.replaceData = row;
                this.handleSensorChange(2);
            },
            // 请求  type =  1:更换; 2:删除; 0:保存;
            handleSensorChange(type=0){
                const data = {
                    editId: this.replaceData.id,
                    equipmentNo: this.replaceData.equipmentNo,
                    monitorFlag: this.replaceData.monitorFlag,
                    monitorSensorCatId: this.replaceData.monitorSensorCatId,
                    monitorSensorIdx: this.replaceData.monitorSensorIdx,
                    sensorAlias: this.replaceData.sensorAlias,
                    showMonitorFlag: this.replaceData.showMonitorFlag,
                    sortId: this.replaceData.sortId
                };
                // type=1代表更换
                if(type === 1){
                    data['changeId'] = this.$store.state.sensorChangeId
                }else if(type === 2){
                    data.willDelete = true;
                }
                postSensorChange(data).then(res => {
                    if(res.code !== null && res.code !== undefined){
                        if(res.code === 1){
                            this.$message.success([this.$t('labDevice.saveSuccess'), this.$t('hardware.changeSuccess') ,this.$t('common.deleteSuccess') ][type]);
                        }else{
                            this.$message.error(res.message)
                        }
                        this.getList()
                    }else{
                        this.$message.error(res.message)
                    }
                })
            },
            async handleSave() {
                const data = {
                    editId: this.replaceData.id,
                    equipmentNo: this.replaceData.equipmentNo,
                    monitorFlag: this.replaceData.monitorFlag,
                    monitorSensorCatId: this.replaceData.monitorSensorCatId,
                    monitorSensorIdx: this.replaceData.monitorSensorIdx,
                    sensorAlias: this.replaceData.sensorAlias,
                    showMonitorFlag: this.replaceData.showMonitorFlag,
                    sortId: this.replaceData.sortId
                };
                let res = await postSensorChange(data);
                if (res.code !== null && res.code !== undefined) {
                    if (res.code === 1) {
                    } else {
                        this.$message.error(res.message)
                    }
                } else {
                    this.$message.error(res.message)
                }
            },
            handleModalClose() {
                const obj = {
                    save: [],
                    next: true
                };
                this.probeName.map(item => {
                    const items = this.originalData[item.id];
                    if (item.sensorAlias != items.sensorAlias || item.showMonitorFlag != items.showMonitorFlag || item.monitorFlag != items.monitorFlag) {
                        obj.save.push(item);
                        obj.next = false;
                    }
                })
                if (!obj.next) {
                    this.$confirm(this.$t('labDevice.notSave'), this.$t('common.hint'), {
                        type: "warning",
                        confirmButtonText: this.$t('common.confirm'),
                        cancelButtonText: this.$t('common.cancel')
                    }).then(() => {
                        this.loading = true;
                        const requestArr = [];
                        obj.save.map(item => {
                            this.replaceData = item;
                            requestArr.push(this.handleSave())
                        })
                        Promise.all(requestArr).then(() => {
                            this.loading = false;
                            this.$message.success(this.$t('labDevice.saveSuccess'));
                            this.modalVisible = false;
                            this.$emit('handle');
                        })
                    }).catch(() => {
                        this.modalVisible = false;
                        this.$emit('handle')
                    })
                } else {
                    this.modalVisible = false;
                    this.$emit('handle')
                }
            },
        },
    }
</script>