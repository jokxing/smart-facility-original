import {DEVICE_ID, DEVICE_USE_STATUS} from "@/utils/constant";
import moment from "moment";
import i18n from "@/i18n";

/**
 *
 * @param {*} array 数组
 * @param {*} id Number
 * @param {*} callback 回调函数
 */

export function dataFilter(array, id, callback) {
  for (const item of array) {
    if (item.id === id) {
      callback(item.name);
      break;
    } else if (id === 0) {
      callback("公司");
      break;
    }
  }
}

/**
 *
 * @param {*} array 需要格式化数据的数组
 * @param {*} value 数据id，例如：departmentId:1
 * @returns
 */
export function tableDataFormatter(array, value) {
  let obj = {};
  array.map(item => {
    obj[item.id] = item.name;
  });
  return obj[value];
}

/**
 *
 * @param {*} array 序列化筛选数据，筛选类目加上‘全部’
 * @param {*} array 需要格式化数据的数组
 * @returns
 */

export const serializeScreenData = array => {
  return [{ label: i18n.t('common.all'), value: i18n.t('common.all') }, ...array];
};

/**
 *
 * @param data 信号值
 * @param unit 单位
 * @param weak 弱
 * @param center 中
 * @param strong 强
 * @returns {string}
 */
export function signalStateFilter(
  data,
  unit,
  weak = 0,
  center = 0,
  strong = 0
) {
  if (data < weak) {
    return "<span class='abnormal'>" + data + unit + "("+i18n.t('hardware.weak')+")</span>";
  }
  if (data < center && data >= weak) {
    return data + unit + "（"+i18n.t('hardware.center')+"）";
  }
  if (data >= center) {
    return data + unit + "（"+i18n.t('hardware.strong')+"）";
  }
  if (data === weak) {
    return `<span class='abnormal'>${data}` + unit + `（`+i18n.t('common.offLine')+`）</span>`;
  }
}

/**
 * 计算当前时间往前多长时间，例如：一周前等
 * @param day 天数
 * @returns {Date[]}
 */
export function computationTime(day) {
  const end = new Date();
  const start = new Date();
  start.setTime(start.getTime() - 3600 * 1000 * 24 * day);
  return [start, end];
}

/**
 * 下载本地模板文件
 * @param url 在目录中的位置
 * @param fileName 文件名 ps:需要与文件位置后面的文件名一致
 */
export function downloadFile(url, fileName) {
  let a = document.createElement("a"); //创建一个<a></a>标签
  a.href = url; // 给a标签的href属性值加上地址，注意，这里是绝对路径，不用加 点.
  a.download = fileName; //设置下载文件文件名，这里加上.xlsx指定文件类型，pdf文件就指定.fpd即可
  a.style.display = "none"; // 障眼法藏起来a标签
  document.body.appendChild(a); // 将a标签追加到文档对象中
  a.click(); // 模拟点击了a标签，会触发a标签的href的读取，浏览器就会自动下载了
  a.remove();
}

/**
 * 节流函数
 * @param fn 执行的方法
 * @param wait 等待时间
 * @param options leading:false 禁用第一次执行   trailing: false 表示禁用停止触发的回调
 */
export function throttle(fn, wait, options = {}) {
  let timer = null;
  let previous = 0;
  let throttled = function () {
    let now = +new Date();
    // remaining 不触发下一次函数的剩余时间
    if (!previous && options.leading === false) previous = now;
    let remaining = wait - (now - previous);
    if (remaining < 0) {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      previous = now;
      fn.apply(this, arguments);
    } else if (!timer && options.trailing !== false) {
      timer = setTimeout(() => {
        previous = options.leading === false ? 0 : new Date().getTime();
        timer = null;
        fn.apply(this, arguments);
      }, remaining);
    }
  };
  return throttled;
}

/**
 *
 * @param item
 * @returns
 */
export function alarmScope(item) {
  if (item !== [] && item["sensorType"]) {
    if (DEVICE_ID[item.type]) {
      return;
    }
    return (
        '<el-col :span=\'6\'><span>' +
        item.sensorType.name +
        '：</span></el-col><el-col :span=\'16\'><span>' +
        item.min +
        '~' +
        item.max +
        ' ' +
        item.sensorType.unit +
        '</span></el-col>'
    )
  }
}

export function sensorType(value) {
  let str;
  switch (value) {
    case 1000:
      str = i18n.t('common.offLineAlarm');
      break
    case 17:
    case 2000:
      str = i18n.t('other.alarm1');
      break
    case -3:
      str = i18n.t('other.alarm2');
      break
    case 666:
      str = i18n.t('other.alarm3');
      break
    default:
      str = i18n.t('other.alarm4');
      break
  }
  return str;
}

// 判断多功能还是单功能报警
export function judgeAlerter(value) {
  if (typeof value === "string") {
    return (value.indexOf("111109100") !== -1 || value.indexOf("20010101020") !== -1);
  }
}

/**
 * 数组对象去重
 * @param array 数组
 * @param key 对象key值
 * @returns {any[]}
 */
export function arrayToHeavy(array, key) {
  let map = new Map();
  for (let item of array) {
    if (!map.has(item[key])) {
      map.set(item[key], item);
    }
  }
  return [...map.values()];
}

