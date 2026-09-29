<template>
    <SelectTree
        :model="departmentId"
        :prop="props"
        :options="departmentData"
        :value="selectTreeValue"
        :clearable="isClearable"
        :accordion="isAccordion"
        @getValue="getValue($event)"
        :placeholder="placeholder"
    />
</template>

<script>
    import SelectTree from "@/components/SelectTree";
    import { getDepartment } from "@/api/department";
    import {ERROR} from "@/utils/constant";
    import i18n from "@/i18n";
    export default {
        components: {
            SelectTree
        },
        props:{
            placeholder:{
                type: String,
                default: i18n.t('common.selectDepartemnt')
            }
        },
        data() {
            return {
                departmentId: "",
                isClearable: true, // 可清空（可选）
                isAccordion: false, // 可收起（可选）
                selectTreeValue: "0", // 初始ID（可选）
                departmentList: [],
                props: {
                    // 配置项（必选）
                    value: "id",
                    label: "name",
                    children: "subDivisions",
                },
            }
        },
        mounted() {
            this.getDepartmentData()
        },
        methods: {
            // 选择部门
            getValue(value) {
                this.selectTreeValue = value;
                this.departmentId = value;
                this.$emit('setDepartmentId', value)
            },
            // 部门初始化
            async getDepartmentData() {
                const _ = this;
                try {
                    let temp = [];
                    let result = await getDepartment();
                    if (result.code === 1) {
                        temp = result.items.list;
                    } else {
                        temp = [];
                    }
                    _.departmentList = temp;
                } catch (err) {
                    _.departmentList = [];
                    this.$message.error(ERROR);
                    throw err;
                }
            },
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
            }
        },
        watch: {
            $route(to,from){
                this.departmentId = "";
                this.selectTreeValue = "0"
            },
        },
    }
</script>
