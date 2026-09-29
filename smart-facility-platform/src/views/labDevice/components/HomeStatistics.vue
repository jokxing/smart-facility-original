<template>
    <div class="use-rate-chart">
        <div class="session flex">
            <select-asset-classify
                class="input-with-select"
                :id.sync="items.categoryId"
                :disabled="leftUseCharts.loading"
                :select-tree-value.sync="items.categoryId"/>
            <el-date-picker
                v-model="items.year"
                type="year"
                format="yyyy"
                value-format="yyyy"
                :clearable="false"
                :disabled="leftUseCharts.loading"
                class="w60 margin-small-right"
                :placeholder="$t('common.selectMonth')">
            </el-date-picker>
            <el-select
                class="w60 margin-small-right"
                :placeholder="$t('common.selectMonth')"
                clearable
                :disabled="leftUseCharts.loading"
                v-model="items.month">
                <el-option
                    v-for="item in months"
                    :key="item.value"
                    :label="item.label" :value="item.value"></el-option>
            </el-select>
            <el-button :disabled="leftUseCharts.loading" :class="{'is-active': items.periodType === 1}"
                       @click="items.periodType = 1">
                {{ $t("common.workday") }}
            </el-button>
            <el-button :disabled="leftUseCharts.loading" :class="{'is-active': items.periodType === 2}"
                       @click="items.periodType = 2">
                {{ $t("common.naturalDay") }}
            </el-button>
        </div>
        <el-row type="flex" justify="space-between">
            <el-col :span="8" style="min-width:400px" class="mr16">
                <div class="equipmentStatus session chart-height">
                    <div class="title">
                        <span>{{ $t('labDevice.compositeUse1') }}</span>
                        <!--            <span style="float: right">{{ deviceCount }}</span>-->
                    </div>
                    <div class="left-chart">

                        <div style="height: 100%" v-if="compositeUseCharts.rows.length">
                            <div class="unit">{{ $t('transport.unit') + ":" + " "+ $t('common.stand') }}</div>
                            <ve-histogram
                                :extend="compositeOption"
                                v-loading="compositeUseCharts.loading"
                                :height="'100%'"
                                :data="compositeUseCharts"
                            />
                        </div>
                        <data-empty :height="'100%'" v-loading="compositeUseCharts.loading" v-else/>
                    </div>
                </div>
            </el-col>
            <el-col :span="16">
                <!-- 设备使用率统计 -->
                <div class="equipmentStatus session chart-height">
                    <div class="title">
                        <span>{{ $t('labDevice.compositeUse2') }}</span>
                    </div>
                    <div v-if="leftUseCharts.rows.length" v-loading="leftUseCharts.loading"
                         style="display: flex;justify-content: space-between">
                        <div class="rate-chart">
                            <div class="unit">{{ $t('transport.unit') + ":" + " %" }}</div>
                            <ve-bar
                                :extend="leftOption"
                                :data="leftUseCharts"
                                v-if="leftUseCharts.rows.length"
                                v-loading="leftUseCharts.loading"
                                :height="'100%'"
                                :colors="['#3078F0']"
                            />
                        </div>
                        <div class="ul">
                            <ul class="right-table">
                                <li class="table-head">
                                    <div class="composite"></div>
                                    <div class="composite">{{ $t("labDevice.compositeRate") }}</div>
                                    <div class="composite">{{ $t("labDevice.useNum") }}</div>
                                    <div class="composite">{{ $t("labDevice.runDurationHMS") }}</div>
                                </li>
                                <li class="table-tr" v-for="(item,index) in leftUseCharts.rows" :key="index">
                                    <div class="composite">{{ item.typeName }}</div>
                                    <div class="composite">{{ item.useRate }}%</div>
                                    <div class="composite">{{ item.useCount }}{{ $t('common.next') }}</div>
                                    <div class="composite">{{ item.dayUseCount }}{{
                                            $t('labDevice.host')
                                        }}/{{ $t('other.everyday') }}
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <data-empty :height="'86%'" v-loading="leftUseCharts.loading" v-else/>
                </div>
            </el-col>

        </el-row>
    </div>
</template>

<script>
import echarts from "echarts";
import {
    getStatisticEquipmentClassification,
    getStatisticEquipmentUseRate,
    queryClassificationV3Statistics
} from "@/api/labDevice";
import VeHistogram from "v-charts/lib/histogram.common";
import VeBar from "v-charts/lib/bar.common";
import DataEmpty from "@c/DataEmpty";
import SelectAssetClassify from "@c/SelectAssetClassify";

