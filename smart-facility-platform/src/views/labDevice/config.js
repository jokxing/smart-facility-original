/*-------------智能插座的状态-------------*/
import i18n from "@/i18n";
const INTELLEGENTSOKETSTATUS = [
  {
    label: "运行中",
    value: 1,
    color: "#13ce66"
  },
  {
    label: "待机中",
    value: 0,
    color: "#666666"
  },
  {
    label: "已关机",
    value: -1,
    color: "#000000"
  },
  {
    label: "维护中",
    value: -2,
    color: "#ff4949"
  },
  {
    label: "未检测",
    value: -3,
    color: "#ffd591"
  }
];



const colorList = ["#13ce66", "#666", "#000000", "#ff4949", "#ffd591"];

/*-------------设备状态-------------*/
export const STATUSSET = [
  {
    label: "未绑定智能插座",
    value: -1,
    color: "#13ce66"
  },
  {
    label: "关机中",
    value: 0,
    color: "#ffd591"
  },
  {
    label: "运行中",
    value: 1,
    color: "#ff4949"
  },{
    label:'待机中',
    value:''
  }
];

export const dateData = [
  {
    name: "一周"
  },
  {
    name: "一月"
  },
  {
    name: "半年"
  },
  {
    name: "一年"
  }
];
