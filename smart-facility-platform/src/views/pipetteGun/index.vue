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
            this.syncTabFromRoute();
        },
        watch: {
            '$route.path'() {
                this.syncTabFromRoute();
            }
        },
        methods: {
            syncTabFromRoute() {
                const path = this.$route.path || '';
                const name = path.indexOf('pipetteGunRack') !== -1 ? 'pipetteGunRack' : 'pipetteGun';
                if (this.activeName !== name) {
                    this.activeName = name;
                }
            },
            handleClick() {
                const target = '/lhd/pipetteGun/' + this.activeName;
                if (this.$route.path !== target) {
                    this.$router.push(target);
                }
            }
        },
    }
</script>
