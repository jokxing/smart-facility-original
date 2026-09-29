<template>
    <div class="app-main">
        <div v-if="title" class="sever-title">
            ▍ {{ title }}
        </div>
        <router-view/>
    </div>
</template>
<script>
/*不需要显示的标题*/
const titleObj = {
    "mapSettings": true,
    "statistics": true,
    "approvalProcessSet": true
}
export default {
    name: "AppMain",
    computed: {
        title() {
            const route = this.$route;
            return this.titleShow(route.meta.title) ? false : this.$t("route." + route.meta.title);
        },
    },
    watch: {
        $route: {
            handler(obj) {
                localStorage.removeItem("pageSize");
            }
        }
    },
    methods: {
        titleShow(value) {
            return titleObj[value];
        }
    }
};
</script>
<style lang="less" scoped>
@import "../../../style/variable";
</style>
