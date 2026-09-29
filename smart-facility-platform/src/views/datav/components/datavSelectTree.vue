<template>
    <div>
        <SelectTree
            :accordion="false"
            :clearable="true"
            :model="departmentId"
            :options="departmentData"
            :prop="props"
            :value="selectTreeValue"
            :popperClass="'dataV-select'"
            :placeholder="$t('common.selectDepartemnt')"
            @getValue="getValue($event)"/>
    </div>
</template>

<script>
    import SelectTree from "@/components/SelectTree";
    import { getDepartment } from "@/api/department";
    export default {
        data() {
            return {
                // 部门
                departmentId: "",
                selectTreeValue: "0",// 初始ID（可选）
                props: {
                    // 配置项（必选）
                    value: "id",
                    label: "name",
                    children: "subDivisions",
                },
                departmentList: [],
            }
        },
        components:{
            SelectTree,
        },
        computed: {
            departmentData() {
                const traverse = (array, _proto) => {
                    let am = array.map((arr) => {
                        if (arr[_proto].length && arr[_proto].length > 0) {
                            traverse(arr[_proto], _proto);
                        }
                        arr.id = arr["id"].toString();
                    });
                    return array;
                };
                return traverse(this.departmentList, "subDivisions");
            },
        },
        mounted() {
            this.getDepartmentData()
        },
        methods: {
            // 部门列表
            getDepartmentData() {
                let temp = [];
                getDepartment().then(res => {
                    if (res.code == 1) {
                        let items = res.items;
                        if (items.list && items.list.length > 0) {
                            let lists = items.list;
                            temp = lists.sort(
                                (a, b) => b.defaultDepartment - a.defaultDepartment
                            );
                        }
                    } else {
                        this.$message.error(res.message);
                    }
                    temp.unshift({id:"",name: "全部",subDivisions:[]})
                    this.departmentList = temp;
                }).catch(err => {
                    this.departmentList = []
                })
            },
            // 部门选择
            getValue(value) {
                this.departmentId = value;
                this.selectTreeValue = value;
                this.$emit('getDepartmentId', value)
            },
        },
    }
</script>