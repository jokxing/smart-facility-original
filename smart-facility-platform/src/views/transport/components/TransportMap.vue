<!-- 运输地图 -->
<template>
    <div class="map">
        <slot name="append"></slot>
        <div id="container">
            <div v-if="mapUnavailable" class="map_unavailable" role="status">
                {{ mapUnavailableHint }}
            </div>
        </div>
        <div class="info">
            <h4 id='status'>{{ mapUnavailable ? mapUnavailableHint : '' }}</h4>
            <hr>
            <p id='result'></p>
            <hr>
            <p>{{ $t('transport.map1') }}</p>
        </div>
    </div>
</template>
<script>

import AMapLoader from "@amap/amap-jsapi-loader"

/**
 * 随机生成路线
 * @param item(Number)
 */
let AMap1, marker;
const isDemo = process.env.VUE_APP_DEMO === "true";
// Never embed a provider key in source. Non-demo may supply one via env; demo never loads the SDK.
const mapKey = (process.env.VUE_APP_AMAP_KEY || "").trim();
export default {
    name: "TransportMap",
    data() {
        return {
            polyline: null,
            markerObj: {},
            mapUnavailable: false,
            mapUnavailableHint: "运输地图未接入本地演示，不加载外部地图服务。"
        }
    },
    props: {
        lineArr: {
            type: Array,
            default: () => []
        },
        orderList: {
            type: Array,
            default: () => []
        }
    },
    created() {
        // 获取gps轨迹图
    },
    mounted() {
        this.initMap();
    },
    watch: {
        lineArr: {
            handler: function (newArray) {
                this.drawPolyline();
            },
            deep: true
        },
        orderList: {
            handler: function (newArray) {
                // this.drawPolyline();
            },
            deep: true
        }
    },
    methods: {
        initMap() {
            const _this = this;
            if (isDemo || !mapKey) {
                this.mapUnavailable = true;
                return;
            }
            AMapLoader.load({
                key: mapKey,
                version: "2.0",
                plugins: ['AMap.Geolocation', 'AMap.MoveAnimation', "AMap.GraspRoad"],
            }).then((AMap) => {
                AMap1 = AMap;
                this.map = new AMap.Map("container", {
                    viewMode: "3D",
                    zoom: 16,
                    center: _this.lineArr[0],
                    resizeEnable: true,
                });
            }).catch(e => {
                this.mapUnavailable = true;
                console.log(e);
            })
        },
        drawMarker(index, items) {
            if (!this.map || !AMap1) {
                return;
            }
            const key = "marker" + index;
            this.markerObj[key] = null;
            this.markerObj[key] = new AMap1.Marker({
                position: new AMap.LngLat(items.gps[0], items.gps[1]),
                offset: new AMap.Pixel(0, 0),
                zoom: 16,
            });
            this.markerObj[key].setLabel({
                offset: new AMap.Pixel(10, 10),  //设置文本标注偏移量
                content: "<div class='info'>"+ items.transportNo +"</div>", //设置文本标注内容
                direction: 'right' //设置文本标注方位
            })
            this.markerObj[key].setMap(this.map);
            this.map.add(this.markerObj[key]);
            this.handleGeolocation();
        },
        // 绘制轨迹
        drawPolyline() {
            if (!this.map || !AMap1) {
                return;
            }
            if (this.polyline != null) {
                this.polyline.remove();
            }
            const objLength = Object.keys(this.markerObj).length;
            if (objLength) {
                for (let i = 0; i < objLength; i++) {
                    const key = 'marker' + i;
                    this.map.remove(this.markerObj[key]);
                }
            }
            if (this.lineArr.length == 0) {
                return false;
            }
            this.markerObj = {};
            this.polyline = new AMap1.Polyline({
                map: this.map,
                path: this.lineArr,
                showDir: true,
                strokeColor: "#28F",  //线颜色
                // strokeOpacity: 1,     //线透明度
                strokeWeight: 6,      //线宽
                strokeStyle: "solid"  //线样式
            });
            this.handleGeolocation();
            this.map.setFitView();
            this.orderList.map((item, index) => {
                this.drawMarker(index, item);
            })
        },
        // 精准定位
        handleGeolocation() {
            if (!this.map || !AMap1) {
                return;
            }
            const _this = this;
            AMap1.plugin('AMap.Geolocation', function () {
                const geolocation = new AMap.Geolocation({
                    enableHighAccuracy: true,//是否使用高精度定位，默认:true
                    timeout: 10000,          //超过10秒后停止定位，默认：5s
                    buttonPosition: 'RB',    //定位按钮的停靠位置
                    buttonOffset: new AMap.Pixel(10, 20),//定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
                    zoomToAccuracy: true,   //定位成功后是否自动调整地图视野到定位点
                    maximumAge: 0, // 定位结果缓存0毫秒，默认：0
                    noIpLocate: 0, // 是否禁止使用IP定位，默认值为0，可选值0-3  0: 可以使用IP定位    1: 手机设备禁止使用IP定位  2: PC上禁止使用IP定位  3: 所有终端禁止使用IP定位
                    convert: true, // 自动偏移坐标，偏移后的坐标为高德坐标，默认：true
                    showButton: false, // 显示定位按钮，默认：true
                    showMarker: false, // 定位成功后在定位到的位置显示点标记，默认：true
                    showCircle: true, // 定位成功后用圆圈表示定位精度范围，默认：true
                    panToLocation: true, // 定位成功后将定位到的位置作为地图中心点，默认：true
                    extensions: "all",
                    pName: "Geolocation",
                });
                _this.map.addControl(geolocation);
                geolocation.getCurrentPosition(function (status, result) {
                    if (status == 'complete') {
                        onComplete(result)
                    } else {
                        onError(result)
                    }
                });
            });

            //解析定位结果
            function onComplete(data) {
                document.getElementById('status').innerHTML = _this.$t('transport.map2')
                let str = [];
                str.push('定位结果：' + data.position);
                str.push('定位类别：' + data.location_type);
                if (data.accuracy) {
                    str.push('精度：' + data.accuracy + ' m');
                }//如为IP精确定位结果则没有精度信息
                str.push('是否经过偏移：' + (data.isConverted ? _this.$t('labDevice.yes') : _this.$t('labDevice.no')));
                document.getElementById('result').innerHTML = str.join('<br>');
            }

            //解析定位错误信息
            function onError(data) {
                if (data.message.indexOf("timeout") !== -1) {
                    document.getElementById('result').innerHTML = _this.$t('transport.map4');
                }
                if (data.message.indexOf("permission") !== -1) {
                    document.getElementById('result').innerHTML = _this.$t('transport.map5');
                }

            }
        },
        // 轨迹偏移
        /**
         handleGraspRoad(AMap) {
            const _this = this;
            let graspRoad;
            const pathParam = [
                {"x": 10.000000, "y": 20.000000, "sp": 19, "ag": 0, "tm": 1478031031},
                {"x": 10.010000, "y": 20.000000, "sp": 10, "ag": 0, "tm": 2},
                {"x": 10.020000, "y": 20.000000, "sp": 10, "ag": 110, "tm": 3},
                {"x": 10.030000, "y": 20.000000, "sp": 10, "ag": 120, "tm": 4},
                {"x": 10.040000, "y": 20.000000, "sp": 10, "ag": 120, "tm": 5},
                {"x": 10.050000, "y": 20.000000, "sp": 10, "ag": 30, "tm": 6},
                {"x": 10.060000, "y": 20.000000, "sp": 10, "ag": 30, "tm": 7},
                {"x": 10.070000, "y": 20.010000, "sp": 10, "ag": 30, "tm": 8}]

            let path1 = [];
            for (let i = 0; i < pathParam.length; i += 1) {
                path1.push([pathParam[i].x, pathParam[i].y])
            }
            const oldLine = new AMap.Polyline({
                path: path1,
                strokeWeight: 8,
                strokeOpacity: 1,
                strokeColor: 'red'
            })
            _this.map.add(oldLine)
            if (!graspRoad) {
                graspRoad = new AMap.GraspRoad()
            }
            graspRoad.driving(pathParam, function (error, result) {
                if (!error) {
                    let path2 = [];
                    const newPath = result.data.points;
                    for (var i = 0; i < newPath.length; i += 1) {
                        path2.push([newPath[i].x, newPath[i].y])
                    }
                    const newLine = new AMap.Polyline({
                        path: path2,
                        strokeWeight: 8,
                        strokeOpacity: 0.8,
                        strokeColor: '#0091ea',
                        showDir: true
                    })
                    _this.map.add(newLine)
                    _this.map.setFitView()
                }
            })
        },
         **/
    }
}
</script>

<style lang="less" scoped>
#container {
    padding: 0;
    margin: 0;
    width: 100%;
    height: 500px;
}

.map_unavailable {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    color: #606266;
    background: #f5f7fa;
    font-size: 14px;
    text-align: center;
    padding: 16px;
    box-sizing: border-box;
}

.amap-copyright {
    opacity: 0 !important;
}

.info {
    width: 26rem;
    position: absolute;
    right: 0;
    top: 0;
}

.map {
    position: relative;
}
</style>