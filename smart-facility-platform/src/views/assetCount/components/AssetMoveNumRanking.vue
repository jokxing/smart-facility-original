<template>
    <div>
        <div class="head">
            <div class="title">{{ $t('labDevice.assetMoveNum') }}</div>
            <el-button type="text" icon="el-icon-more" class="more" @click="$emit('handle', yearMonth)"></el-button>
        </div>
        <div class="session rank">
            <div class="query">
                <el-form :inline="true" :label-position="'left'" ref="form" label-width="70px">
                    <el-form-item :label="$t('common.selectMonth')">
                        <el-date-picker
                            v-model="yearMonth"
                            type="month"
                            :clearable="false"
                            :placeholder="$t('common.selectMonth')"
                            :picker-options="pickerOptions"
                            @change="handleMonth">
                        </el-date-picker>
                    </el-form-item>
                </el-form>
                <div>
                    <el-button 
                        v-for="item in tabs" 
                        :key="item.value"
                        :type="item.value === type ? 'primary' : ''"
                        @click="handleType(item.value)">
                        {{ item.text }}
                    </el-button>
                </div>
            </div>

            <Table :tableData="tableData" :data="list" v-loading="loading" style="margin-top: 0">
                <template slot-scope="data">
                    <el-progress 
                        v-if="data.prop === 'progress'"
                        :show-text="false" 
                        :stroke-width="16" 
                        :percentage="data.data.percentage ? data.data.percentage : 0">
                    </el-progress>
                    <span v-if="data.prop === 'propertyPercent'" :class="data.data.propertyPromotion === 0 ? 'normal' : data.data.propertyPromotion === 1 ? 'abnormal' : ''">
                        {{ data.data.propertyPercent }} 
                        <i :class="data.data.propertyPromotion === 0 ? 'el-icon-caret-top' : data.data.propertyPromotion === 1 ? 'el-icon-caret-bottom' : ''"></i>
                    </span>
                </template>
            </Table>
        </div>
    </div>
</template>

<script>
    import Table from "@c/Tables";
    import { postPropertyMoveNumRank } from "@/api/property";
    import moment from "moment";
    export default {
        components: {
            Table
        },
        data() {
            const _this = this;
            return {
                loading: false,
                yearMonth: moment(new Date()).format("YYYY-MM"),
                pickerOptions: {
                    disabledDate: (time) => {
                        let a = new Date().getFullYear();
                        let b = new Date().getMonth();
                        return time.getMonth() > b || time.getFullYear() != a
                    }
                },
                tabs: [
                    {
                        text: _this.$t('labDevice.labDeviceType'),
                        value: 1
                    },
                    {
                        text: _this.$t('labDevice.degree'),
                        value: 2
                    },
                ],
                type: 1,
                tableData: [
                    {
                        label: _this.$t('labDevice.ranking'),
                        type: "index",
                        width: "60"
                    },
                    {
                        label: _this.$t('labDevice.labDeviceType'),
                        prop: "instrumentName",
                        width: "240"
                    },
                    {
                        prop: "progress",
                        isSlot: true
                    },
                    {
                        label: _this.$t('labDevice.degree'),
                        prop: "propertyMoveNum",
                        width: "80"
                    },
                    {
                        label: _this.$t('labDevice.monthBasis'),
                        prop: "propertyPercent",
                        isSlot: true,
                        width: "100"
                    },
                ],
                list: []
            }
        },
        mounted() {
            this.getList()
        },
        methods: {
            getList() {
                var data = {
                    type: this.type,
                    yearMonth: this.yearMonth
                }
                this.loading = true;
                postPropertyMoveNumRank(data).then(res => {
                    this.loading = false;
                    if(res.code === 1){
                        var list = res.items.propertyMoveResultList;
                        if(res.items.propertyCount > 0){
                            for(var i = 0; i < list.length; i++){
                                list[i]['percentage'] = (list[i].propertyMoveNum / res.items.propertyCount) * 100
                            }
                        }
                        this.list = list;
                    }
                })
            },
            handleMonth(val){
                this.yearMonth = moment(val).format("YYYY-MM");
                this.getList()
            },
            handleType(value) {
                this.type = value;
                this.getList()
            }
        },
    }
</script>