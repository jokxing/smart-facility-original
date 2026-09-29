<template>
    <el-select v-model="userId" :clearable="clearable" :filterable="filterable" @change="handleChange">
        <el-option 
            v-for="item in list" 
            :key="item.id" 
            :label="item.name"
            :value="item.id">
        </el-option>
    </el-select>
</template>

<script>
    import { getUserList } from "@/api/user"
    export default {
        props:{
            // 有数据就给list末尾追加数据
            pushData:{
                type: Array,
                default: []
            },
            clearable: {
                type: Boolean,
                default: false
            },
            filterable: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                userId: null,
                list: []
            }
        },
        mounted() {
            this.getList()
        },
        methods: {
            getList(){
                getUserList({pageSize: 999999}).then(res => {
                    if(res.code === 1){
                        this.list = res.items.list;
                        if(this.pushData.length > 0){
                            for(var i = 0; i < this.pushData.length; i++){
                                this.list.push(this.pushData[i])
                            }
                        }
                    }
                })
            },
            handleChange() {
                this.$emit('update:userId', this.userId);
                this.$emit('handle')
            }
        }
    }
</script>