import router from "@/router";
import NProgress from "nprogress"; // 进度条
import { Message } from "element-ui";
import "nprogress/nprogress.css"; // 进度条样式
import store from "@/store";
import {getDepartment} from "@/api/department";
import i18n from "@/i18n";
import {hasDemoSession, clearDemoSession} from "@/mock/session";
import {getRoleMenu} from "@/api/system";
import {getInstrumentCategoryInfoList} from "@/api/labDevice";
const isDemo = process.env.VUE_APP_DEMO === "true";
NProgress.configure({ showSpinner: false });
router.beforeEach(async (to, from, next) => {
  const { title } = to.meta;
  NProgress.start();
  if (isDemo) {
    document.title = '智慧设施 · 本地演示';
    if (to.path === '/login') {
      next();
      NProgress.done();
      return;
    }
    if (!hasDemoSession()) {
      clearDemoSession();
      next({path: '/login', query: {redirect: to.fullPath}});
      NProgress.done();
      return;
    }
    const demoAllowed = to.path === '/dashboard' || to.path === '/building' || to.path === '/floor/view'
      || to.path === '/floor/designer' || to.path === '/room/view' || to.path === '/room/designer'
      || to.path === '/floorDataV' || to.path === '/roomDataV' || to.path === '/roomDataV/'
      || to.path === '/sys/a/log'
      || to.path === '/lhd/hardware/home' || to.path === '/ld/labdevice' || to.path === '/ld/maintenance'
      || to.path === '/rm/room'
      || to.path === '/ds/statistics' || to.path === '/pro';
    if (!demoAllowed) {
      Message.info('本演示已开放中控地图、大屏、报警记录、智能硬件、设备管理、维保管理、房间管理、数据统计总览；当前管理页面尚未接入。');
      next('/dashboard');
      NProgress.done();
      return;
    }
    // Building / floor / room / DataV must not re-run login bootstrap or clear building Vuex selection.
    if (to.path === '/building' || to.path === '/floor/view' || to.path === '/floor/designer'
      || to.path === '/room/view' || to.path === '/room/designer'
      || to.path === '/floorDataV' || to.path === '/roomDataV' || to.path === '/roomDataV/') {
      next();
      NProgress.done();
      return;
    }
    try {
      const [departments, categories, menus] = await Promise.all([
        getDepartment(), getInstrumentCategoryInfoList({keyword: ''}), getRoleMenu()
      ]);
      if ([departments, categories, menus].some(res => res.code !== 1)) throw new Error('演示初始化失败。');
      store.commit('SETDEPARTMENT', departments.items.list);
      store.commit('setAssetClassify', categories.items);
      store.commit('SETMENU', {menu: JSON.stringify(menus.items)});
      store.commit('SETLEVEL', 1);
      localStorage.setItem('MENU', JSON.stringify(menus.items));
      next();
    } catch (_) {
      clearDemoSession();
      Message.error('演示初始化失败，请重新登录。');
      next('/login');
    } finally {
      NProgress.done();
    }
    return;
  }
  document.title = i18n.t('route.' + title) || "智慧设施";
  //是否登录界面
  if (to.path === '/502') {
    next();
    NProgress.done();
    return;
  }
  if (to.path !== "/login") {
    //token 是否为空
    let token = localStorage.getItem("token");
    if (token) {
      //跳转的路由是否为空
      const departments = store.state.departments;
      if (departments.length === 0) {
        getDepartment().then(res => {
          if (res.code && res.items['list']) {
            store.commit("SETDEPARTMENT", res.items.list);
          }
        })
      }
      if (store.state.assetClassify.length === 0) {
        await store.dispatch("getAccessClassify", "");
      }
      if (to.matched.length === 0) {
        from.name ? next({ name: from.name }) : next("/");
      } else {
        next();
      }
      NProgress.done();
      let roleId = JSON.parse(localStorage.getItem("USERINFO")) && JSON.parse(localStorage.getItem("USERINFO")).roleId;
      const level = roleId === 5 ? 0 : 1 ;
      store.commit("SETLEVEL", level);
    } else {
      Message.error(i18n.t('common.pleaseLogin'));
      next({
        path: "/login",
        query: {
          redirect: to.fullPath
        }
      });
      NProgress.done();
    }
  } else {
    next();
    NProgress.done();
  }
});