export default {
    name: "HomeStatistics",
    components: {
        VeHistogram,
        DataEmpty,
        VeBar,
        SelectAssetClassify
    },
    data() {
        const _this = this;
        return {
            leftOption: {
                legend: {
                    show: false
                },
                tooltip: {
                    trigger: 'item',
                    show: true,
                    formatter: (params) => {
                        return params.name + '：' + params.data + "%"
                    }
                },
                grid: {
                    top: 20,
                    left: 0,
                    right: 20,
                    bottom: 0
                },
                xAxis: {
                    axisLabel: {
                        formatter: "{value}%"
                    },
                },
                yAxis: {
                    inverse: true,
                },
                series: {
                    type: 'bar',
                    barMaxWidth: 30,
                    barCategoryGap: "10%",
                    itemStyle: {
                        normal: {
                            color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
                                {offset: 0, color: '#3078F0'},
                                {offset: 1, color: '#F6F9FE'}
                            ])
                        }
                    }
                },
            },
            compositeOption: {
                yAxis: {
                    type: 'value',
                    axisLabel: {
                        formatter: (value) => {
                            return value
                        }
                    },
                    minInterval: 1
                },
                grid: {
                    right: 0,
                    bottom: 0,
                    top: 20,
                    left: 0
                },
                legend: {
                    show: false
                },
                tooltip: {
                    trigger: 'item',
                    show: true,
                    formatter: (params) => {
                        return this.tootilFormatter(params)
                    }
                },
                xAxis: {
                    axisLabel: {
                        interval: 0
                    }
                },
                series: {
                    barMaxWidth: 20,
                    backgroundStyle: {
                        color: '#F9F7F3',
                        // barBorderRadius: [10, 10, 10, 10]
                    },
                    itemStyle: {
                        normal: {
                            color: function (params) {
                                const colors = [
                                    "#D9B480"
                                ]
                                return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                    {offset: 0, color: colors[0]},
                                    {offset: 1, color: colors[0] + 50}
                                ])
                            },
                            // barBorderRadius: [10, 10, 10, 10]
                        }
                    }
                }
            },
            compositeUseCharts: {
                loading: false,
                columns: ['name', 'data'],
                rows: [],
                formatter: ' %',
                name: '使用率',
                type: 1
            },
            // 左边图表数据
            leftUseCharts: {
                loading: false,
                columns: ['typeName', 'useRate'],
                rows: [],
                type: 1
            },
            items: {
                categoryId: "",
                periodType: 1,
                year: "",
                month: ""
            },
            months: [
                {value: 1, label: '01'},
                {value: 2, label: '02'},
                {value: 3, label: '03'},
                {value: 4, label: '04'},
                {value: 5, label: '05'},
                {value: 6, label: '06'},
                {value: 7, label: '07'},
                {value: 8, label: '08'},
                {value: 9, label: '09'},
                {value: 10, label: 10},
                {value: 11, label: 11},
                {value: 12, label: 12},
            ],
            isHeight: true
        }
    },
    watch: {
        'items.categoryId': {
            handler(value) {
                this.init()
            }
        },
        'items.year': {
            handler(value) {
                if (this.leftUseCharts.loading) {
                    return
                }
                this.init()
            }
        },
        'items.month': {
            handler(value) {
                if (this.leftUseCharts.loading) {
                    return
                }
                this.init()
            }
        },
        'items.periodType': {
            handler(value) {
                this.init()
            }
        },

    },
    created() {
        const date = new Date();
        this.items.year = date.getFullYear().toString();
        this.items.month = date.getMonth() + 1;
        console.log(window.screen.width)
        this.isHeight = window.screen.width > 1350;
    },
    methods: {
        init() {
            this.getUseRate();
            this.queryClassifyChartData();
        },
        tootilFormatter(params) {
            return params.name + '：' + params.data
        },
        async getUseRate() {
            this.leftUseCharts.loading = true
            this.leftUseCharts.rows = [];
            await getStatisticEquipmentUseRate(this.items).then(res => {
                this.leftUseCharts.loading = false;
                if (res.code) {
                    this.leftUseCharts.rows = res.items
                    const max = Math.max.apply(
                        Math,
                        this.leftUseCharts.rows.map((item) => {
                            return item.useRate
                        })
                    )
                    if (max >= 10) {
                        delete this.leftOption.xAxis.max;
                    } else {
                        this.leftOption.xAxis.max = 10;
                    }

                }
            })
        },
        async queryClassifyChartData() {
            this.compositeUseCharts.loading = true
            this.compositeUseCharts.rows = []
            let defaultData = []
            try {
                await getStatisticEquipmentClassification(this.items).then((res) => {
                    this.compositeUseCharts.loading = false;
                    if (!res.items.classificaVOList?.length) {
                        res.items.classificaVOList = defaultData
                    }
                    this.handleCompositeUseChartData(res.items.classificaVOList)
                })
            } catch (e) {
                this.compositeUseCharts.loading = false;
                this.handleCompositeUseChartData(defaultData)
            }

        },
        handleCompositeUseChartData(list) {
            if (list.length === 0) {
                return
            }
            list.map((item) => {
                let name = ''
                switch (item.useRateFlag) {
                    case 1:
                        name = '0-20%'
                        break
                    case 2:
                        name = '20-40%'
                        break
                    case 3:
                        name = '40-60%'
                        break
                    case 4:
                        name = '60-80%'
                        break
                    case 5:
                        name = '80-100%'
                        break
                }
                this.compositeUseCharts.rows.push({
                    name,
                    data: item.useRateNum
                })
                const max = Math.max.apply(
                    Math,
                    this.compositeUseCharts.rows.map((item) => {
                        return item.data
                    })
                )
                if (max >= 5) {
                    delete this.compositeOption.yAxis.max;
                } else {
                    this.compositeOption.yAxis.max = 5;
                }
            })
        },
    }
}
</script>

