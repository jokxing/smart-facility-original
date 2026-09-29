<template>
    <div class="circular" :class="statusColor(status, arr)">
        <div class="circular-mid">
            <div class="circular-small">{{ statusText(status, arr) }}</div>
        </div>
    </div>
</template>

<script>
    import { statusText, statusColor } from "@/utils/methods"
    export default {
        props: {
            status:{
                type: Number,
                default: null
            },
            arr: {
                type: Array,
                default: () => []
            }
        },
        data() {
            return {
                statusText,
                statusColor,
            }
        },
    }
</script>

<style lang="less" scoped>
    @import '../../style/variable.less';
    .circular{
        width: 120px;
        height: 120px;
        position: relative;
        border-radius: 50%;
        .circular-mid{
            width: 96px;
            height: 96px;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            border-radius: 50%;
            .circular-small{
                width: 76px;
                height: 76px;
                line-height: 24px;
                border-radius: 50%;
                margin: 10px;
                color: #FFFFFF;
                font-size: 20px;
                display: flex;
                justify-content: center;
                align-items: center;
            }
        }
        &.normal{
            background: rgba(16, 184, 156, 0.08);
            .circular-mid{
                background: rgba(16, 184, 156, 0.15);
                .circular-small{
                    background: @normal;
                }
            }
        }
        &.danger{
            background: rgba(239,77,78,0.08);
            .circular-mid{
                background: rgba(239,77,78,0.15);
                .circular-small{
                    background: @abnormal;
                }
            }
        }
        &.offline{
            background: rgba(173, 186, 203, 0.05);
            .circular-mid{
                background: rgba(173, 186, 203, 0.18);
                .circular-small{
                    background: @offLine;
                }
            }
        }
        &.blueColor{
            background: rgba(68, 137, 255, 0.05);
            .circular-mid{
                background: rgba(68, 137, 255, 0.18);
                .circular-small{
                    background: @blueColor;
                }
            }
        }
    }
</style>