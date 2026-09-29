<template>
  <select-tree
      :class="isClass ? 'select-change-p': 'input-with-select margin-small-right'"
      :clearable="true"
      :default-open="false"
      :level="true"
      :model.sync="id"
      :options="data"
      :popper-class="popperClass"
      :prop="props"
      :value.sync="selectTreeValue"
      :isAccurate="isAccurate"
      accordion
      :placeholder="$t('common.placeholder')"
      @getValue="getValue($event)"/>
</template>

<script>
import SelectTree from "@/components/SelectTree";

export default {
  name: "FloorSelectTree",
  components: {SelectTree},
  props: {
    id: {
      type: [Number, String],
      default: null
    },
    data: {
      type: Array,
      default: () => []
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
    gradenName: {
      type: String,
      default: ""
    },
    buildingName: {
      type: String,
      default: ""
    },
    isAccurate: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      props: {
        // 配置项（必选）
        value: "id",
        label: "name",
        children: "subDivisions",
      },
    }
  },
  methods: {
    getValue(value) {
      if (!value) {
        this.$emit("update:selectTreeValue", null);
        this.$emit("update:id", null);
      } else {
        this.$emit("update:selectTreeValue", value.data.id.toString());
        this.$emit("update:floorName", value.data.name);
        if(this.isAccurate){
          this.$emit("update:gradenName", value.parent.parent.label);
          this.$emit("update:buildingId", value.parent.key);
          this.$emit("update:id", value.data.id.toString());
        }else{
          this.$emit('update:level', value.level)
          if(value.level === 1){
            this.$emit("update:gradenName", value.data.name);
            this.$emit("update:gardenId",value.data.id)
          }else if(value.level === 2){
            this.$emit("update:buildingId", value.data.id);
          }else {
            this.$emit("update:floorId", value.data.id);
          }
        }
        this.$emit("update:buildingName", value.parent.label);
      }
      this.$emit("change",value);
    }
  }
}
</script>