<style lang="less" scoped>
@import "../../../../src/style/variable";

.rate-chart {
}

.rate-chart:nth-of-type(1) {
    width: 45%;
    height: 295px;
}

.unit {
    color: #333333;
    font-size: 14px;
    font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
}

.rate-chart:nth-of-type(2) {
    width: 50%;
}

.title {
    font-size: 16px;
    font-weight: bold;
    color: #333333;
    margin-right: 40px;
    margin-bottom: 20px;

    .infoIcon {
        position: relative;
        top: 2px;
    }
}

.total {
    display: flex;
    justify-content: center;

    /deep/ .el-button {
        padding: 8px !important;
    }

    .el-icon-arrow-left,
    .el-icon-arrow-right {
        color: #555555 !important;
    }

    .total-num {
        margin: 0 10px;
        line-height: 30px;
    }
}

.ul {
    position: relative;

    .right-table {
        position: absolute;
        right: 0;
        top: -40px;
        font-size: 14px;

        li {
            list-style: none;
            display: flex;
            text-align: center;

            .composite {
                width: 140px;
                height: 60px;
            }

        }

        .table-head {
            font-weight: 400;
            color: #333333;
            line-height: 60px;

            .composite:nth-of-type(2) {
                background: #E8F2FE;
                border-radius: 10px 10px 0 0;
            }

            .composite:nth-of-type(3) {
                background: #D9F3EA;
                border-radius: 10px 10px 0 0;
            }

            .composite:nth-of-type(4) {
                background: #F8EEDC;
                border-radius: 10px 10px 0 0;
            }
        }

        .table-tr {
            line-height: 49px;
            font-weight: 400;
            color: #555555;

            .composite {
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
                height: 49px;
            }

            .composite:nth-of-type(1) {
                height: 35px;
                background: #FFFFFF;
                box-shadow: 0 0 3px 0 rgba(15, 61, 137, 0.1);
                border-radius: 15px 0 0 15px;
                margin: auto 0 auto 20px;
                line-height: 35px;
                font-size: 12px;
                width: 120px;
            }

            .composite:nth-of-type(2) {
                background: #F7FBFF;
            }

            .composite:nth-of-type(3) {
                background: #F0FAF6;
            }

            .composite:nth-of-type(4) {
                background: #FFFBF4;
            }
        }

        .table-tr:nth-of-type(2n-1) {
            .composite:nth-of-type(2) {
                background: #EEF5FE;
            }

            .composite:nth-of-type(3) {
                background: #E4F4EE;
            }

            .composite:nth-of-type(4) {
                background: #FCF5E9;
            }
        }
    }
}
.left-chart {
    height: 295px;
}
.is-active {
    background: @subjectColor !important;
    color: @white !important;
}

.el-button:hover {
    background: @subjectColor !important;
    color: @white !important;
}

.w60 {
    width: 100px;
}

.chart-height {
    height: 395px;
}

</style>