// 在线状态
export function onLineStatus(value) {
  if (value === -100) {
    return i18n.t('common.offLine')
  } else if (value === 0) {
    return i18n.t('common.notActivate')
  } else {
    if (value === 1 || value < 0 || value != -100) {
      return i18n.t('common.isLine')
    }
  }
}

// 状态显示对应的文字
export function statusText (status, arr) {
	let str = "";
	for(var i = 0; i < arr.length; i++){
		if(Array.isArray(arr[i].code)){
			if(arr[i].code.indexOf(status) > -1){
				str = arr[i].label
			}
		}else{
			if(status == arr[i].code){
				str = arr[i].label
			}
		}
	}
	return str
}

// 状态 区分颜色
export function statusColor (status, arr) {
	for(var i = 0; i < arr.length; i++){
		if(Array.isArray(arr[i].code)){
			if(arr[i].code.indexOf(status) > -1){
				return { class: arr[i].value }
			}
		}else{
			if(status == arr[i].code){
				return arr[i].value
			}
		}
	}
}

/**
 * @param status 状态
 * @param type 0：非报警器类 1： 报警器类
 * @returns {(string|VueI18n.LocaleMessages|string)[]|*}
 */
export function getSenorStatus (status, type) {
  var arr = {
    1: [i18n.t('common.normal'), "normal", "normal-bg"],
    0: [i18n.t('common.notActivate'), "normal", "normal-bg"],
    "-100": [i18n.t('common.offLine'), "offLine", "offLine-bg"],
    4: ["-", ""],
  }

  if (arr[status]) {
      if (type && ![0, -100].includes(status)) {
        return [i18n.t('hardware.aboutage'), "normal", "normal-bg"]
      } else if (type && [-100].includes(status)){
        return [i18n.t('common.offLine'), "offLine", "offLine-bg"];
      }
      return arr[status];
  } else {
      if (type) {
        return [i18n.t('hardware.outage'), "normal", "normal-bg"]
      }
      if (Number(status) <= 0 && Number(status) > -100 || Number(status) ===2) {
        return [i18n.t('common.abnormal'), "abnormal", "abnormal-bg"]
      }
  }
}

export function getStatusColor (status, arr){
  let color = "";
  arr.map((a) => {
    if (a.code === status) {
      color = a.color;
    }
  });
  return color;
}

export function getQuery (){
  let href = window.location.href
  let query = href.substring(href.indexOf('?') + 1);
  let param = query.split("&");
  let obj = {}
  for (var i = 0; i < param.length; i++) {
      let per = param[i].split("=");
      obj[per[0]] = per[1]
  }
  return obj;
}

// 开始时间-结束时间，精到秒
export function getStartAndEndTime (type) {
  // 1当天，2本周，3本月
  var date = [];
  if(type === 1){
    date = [moment().startOf('day').format('YYYY-MM-DD HH:mm:ss'), moment().format("YYYY-MM-DD") + " 23:59:59"]
  }
  if(type === 2){
    date = [moment().startOf('isoWeek').format('YYYY-MM-DD HH:mm:ss'), moment().format("YYYY-MM-DD") + " 23:59:59"]
    console.log(date, type)
  }
  if(type === 3){
    date = [moment().startOf('month').format("YYYY-MM-DD HH:mm:ss"), moment().format("YYYY-MM-DD") + " 23:59:59"]
  }
  return date
}

// 防抖函数
export function debounce(fn, delay) {
  let delays = delay || 200;
  let timer;
  return function () {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(function () {
      timer = null;
      fn.call(this);
    }, delays);
  };
}
/**
 * 获取当前准时准点到 n 天的时间
 * @param days 天数 正数从当前时间往前推，负数从当前时间往未来
 * @param defaultTime 日期时间结束
 * @returns {(number|string)[]}
 */
export function theOtherDay(days, defaultTime = ['00:00:00', '23:59:59']) {
  let date = new Date().getTime();
  const difference = 60 * 60 * 1000 * 24 * days;
  const lastDate = moment(date - difference).format("YYYY-MM-DD");
  date = moment(date).format("YYYY-MM-DD");
  if (days < 0) {
    return [date + " " + defaultTime[0], lastDate + " " + defaultTime[1]];
  } else {
    return [lastDate + " " + defaultTime[0], date + " " + defaultTime[1]]
  }
}
// export function localToUtc(date) {
//   const time = moment(date).utc();
//   const GMT = localStorage.getItem("GMT");
//   let utc = -8;
//   if (GMT && GMT.toString() !== "undefined") {
//       utc = -8 + 2*(Number(GMT));
//   }
//   return moment(time).utcOffset(utc).format(TIME_FORMAT)
// }

export function deleteObjectEmptyLable(params) {
  for (var key in params) {
    if (
      [undefined, null, ''].includes(params[key]) ||
      (params[key] && params[key] instanceof Array && !params[key].length)
    ) {
      delete params[key]
    }
  }
  return params
}

/**
 * 并发请求
 * @param list 请求列表
 * @param max 最大并发数
 * @param callback 回调函数
 */
export const concurrentRequest = (list, max = 3, callback) => {
  let index = 0;
  const request = () => {
    if (index >= list.length) return;
    const item = list[index];
    callback(item).finally(() => {
      index++;
      request();
    });
  };
  for (let i = 0; i < max && i < list.length; i++) {
    index = i;
    request();
  }
};
