<template>
    <div class="v-charts-data-empty1" :style="{'height': height}">
        <img v-if="lang == 'zh'" src="../../../src/assets/systemImages/powerNot.png" alt="">
        <img v-else src="../../../src/assets/systemImages/powerNot1.png" alt="">
    </div>
</template>
<script>
export default {
    name: "index",
    props: {
        height: { type: String, default: '100%' },
    },
    data() {
        return {
            lang: 'zh'
        }
    },
    created() {
        if (localStorage.getItem("lang")) {
            this.lang = localStorage.getItem("lang")
        }
    }
}
</script>
<style lang="less" scoped>
.v-charts-data-empty1 {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(255, 255, 255, .9);
    color: #888;
    font-size: 14px;
    img {
        width: 200px;
    }
}
</style>