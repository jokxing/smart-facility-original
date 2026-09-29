<template>
    <el-dialog
        :title="title"
        :visible.sync="dialogVisible"
        :before-close="handleClose"
        :close-on-click-modal="false"
        append-to-body
        class="sensor-table"
        top="3vh"
        width="55%">
        <div v-loading="loading">
            <el-form v-model="form" :inline="true"  label-position="left" label-width="auto">
                <el-form-item>
                    <el-input
                        v-model.trim="form.keyword"
                        class="input-with-select"
                        clearable
                        :placeholder="$t('hardware.inputNameOrNo')"
                        @keyup.enter.native="handleQuery">
                        <el-button
                            slot="append"
                            class="el-button-host"
                            icon="icon-search1"
                            @click="handleQuery">
                        </el-button>
                    </el-input>
                </el-form-item>
                <el-form-item>
                    <el-select
                        class="input-with-select"
                        :placeholder="$t('hardware.sensorType')"
                        :disabled="index === 1"
                        multiple
                        collapse-tags
                        clearable
                        v-model="form.sensorType"
                        @change="handleQuery">
                        <el-option
                            v-for="item in sensors" :key="item.id"
                            :value="item.id"
                            :label="DEVICE_ID[item.id] ? item.name : item.name + ' (' + item.unit + ')'">
                        </el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <Table :tableData="tableData" :data="list">
                <template slot-scope="data">
                    <div v-if="data.prop === 'bindList'">
                        <p class="index-offOn" v-for="item in data.data.bindList" :key="item.objId">
                            {{ THINGTYPE2[item.type] }}： {{ item.name }}
                            <span
                                v-if="data.data.nowBind && item.type === data.data.nowBind.split(';')[0] && item.objId === data.data.nowBind.split(';')[1]">
                                {{ $t('hardware.nowBind') }}
                            </span>
                            <span v-else>{{ $t('hardware.unNowBind') }}</span>
                        </p>
                    </div>
                    <div v-else>
                        <el-button 
                            type="text"
                            :disabled="data.data.bindList && data.data.bindList.length > 0"
                            @click="handleBinding(data.data)">
                            {{ $t('system.change') }}
                        </el-button>
                    </div>
                </template>
            </Table>
            <div class="paging">
                <pagination
                    v-show="total > form.pageSize"
                    :limit.sync="form.pageSize"
                    :page.sync="form.pageNum"
                    :total="total"
                    @pagination="getList"/>
            </div>
        </div>
    </el-dialog>
</template>

<script>
    import Table from "@c/Tables";
    import Pagination from "@/components/Pagination/index";
    import { getAllSensorType, postMonitorIndicatorList, postMonitorIndicatorAdd } from "@/api/monitorIndicator";
    import { THINGTYPE2, DEVICE_ID } from "@/utils/constant";
    import store from "@/store"
    export default {
        components: {
            Table,
            Pagination
        },
        data() {
            const _this = this;
            return {
                THINGTYPE2,
                DEVICE_ID,
                dialogVisible: false,
                loading: false,
                title: _this.$t('hardware.addSensor'),
                form: {
                    keyword: "",
                    sensorType: [],
                    pageNum: 1,
                    pageSize: 10
                },
                items: "",
                index: 0,
                type: 0,
                total: 0,
                sensors: [],
                tableData: [
                    {
                        label: "#",
                        type: "index",
                        width: "60"
                    },
                    {
                        label: _this.$t('hardware.devciceName'),
                        prop: "equipmentName",
                    },
                    {
                        label: _this.$t('hardware.devciceNo'),
                        prop: "equipmentNo",
                    },
                    {
                        label: _this.$t('hardware.monitorSensorName'),
                        prop: "monitorSensorName",
                        width: "120"
                    },
                    {
                        label: _this.$t('hardware.association'),
                        prop: "bindList",
                        isSlot: true,
                        width: "300"
                    },
                    {
                        label: _this.$t('common.handle'),
                        width: "80",
                        isSlot: true
                    },
                ],
                list: []
            }
        },
        methods: {
            /**
             *
             * @param index 0新增, 1更换
             * @param type 2设备，3房间
             * @param item 详情数据
             */
            open(index,type,item){
                this.index = index;
                this.type = type;
                this.items = item;
                this.dialogVisible = true;
                if(index === 0){
                    this.title = this.$t('hardware.addSensor')
                }else{
                    this.title = this.$t('hardware.editSensor');
                    this.form.sensorType = [item.monitorSensorCatId]
                }
                this.getType();
                this.getList();
            },
            getType() {
                getAllSensorType().then(res => {
                    if(res.code === 1){
                        this.sensors = res.items
                    }
                })
            },
            getList() {
                this.loading = true;
                postMonitorIndicatorList(this.form).then(res => {
                    this.loading = false;
                    if(res.code === 1){
                        this.list = res.items.list;
                        this.total = res.items.total
                    }
                })
            },
            handleQuery(){
                this.form.pageNum = 1;
                this.form.pageSize = 10;
                this.getList()
            },
            // 选择
            handleBinding(row) {
                if(this.index === 0){
                    var data = {
                        id: row.id,
                        equipmentNo: row.equipmentNo,
                        monitorSensorCatId: row.monitorSensorCatId,
                        monitorSensorIdx: row.monitorSensorIdx,
                        objId: this.items.id,
                        objNo: this.items.no,
                        objType: this.type
                    }
                    this.loading = true;
                    postMonitorIndicatorAdd(data).then(res => {
                        if(res.code){
                            if(res.code === 1){
                                this.$message.success(this.$t('common.addSuccess'));
                                this.getList()
                            }else{
                                this.loading = false;
                                this.$message.error(res.message)
                            }
                        }else{
                            this.loading = false;
                            this.$message.error(res.message)
                        }
                    })
                }else{
                    store.commit('setSensorChangeId', row.id);
                    // this.$emit("update:sensorTableChangeId", row.id);
                    this.handleClose();
                    this.$emit("handleProbeNameEdit")
                }
            },
            handleClose() {
                this.dialogVisible = false;
                this.form = {
                    keyword: "",
                    sensorType: "",
                    pageNum: 1,
                    pageSize: 10
                }
                if(this.index === 0){
                    this.$emit('handle')
                }
            }
        },
    }
</script>

<style lang="less" scoped>
    .sensor-table{
        .index-offOn{
            line-height: 26px;
            span{
                color: #409EFF;
            }
        }
        /deep/ .el-dialog__body{
            max-height: 831px;
            overflow-y: auto;
        }
        /deep/ .input-with-select{
            &.el-select>.el-input{
                width: 400px;
            }
        }
    }
</style>