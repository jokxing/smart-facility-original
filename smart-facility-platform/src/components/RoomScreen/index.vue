<template>
    <el-dialog
        :before-close="handleClose"
        :close-on-click-modal="false"
        :title="$t('labDevice.roomScreen')"
        :visible.sync="dialogVisible"
        append-to-body
        destroy-on-close
        width="600px">
        <div v-loading="loading">
            <el-form label-width="120px">
                <el-form-item :label="$t('labDevice.changeFloor')" required>
                    <floor-select-tree
                        :data="floors"
                        :id.sync="floorSelectId"
                        :level.sync="level"
                        :gardenId.sync="items.gardenId"
                        :buildingId.sync="items.buildingId"
                        :floorId.sync="items.floorId"
                        :select-tree-value="floorSelectId"
                        :isAccurate="false"
                        @change="handleFloorSelect"/>
                </el-form-item>
                <el-form-item :label="$t('common.room')">
                    <el-input
                        v-model.trim="items.keyword"
                        class="input-with-select"
                        clearable
                        :placeholder="$t('labDevice.inputRoomName')"
                        @keyup.enter.native="getList">
                    </el-input>
                </el-form-item>
            </el-form>
            <el-row>
                <el-checkbox-group v-model="roomIds">
                    <el-col v-for="item in list" :key="item.id" :lg="8" :sm="12" :xs="12" class="margin-center">
                        <el-checkbox :label="item.id" @change="handleRoomId($event,item)">{{ item.name }}</el-checkbox>
                    </el-col>
                </el-checkbox-group>
                <div v-if="!list.length" class="empty">{{ $t('common.notMessage1') }}</div>
            </el-row>
            <div class="paging">
                <pagination
                    :layout="'total, prev, pager, next, jumper'"
                    :limit.sync="items.pageSize"
                    :page-count="5"
                    :page.sync="items.pageNum"
                    :total="total"
                    @pagination="getList"/>
            </div>

            <el-row class="select-check-room">
                <div>{{ $t('common.selected') }}{{ selectCheckRooms.length }}{{ $t('system.roomNum') }}</div>
                <el-tag
                    class="margin-small-center margin-small-right"
                    v-for="(tag,index) in selectCheckRooms"
                    :key="tag.name"
                    closable
                    @close="handleTagClose(tag,index)">
                    {{tag.name}}
                </el-tag>
            </el-row>
        </div>
        <span slot="footer" class="dialog-footer">
            <el-button @click="handleClose">{{ $t('common.cancel') }}</el-button>
            <el-button type="primary" @click="handleSubmit()">{{ $t('common.confirm') }}</el-button>
        </span>
    </el-dialog>
</template>

