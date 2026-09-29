<template>
    <select-tree
        :class="isClass ? 'select-change-p': 'input-with-select margin-small-right'"
        :clearable="true"
        :default-open="false"
        :level="true"
        :model.sync="id"
        :options="data"
        :popper-class="popperClass"
        :prop="props"
        :value.sync="selectTreeValue"
        :isToRoom="isToRoom"
        accordion
        :placeholder="placeholder"
        @getValue="getValue($event)"/>
</template>

<script>
import SelectTree from "@/components/SelectTree";
import {getMapGardenList} from "@/api/mapSet";

export default {
    name: "FloorSelectTree",
    components: {SelectTree},
    props: {
        id: {
            type: [Number, String],
            default: null
        },
        placeholder: {
            type: String,
            default: "请选择楼层"
        },
        isClass: {
            type: Boolean,
            default: false
        },
        selectTreeValue: {
            type: [Number, String],
            default: "0"
        },
        popperClass: {
            type: String,
            default: ""
        },
        gradenName: {
            type: String,
            default: ""
        },
        buildingName: {
            type: String,
            default: ""
        },
        // 是否选到房间
        isToRoom: {
            type: Boolean,
            default: false,
        }
    },
    data() {
        return {
            props: {
                // 配置项（必选）
                value: "id",
                label: "name",
                children: "subDivisions",
            },
            data: []
        }
    },
    mounted() {
        this.handleMapGardenList()
    },
    methods: {
        handleMapGardenList(){
            getMapGardenList().then(res => {
                if (res.code) {
                    for (const item of res.items) {
                        let grandpa = {
                            key: item.gardenId,
                            id: item.gardenId,
                            name: item.gardenName,
                            subDivisions: [],
                        };
                        for (const element of item.subDivisions) {
                            let father = {
                                key: element.id,
                                id: element.id,
                                name: element.name,
                                subDivisions: [],
                            };
                            grandpa.subDivisions.push(father);
                            for (const sun of element.subDivisions) {
                                let grandson = {
                                    key: sun.id,
                                    id: sun.id,
                                    name: sun.name,
                                    subDivisions: [],
                                };
                                father.subDivisions.push(grandson);
                                if(this.isToRoom){
                                    for (const lab of sun.subDivisions) {
                                        let labs = {
                                            key: lab.labId,
                                            id: lab.labId,
                                            name: lab.labName,
                                        };
                                        grandson.subDivisions.push(labs);
                                    }
                                }
                            }
                        }
                        this.data.push(grandpa);
                    }
                } else {
                    this.$message.error(res.message);
                }
            })
        },
        getValue(value) {
            if (!value) {
                this.$emit("update:selectTreeValue", null);
                this.$emit("update:id", null);
            } else {
                this.$emit("update:selectTreeValue", value.data.id.toString());
                this.$emit("update:id", value.data.id.toString());
                this.$emit("update:floorName", value.data.name);
                this.$emit("update:gradenName", value.parent.parent.label);
                this.$emit("update:buildingName", value.parent.label);
                this.$emit("update:buildingId", value.parent.key);
            }
            this.$emit("change");
        }
    }
}
</script>

<style scoped>

</style>
