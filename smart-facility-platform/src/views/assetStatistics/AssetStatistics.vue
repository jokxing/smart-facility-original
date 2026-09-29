<template>
  <div class="asset-statistics">
    <el-row :gutter="20">
      <el-col :md="8">
        <div class="session">
          <div class="clearfix">
            <div class="title">资产使用组织统计</div>
            <div class="cut-type">
              <div class="margin-small-right is-active">按数量</div>
              <div>按金额</div>
            </div>
          </div>
          <ring-chart :center-text="'资产总数'" :data-charts="assetUser"></ring-chart>
        </div>
      </el-col>
      <el-col :md="8">
        <div class="session">
          <div class="clearfix">
            <div class="title">资产状态统计</div>
            <div class="cut-type">
              <div class="margin-small-right is-active">按数量</div>
              <div>按金额</div>
            </div>
          </div>
          <ring-chart :center-text="'资产总数'" :data-charts="assetStatus"></ring-chart>
        </div>
      </el-col>
      <el-col :md="8">
        <div class="session">
          <div class="clearfix">
            <div class="title">资产分类统计</div>
            <div class="cut-type">
              <div class="margin-small-right is-active">按数量</div>
              <div>按金额</div>
            </div>
          </div>
          <ring-chart :center-text="'资产总数'" :data-charts="assetClass"></ring-chart>
        </div>
      </el-col>
    </el-row>
    <el-row :gutter="20" class="asset-bottom">
      <el-col :md="8">
        <div class="session asset-session">
          <div class="clearfix">
            <div class="title">资产增量统计</div>
            <div></div>
          </div>
          <bar-line-chart :data-charts="assetAddNum"/>
        </div>
        <div class="session asset-session">
          <div class="clearfix">
            <div class="title">使用率排行</div>
            <div></div>
          </div>
          <histogram-chart :interval="1" :data-charts="assetUserRanking" :height="'250px'"/>
        </div>
      </el-col>
      <el-col :md="8" class="ai-session">
        <div class="session" style="height: 100%">
          <div class="clearfix">
            <div class="title">智能盘点</div>
            <div style="font-size: 12px;color: #555555">最近盘点时间：2022-08-25&nbsp;13:05:01</div>
          </div>
          <div class="ai-check margin-center">
            <div class="ai-check-one">
              <span class="margin-small-right" style="color: #555555">资产总数</span>
              <span>25102</span>件
            </div>
            <div class="ai-check-one">
              <span class="margin-small-right" style="color: #555555">资产总额</span>
              <span>2451242567</span>元
            </div>
          </div>
          <div class="ai-content">
            <div class="ai-count">
              <div class="clearfix w250">
                <div>盘点资产总览</div>
                <div class="num">6000<span>件</span></div>
              </div>
              <div class="count-num">2451242567<span>元</span></div>
            </div>
            <div class="ai-check padding-16">
              <div class="clearfix w250">
                <div>实验室设备</div>
                <div class="num">2000<span>件</span></div>
              </div>
              <div class="count-num">851242567<span>元</span></div>
            </div>
            <div class="ai-check padding-16">
              <div class="clearfix w250">
                <div>行政设备</div>
                <div class="num">2000<span>件</span></div>
              </div>
              <div class="count-num">751242567<span>元</span></div>
            </div>
            <div class="ai-check padding-16">
              <div class="clearfix w250">
                <div>IT设备</div>
                <div class="num">2000<span>件</span></div>
              </div>
              <div class="count-num">951242567<span>元</span></div>
            </div>
          </div>
          <div class="ai-proportion">
            <el-row>
              <el-col :md="12">
                <div style="position: relative">
                  <ring-chart3 :type="1" class="ring-charts"/>
                  <div class="ai-proportion-ring">
                    <div>监控中资产</div>
                    <div>57%</div>
                  </div>
                </div>
              </el-col>
              <el-col :md="12">
                <div style="position: relative">
                  <ring-chart3 :data-charts="[5,0,15]" :type="0" class="ring-charts"/>
                  <div class="ai-proportion-ring">
                    <div>未监控资产</div>
                    <div>15%</div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
        </div>
      </el-col>
      <el-col :md="8" class="ai-session">
        <div class="session" style="height: 100%;overflow:hidden;">
          <div class="title">资产异动信息</div>
          <vue-seamless-scroll :class-option="optionSingleHeightTime" :data="listData" class="seamless-warp">
            <ul class="move-cent">
              <li v-for="(item, index) in listData" :key="index" class="move-top">
                <div class="clearfix">
                  <div class="move"><span>{{ item.name }}</span> 位置变动</div>
                  <div class="date">{{ item.date }}</div>
                </div>
                <div>{{ item.title }}</div>
              </li>
            </ul>
          </vue-seamless-scroll>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import RingChart from "@c/RingChart2"
import BarLineChart from "@c/BarLineChart"
import HistogramChart from "@c/HistogramChart/index";
import RingChart3 from "@c/RingChart3"
import VueSeamlessScroll from "vue-seamless-scroll";

