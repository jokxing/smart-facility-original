const {connect,delay}=require('./mp1-simulator-driver.cjs');
const fs=require('fs');
const path=require('path');
const directory=path.resolve(__dirname,'../docs/evidence/miniapp-device-navigation');
const phase=process.argv[2]||'review';
async function run(){
  const d=await connect(process.env.MINIAPP_REVIEW_WS || 'ws://127.0.0.1:9420');
  const results=[];
  const record=(name,details)=>{results.push({name,details});console.log(JSON.stringify(results[results.length-1]));};
  async function wait(route){for(let i=0;i<40;i++){const p=await d.call('App.getCurrentPage');if(p.path===route){await delay(700);return p;}await delay(500);}throw Error('Route timeout: '+route);}
  async function children(p,e,selector='*'){return (await d.call('Element.getElements',{pageId:p.pageId,elementId:e.elementId,selector})).elements;}
  async function snapshot(name){try{const r=await d.call('App.captureScreenshot');fs.writeFileSync(path.join(directory,phase+'-'+name+'.png'),Buffer.from(r.data.replace(/^data:image\/\w+;base64,/,''),'base64'));record('screenshot',name);}catch(e){record('screenshot unavailable',e.message);}}
  try{
    fs.mkdirSync(directory,{recursive:true});await d.call('App.enableLog');
    if(!await d.wx('getStorageSync','sf-mini-demo:token')){
      await d.wx('reLaunch',{url:'/myPage/Login/Login'});
      const login=await wait('myPage/Login/Login');
      const inputs=(await d.call('Page.getElements',{pageId:login.pageId,selector:'.input'})).elements;
      for(const [i,value] of ['demo','Demo1234'].entries())await d.call('Element.triggerEvent',{pageId:login.pageId,elementId:inputs[i].elementId,type:'input',detail:{value}});
      const button=(await d.call('Page.getElements',{pageId:login.pageId,selector:'.button'})).elements[0];
      await d.call('Element.tap',{pageId:login.pageId,elementId:button.elementId});
      await wait('pages/tabBar/Home/Home');
    }
    await d.wx('switchTab',{url:'/pages/tabBar/Labdevice/index'});
    let p=await wait('pages/tabBar/Labdevice/index');
    const refs=(await d.call('Page.getElements',{pageId:p.pageId,selector:'.vue-ref'})).elements;
    const list=refs.find(e=>e.is==='pages/tabBar/Labdevice/Labdevice');
    const cards=(await children(p,list)).filter(e=>e.is==='components/LabdeviceCard/index');
    if(!cards.length)throw Error('No rendered device cards');
    const selected=(await d.call('Element.getData',{pageId:p.pageId,elementId:cards[0].elementId})).data.item;
    record('selected card',{id:selected.id,name:selected.name});
    const cardChildren=await children(p,cards[0]);
    const card=cardChildren.find(e=>e.is==='uni_modules/uni-card/components/uni-card/uni-card');
    const target=(await children(p,card,'.uni-card'))[0];
    await d.call('Element.tap',{pageId:p.pageId,elementId:target.elementId});
    p=await wait('detailPage/LabdeviceDetail/index');
    const detailRefs=(await d.call('Page.getElements',{pageId:p.pageId,selector:'.vue-ref'})).elements;
    const component=detailRefs.find(e=>e.is==='detailPage/LabdeviceDetail/LabdeviceDetail');
    const data=(await d.call('Element.getData',{pageId:p.pageId,elementId:component.elementId})).data;
    record('actual detail',{route:p.path,id:p.query.id,detailId:data.detail&&data.detail.id,name:data.detail&&data.detail.name,parameterStatus:data.detail&&data.detail.bingStatus});
    if(data.detail.id!==selected.id)throw Error('Detail does not match clicked device');
    await snapshot('detail');
    await d.wx('startPullDownRefresh');await delay(1500);
    const refreshed=(await d.call('Element.getData',{pageId:p.pageId,elementId:component.elementId})).data;
    record('detail refresh',{id:refreshed.detail.id,sensorCount:refreshed.list.length});
    await d.wx('navigateBack');await wait('pages/tabBar/Labdevice/index');
    record('return to list',true);
    record('runtime errors',d.events.filter(e=>e.method==='App.exceptionThrown'||(e.method==='App.logAdded'&&e.params.type==='error')).map(e=>e.params));
  }finally{fs.mkdirSync(directory,{recursive:true});fs.writeFileSync(path.join(directory,phase+'-results.json'),JSON.stringify({at:new Date().toISOString(),results},null,2));d.close();}
}
run().catch(e=>{console.error(e.message);process.exitCode=1;});
