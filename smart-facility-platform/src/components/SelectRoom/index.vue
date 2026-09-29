<template>
    <el-select 
        v-model="id" 
        class="select-change" 
        :placeholder="roomId ? 'loading...' : $t('common.selectRoom')"
        :filterable="filterable"
        @change="handleChange">
        <el-option
            v-for="item in roomList"
            :key="item.id"
            :label="item.name"
            :value="item.id">
        </el-option>
    </el-select>
</template>

<script>
    import {getRoomList} from "@/api/room"; 
    export default {
        props: {
            roomId: {
                type: Number,
                default: null
            },
            filterable: {
                type: Boolean,
                default: false
            },
        },
        data() {
            return {
                roomList: [],
                id: null,
            }
        },
        beforeUpdate() {
            // this.id = this.roomId
        },
        mounted() {
            this.getRoomData()
        },
      watch: {
        roomId: {
          handler(val) {
            this.id = val;
          },
          deep: true
        }
      },
        methods: {
            getRoomData() {
                getRoomList({pageSize: 10000, pageNum: 1}).then(res => {
                    if (res.code) {
                        this.id = this.roomId;
                        this.roomList = res.items.list
                    }
                }).catch(err => {

                })
            },
            handleChange(e){
                this.$emit("update:roomId", e);
            }
        },
    }
</script>