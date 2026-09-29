/**
 * 完全复制一个对象
 * 注意：对象若有相互引用的情况下（如 A.b = B; B.a = A;），不适用，会无线递归下去；
 * @param obj [{'...':[...]},...]
 * @returns newObj
 */
export function deepCopyObject(obj) {
    var newObj = obj;
    if (Object.prototype.toString.call(obj) === '[object Object]') {
        newObj = {};
        for (var i in obj) newObj[i] = deepCopyObject(obj[i]);
    } else if (Object.prototype.toString.call(obj) === '[object Array]') {
        newObj = [];
        obj.forEach(item => {
            newObj.push(deepCopyObject(item))
        });
    }
    return newObj;
}

/**
 * 通过时间字符串获取时间范围（一天内）
 * @param startTimeString  '00:00:00'
 * @param endTimeString '00:00:00'
 * @param now
 * @returns {Date[]}
 */
export function getTimeLimit(
    startTimeString = '00:00:00',
    endTimeString = '00:00:00',
    now = new Date()) {

    var start = startTimeString.split(':')
    while (start.length < 3) start.push(0)
    var end = endTimeString.split(':')
    while (end.length < 3) end.push(0)

    return [
        new Date(now.getFullYear(), now.getMonth(), now.getDate(), start[0], start[1], start[2], 0),
        new Date(now.getFullYear(), now.getMonth(), now.getDate(), end[0], end[1], end[2], 0),
    ]

}

/**
 * 通过时间范围对象 获取 时间段字符串（一天内）
 * @param start
 * @param end
 * @returns {*[]}
 */
export function getTimeRangeStr(start, end) {
    let h, m, s;
    let rangeStr = [];

    if (start) {
        h = start.getHours();
        m = start.getMinutes();
        s = start.getSeconds();
        rangeStr.push((h > 9 ? h : '0' + h) +
            ':' + (m > 9 ? m : '0' + m) +
            ':' + (s > 9 ? s : '0' + s));
    } else {
        rangeStr.push('00:00:00');
    }

    //////

    if (end) {
        h = end.getHours();
        m = end.getMinutes();
        s = end.getSeconds();
        rangeStr.push((h > 9 ? h : '0' + h) +
            ':' + (m > 9 ? m : '0' + m) +
            ':' + (s > 9 ? s : '0' + s));
    } else {
        rangeStr.push('23:59:59');
    }

    return rangeStr;
}

/**
 * 数字字符串列表转为数字列表：
 * ['1','2','3',...]  -->>  [1,2,3,...]
 *
 * @param numStringList
 * @returns {*[]}
 */
export function numStringListToNumList(numStringList = []) {
    let numList = [];
    numStringList.forEach(ns => {
        numList.push(parseInt(ns));
    })
    return numList;
}

/**
 * 省略字符，使字符串在超过maxLength长度后替换为省略号
 * @param str
 * @param maxLength
 * @returns {string|*}
 */
export function ellipsisString(str, maxLength) {
    if (str.length > maxLength) {
        return str.substr(0, maxLength) + '...';
    } else return str;
}

/**
 * 在对象列表中查找对象，根据对象中某成员等于某值来查找
 * @param objList 对象列表
 * @param memberName 指定要找的对象的成员
 * @param memberValue 指定要找的对象的成员的值
 * @returns {{item: null, index: number}|{item: *, index: number}}
 */
export function objListFindByMember(objList, memberName, memberValue) {
    let item=null;
    let index=-1;
    for ( index = 0; index < objList.length; index ++) {
        item = objList[index];
        if(item[memberName]===memberValue){
            return {item,index};
        }
    }
    return {item:null,index:-1};
}