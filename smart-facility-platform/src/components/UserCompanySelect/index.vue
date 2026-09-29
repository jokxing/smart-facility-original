<template>
    <el-select clearable v-model="id" :placeholder="$t('hardware.selectUsers')" @change="handleChange">
        <el-option
            v-for="item in userList"
            :key="item.id"
            :label="item.name"
            :value="item.id">
        </el-option>
    </el-select>
</template>

<script>
import {getUserCompanyList, getUserList} from '@/api/user'
    export default {
        props: {
            userId: {
                type: Number | String,
                default: null
            },
            type: {
                type: Number,
                default: null
            },
            depId: {
                type: [Number, String],
                default: 0
            }
        },
        data() {
            return {
                userList: [],
                id: null
            }
        },
        mounted() {
            this.id = JSON.parse(JSON.stringify(this.userId));
            this.init()
        },
        methods: {
            init() {
                getUserList({departmentId: this.depId || 0, pageNum: 1, pageSize: 10000}).then(res => {
                    if(res.code === 1){
                        this.userList = res.items.list;
                    }
                })
            },
            handleChange(){
                this.$emit("update:userId", this.id);
                this.$emit('getVal', this.id);
            }
        },
        watch: {
            depId: {
                handler(newVal) {
                    console.log(newVal)
                    getUserList({departmentId: newVal || 0, pageNum: 1, pageSize: 10000}).then(res => {
                        if(res.code === 1){
                            this.userList = res.items.list
                        }
                    })
                },
                deep: true
            }
        }
    }
</script>