const {connect, delay} = require('./mp1-simulator-driver.cjs');
const fs = require('fs');
const path = require('path');
const {spawnSync} = require('child_process');
module.exports = async function () {
  let d = await connect();
  const results = [];
  const record = (name, passed, details) => {results.push({name, passed, details});console.log(JSON.stringify(results[results.length-1]));};
  async function page() {return d.call('App.getCurrentPage');}
  async function wait(route) {for(let i=0;i<40;i++){const p=await page();if(p.path===route){await delay(700);return p;}await delay(500);}throw Error('Route did not become '+route);}
  async function elements(p, selector) {return (await d.call('Page.getElements',{pageId:p.pageId,selector})).elements;}
  async function tap(p,e) {await d.call('Element.tap',{pageId:p.pageId,elementId:e.elementId});}
  async function data(p) {return (await d.call('Page.getData',{pageId:p.pageId})).data;}
  async function screenshot(name) {try{await d.screenshot(name);record('screenshot '+name,true);}catch(e){record('screenshot '+name,false,e.message);}}
  try {
    await d.call('App.enableLog');
    await d.wx('setStorageSync','sf-mp1-acceptance-unrelated','keep');
    await d.wx('removeStorageSync','sf-mini-demo:token');
    await d.wx('reLaunch',{url:'/myPage/Login/Login'});
    let p=await wait('myPage/Login/Login');
    const inputs=await elements(p,'.input');
    await d.call('Element.triggerEvent',{pageId:p.pageId,elementId:inputs[0].elementId,type:'input',detail:{value:'demo'}});
    await d.call('Element.triggerEvent',{pageId:p.pageId,elementId:inputs[1].elementId,type:'input',detail:{value:'wrong'}});
    let button=(await elements(p,'.button'))[0];
    await tap(p,button);await delay(1000);
    record('native input and wrong-password button tap', (await page()).path==='myPage/Login/Login' && !await d.wx('getStorageSync','sf-mini-demo:token'), {submitting:(await data(p)).submitting});
    await d.call('Element.triggerEvent',{pageId:p.pageId,elementId:inputs[1].elementId,type:'input',detail:{value:'Demo1234'}});
    await tap(p,button);
    p=await wait('pages/tabBar/Home/Home');
    let home=await data(p);
    record('native login button tap and statistics',home.statistics.instrumentStatistics.normalCount===11 && home.statistics.instrumentStatistics.alarmCount===1 && home.statistics.roomStatistics.alarmCount===1,home.statistics);
    await d.wx('startPullDownRefresh');await delay(1000);
    record('native home refresh',!(await data(p)).loading);
    await screenshot('06-native-home');
    let boxes=await elements(p,'.box');
    await tap(p,boxes[4]);
    p=await wait('pages/tabBar/Room/Room');await delay(1000);
    const room=await data(p);
    record('native home alarm-room card tap',room.dashboardType===2 && room.loadingNum===0,{dashboardType:room.dashboardType,loadingNum:room.loadingNum});
    await d.wx('switchTab',{url:'/pages/tabBar/Home/Home'});p=await wait('pages/tabBar/Home/Home');
    boxes=await elements(p,'.box');await tap(p,boxes[1]);p=await wait('pages/tabBar/Labdevice/index');
    const refs=await elements(p,'.vue-ref');const device=refs.find(e=>e.is==='pages/tabBar/Labdevice/Labdevice');
    const tabs=(await d.call('Element.getElements',{pageId:p.pageId,elementId:device.elementId,selector:'.demo-uni-col'})).elements;
    await tap(p,tabs[1]);await delay(1000);
    const deviceData=(await d.call('Element.getData',{pageId:p.pageId,elementId:device.elementId})).data;
    record('native device status-filter tap',deviceData.sensorStatus===1,{sensorStatus:deviceData.sensorStatus,loadingNum:deviceData.loadingNum,listLength:deviceData.list.length});
    await d.wx('switchTab',{url:'/pages/tabBar/My/My'});p=await wait('pages/tabBar/My/My');
    const head=(await elements(p,'.head'))[0];await tap(p,head);p=await wait('myPage/UserInfo/UserInfo');
    await tap(p,(await elements(p,'.logout-btn'))[0]);p=await wait('myPage/Login/Login');
    record('native logout button tap and storage isolation',!await d.wx('getStorageSync','sf-mini-demo:token') && await d.wx('getStorageSync','sf-mp1-acceptance-unrelated')==='keep');
    await screenshot('07-native-logout');
    const errors=d.events.filter(e=>e.method==='App.exceptionThrown'||(e.method==='App.logAdded'&&e.params.type==='error')).map(e=>e.params);
    record('runtime error log collection',errors.length===0,errors);
    await d.wx('setStorageSync','sf-mp1-reopen-diagnostic','persistence-marker');
    await delay(2500);d.close();
    const cli='F:\\应用\\微信开发者工具\\微信web开发者工具\\cli.bat';
    const project=path.resolve(__dirname,'../miniprogram/unpackage/dist/dev/mp-weixin');
    for(const command of ['close','auto']) {
      const args=[command,'--project',project];if(command==='auto')args.push('--auto-port','9420');
      const r=spawnSync(cli,args,{shell:true,windowsHide:true,encoding:'utf8',timeout:45000});
      if(r.status!==0)throw Error('IDE '+command+' failed');if(command==='close')await delay(2000);
    }
    for(let i=0;i<30;i++){try{d=await connect();break;}catch(e){if(i===29)throw e;await delay(500);}}
    await delay(6000);
    const marker=await d.wx('getStorageSync','sf-mp1-reopen-diagnostic');
    record('IDE reopen storage diagnostic',marker==='persistence-marker',{markerPreserved:marker==='persistence-marker',tokenPresent:!!await d.wx('getStorageSync','sf-mini-demo:token'),route:(await page()).path});
    await d.wx('removeStorageSync','sf-mp1-reopen-diagnostic');await d.wx('removeStorageSync','sf-mp1-acceptance-unrelated');
  }catch(e){record('native suite interrupted',false,e.message);process.exitCode=1;}
  finally {
    const directory=path.resolve(__dirname,'../docs/evidence/miniapp-mp1');fs.mkdirSync(directory,{recursive:true});
    const stale=path.join(directory,'02-login-cold-start.png');if(fs.existsSync(stale))fs.renameSync(stale,path.join(directory,'00-reopen-diagnostic.png'));
    fs.writeFileSync(path.join(directory,'native-results.json'),JSON.stringify({testedAt:new Date().toISOString(),method:'Native WXML element input/tap, native Page/Element data, native wx API, IDE close/auto diagnostic',results},null,2));d.close();
  }
};
