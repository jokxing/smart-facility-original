<template>
    <div>
        <el-tabs v-model="activeName" @tab-click="handleClick">
            <el-tab-pane :label="$t('route.pipetteGun')" name="pipetteGun"></el-tab-pane>
            <el-tab-pane :label="$t('route.pipetteGunRack')" name="pipetteGunRack"></el-tab-pane>
        </el-tabs>
        <router-view></router-view>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                activeName: "pipetteGun"
            }
        },
        mounted() {
            if(this.$route.name === 'PipetteGun'){
                this.activeName = "pipetteGun";
            }else{
                this.activeName = "pipetteGunRack"
            }
            this.$router.push('/lhd/pipetteGun/' + this.activeName)
        },
        methods: {
            handleClick() {
                console.log('/ld/pipetteGun/' + this.activeName)
                this.$router.push('/lhd/pipetteGun/' + this.activeName)
            }
        },
    }
</script>