<template>
    <div class="asset-tag">
        <el-tabs v-model="activeName" @tab-click="handleClick">
            <el-tab-pane :label="$t('hardware.assetTag')" name="tag">
                <Tag v-if="activeName === 'tag'" />
            </el-tab-pane>
            <el-tab-pane :label="$t('hardware.assetGateway')" name="gateway">
                <Gateway v-if="activeName === 'gateway'" />
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script>
    import Tag from "./Tag";
    import Gateway from "./Gateway";
    export default {
        components: {
            Tag,
            Gateway
        },
        data() {
            return {
                activeName: ""
            }
        },
        mounted() {
            if(this.$route.query.type){
                if(this.$route.query.type === "1"){
                    this.activeName = "tag"
                }else{
                    this.activeName = "gateway"
                }
            }else{
                this.activeName = "tag"
                this.$router.push("/lhd/assetTag?type=1");
            }
        },
        methods: {
            handleClick(){
                if(this.activeName === "tag"){
                    this.$router.push("/lhd/assetTag?type=1")
                }else{
                    this.$router.push("/lhd/assetTag?type=2")
                }
            }
        }
    }
</script>

<style lang="less" scoped>
    @import "./index.less";
</style>