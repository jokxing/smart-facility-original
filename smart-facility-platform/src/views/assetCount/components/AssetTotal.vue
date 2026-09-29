<template>
    <el-row type="flex" class="asset-total" justify="space-between">
        <el-col :span="6" v-for="(item,index) in statisticsData" :key="index">
            <div class="asset-grid-content">
                <div class="icon">
                    <i :class="item.icon"></i>
                </div>
                <div>
                    <p>{{ item.name }}</p>
                    <h3>{{ item.num }}</h3>
                    <p>
                        {{ $t('labDevice.yearOnYear') }}
                        <span :class="item.promotion === 0 ? 'normal' : item.promotion === 1 ? 'abnormal' : ''">
                            {{ item.percent }}<i :class="item.promotion === 0 ? 'el-icon-caret-top' : item.promotion === 1 ? 'el-icon-caret-bottom' : ''"></i>
                        </span>
                    </p>
                </div>
            </div>
        </el-col>
    </el-row>
</template>

<script>
    export default {
        props:{
            statistics: {
                type: Object,
                default: {}
            } 
        },
        data() {
            const _this = this;
            return {
                statisticsData: [
                    {
                        name: _this.$t('labDevice.totalStocktaking'),
                        num: 0,
                        percent: '0%',
                        promotion: null
                    },
                    {
                        name: _this.$t('labDevice.checkSum'),
                        icon: "icon-zichanzongshu",
                        num: 0,
                        percent: '0%',
                        promotion: null
                    },
                    {
                        name: _this.$t('labDevice.notMoveAssetNum'),
                        icon: "icon-weiyidongzichanshu",
                        num: 0,
                        percent: '0%',
                        promotion: null
                    },
                    {
                        name: _this.$t('labDevice.moveAssetNum'),
                        icon: "icon-yidongzichanshu",
                        num: 0,
                        percent: '0%',
                        promotion: null
                    },
                ]
            }
        },
        watch: {
            statistics(newValue){
                this.statisticsData[0].num = newValue.inventoryAmount || 0;
                this.statisticsData[1].num = newValue.inventoryNum || 0;
                this.statisticsData[2].num = newValue.noMoveNum || 0;
                this.statisticsData[3].num = newValue.moveNum || 0;
                this.statisticsData[0].percent = newValue.inventoryAmountPercent || '0%';
                this.statisticsData[1].percent = newValue.inventoryNumPercent || '0%';
                this.statisticsData[2].percent = newValue.noMoveNumPercent || '0%';
                this.statisticsData[3].percent = newValue.moveNumPercent || '0%';
                this.statisticsData[0].promotion = newValue.inventoryAmountPromotion;
                this.statisticsData[1].promotion = newValue.inventoryNumPromotion;
                this.statisticsData[2].promotion = newValue.noMoveNumPromotion;
                this.statisticsData[3].promotion = newValue.moveNumPromotion;
            }
        }
    }
</script>