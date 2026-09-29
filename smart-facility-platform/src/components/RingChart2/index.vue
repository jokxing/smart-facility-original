<template>
    <div>
        <ve-ring
            :color="colors"
            :data="dataCharts"
            v-if="dataCharts.rows.length"
            :extend="options"
            :height="height"
            :width="width"
        >
        </ve-ring>
        <data-empty :height="height" v-loading="dataCharts.loading" v-else/>
    </div>

</template>

<script>
import VeRing from "v-charts/lib/ring.common";
import DataEmpty from "@c/DataEmpty";

export default {
    name: "index",
    components: {
        VeRing,
        DataEmpty
    },
    props: {
        dataCharts: {
            type: Object,
            default: null
        },
        colors: {
            type: Array,
        },
        width: {
            type: String,
            default: "100%"
        },
        height: {
            type: String,
            default: "210px"
        },
        centerText: {
            type: String,
            default: ""
        }
    },
    data() {
        const _this = this;
        let count;
        _this.dataCharts.rows.map(item => {
            count += item.count;
        })
        this.options = {
            legend: {
                right: 0,
                // top: 10,
                bottom: 0,
                orient: "vertical",
                itemHeight: 10,
                formatter: function (name) {
                    const data = _this.dataCharts.rows;
                    let total = 0;
                    let tarValue;
                    for (let i = 0; i < data.length; i++) {
                        total += data[i].count;
                        if (data[i].name == name) {
                            tarValue = data[i].count;
                        }
                    }
                    let v = tarValue;
                    let p = Math.round(((tarValue / total) * 100));
                    return `${name}  ${v} ( ${p}% )`;
                },
            },
            series: {
                radius: ['40%', '60%'],
                center: ["30%", "50%"],
                label: {
                    show: true,
                }
            },
            graphic:  //为环形图中间添加文字
                [{
                    type: "text",
                    left: "23.5%",
                    top: "52%",
                    style: {
                        text: "资产总数",
                        textAlign: 'center',
                        fill: '#666666',
                        fontSize: 14,
                    },
                },
                    {
                        type: "text",
                        left: "26%",
                        top: "42%",
                        style: {
                            text: "",
                            textAlign: "center",
                            fill: "#01CD9B",
                            fontSize: 18,
                            fontWeight: "bold"
                        },
                    }
                ]
        }
        return {}
    },
    mounted() {
        let count = 0;
        this.dataCharts.rows.map(item => {
            count += item.count
        })
        this.options.graphic[1].style.text = `${count}`
    }
}
</script>

<style scoped>

</style>