<script>
    import FloorSelectTree from "@c/FloorSelectTree";
    import Pagination from "@c/Pagination/index";
    import { getMapGardenList } from "@/api/mapSet";
    import { getRoomList } from "@/api/room";
    export default {
        components: {
            FloorSelectTree,
            Pagination
        },
        data() {
            return {
                loading: false,
                dialogVisible: false,
                items: {
                    gardenId: null,
                    buildingId: null,
                    floorId: null,
                    keyword: "",
                    pageSize: 10,
                    pageNum: 1
                },
                level: null,
                floors: [],
                list: [],
                total: 0,
                roomIds: [],
                floorSelectId: null,
                isSeographicalLocation: false,
                selectCheckRooms:[],
                isSubmit: 0
            }
        },
        methods: {
            open(data, level){
                this.dialogVisible = true;

                if(data){
                    if(level === 1){
                        this.items.gardenId = data.gardenId;
                        this.items.buildingId = null;
                        this.items.floorId = null;
                    }
                    if (level === 2) {
                        this.items.gardenId = data.gardenId;
                        this.items.buildingId = data.buildingId;
                        this.items.floorId = null;
                    }
                    if (level === 3) {
                        this.items.gardenId = data.gardenId;
                        this.items.buildingId = data.buildingId;
                        this.items.floorId = data.floorId;
                    }
                    this.isSeographicalLocation = true;
                }

                this.handleQuery();
            },
            getList() {
                this.loading = true;
                this.list = [];
                getRoomList(this.items).then(res => {
                    this.loading = false;
                    if(res.code === 1){
                        this.list = res.items.list;
                        this.total = res.items.total;
                    }
                })
            },
            handleQuery() {
                this.floors = [];
                this.loading = true;
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

                        if(!this.isSeographicalLocation){
                            // this.items.gardenId = this.floors[0].id;
                            // this.items.buildingId = this.floors[0].subDivisions[0].id
                            // this.items.floorId = this.floors[0].subDivisions[0].subDivisions[0].id;
                            this.floorSelectId = this.floors[0].name + '/' +  this.floors[0].subDivisions[0].name + '/' + this.floors[0].subDivisions[0].subDivisions[0].name;
                        }else{
                            var buildingSubDivisions = [];
                            var floorSubDivisions = [];
                            for(var i = 0; i < this.floors.length; i++){
                                if(this.floors[i].id === this.items.gardenId){
                                    this.floorSelectId = this.floors[i].name
                                    buildingSubDivisions = this.floors[i].subDivisions
                                }
                            }
                            if(this.items.buildingId){
                                for(var i = 0; i < buildingSubDivisions.length; i++){
                                    if(buildingSubDivisions[i].id === this.items.buildingId){
                                        this.floorSelectId += '/' + buildingSubDivisions[i].name;
                                        floorSubDivisions = buildingSubDivisions[i].subDivisions
                                    }
                                }
                            }
                            if(this.items.floorId){
                                for(var i = 0; i < floorSubDivisions.length; i++){
                                    if(floorSubDivisions[i].id === this.items.floorId){
                                        this.floorSelectId += '/' + floorSubDivisions[i].name;
                                    }
                                }
                            }
                        }
                        this.getList()  
                    } else {
                        this.$message.error(res.message);
                    }
                })
            },
            handleFloorSelect(row) {
                if(this.level === 1){
                    this.items.buildingId = null;
                    this.items.floorId = null;

                    this.floorSelectId = row.label
                }else if(this.level === 2){
                    this.items.floorId = null;

                    this.floorSelectId = row.parent.label + '/' + row.label
                }else{
                    this.floorSelectId = row.parent.parent.label + '/' + row.parent.label + '/' + row.label
                }
                this.getList()
            },
            handleRoomId(e,item){
                if(e){
                    this.selectCheckRooms.push({id:item.id,name:item.name})
                }else{
                    for(var i = 0; i < this.selectCheckRooms.length; i++){
                        if(this.selectCheckRooms[i].id === item.id){
                            this.selectCheckRooms.splice(i,1)
                        }
                    }
                }
            },
            handleTagClose(tag,index) {
                this.selectCheckRooms.splice(index,1);
                for(var i = 0; i < this.roomIds.length; i++){
                    if(this.roomIds[i] === tag.id){
                        this.roomIds.splice(i,1)
                    }
                }
            },
            handleSubmit() {
                var data = {
                    gardenId: this.items.gardenId,
                    buildingId: this.items.buildingId,
                    floorId: this.items.floorId,
                    roomIds: this.roomIds
                }
                this.$emit('handle', data)
                this.dialogVisible = false;
                this.isSeographicalLocation = false;
                this.items = {
                    gardenId: null,
                    buildingId: null,
                    floorId: null,
                    keyword: "",
                    pageSize: 10,
                    pageNum: 1
                };
                this.isSubmit = 1
            },
            handleClose() {
                this.dialogVisible = false;
                this.isSeographicalLocation = false;
                this.floors = [];
                if(this.isSubmit !== 1){
                    this.selectCheckRooms = [];
                    this.roomIds = [];
                }
                this.items = {
                    gardenId: null,
                    buildingId: null,
                    floorId: null,
                    keyword: "",
                    pageSize: 10,
                    pageNum: 1
                }
            }
        },
    }
</script>

<style lang="less" scoped>
    .empty {
        height: 40px;
        line-height: 40px;
        text-align: center;
    }
</style>