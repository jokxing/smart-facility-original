<template>
    <div class="inner use-frequency" v-loading="loading">
        <el-row type="flex" justify="space-between">
            <h3>{{ $t('labDevice.useRate') }}</h3>
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

        <div ref="barEcharts" class="echarts"></div>
        <p v-if="!isData" class="no-data">{{ $t('common.notMessage1') }}</p>

        <div class="grade-list" v-if="isGunData">
            <ul>
                <li v-for="(item,index) in gradeList" :key="index">
                    <div>{{ item.name }}</div>
                    <div>{{ item.data }}%</div>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
    import * as echarts from 'echarts';
    import { postGunUseFrequency } from "@/api/gun";
    import { GUNTIME } from "@/utils/constant";
    import moment from "moment";
    export default {
        data() {
            return {
                GUNTIME,
                loading: false,
                isData: false,
                isGunData: false,
                options: {},
                myChart: null,
                gradeList: [],
                dateType: 3,
                datetimer: "",
                obj: {
                    gunFiltrateVO: {
                        departmentId: null,
                        gardenId: null,
                        buildingId: null,
                        floorId: null,
                        keyword: "",
                        roomIds: [],
                        signatureId: null,
                        status: null,
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
            const _this = this;
            this.options = {
                legend: {
                    orient: "vertical",
                    right: '6%',
                    bottom: 10,
                    formatter: function (name) {
                        return `${name}`;
                    },
                },
                tooltip: {
                    formatter: "{b}：{c}%"
                },
                series: [
                    {
                        type: 'pie',
                        radius: ['50%', '85%'],
                        center: '50%',
                        data: [],
                        label: {
                            show: true,
                            formatter: "{b}：{c}%",
                        },
                        itemStyle: {
                            normal: {
                                color: function (colors) {
                                    var colorList = [
                                        '#5470c6',
                                        '#91cc75',
                                        '#fac858',
                                        '#ef6567',
                                        '#73c0de',
                                    ];
                                    return colorList[colors.dataIndex];
                                }
                            },
                        }
                    }
                ],
                graphic:[
                    {
                        type:"text",
                        left:"center",
                        top:"38%",
                        style:{
                            text: _this.$t('common.all'),
                            textAlign: "center",
                            fill: "#333",
                            fontSize: 14,
                        }
                    },
                    {
                        type:"text",
                        left:"center",
                        top:"50%",
                        style:{
                            text: "0",
                            textAlign: "center",
                            fill: "#333",
                            fontSize: 20,
                            fontWeight: "bold"
                        }
                    }
                ]
            }

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
                var _this = this;
                this.loading = true;
                var chartData = []
                postGunUseFrequency(this.obj).then(res => {
                    this.loading = false;
                    if(res.code === 1){
                        if(res.items.gradeOneRatio > 0){
                            chartData.push({ value: res.items.gradeOneRatio, name: this.$t('labDevice.grade') + '1 [0-20%]',  list: res.items.gradeOneList })
                        }
                        if(res.items.gradeTwoRatio > 0){
                            chartData.push({ value: res.items.gradeTwoRatio, name: this.$t('labDevice.grade') + '2 [20-40%]', list: res.items.gradeTwoList })
                        }
                        if(res.items.gradeThreeRatio > 0){
                            chartData.push({ value: res.items.gradeThreeRatio, name: this.$t('labDevice.grade') + '3 [40-60%]', list: res.items.gradeThreeList })
                        }
                        if(res.items.gradeFourRatio > 0){
                            chartData.push({ value: res.items.gradeFourRatio, name: this.$t('labDevice.grade') + '4 [60-80%]', list: res.items.gradeFourList })
                        }
                        if(res.items.gradeFiveRatio > 0){
                            chartData.push({ value: res.items.gradeFiveRatio, name: this.$t('labDevice.grade') + '5 [80-100%]', list: res.items.gradeFiveList })
                        }
                        this.options.series[0].data = chartData;

                        if(chartData.length > 0){
                            this.isData = true;
                            this.options.graphic[0].style.text = this.$t('common.all');
                            this.options.graphic[1].style.text = res.items.count
                        }else{
                            this.isData = false;
                            this.options.graphic[0].style.text = "";
                            this.options.graphic[1].style.text = ""
                        }
                        this.$nextTick(() => {
                            this.myChart = echarts.init(this.$refs.barEcharts);
                            this.myChart.setOption(this.options);
                            this.myChart.on('click', function(params) {
                                _this.isGunData = true;
                                _this.gradeList = params.data.list
                            });
                            this.myChart.on('mouseout', function(params) {
                                _this.isGunData = false;
                                _this.gradeList = []
                            });
                        })
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
                this.getList()
            },
            // 时间格式化
            handleDatetimer(){
                this.dateType = null;
                this.obj.statisticsCommonParam.dateType = null;
                this.obj.statisticsCommonParam.beginTime = moment(this.datetimer[0]).format("YYYY-MM-DD HH:mm:ss");
                this.obj.statisticsCommonParam.endTime = moment(this.datetimer[1]).format("YYYY-MM-DD HH:mm:ss");
                this.getList()
            }
        },
    }
</script>

<style lang="less" scoped>
    .use-frequency{
        position: relative;
        .echarts {
            height: 280px;
        }
        .grade-list{
            width: 150px;
            padding: 20px;
            background-color: rgba(0, 0, 0, 0.75);
            position: absolute;
            top: 15%;
            right: 25%;
            border-radius: 10px;
            ul{
                li{
                    width: 100%;
                    display: flex;
                    justify-content: space-between;
                    color: #fff;
                }
            }
        }
    }
</style>