<template>
    <el-form ref="form" :model="form" label-position="left" label-width="auto">
        <el-form-item
            v-for="(item,index) in formData" 
            :key="index" 
            :label="item.label" 
            :required="item.isRequired"
            :show-message="false" 
            :prop="item.prop"
            :class="item.itemClass">
            <slot v-if="item.type === 'slot'" :data="item"></slot>
            <!-- text -->
            <el-input 
                v-if="item.type === 'text'"
                v-model.trim="form[item.prop]"
                :placeholder="item.placeholder"
                :maxlength="item.maxlength"
                :disabled="item.disabled"
                class="select-change-p">
            </el-input>
            <!-- textarea -->
            <el-input
                v-if="item.type === 'textarea'" 
                type="textarea" 
                v-model.trim="form[item.prop]"
                class="select-change-p"
                :maxlength="item.maxlength"
                :rows="item.rows"
                :show-word-limit="item.showWordLimit">
            </el-input>
            <!-- select -->
            <el-select 
                v-if="item.type === 'select'"
                class="select-change-p"
                v-model.trim="form[item.prop]"
                :multiple="item.multiple"
                :placeholder="item.placeholder">
                <el-option
                    v-for="s in item.options"
                    :key="s[item.optionObj.value]"
                    :label="s[item.optionObj.label]"
                    :value="s[item.optionObj.value]">
                </el-option>
            </el-select>
            <!-- number -->
            <el-input
                v-if="item.type === 'number'"
                v-model.trim="form[item.prop]"
                autocomplete="off"
                :maxlength="item.maxlength"
                class="select-change-p"
                :class="item.class"
                type="number"
                :placeholder="item.placeholder"
                :disabled="item.disabled">
                <template #append v-if="item.append">
                    <span>{{ item.append }}</span>
                </template>
            </el-input>
            <!-- switch -->
            <el-switch 
                v-if="item.type === 'switch'" 
                v-model="form[item.prop]" 
                :active-value="1"
                :inactive-value="0" />
            <!-- date-picker -->
            <el-date-picker
                v-if="item.type === 'datetimerange'"
                v-model="datetimer"
                :picker-options="item.pickerOptions"
                align="right"
                class="select-change-p"
                :end-placeholder="$t('common.endDate')"
                :range-separator="$t('common.most')"
                :start-placeholder="$t('common.startDate')"
                type="datetimerange"
                :value-format="valueFormat"
                @change="handleDateTimer($event,item)">
            </el-date-picker>
            <!-- date -->
            <el-date-picker
                v-if="item.type === 'date'"
                class="select-change-p"
                v-model="form[item.prop]"
                type="date"
                :placeholder="$t('labDevice.selectDate')"
                :disabled="item.disabled">
            </el-date-picker>
            <!-- datetime -->
            <el-date-picker
                v-if="item.type === 'datetime'"
                class="select-change-p"
                v-model="form[item.prop]"
                type="datetime"
                :picker-options="item.pickerOptions"
                :placeholder="$t('common.selectTime')"
                :disabled="item.disabled">
            </el-date-picker>
            <!-- 部门 -->
            <SelectDepartment
                v-if="item.type === 'selectDepartment'"
                class="select-change-p"
                :departmentId.sync="form[item.prop]"
                :select-tree-value.sync="form[item.prop]"
                :disabled="item.disabled"/>
            <!-- 房间 -->
            <SelectRoom 
                v-if="item.type === 'selectRoom'"
                :roomId.sync="form[item.prop]"
                :filterable="true"
                class="select-change-p"
                :disabled="item.disabled" />
            <select-asset-classify
                :is-class="true"
                v-if="item.type === 'selectClass'"
                :id.sync="form[item.prop]"
                class="select-change-p"
                :select-tree-value.sync="form[item.prop]"/>
            <!-- 上传 -->
            <chuxou-upload
                v-if="item.type === 'upload'"
                :accept="item.accept"
                :acceptTips="item.acceptTips"
                :dir="item.dir"
                :limit="item.limit"
                :value="fileList"
                @handleUploadSuccess="handleUploadSuccess(item.prop, $event)"
            />
        </el-form-item>
    </el-form>
</template>

<script>
    import SelectTree from "@/components/SelectTree";
    import SelectDepartment from "@c/SelectdePartment";
    import SelectRoom from "@c/SelectRoom";
    import ChuxouUpload from "@/components/ChuxouUpload";
    import moment from "moment";
    import SelectAssetClassify from "@c/SelectAssetClassify";
    export default {
        components: {
            SelectTree,
            SelectDepartment,
            SelectRoom,
            ChuxouUpload,
            SelectAssetClassify

        },
        props:{
            formData: {
                type: Array,
                default: []
            },
            data: {
                type: Object,
                default: {}
            },
            labelWidth: {
                type: String,
                default: ""
            },
            valueFormat: {
                type: String,
                default: "yyyy-MM-dd HH:mm:ss"
            }
        },  
        data() {
            return {
                form:{},
                datetimer: [],
                selectTreeValue: null,
                fileList: []
            }
        },
        mounted() {
            this.form = this.data;
            for(var i = 0; i < this.formData.length; i++){
                if(this.formData[i].type === 'selectDepartment'){
                    this.selectTreeValue = this.data.departmentId
                }
            }
        },
        watch: {
          data: {
            handler(obj) {
              this.form = obj;
            },
            deep: true
          }
        },
        methods:{
            handleDateTimer(e,item) {
                if(this.valueFormat === 'yyyy-MM-dd HH:mm:ss'){
                    var format = "YYYY-MM-DD HH:mm:ss"
                }
                if (e) {
                    this.form[item.value[0]] = moment(e[0]).format(format)
                    this.form[item.value[1]] = moment(e[1]).format(format)
                } else {
                    this.form[item.value[0]] = "";
                    this.form[item.value[1]] = "";
                }

            },
            // 上传
            handleUploadSuccess(type,e) {
                this.form[type] = e
            }
        }
    }
</script>

<style lang="less" scoped>
    .append-item{
        width: 420px;
    }
    /deep/ .el-textarea .el-input__count{
        background-color: initial;
    }
</style>