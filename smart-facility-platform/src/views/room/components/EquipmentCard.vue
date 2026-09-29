<template>
  <div :class="{ 'adaptationScreen': isAdaptationScreen }" class="card">
    <div class="equipment-name clearfix">
      <div>
        <a target="_blank" :title="$t('room.lookMore')" @click="handleGoEquipment(data.id)">{{ data.name }}</a>
      </div>
    </div>
    <div class="equipment-message">
      <div class="equipment-icon">
        <img :src="data.url" alt="">
      </div>
      <div v-if="data.type !== 8" class="equipment">
        <div
            v-for="(item, index) in data.sensors"
            :key="item.id"
            class="equipment-state">
          <div
              v-if="index<6"
              class="equipment-state-value">
            <span>{{ item.sensorType.name }}</span>
            <div class="num">
              <span :class="item.status === $STATUS.NORMAL ? 'normal' : 'abnormal'" class="ft20">
                {{ DATAZOOM[item.type] ? handleNum(item) : handleNum(item)[0] }}
              </span>
              <span v-if="!DATAZOOM[item.type]" class="unit">{{ handleNum(item)[1] }}</span>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="equipment">
        <div class="equipment-state">
          <div
              :class="data.powerFailure ? 'normal' : 'abnormal'"
              class="equipment-state-value"
          >{{
              data.powerFailure ? $t('hardware.aboutage') : $t('hardware.outage')
            }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import i18n from "@/i18n";
import {DATAZOOM} from "@/utils/constant";

export default {
  name: "EquipmentCard",
  props: {
    data: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      isAdaptationScreen: false,
        DATAZOOM
    }
  },
  mounted() {
    //用户分辨率100%为false，其他为true
    if (screen.width < 1550) {
      this.isAdaptationScreen = true
    }
    ;
  },
  methods: {
    handleGoEquipment() {
      this.$emit("change")
    },
    handleRemoveRoomGoods(id) {
      this.$confirm(this.$t('room.unBindLabDeviceMessage'), this.$t('room.unBindLabDevice'), {
        type: "warning",
          cancelButtonText: i18n.t("common.cancel"),
          confirmButtonText: i18n.t("common.confirm"),
      }).then(() => {
        this.$emit("handle", id);
      }).catch(() => {
        this.$message.info(i18n.t("common.cancelHandle"));
      });
    },
    handleNum(item) {
      const str = this.handleSensor(item);
      if (DATAZOOM[item.type]) {
          return str
      } else {
          return str.split(" ");
      }
    }
  },
};
</script>

<style lang="less" scoped>
@import "../../../../src/style/variable";

.equipment-name {
  margin-bottom: 8px;
  font-size: 16px;

  a {
    color: #448AFF;
    font-weight: bold;
  }
}

.equipment-message {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .equipment-icon {
    width: 50px;
    height: 90px;
    line-height: 90px;
    margin-right: 14px;

    img {
      width: 100%;
      vertical-align: middle;
    }
  }

  .equipment {
    flex: 1;
    display: flex;
    flex-wrap: wrap;

    .equipment-state {
      line-height: 1.5;
      width: 50%;
      display: flex;
      justify-content: space-between;

      .equipment-state-value {
        width: 98%;
        font-size: 12px;
        display: flex;
        align-items: center;
        justify-content: flex-start;

        .num {
          margin-left: 10px;
        }

        span {
          color: #888888;
          font-size: 12px;
        }

        .unit {
          font-size: 12px;
        }

        .ft20 {
          font-size: 14px;
        }
      }
    }
  }
}

.card {
  // min-width: 320px;
  padding: 20px 10px 20px 10px;
  border-radius: 8px;
  margin-left: 16px;
  margin-bottom: 20px;
  background: #EAF2FE;
}

.adaptationScreen {
  padding: 20px 6px 20px 6px;

  a {
    padding-left: 10px;
  }
}

</style>