export default {
  name: "AssetStatistics",
  components: {
    RingChart,
    HistogramChart,
    BarLineChart,
    VueSeamlessScroll,
    RingChart3
  },
  data() {
    return {
      assetUser: {
        columns: ["name", "count"],
        rows: [
          {name: "质量部", count: 70},
          {name: "生产部", count: 80},
          {name: "软件部", count: 47},
          {name: "仓库", count: 56},
        ]
      },
      assetStatus: {
        columns: ["name", "count"],
        rows: [
          {name: "闲置资产", count: 50},
          {name: "在用资产", count: 100},
          {name: "借用资产", count: 42},
          {name: "已处置资产", count: 10},
          {name: "维修中资产", count: 12},
          {name: "审批中资产", count: 16},
          {name: "待维修资产", count: 2},
        ]
      },
      assetClass: {
        columns: ["name", "count"],
        rows: [
          {name: "实验室资产", count: 70},
          {name: "IT资产", count: 80},
          {name: "行政资产", count: 47},
        ]
      },
      assetAddNum: {
        columns: ["date", "num", "money"],
        loading: false,
        rows: [
          {date: "1月", num: 0, money: 0},
          {date: "2月", num: 0, money: 0},
          {date: "3月", num: 0, money: 0},
          {date: "4月", num: 4, money: 4010},
          {date: "5月", num: 2, money: 3200},
          {date: "6月", num: 6, money: 6950},
          {date: "7月", num: 10, money: 12500},
          {date: "8月", num: 5, money: 6520},
          {date: "9月", num: 2, money: 2860},
          {date: "10月", num: 1, money: 1200},
          {date: "11月", num: 1, money: 1100},
          {date: "12月", num: 0, money: 0},
        ]
      },
      assetUserRanking: {
        columns: ["name", "count"],
        formatter: " 次",
        rows: [
          {name: "超低温冰箱", count: 532},
          {name: "实验柜", count: 52},
          {name: "移液枪", count: 1002},
          {name: "HP电脑20220601", count: 125},
          {name: "HP电脑20220602", count: 162},
          {name: "投影仪", count: 152},
        ]
      },
      listData: [
        {name: "超低温冰箱", date: "2022-05-30", title: "由302资产网关，移动到304资产网关"},
        {name: "HP电脑20220601", date: "2022-05-30", title: "由办公室001，移动到办公室003"},
        {name: "软件部椅子002", date: "2022-05-18", title: "由软件部，移动到生产部"},
        {name: "软件部美的风扇JD", date: "2022-05-10", title: "由软件部，移动到仓库"},
        {name: "软件部美的风扇JD", date: "2022-05-10", title: "由软件部，移动到仓库"},
        {name: "软件部美的风扇JD", date: "2022-05-10", title: "由软件部，移动到仓库"},
      ],
      height: 108
    }
  },
  mounted() {
    let li, bottom;
    this.$nextTick(() => {
      const element = document.querySelector(".move-top");
      li = element.clientHeight;
      bottom = window.getComputedStyle(element, null).marginBottom.toString().replaceAll("px", "") * 1;
      this.height = li + bottom;
    })

  },
  computed: {
    optionSingleHeightTime() {
      return {
        singleHeight: this.height,
        waitTime: 2500
      }
    }
  }
}
</script>

<style lang="less" scoped>
.title {
  font-size: 16px;
  line-height: 30px;
  font-weight: bold;
  position: relative;
  color: #3F51B5;

  &::before {
    content: "";
    width: 4px;
    height: 18px;
    line-height: 18px;
    border-radius: 2px;
    background: #3F51B5;
    position: absolute;
    left: -20px;
    top: 5px;
  }
}

.cut-type {
  display: flex;

  div {
    font-size: 14px;
    width: 60px;
    height: 30px;
    line-height: 30px;
    text-align: center;
    background: #F4F4F9;
    border-radius: 5px;
    color: #3F51B5;
  }

  div:hover {
    cursor: pointer;
  }

  .is-active {
    color: #FFFFFF;
    background: #3F51B5;
  }
}

.ai-check-one {
  width: 48%;
  color: #00B1FF;
  text-align: start;
  padding: 10px 10px 10px 20px;
  background: #E5F7FF;
  border-left: 5px solid #00B1FF;

  span:nth-of-type(2n+1) {
    font-size: 14px;
  }

  span:nth-of-type(2n) {
    font-size: 16px;
    font-weight: bold;
  }
}

.ai-content {
  width: 450px;
  height: 230px;
  background: #FFFFFF;
  margin: 40px auto 80px;
  padding: 16px;
  box-shadow: 2px 1px 6px 0 rgba(21, 29, 59, 0.1);
  border-radius: 8px;

  .ai-count {
    width: 100%;
    height: 50px;
    line-height: 50px;
    background: #ECECFD;
    display: flex;
    padding: 0 16px;
    font-size: 14px;
    justify-content: space-between;
    color: #555555;
    border-radius: 6px;

  }
}

.w250 {
  width: 200px;

  .num {
    font-size: 16px;
    color: #4447EA;
    font-weight: bold;

    span {
      font-size: 14px;
      margin-left: 8px;
    }
  }
}

.count-num {
  font-size: 16px;
  color: #4447EA;
  font-weight: bold;

  span {
    font-size: 14px;
    margin-left: 8px;
  }
}

.ai-check {
  display: flex;
  justify-content: space-between;
  text-align: end;
  line-height: 30px;
}

.padding-16 {
  padding: 0 16px;
}

.ai-proportion {
  margin-top: 40px;
}

.ai-proportion-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  div {
    text-align: center;
  }
}


.green {
  background: #13ce66;

  .small-ring {
    background: #000000;
  }
}

.pick {
  background: #E69F9F;

  .small-ring {
    background: #000000;
  }
}

.grey {
  background: #c4c5c8;

  .small-ring {
    background: #F4EDED;
  }
}

.move-cent {
  margin-top: 20px;
  overflow-y: auto;

  li {
    padding: 20px;
    background: #F0F1FD;
    margin-bottom: 20px;
    border-radius: 8px;
    line-height: 1.5;

    .move {
      font-weight: bold;

      span {
        color: #4447EA;
      }
    }

    .date {
      font-size: 12px;
      color: #999999;
    }
  }

  li:last-of-type {
    margin-bottom: 0;
  }
}

.seamless-warp {
  height: 650px;
  overflow: hidden;
}

.asset-session {
  height: 350px;
}

.ai-session {
  height: 720px;
}
</style>
