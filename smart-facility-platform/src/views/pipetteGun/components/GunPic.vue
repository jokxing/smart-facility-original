<template>
    <div class="gun-rack-pic" v-if="mouseInfo">
        <div>
            <img class="gun-rack-img" src="../../../assets/device/gun-rack.png">

            <img 
                class="gun-img" 
                :class="'cardNo-' + mouseInfo.detent" 
                :src="require('../../../assets/device/gun-' + statusColor(mouseInfo.status, GUNSTATUS) + '.png')">
        </div>
        <p :class="statusColor(mouseInfo.status, GUNSTATUS)">
            <span v-if="mouseInfo.status === 2">{{ $t('labDevice.overTime1') }}{{ mouseInfo.hour }}{{ $t('labDevice.noReturn') }}</span>
            <span v-else>{{ statusText(mouseInfo.status, GUNSTATUS) }}</span>
        </p>
        <p v-if="mouseInfo.status === 0">{{ $t('labDevice.location') }}：{{ mouseInfo.gunRackName }} {{ mouseInfo.detent }}{{ $t('labDevice.location1') }}</p>
        <p v-else>{{ $t('labDevice.location') }}：{{ detail.preciseLocation }}</p>
    </div>
</template>

<script>
    import { getGunPipetteMouseInfo } from "@/api/gun";
    import { GUNSTATUS } from "@/utils/constant";
    import { statusText, statusColor } from "@/utils/methods";
    export default {
        props:{
            detail:{
                type: Object,
                default: {}
            } 
        },
        data() {
            return {
                GUNSTATUS,
                statusText,
                statusColor,
                mouseInfo: ""
            }
        },
        mounted() {
            this.getMouseInfo()
        },
        methods: {
            getMouseInfo(){
                var data = {
                    gunRackId: this.detail.gunRackId,
                    detent: this.detail.detent,
                    no: this.detail.no
                }
                getGunPipetteMouseInfo(data).then(res => {
                    if(res.code === 1){
                        this.mouseInfo = res.items
                    }
                })
            }
        }
    }
</script>