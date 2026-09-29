<template>
    <div id="container" class="building" @click="showBuildingBtn = false">
        <div class="canvans-loading" v-show="isCanvans">
            <div class="inner">
                <el-progress :percentage="progressNum" :stroke-width="12"/>
                <p>模型正在努力加载中...</p>
            </div>
        </div>
        <dv-loading v-if="isLoading">努力加载中...</dv-loading>
        <div v-else>
            <div class="header">
                <div class="logo" @click="$router.push('/dashboard')">
                    <img alt="" src="../../../src/assets/systemImages/logo2.png"/>
                    <h4>{{ companyName ? companyName : "广州楚秀信息科技有限公司" }}</h4>
                </div>
                <el-select
                    v-model="buildingVal"
                    placeholder="Select"
                    size="large"
                    :popper-append-to-body="false"
                    @change="handleBuilding()"
                    @focus="showBuildingBtn = false">
                    <el-option
                        v-for="item in buildingType"
                        :key="item.gardenId"
                        :label="item.gardenName"
                        :value="item.gardenId"
                        class="building-option">
                    </el-option>
                </el-select>
            </div>
            <div class="datav-button">
                <el-button type="info" plain @click="handleRoomDataV">{{ $t('dataV.labDeviceDataV') }}</el-button>
                <el-button type="info" plain @click="handleFloorDataV">{{ $t('dataV.roomDataV') }}</el-button>
            </div>

            <div class="right-bg">
                <div class="right-btn">
                    <div class="floor-btn" v-if="floorBtns.length > 0">
                        <div class="time"
                             v-for="item in floorBtns"
                             :key="item.id">
                            <el-button
                                :class="{ active: item.id == buildingNumIndex }"
                                @click="goFloorView(item)">
                                {{ item.name }}
                            </el-button>
                            <div class="dotted-line"></div>
                        </div>
                    </div>
                    <div class="icon" @click.stop="showBuildingBtn =! showBuildingBtn">
                        <img src="../../assets/centerControl/building-icon.png">
                    </div>
                    <div class="building-btn" v-show="!showBuildingBtn">
                        <div
                            v-for="(item, index) in buildingData"
                            :key="item.id">
                            <el-button
                                v-if="item.id == buildingNumIndex"
                                :class="{ active: item.id == buildingNumIndex }"
                                @click="handleBuildingNum(item.id, index)">
                                {{ item.name }}
                            </el-button>
                        </div>
                    </div>
                    <transition name="building-fade">
                        <div class="building-btn" v-show="showBuildingBtn">
                            <el-button
                                v-for="(item, index) in buildingData"
                                :key="item.id"
                                :class="{ active: item.id == buildingNumIndex }"
                                @click="handleBuildingNum(item.id, index)">
                                {{ item.name }}
                            </el-button>
                        </div>
                    </transition>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "three";
import {getGardenList, getBuilding} from "../../api/map/index";
import {resolveBuildingModelUrl} from "@/utils/demoModelUrl";
import {BASE_URL} from "@/utils/constant.js";

import {mapState, mapMutations} from "vuex";
import "@/plugins/dataV";
import {ERROR} from "@/utils/constant";

const isDemo = process.env.VUE_APP_DEMO === "true";

