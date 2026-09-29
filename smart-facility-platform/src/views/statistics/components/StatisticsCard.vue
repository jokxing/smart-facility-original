<template>
  <div class="statistics-card">
    <div class="counter-lg">
      <div class="statistics-card-title">
        <span class="title">{{ data.title }}</span>
        <span>{{ $t('common.sum') }}：{{ data.total }}</span>
      </div>
      <div class="path" @click="handlePath(data.path, data.id)"><a class="margin-small-right">{{ $t('statistics.detail') }}</a><i
          class="el-icon-arrow-right"></i></div>
    </div>
    <el-row class="counter-label" justify="space-between" type="flex">
      <el-col :sm="6">
        <div>
          <div class="counter-normal">
            <span class="statistics-card-num">{{ data.normal }}</span>
<!--            <span class="statistics-card-unit">{{ data.unit }}</span>-->
          </div>
          <div class="statistics-card-status">{{ $t('common.normal') }}&nbsp;{{ subheading }}</div>
        </div>
      </el-col>
      <el-col :sm="6">
        <div>
          <div class="counter-error">
            <span class="statistics-card-num">{{ data.error }}</span>
<!--            <span class="statistics-card-unit">{{ data.unit }}</span>-->
          </div>
          <div class="statistics-card-status">{{ $t('common.abnormal') }}&nbsp;{{ subheading }}</div>
        </div>
      </el-col>
      <el-col :sm="6">
        <div>
          <div class="counter-line">
            <span class="statistics-card-num">{{ data.offLine }}</span>
<!--            <span class="statistics-card-unit">{{ data.unit }}</span>-->
          </div>
          <div class="statistics-card-status">{{ $t('common.offLine') }}&nbsp;{{ subheading }}</div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  name: "StatisticsCard",
  props: {
    data: {
      type: Object,
      default: null
    }
  },
  methods: {
    handlePath(path, id) {
      this.$store.commit("SETMENUKEY", id);
      this.$router.push(path);
    }
  },
  mounted() {

  },
  computed: {
    subheading() {
      if (this.data.id === "ld") {
        return this.$t('common.equipment');
      }
      if (this.data.id === "rm") {
        return this.$t('common.room');
      }
      if (this.data.id === "lhd") {
        return this.$t('hardware.device');
      }
    }
  }
}
</script>

<style lang="less" scoped>
@import "../../../style/variable.less";

.statistics-card {
  width: 505px;
  background: #F4F8FF;
  border-radius: 8px;
  padding: 20px;
}

.counter-lg {
  display: flex;
  justify-content: space-between;

  .statistics-card-title {
    font-size: 12px;
    font-weight: @fw400;
    color: #8A8FAF;
    line-height: 30px;

    .title {
      font-size: @font16;
      font-weight: @fwbold;
      color: @555;
      line-height: 30px;
      margin-right: 20px;
    }
  }

  .path > a, i {
    font-size: 12px;
    font-weight: @fw400;
    color: #8A8FAF;
    line-height: 30px;
  }
}

.counter-number {
  font-size: 50px;
  line-height: 1.5;
}

.counter-label {
  display: flex;
  justify-content: space-between;
  font-size: @miniFontSize;
}

.counter-normal {
  line-height: 1.5;
  color: @normal;
  font-size: @bigFontSize;
  font-weight: 500;
}

.counter-error {
  line-height: 1.5;
  color: @abnormal;
  font-size: @bigFontSize;
  font-weight: 500;
}

.counter-line {
  line-height: 1.5;
  color: @offLine;
  font-size: @bigFontSize;
  font-weight: 500;
}

.statistics-card-num {
  font-size: @font40;
  font-weight: @fw500;
  line-height: 60px;
}

.statistics-card-unit {
  font-size: @font14;
  font-weight: @fw400;
  line-height: 30px;
  margin-left: 10px;
}

.statistics-card-status {
  font-size: @font14;
  font-weight: @fw400;
  color: #777777;
  line-height: 30px;
}
</style>
