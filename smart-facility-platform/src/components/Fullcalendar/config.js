// 时间分钟 小于30分钟比如：14:10改为14:30，大于30分钟比如：14：33改为15:00
export function minutesExactly () {
    var date = new Date();
    var minutes = date.getMinutes();
    var newDate = "";
    if(minutes < 30){ 
        newDate = date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate() + " " + date.getHours() + ":30:" + date.getSeconds()
    }else{
        newDate = date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate() + " " + (date.getHours()+1) + ":00:" + date.getSeconds()
    }
    return newDate
}