export default {
    data() {
        const userInfo = JSON.parse(localStorage.getItem("USERINFO") || "null");
        return {
            companyName: userInfo && userInfo.companyName,
            isCanvans: false,
            progressNum: 0,
            isLoading: true,
            buildingType: [],
            buildingVal: 0,
            buildingData: [],
            buildingNumIndex: 0,
            showBuildingBtn: false,
            floorBtns: [],
            scene: null,
            camera: null,
            bigImg: require("../../assets/centerControl/shinei.jpg"),
            floorImg: require("../../assets/centerControl/floor.jpg"),
            loader: null,
            glbScene: null,
            renderer: null,
            controls: null,
            group: null,
            width: window.innerWidth,
            height: window.innerHeight,
            container: null,
            fromPath: "",
            gardenRequestToken: 0,
            modelRequestToken: 0,
            animationFrameId: null,
            progressHideTimer: null,
            pageAlive: true,
            skyBox: null,
            floorMesh: null,
        };
    },
    mounted() {
        this.scene = new THREE.Scene();
        this.group = new THREE.Group();

        this.$nextTick(() => {
            if ((this.fromPath === "/floor/view" || this.fromPath === "/roomDataV" || this.fromPath === "/floorDataV") && this.gardenListData !== "") {
                this.buildingType = this.gardenListData;
                this.buildingVal = this.gardenId;
                this.buildingNumIndex = this.buildingId;
                this.buildingInit(this.gardenId);
            } else {
                this.getList();
            }
        });

        this.init();
        this.animate();
    },
    methods: {
        handleRoomDataV() {
            const buildingId = this.buildingNumIndex;
            this.$router.push({
                name: "RoomDataV",
                query: buildingId ? {buildingId} : {}
            });
            this.handleStorage();
        },
        handleFloorDataV() {
            const building = this.buildingData.find(item => item.id == this.buildingNumIndex) || this.buildingData[0];
            const floors = (building && building.subDivisions) || [];
            const floorId = floors.length ? floors[0].id : undefined;
            this.$router.push({
                path: "/floorDataV",
                query: floorId ? {floorId} : {}
            });
            this.handleStorage();
        },
        ...mapMutations("building", {
            handleGardenId: "GARDENID",
            handleGardenListData: "GARDENLISTDATA",
            handleBuildingId: "BUILDINGID",
        }),
        clearProgressHideTimer() {
            if (this.progressHideTimer) {
                clearTimeout(this.progressHideTimer);
                this.progressHideTimer = null;
            }
        },
        finishModelProgress() {
            this.clearProgressHideTimer();
            this.progressHideTimer = setTimeout(() => {
                if (!this.pageAlive) return;
                this.isCanvans = false;
                this.progressNum = 0;
                this.progressHideTimer = null;
            }, 300);
        },
        disposeObject3D(root) {
            if (!root) return;
            root.traverse(child => {
                if (child.geometry) child.geometry.dispose();
                const material = child.material;
                if (!material) return;
                const list = Array.isArray(material) ? material : [material];
                list.forEach(mat => {
                    Object.keys(mat).forEach(key => {
                        const value = mat[key];
                        if (value && value.isTexture) value.dispose();
                    });
                    mat.dispose();
                });
            });
        },
        removeBuildingModel() {
            if (this.glbScene && this.scene) {
                this.scene.remove(this.glbScene);
                this.disposeObject3D(this.glbScene);
            }
            this.glbScene = null;
        },
        resetBuildingUi() {
            this.buildingData = [];
            this.buildingNumIndex = 0;
            this.floorBtns = [];
            this.removeBuildingModel();
            this.isCanvans = false;
            this.progressNum = 0;
            this.clearProgressHideTimer();
        },
        applySelectedBuilding(building) {
            if (!building) {
                this.resetBuildingUi();
                this.$message.warning("当前园区暂无楼栋数据");
                return;
            }
            this.buildingNumIndex = building.id;
            this.floorBtns = [];
            const floors = building.subDivisions || [];
            for (let i = floors.length - 1; i >= 0; i--) {
                this.floorBtns.push(floors[i]);
            }
            this.canvansFloor(building.url);
        },
        getList() {
            const token = ++this.gardenRequestToken;
            getGardenList().then(res => {
                if (!this.pageAlive || token !== this.gardenRequestToken) return;
                if (res.code !== 1) {
                    this.isLoading = false;
                    this.resetBuildingUi();
                    this.$message.error(res.message || "获取园区失败");
                    return;
                }
                const items = Array.isArray(res.items) ? res.items : [];
                this.buildingType = items;
                if (!items.length) {
                    this.isLoading = false;
                    this.resetBuildingUi();
                    this.$message.warning("暂无园区数据");
                    return;
                }
                this.buildingVal = items[0].gardenId;
                this.handleGardenId(items[0].gardenId);
                this.buildingInit(items[0].gardenId);
            }).catch(() => {
                if (!this.pageAlive || token !== this.gardenRequestToken) return;
                this.isLoading = false;
                this.resetBuildingUi();
                this.$message.error(ERROR);
            });
        },
        buildingInit(id, goBuilding) {
            const token = ++this.gardenRequestToken;
            getBuilding({gardenId: id}).then(res => {
                if (!this.pageAlive || token !== this.gardenRequestToken) return;
                if (res.code !== 1) {
                    this.isLoading = false;
                    this.resetBuildingUi();
                    this.$alert("请求失败，请刷新页面", "提示");
                    return;
                }
                this.isLoading = false;
                const items = Array.isArray(res.items) ? res.items : [];
                this.buildingData = items;
                if (!items.length) {
                    this.resetBuildingUi();
                    this.$message.warning("当前园区暂无楼栋数据");
                    return;
                }

                let selected = items[0];
                if (this.buildingId !== "" && !goBuilding && this.fromPath !== "/dashboard") {
                    const matched = items.find(item => item.id == this.buildingId);
                    if (matched) selected = matched;
                }
                this.applySelectedBuilding(selected);
            }).catch(() => {
                if (!this.pageAlive || token !== this.gardenRequestToken) return;
                this.isLoading = false;
                this.resetBuildingUi();
                this.$alert("请求失败，请刷新页面", "提示");
            });
        },
        canvansFloor(url) {
            const token = ++this.modelRequestToken;
            this.removeBuildingModel();
            const picUrl = resolveBuildingModelUrl(url, BASE_URL);
            if (!picUrl) {
                this.isCanvans = false;
                this.progressNum = 0;
                this.$message.warning("当前楼栋暂无可用本地模型");
                return;
            }

            this.isCanvans = true;
            this.progressNum = 0;
            this.loader = new GLTFLoader();
            this.loader.load(
                picUrl,
                glb => {
                    if (!this.pageAlive || token !== this.modelRequestToken || !this.scene) {
                        this.disposeObject3D(glb && glb.scene);
                        return;
                    }
                    const isDemo = process.env.VUE_APP_DEMO === 'true';
                    if (isDemo) {
                        // Imported GLBs have different units/origins. Fit in world space
                        // after applying their authored node transforms; keep feet at y=0.
                        glb.scene.updateMatrixWorld(true);
                        const bounds = new THREE.Box3().setFromObject(glb.scene);
                        const size = bounds.getSize(new THREE.Vector3());
                        const extent = Math.max(size.x, size.y, size.z);
                        if (Number.isFinite(extent) && extent > 0) {
                            glb.scene.scale.multiplyScalar(55 / extent);
                            glb.scene.updateMatrixWorld(true);
                            bounds.setFromObject(glb.scene);
                            const center = bounds.getCenter(new THREE.Vector3());
                            glb.scene.position.add(new THREE.Vector3(-center.x, -bounds.min.y, -center.z));
                            const height = bounds.max.y - bounds.min.y;
                            this.controls.target.set(0, height * 0.45, 0);
                            this.camera.position.set(56.5, height * 0.45 + 30.5, 69.5);
                            this.controls.update();
                        }
                    } else {
                        glb.scene.scale.multiplyScalar(0.7);
                    }
                    glb.scene.traverse(child => {
                        child.castShadow = true;
                        if (isDemo && child.isMesh) {
                            const materials = Array.isArray(child.material) ? child.material : [child.material];
                            materials.forEach(material => {
                                if (!material || !material.map || !material.emissive) return;
                                // A texture-matched fill brightens only the building;
                                // leave the environment's original color pipeline intact.
                                material.emissiveMap = material.map;
                                material.emissive.setHex(0xffffff);
                                material.emissiveIntensity = 0.3;
                                material.needsUpdate = true;
                            });
                        }
                    });
                    this.scene.position.set(...(isDemo ? [0, 0, 0] : [-15, -30, 0]));
                    this.glbScene = glb.scene;
                    this.scene.add(glb.scene);
                    this.progressNum = 100;
                    this.finishModelProgress();
                },
                xhr => {
                    if (!this.pageAlive || token !== this.modelRequestToken) return;
                    if (xhr && xhr.total > 0) {
                        this.progressNum = Math.min(100, parseInt((xhr.loaded / xhr.total) * 100, 10) || 0);
                    } else if (xhr && xhr.loaded > 0) {
                        this.progressNum = Math.min(99, Math.max(this.progressNum, 10));
                    }
                },
                () => {
                    if (!this.pageAlive || token !== this.modelRequestToken) return;
                    this.isCanvans = false;
                    this.progressNum = 0;
                    this.$alert(ERROR, "提示");
                }
            );
        },
        initCamera() {
            let point0 = new THREE.DirectionalLight(0x999999, 7);
            point0.position.set(200, 0, 200);
            this.scene.add(point0);

            let point1 = new THREE.DirectionalLight(0x999999, 3);
            point1.position.set(-200, 0, -200);
            this.scene.add(point1);

            let ambient = new THREE.AmbientLight(0x878787, 1.5);
            this.scene.add(ambient);

            const spotLight = new THREE.SpotLight(0x878787, 0.8);
            spotLight.angle = Math.PI / 5;
            spotLight.penumbra = 0.2;
            spotLight.position.set(20, 150, -80);
            spotLight.castShadow = true;
            spotLight.shadow.camera.near = 80;
            spotLight.shadow.camera.far = 300;
            this.scene.add(spotLight);

            const dirLight = new THREE.DirectionalLight(0x878787, 0.3);
            dirLight.position.set(0, 120, 0);
            dirLight.castShadow = true;
            dirLight.shadow.camera.near = 10;
            dirLight.shadow.camera.far = 20;
            this.scene.add(dirLight);

            this.camera = new THREE.PerspectiveCamera(60, this.width / this.height, 1, 1000);
            let texture = new THREE.TextureLoader().load(this.bigImg);
            let material = new THREE.MeshBasicMaterial({map: texture});
            material.map = texture;
            this.skyBox = new THREE.Mesh(
                new THREE.SphereGeometry(700, 60, 40),
                material
            );
            this.skyBox.geometry.scale(-1, 1, 1);
            this.skyBox.position.y = 50;
            this.scene.add(this.skyBox);

            let floorMat = new THREE.MeshStandardMaterial();
            const textureLoader = new THREE.TextureLoader();
            textureLoader.load(this.floorImg, map => {
                if (!this.pageAlive) {
                    map.dispose();
                    return;
                }
                map.wrapS = THREE.RepeatWrapping;
                map.wrapT = THREE.RepeatWrapping;
                map.repeat.set(100, 100);
                floorMat.map = map;
                floorMat.needsUpdate = true;
            });

            const floorGeometry = new THREE.PlaneGeometry(10000, 10000);
            this.floorMesh = new THREE.Mesh(floorGeometry, floorMat);
            this.floorMesh.receiveShadow = true;
            this.floorMesh.rotation.x = -0.5 * Math.PI;
            this.scene.add(this.floorMesh);

            this.camera.position.set(25, 10, 100);
            this.camera.lookAt(this.scene.position);

            window.addEventListener("resize", this.onWindowResize, false);
        },
        initRenderer() {
            this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true, logarithmicDepthBuffer: true});
            this.renderer.shadowMap.enabled = true;
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.setSize(this.width, this.height);
            this.container = document.getElementById("container");
            this.container.appendChild(this.renderer.domElement);
        },
        initControl() {
            this.controls = new OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableZoom = true;
            this.controls.minDistance = 80;
            this.controls.maxDistance = 200;
            this.controls.minPolarAngle = 1;
            this.controls.maxPolarAngle = 1.6;
        },
        animate() {
            if (!this.pageAlive || !this.scene || !this.renderer || !this.camera) return;
            this.renderer.render(this.scene, this.camera);
            this.animationFrameId = requestAnimationFrame(this.animate);
        },
        onWindowResize() {
            if (!this.camera || !this.renderer) return;
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        },
        init() {
            this.initCamera();
            this.initRenderer();
            this.initControl();
        },
        handleBuilding() {
            this.floorBtns = [];
            this.isLoading = true;
            this.removeBuildingModel();
            this.buildingInit(this.buildingVal, "1");
            this.handleGardenId(this.buildingVal);
        },
        handleBuildingNum(id, index) {
            this.buildingNumIndex = id;
            this.floorBtns = [];
            const building = this.buildingData[index];
            if (!building) {
                this.$message.warning("当前楼栋数据无效");
                return;
            }
            const floors = building.subDivisions || [];
            for (let i = floors.length - 1; i >= 0; i--) {
                this.floorBtns.push(floors[i]);
            }
            this.canvansFloor(building.url);
        },
        goFloorView(item) {
            if (isDemo && !item.mapUrl) {
                this.$message.info("本阶段该楼层尚未接入平面图");
                return;
            }
            this.$router.push({
                path: "/floor/view",
                query: {
                    floorId: item.id,
                    mapUrl: item.mapUrl,
                    mapId: item.mapId,
                    floorName: item.name,
                    buildingVal: this.buildingVal
                },
            });
            this.handleStorage();
        },
        handleStorage() {
            this.handleGardenListData(this.buildingType);
            this.handleBuildingId(this.buildingNumIndex);
        }
    },
    computed: {
        ...mapState("building", {
            gardenId: "gardenId",
            gardenListData: "gardenListData",
            buildingId: "buildingId",
        }),
    },
    beforeRouteEnter(to, from, next) {
        next(vm => {
            vm.fromPath = from.path;
        });
    },
    beforeDestroy() {
        this.pageAlive = false;
        this.gardenRequestToken++;
        this.modelRequestToken++;
        this.clearProgressHideTimer();
        if (this.animationFrameId != null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        window.removeEventListener("resize", this.onWindowResize, false);
        if (this.controls) {
            this.controls.dispose();
            this.controls = null;
        }
        this.removeBuildingModel();
        if (this.skyBox) {
            this.disposeObject3D(this.skyBox);
            if (this.scene) this.scene.remove(this.skyBox);
            this.skyBox = null;
        }
        if (this.floorMesh) {
            this.disposeObject3D(this.floorMesh);
            if (this.scene) this.scene.remove(this.floorMesh);
            this.floorMesh = null;
        }
        if (this.renderer) {
            if (this.renderer.domElement && this.renderer.domElement.parentNode) {
                this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
            }
            this.renderer.dispose();
            this.renderer.forceContextLoss && this.renderer.forceContextLoss();
            this.renderer = null;
        }
        this.scene = null;
        this.camera = null;
        this.loader = null;
        this.group = null;
        this.container = null;
    },
};
</script>

<style lang="less" scoped>
@import "./building.less";
</style>
