<template>
    <div class="screen-result-statistics">
        <el-row type="flex" justify="space-between">
            <h3 class="title-h3">{{ $t('labDevice.screenResult') }}</h3>
<!--            <div>-->
<!--                使用率算法设置&nbsp;&nbsp;&nbsp;-->
<!--                <el-button -->
<!--                    v-for="item in PERIODTYPES"-->
<!--                    :key="item.value"-->
<!--                    :type="data.periodType === item.value ? 'primary' : ''"-->
<!--                    @click="handlePeriodType(item.value)">-->
<!--                    {{ item.label }}-->
<!--                </el-button>-->
<!--            </div>-->
        </el-row>

        <el-row type="flex" justify="space-between" class="box">
            <GunUseFrequency ref="gunUseFrequency" />
            <SignatureUseRanked ref="signatureUseRanked" /> 
        </el-row>

        <TimePeriodSelection ref="timePeriodSelection" @handle="handlePeriodTime" />
    </div>
</template>

<script>
    import GunUseFrequency from "./GunUseFrequency";
    import SignatureUseRanked from "./SignatureUseRanked";
    import TimePeriodSelection from "./TimePeriodSelection";
    import { PERIODTYPES } from "@/utils/constant";
    export default {
        components: {
            GunUseFrequency,
            SignatureUseRanked,
            TimePeriodSelection
        },
        data() {
            return {
                PERIODTYPES,
                data: {
                    departmentId: null,
                    signatureId: null,
                    keyword: "",
                    periodType: 1,
                    periodBeginTime: "",
                    periodEndTime: "",
                    gardenId: null,
                    buildingId: null,
                    floorId: null,
                    roomIds: [],
                    status: null
                },
                num: 0
            }
        },
        methods: {
            getList(data) {
                this.data.gardenId = data.gardenId;
                this.data.buildingId = data.buildingId;
                this.data.floorId = data.floorId;
                this.data.roomIds = data.roomIds;
                this.data.departmentId = data.departmentId;
                this.data.signatureId = data.signatureId;
                this.data.keyword = data.keyword;
                this.data.status = data.status;
                this.$refs.gunUseFrequency.init(this.data);
                this.$refs.signatureUseRanked.init(this.data)
            },
            handlePeriodType(value){
                if(value === 0){
                    var time = [this.data.periodBeginTime,this.data.periodEndTime];
                    this.$refs.timePeriodSelection.open(time)
                }else{
                    this.data.periodType = value;
                    this.$nextTick(() => {
                        this.$refs.gunUseFrequency.init(this.data);
                        this.$refs.signatureUseRanked.init(this.data)
                    })
                }
            },
            // 使用率算法设置-时段
            handlePeriodTime(data) {
                this.data.periodType = data.periodType;
                this.data.periodBeginTime = data.startTime;
                this.data.periodEndTime = data.endTime;
                this.$nextTick(() => {
                    this.$refs.gunUseFrequency.init(this.data);
                    this.$refs.signatureUseRanked.init(this.data)
                })
            },
        },
    }
</script>

<style lang="less" scoped>
    .screen-result-statistics{
        .box{
            margin-top: 20px;
            /deep/ h3{
                font-size: 16px;
                margin-bottom: 20px;
            }
            /deep/ .inner{
                width: 49%;
                position: relative;
                .no-data{
                    position: absolute;
                    top: 15%;
                    width: 100%;
                    height: 250px;
                    line-height: 250px;
                    text-align: center;
                }
                .paging{
                    margin-top: 15px;
                }
            }
        }
    }
</style>