<template>
    <div>
        <el-tabs v-model="activeName" @tab-click="handleClick">
            <el-tab-pane :label="$t('route.assetCount1')" name="assetCount"></el-tab-pane>
            <el-tab-pane :label="$t('route.reportAndRanking')" name="reportAndRanking"></el-tab-pane>
        </el-tabs>

        <router-view></router-view>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                activeName: "assetCount"
            }
        },
        mounted() {
            if(this.$route.name === 'AssetCount'){
                this.activeName = "assetCount";
            }else{
                this.activeName = "pipetteGunRack"
            }
            this.$router.push('/apply/assetCount/' + this.activeName)
        },
        methods: {
            handleClick() {
                console.log('/apply/assetCount/' + this.activeName)
                this.$router.push('/apply/assetCount/' + this.activeName)
            }
        },
    }
</script>