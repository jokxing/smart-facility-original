import {
	getOssPolicy
} from "@/utils/api.js"
import moment from "@/utils/moment.js"
// 运行状态/参数状态 区分颜色
export function statusColor(status, arr) {
	for (var i = 0; i < arr.length; i++) {
		if (Array.isArray(arr[i].code)) {
			if (arr[i].code.indexOf(status) > -1) {
				return {
					class: arr[i].value
				}
			}
		} else {
			if (status == arr[i].code) {
				return {
					class: arr[i].value
				}
			}
		}
	}
	// 数据尚未返回或状态未知时，不套用正常/报警样式，也保证模板可安全读取 .class。
	return { class: '' }
}

// 运行状态/参数状态 显示对应的文字
export function statusText(status, arr) {
	let str = "";
	for (var i = 0; i < arr.length; i++) {
		if (Array.isArray(arr[i].code)) {
			if (arr[i].code.indexOf(status) > -1) {
				str = arr[i].label
			}
		} else {
			if (status == arr[i].code) {
				str = arr[i].label
			}
		}
	}
	return str
}

// 设备管理/房间管理 被监测的状态 格式化数据的数组
export function sensorsArray(list) {
	const arr = [];
	for (var i = 0; i < list.length; i++) {
		arr.push({
			...list[i].thingsDetail,
			reportDate: "",
			// reportDate: list[i].simpleEquipments[0].reportDate,
			sensors: [],
		})
		if (list[i].simpleEquipments.length > 0) {
			arr[i].reportDate = list[i].simpleEquipments[0].reportDate ? list[i].simpleEquipments[0].reportDate : ''
		}
		for (var j = 0; j < list[i].simpleEquipments.length; j++) {
			if (list[i].simpleEquipments[j].sensors) {
				for (var k = 0; k < list[i].simpleEquipments[j].sensors.length; k++) {
					if (list[i].simpleEquipments[j].sensors[k].type != 0) {
						arr[i].sensors.push(list[i].simpleEquipments[j].sensors[k])
					}
				}
			}
		}
	};
	return arr
}

/**
 * 格式化时间 1971:01:01 00:00:00
 */
export function forDateTime(value) {
	if (!value) {
		return "";
	}
	let date;
	if (typeof value === "string") {

		if (value.indexOf('-') != -1) {

			let time = new Date()
			let timeZone = time.toString()
			const date1 = timeZone.split(" ")[5];
			const time1 = moment(value).utc();
			const GMT = date1.split("GMT")[1];
			let utc = -8;
			if (GMT && GMT.toString() !== "undefined") {
				utc = -8 + 2 * (Number(GMT) / 100);
			}
			return moment(time1).utcOffset(utc).format("YYYY-MM-DD HH:mm:ss")
		} else {
			date = new Date(value * 1);
		}
	} else {
		date = new Date(value);
	}
	const year = date.getFullYear();
	//获取月份，获取的月份比实际小1，所以在使用的时候需要+1
	const month = date.getMonth() + 1;
	//获取日
	const day = date.getDate();
	//获取时
	const hours = date.getHours();
	//获取分
	const minutes = date.getMinutes();
	//获取秒
	const seconds = date.getSeconds();
	//组合格式为年-月-日 时：分：秒（2021-7-5 21:21:21）
	const time = year + "-" + p(month) + "-" + p(day) + " " + p(hours) + ":" + p(minutes) + ":" + p(seconds);
	return time;
}
// 双位数补零
function p(s) {
	return s < 10 ? '0' + s : s
}

export function arrayToHeavy(array, key) {
	let map = new Map();
	for (let item of array) {
		if (!map.has(item[key])) {
			map.set(item[key], item);
		}
	}
	return [...map.values()];
}

/**
 * @param {Object} dir 文件夹前缀
 */
export function getFormData(dir) {
	return new Promise((resolve, reject) => {
		getOssPolicy({
			dir
		}).then(res => {
			if (res.code) {
				resolve(res.items);
			}
		})
	})

}
