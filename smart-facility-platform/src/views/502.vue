<template>
    <div class="error">
        <div class="error-502">
            <img src="../assets/systemImages/502.png" alt="">
            <div>{{ $t('common.systemUpgrade') }}&nbsp;<span @click="handleReset">{{ $t('hardware.reset') }}</span></div>
        </div>
    </div>
</template>

<script>
import router from "../router";

export default {
    name: "Error502",
    methods: {
        handleReset() {
            router.back();
        }
    }
}
</script>

<style lang="less" scoped>
.error {
    width: 100vw;
    height: 100vh;

    .error-502 {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        img {
            width: 308px;
            height: 235px;
        }

        div {
            font-size: 18px;
            font-weight: 400;
            color: #777777;
            line-height: 30px;
        }
    }
}
</style>
