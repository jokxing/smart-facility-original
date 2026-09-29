<template>
    <el-dialog
        :before-close="handleClose"
        :title="title"
        :close-on-click-modal="false"
        append-to-body
        :visible.sync="dialogFormVisible">
        <el-form :model="form" label-position="left" label-width="auto">
            <el-form-item :label="$t('labDevice.parentClass')" v-if="!type">
                <select-asset-classify
                    :is-class="true"
                    :id.sync="form.parentId"
                    class="select-change-p"
                    :select-tree-value.sync="form.parentId"/>
            </el-form-item>
            <el-form-item :label="$t('labDevice.classNo')" required>
                <el-input
                    class="select-change-p"
                    @input="handleCodeValid"
                    maxlength="20"
                    v-model="form.assetCategoryCode"
                    :placeholder="$t('common.pleaseInput')"></el-input>
            </el-form-item>
            <el-form-item :label="$t('labDevice.className')" required>
                <el-input
                    class="select-change-p"
                    v-model="form.assetCategoryName"
                    maxlength="20"
                    @input="handleNameValid"
                    :placeholder="$t('common.pleaseInput')"></el-input>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button :disabled="loading" @click="handleClose">{{ $t('common.cancel') }}</el-button>
            <el-button :disabled="disabled" :loading="loading" type="primary" @click="onsubmit">{{ $t('common.confirm') }}</el-button>
        </div>
    </el-dialog>
</template>

<script>
import {
    getInstrumentCategoryInfoValid,
    postInstrumentCategoryInfoAdd,
    postInstrumentCategoryInfoUpdate
} from "../../../api/labDevice";
import {mapActions} from "vuex";
import SelectAssetClassify from "../../../components/SelectAssetClassify";
import {debounce} from "../../../utils/methods";
let time = null;
export default {
    name: "Created",
    components: {
      SelectAssetClassify
    },
    data() {
        return {
            form: {
                id: "",
                parentId: "",
                assetCategoryCode: "",
                assetCategoryName: ""
            },
            dialogFormVisible: false,
            loading: false,
            type: 0,
            title: "新增分类",
            items: {
                categoryId: "",
                categoryName: "",
                code: ""
            },
            disabled: false
        }
    },
    methods: {
        handleCodeValid(e) {
            if (!e) {
                return
            }
            this.items.code = e;
            this.items.categoryName = "";
            this.valid()
        },
        handleNameValid(e) {
            if (!e) {
                return
            }
            this.items.code = "";
            this.items.categoryName = e;
            this.valid()
        },
        valid() {
            this.items.categoryId = this.form.parentId;
            if (time) {
                clearTimeout(time)
            }
            time = setTimeout(() => {
                getInstrumentCategoryInfoValid(this.items).then(res => {
                    clearTimeout(time)
                    if (res.items.code) {
                        this.disabled = false;
                    } else {
                        this.disabled = true;
                        this.$message.error(res.items.message)
                    }
                })
            }, 500)
        },
        /**
         *
         * @param type 0:新增，1：编辑
         * @param item 参数
         */
        open(type, item) {
            this.dialogFormVisible = true;
            this.type = type;
            this.title = type ? this.$t('labDevice.editClass') : this.$t('labDevice.addClass');
            if (!type) {
                if (item.parentId) {
                    this.form.parentId = item.parentId;
                }
            } else {
                this.form = item;
            }
        },
        handleClose() {
            this.dialogFormVisible = false;
            this.form = {
                id: "",
                parentId: "",
                assetCategoryCode: "",
                assetCategoryName: ""
            }
        },
        onsubmit() {
            this.loading = true;
            if (this.type) {
               return this.edit();
            }
            this.add();
        },
        add() {
            postInstrumentCategoryInfoAdd(this.form).then(res => {
                this.message(res);
            }).catch(e => {
                this.loading = false;
                console.log(e)
            })
        },
        edit() {
            postInstrumentCategoryInfoUpdate(this.form).then(res => {
                this.message(res);
            }).catch(e => {
                this.loading = false;
                console.log(e)
            })
        },
        message(res) {
            this.loading = false;
            if (res.code) {
                this.$message.success(this.title + this.$t('common.success'));
                this.$store.dispatch("getAccessClassify");
                this.$emit("handle");
                this.handleClose();
            } else {
                this.$message.error(res.message);
            }
        }
    }
}
</script>

<style scoped>

</style>