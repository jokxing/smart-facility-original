<template>
    <floor-select-tree
        :id.sync="form.floorId"
        :buildingId.sync="form.buildingId"
        :select-tree-value.sync="form.floorId"
        :graden-name.sync="form.gradenName"
        :building-name.sync="form.buildingName"
        :floorName.sync="form.floorName"
        :data="floors"
        @change="handleChange"/>
</template>

<script>
    import FloorSelectTree from "@c/FloorSelectTree";
    import { getMapGardenList } from "@/api/mapSet";
    export default {
        components: {
            FloorSelectTree
        },
        data() {
            return {
                form: {
                    floorId: null,
                    buildingId: null,
                    gradenName: "",
                    buildingName: "",
                    floorName: ""
                },
                floors: []
            }
        },
        mounted() {
            this.getRoomList()
        },
        methods: {
            getRoomList() {
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
                                    };
                                    father.subDivisions.push(grandson);
                                }
                            }
                            this.floors.push(grandpa);
                        }
                    } else {
                        this.$message.error(res.message);
                    }
                })
            },
            handleChange() {
                this.$emit("update:floorId", this.form.floorId);
                this.$emit("update:buildingId", this.form.buildingId);
                this.$emit("update:floorName", this.form.floorName);
                this.$emit("update:gradenName", this.form.gradenName);
                this.$emit("update:buildingName", this.form.buildingName);
                this.$emit('change')
            }
        },
    }
</script>