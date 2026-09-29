<template>
    <div class="session">
        <el-tabs v-model="activeName" @tab-click="handleClick">
            <el-tab-pane :label="$t('labDevice.assetDocument')" name="assetDocument"></el-tab-pane>
            <el-tab-pane :label="$t('labDevice.consumableDocument')" name="consumableDocument"></el-tab-pane>
        </el-tabs>
        <router-view></router-view>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                activeName: ""
            }
        },
        mounted() {
            if(this.$route.name === 'AssetDocument'){
                this.activeName = "assetDocument";
            }else{
                this.activeName = "consumableDocument"
            }
            this.$router.push('/apply/approval/process/' + this.activeName)
        },
        methods: {
            handleClick() {
                // console.log('/sys/' + this.activeName)
                this.$router.push('/apply/approval/process/' + this.activeName)
            }
        },
    }
</script>