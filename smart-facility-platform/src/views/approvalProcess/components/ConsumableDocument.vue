<template>
    <div style="text-align: center;">
        <img v-if="lang !== 'en'" src="../../../assets/systemImages/default.png" style="width: 350px;margin: 125px 0 200px">
        <img v-else src="../../../assets/systemImages/default1.png" style="width: 350px;margin: 125px 0 200px">
    </div>
</template>
<script>
    export default {
        data() {
            return {
                lang: "zh"
            }
        },
        created() {
            this.lang = localStorage.getItem("lang");
        }
    }
</script>