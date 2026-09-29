<template>
    <div class="electricity-custom">
        <el-descriptions title="设备使用状态统计">
            <template slot="extra">
                <el-button type="primary" icon="icon-query-data" @click="$refs.SeeHistoryData.open(EquipmentId)"> 查看历史数据</el-button>
            </template>
        </el-descriptions>

        <div class="useStatistics-box" v-loading="loading">
            <el-row type="flex" justify="space-between" class="box">
                <el-col :span="8">
                    <div class="box-item">
                        <div class="box-item-header">
                            <div class="flex">
                              <div class="name">当前状态</div>
                              <div class="dateTime">
                                起始时间：{{ useStatisticsData.currentRunStartDate }}
                              </div>
                            </div>
                            <div class="status" :class="statusColor(useStatisticsData.currentStatus,SMARTSOCKETSTATUS)">{{ statusText(useStatisticsData.currentStatus, SMARTSOCKETSTATUS) }}</div>
                        </div>
                        <div class="box-item-content">
                            <div class="flexBox status-box">
                                <div class="status-box-item">
                                    <div class="item_header">
                                        {{
                                            useStatisticsData.currentStatus === 0
                                                ? "关机"
                                                : useStatisticsData.currentStatus === 2
                                                ? "待机"
                                                : "运行"
                                        }}时长
                                    </div>
                                    <div class="item_content">
                                        <div class="text">
                                            <span class="value" v-html="timeTransform(useStatisticsData.currentRunDuration)"></span>
                                        </div>
                                    </div>
                                </div>

                                <div class="status-box-item">
                                    <div class="item_header">耗电量</div>
                                    <div class="item_content">
                                        <div class="text">
                                            <span class="value num">
                                                {{ useStatisticsData.currentElectricityStr }}
                                            </span>
                                            <span class="unit">kw`h</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </el-col>
                <el-col :span="8">
                    <div class="box-item history">
                      <div class="box-item-header">
                          <div class="name">累计统计</div>
                      </div>
                        <div class="flexBox status-box">
                            <div class="status-box-item">
                                <div class="name">历史累计运行时长</div>
                                <div class="row">
                                    <div class="text">
                                        <span class="value" v-html="timeTransform(useStatisticsData.runDuration)">
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div class="status-box-item">
                                <div class="name">历史累计耗电量</div>
                                <div class="row">
                                    <div class="text">
                                        <i class="icon icon-powerEnergy"></i>
                                        <span class="value num">
                                            {{ useStatisticsData.electricityStr }}
                                        </span>
                                        <span class="unit">kw`h</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </el-col>
                <el-col :span="8">
                    <div class="box-item query">
                        <div class="clearfix handleTool">
                          <div class="box-item-header">
                            <div class="name">自定义查询</div>
                          </div>
                            <el-date-picker
                                v-model="useStatisticsDate"
                                end-placeholder="结束日期"
                                range-separator="-"
                                start-placeholder="开始日期"
                                type="daterange"
                                class="w250"
                                value-format="yyyy-MM-dd"
                                @change="getElectricityStatistics">
                            </el-date-picker>
                        </div>
                        <div class="box-item-content">
                            <div class="">
                                运行次数：<span class="num">{{ useStatisticsData.customRunNum }}</span>次
                            </div>
                            <div class="">
                                运行时长：<span v-html="timeTransform(useStatisticsData.customRunDuration)"></span>
                            </div>
                            <div class="">
                                累积功耗：<span class="num">{{ useStatisticsData.customElectricity }}</span>
                                kw`h
                            </div>
                        </div>
                    </div>
                </el-col>
            </el-row>
        </div>

        <see-history-data ref="SeeHistoryData"/>
    </div>
</template>

<script>
    import SeeHistoryData from "@/views/labDevice/components/SeeHistoryData";
    import { postSmartSocketElectricityStatistics } from "@/api/labDevice";
    import { SMARTSOCKETSTATUS } from "@/utils/constant";
    import { statusColor,statusText } from "@/utils/methods";
    export default {
        components: {
            SeeHistoryData
        },
        props: {
            bindingDeviceId: {
                type: [String, Number],
                default: null
            }
        },
        data() {
            return {
                SMARTSOCKETSTATUS,
                statusColor,
                statusText,
                loading: false,
                useStatisticsData: {},
                useStatisticsDate: "",
                EquipmentId: 0
            }
        },
        mounted() {
            this.EquipmentId = this.bindingDeviceId;
            this.getElectricityStatistics();
        },
        methods: {
            getElectricityStatistics() {
              const data = this.useStatisticsDate ? {
                  instrumentId: this.EquipmentId,
                startTime: this.useStatisticsDate[0],
                endTime: this.useStatisticsDate[1],
              } : {
                  instrumentId: this.EquipmentId,
                interval: 6
              };
              this.loading = true;
                postSmartSocketElectricityStatistics(data).then(res => {
                    this.loading = false;
                    if(res.code === 1){
                        this.useStatisticsData = res.items
                    }
                })
            },
            timeTransform(sec) {
                let d = Math.floor(sec / (60 * 60 * 24));
                let dh = sec % (60 * 60 * 24);
                let h = Math.floor(dh / (60 * 60));
                let ms = dh % (60 * 60);
                let m = Math.floor(ms / 60);
                let s = ms % 60;
                let timeStr = "";
                if (d) {
                    timeStr += `<span class="num">${d}</span>天`;
                }
                if (h) {
                    timeStr += `<span class="num">${h}</span>时`;
                }
                if (m) {
                    timeStr += `<span class="num">${m}</span>分`;
                }
                if (s) {
                    timeStr += `<span class="num">${s}</span>秒`;
                }
                if (!timeStr) {
                    timeStr = 0;
                }

                return timeStr;
            },
            handleTab(item){
                this.EquipmentId = item.EquipmentId;
                this.getElectricityStatistics()
            },
            // 本月
            handleSelectUseStatisticsDate() {
                this.useStatisticsDate = "";
                this.getElectricityStatistics()
            },
        },
    }
</script>

<style lang="less" scoped>
    @import "../../../style/variable";
    .electricity-custom{
        .tab{
            span{
                cursor: pointer;
                &.active{
                    color: @subjectColor;
                }
            }
        }
    }
    .useStatistics-box {
      /deep/.num {
        font-size: 24px;
        font-weight: bold;
        color: #3A81F7 !important;
        line-height: 30px;
      }
        .box {
            margin: 0;

            .box-item {
              width: 400px;
              height: 200px;
              background: #FFFFFF;
              padding: 20px;
              box-shadow: 0px 1px 5px 0px rgba(4,0,0,0.06);
              border-radius: 6px;

                .status {
                    text-align: center;

                    &.running {
                        color: #13ce66;
                        border-color: #13ce66;
                    }

                    &.standBy {
                        color: #e5e5e5;
                        border-color: #ff4949;
                    }
                }

                .box-item-header {
                  display: flex;
                  justify-content: space-between;
                      .name {
                          color: #333333;
                          font-weight: bold;
                          margin-right: 10px;
                      }
                  .dateTime {
                    font-size: @font12;
                    text-align: center;
                  }
                }

                .box-item-content {
                  font-size: 14px;
                    .status-box {
                        padding: 40px 0 20px;
                        justify-content: space-between;

                        .status-box-item {
                            flex: 1;
                            text-align: center;

                            .item_header {
                              color: @555;
                                margin-bottom: 20px;
                            }

                            .item_content {
                                .text {

                                    .value {
                                        color: @555;
                                    }
                                  .unit {
                                    color: @555;
                                    font-size: @font14;
                                    font-weight: normal;
                                  }
                                }

                            }
                        }
                    }


                }

                &.history {

                    .status-box-item {
                      font-size: 14px;
                      padding: 40px 0 20px;
                        flex: 1;

                        .name {
                        text-align: center;
                        }



                        .row {
                            position: relative;
                            margin: 0;
                            height: 40px;
                            line-height: 40px;
                            text-align: center;

                            .icon {
                                color: #3A81F7;
                                font-size: 16px;
                                margin-right: 5px;
                            }

                            .text {
                                margin-top: 15px;
                              color: @555;
                              font-weight: 600;

                              .value {
                                color: @555;
                              }
                              .unit {
                                color: @555;
                                font-size: @font14;
                                font-weight: normal;
                              }
                            }
                        }
                    }
                }

                &.query {
                    .handleTool {
                        flex-wrap: nowrap;

                        .btn {
                            margin-right: 20px;
                            background-color: #db943b;
                            border-color: #db943b;
                        }

                        .el-range-editor.el-input__inner {
                            width: auto;
                        }
                    }

                    .box-item-content {
                        padding: 30px 10px;
                    }
                }
            }
        }
    }
.w250 {
  width: 250px !important;
}
</style>