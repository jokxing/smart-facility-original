<template>
    <div class="asset-process">
        <el-tabs v-model="activeName" @tab-click="handleClick">
<!--            <el-tab-pane label="采购申请" name="purchaseRequest"></el-tab-pane>-->
            <el-tab-pane :label="$t('labDevice.checkAndAccept')" name="checkAndAccept"></el-tab-pane>
<!--            <el-tab-pane label="领用单" name="requisition"></el-tab-pane>-->
<!--            <el-tab-pane label="退还单" name="giveBack"></el-tab-pane>-->
<!--            <el-tab-pane label="借用单" name="borrow"></el-tab-pane>-->
<!--            <el-tab-pane label="归还单" name="sendBack"></el-tab-pane>-->
<!--            <el-tab-pane label="预约单" name="8"></el-tab-pane>-->
<!--            <el-tab-pane label="处置单" name="9"></el-tab-pane>-->
<!--            <el-tab-pane label="报修单" name="management"></el-tab-pane>-->
<!--            <el-tab-pane label="维修单" name="11"></el-tab-pane>-->
<!--            <el-tab-pane label="资产变更" name="12"></el-tab-pane>-->
<!--            <el-tab-pane label="设备文件受控" name="13"></el-tab-pane>-->
        </el-tabs>
        <div class="session">
            <router-view v-if="routerAlive" :key="key"/>
        </div>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                activeName: "",
                routerAlive: false
            }
        },
        computed:{
            key(){
                return this.$route.path + Math.random();
            }
        },
        mounted() {
            const routeName = this.$route.name;
            this.activeName = routeName.replace(routeName[0], routeName[0].toLocaleLowerCase())
            this.routerAlive = true
        },
        methods: {
            handleClick(){
                this.routerAlive = false;
                this.$router.push('/apply/asset/process/' + this.activeName);
                this.$nextTick(()=>{
                    this.routerAlive = true;
                });
            }
        },
    }
</script>

<style lang="less" scoped>
    @import "./AssetProcess.less";
</style>