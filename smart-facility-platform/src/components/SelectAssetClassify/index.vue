<!--资产分类选择-->
<template>
    <select-tree
        :class="isClass ? 'select-change': 'input-with-select margin-small-right'"
        :clearable="true"
        :default-open="false"
        :level="true"
        :model.sync="id"
        :options="data"
        :popper-class="popperClass"
        :prop="props"
        :value.sync="selectTreeValue"
        accordion
        :disabled="disabled"
        :placeholder="$t('labDevice.changeClassify')"
        @getValue="getValue($event)"/>
</template>

<script>
import SelectTree from "@/components/SelectTree";
import {mapActions} from "vuex";
export default {
    name: "index",
    components: {SelectTree},
    props: {
        id: {
            type: [Number, String],
            default: null
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
        disabled: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            props: {
                value: "id",
                label: (data) => {
                    return data.name + "("+ data.code +")";
                },
                children: "childrenList"
            },
            data: []
        }
    },
    created() {
      this.data = this.$store.state.assetClassify
    },

    methods: {
        ...mapActions(["getAccessClassify"]),
        getValue(data) {
            if (!data) {
                this.$emit("update:selectTreeValue", null);
                this.$emit("update:id", null);
                return
            }
            this.$emit("update:id",data.data.id.toString());
            this.$emit("update:selectTreeValue",data.data.id.toString());
            this.$emit("change");
        }
    }
}
</script>

<style scoped>

</style>