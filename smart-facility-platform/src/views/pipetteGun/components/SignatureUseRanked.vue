<template>
    <div class="inner" v-loading="loading">
        <el-row type="flex" justify="space-between">
            <h3>{{ $t('labDevice.useRateSort') }}</h3>
            <div class="tab-1">
                <el-button 
                    v-for="item in GUNTIME" 
                    :key="item.value" 
                    :type="dateType === item.value ? 'primary' : ''"
                    @click="handleDate(item.value)">
                    {{ item.label }}
                </el-button>
                <el-date-picker
                    v-model="datetimer"
                    type="datetimerange"
                    :range-separator="$t('common.most')"
                    :start-placeholder="$t('common.startDate')"
                    :end-placeholder="$t('common.endDate')"
                    @change="handleDatetimer">
                </el-date-picker>
            </div>
        </el-row>

        <Histogram 
            v-if="isData"
            :titleSubtext="titleSubtext" 
            :chartData="chartData" />
        <p v-if="!isData" class="no-data">{{ $t('common.notMessage1') }}</p>

        <div class="paging" v-if="total > 10">
            <pagination
                v-show="total > 10"
                :limit.sync="items.pageSize"
                :page.sync="items.pageNum"
                :total="total"
                @pagination="getList"/>
        </div>
    </div>
</template>

<script>
    import Histogram from "./Histogram";
    import Pagination from "@/components/Pagination/index";
    import { postSignatureUseRanked } from "@/api/gun";
    import { GUNTIME } from "@/utils/constant";
    import moment from "moment";
    export default {
        components: {
            Histogram,
            Pagination
        },
        data() {
            const _this = this;
            return {
                GUNTIME,
                loading: false,
                isData: false,
                titleSubtext: _this.$t('transport.unit') + "：%",
                datetimer: "",
                dateType: 3,
                startDate: "",
                endDate: "",
                items: {
                    pageNum: 1,
                    pageSize: 10,
                },
                total: 0,
                obj: {
                    pageNum: 1,
                    pageSize: 10,
                    gunFiltrateVO: {
                        departmentId: null,
                        gardenId: null,
                        buildingId: null,
                        floorId: null,
                        keyword: "",
                        roomIds: [],
                        signatureId: null,
                        status: null
                    },
                    statisticsCommonParam: {
                        periodType: 1,
                        beginTime: "",
                        endTime: "",
                        dateType: 3,
                        periodBeginTime: '',
                        periodEndTime: ''
                    }
                }
            }
        },
        mounted() {
            this.getList()
        },
        methods: {
            init(data) {
                this.obj.gunFiltrateVO.departmentId = data && data.departmentId ? data.departmentId : null;
                this.obj.gunFiltrateVO.gardenId = data && data.gardenId ? data.gardenId : null;
                this.obj.gunFiltrateVO.buildingId = data && data.buildingId ? data.buildingId : null;
                this.obj.gunFiltrateVO.floorId = data && data.floorId ? data.floorId : null;
                this.obj.gunFiltrateVO.keyword = data && data.keyword ? data.keyword : "";
                this.obj.gunFiltrateVO.roomIds = data && data.roomIds ? data.roomIds : [];
                this.obj.gunFiltrateVO.signatureId = data && data.signatureId ? data.signatureId : null;
                this.obj.gunFiltrateVO.status = data.status;

                this.obj.statisticsCommonParam.periodType = data && data.periodType ? data.periodType : 1;
                this.obj.statisticsCommonParam.dateType = this.dateType;
                this.obj.statisticsCommonParam.periodBeginTime = data && data.periodBeginTime ? data.periodBeginTime : '';
                this.obj.statisticsCommonParam.periodEndTime = data && data.periodEndTime ? data.periodEndTime : '';

                this.getList()
            },
            getList() {
                this.obj.pageNum = this.items.pageNum;
                this.obj.pageSize = this.items.pageSize;
                this.isData = false;
                this.loading = true
                postSignatureUseRanked(this.obj).then(res => {
                    this.loading = false;
                    if(res.code === 1){
                        this.chartData = res.items.list;
                        this.total = res.items.total;

                        if(res.items.list.length > 0){
                            this.isData = true;
                        }else{
                            this.isData = false;
                        }
                    }
                })
            },
            // 选择时间
            handleDate(value) {
                this.dateType = value;
                this.obj.statisticsCommonParam.dateType = value;
                this.datetimer = '';

                this.obj.statisticsCommonParam.beginTime = "";
                this.obj.statisticsCommonParam.endTime = "";
                this.items = {
                    pageNum: 1,
                    pageSize: 10,
                };
                this.getList()
            },
            // 时间格式化
            handleDatetimer(){
                this.dateType = null;
                this.obj.statisticsCommonParam.dateType = null;
                this.obj.statisticsCommonParam.beginTime = moment(this.datetimer[0]).format("YYYY-MM-DD HH:mm:ss");
                this.obj.statisticsCommonParam.endTime = moment(this.datetimer[1]).format("YYYY-MM-DD HH:mm:ss");
                this.items = {
                    pageNum: 1,
                    pageSize: 10,
                };
                this.getList()
            }
        },
    }
</script>