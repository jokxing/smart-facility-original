<template>
    <div class="session">
        <el-tabs v-model="activeName" @tab-click="tabClick">
            <el-tab-pane :label="$t('transport.driverManage')" name="driver">
                <list-driver ref="driver"/>
            </el-tab-pane>
            <el-tab-pane :label="$t('transport.productUnit')" name="commonUnit">
                <list-common-unit ref="commonUnit"/>
            </el-tab-pane>
            <el-tab-pane :label="$t('transport.brandName')" name="carBrand">
                <list-car-brand ref="carBrand"/>
            </el-tab-pane>
            <el-tab-pane :label="$t('transport.modelName')" name="catModel">
                <list-car-model ref="catModel"/>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>


<script>

import ListDriver from "@/views/transport/components/ListDriver";
import ListCommonUnit from "@/views/transport/components/ListCommonUnit";
import ListCarModel from "@/views/transport/components/ListCarModel";
import ListCarBrand from "@/views/transport/components/ListCarBrand";

export default {
    name: "transportBasicSetting",
    components: {
        ListDriver,
        ListCommonUnit,
        ListCarModel,
        ListCarBrand
    },
    data() {
        return {
            activeName: "driver",
            activeName_bak: 'driver',
        };
    },

    methods: {
        tabClick() {
            if (this.activeName !== this.activeName_bak) {
                this.$refs[this.activeName].getList();
            }
            this.activeName_bak = this.activeName;
        }
    },
};
</script>
