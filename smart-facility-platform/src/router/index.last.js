import Vue from "vue";
import VueRouter from "vue-router";

import Layout from "../views/layout/Layout";

Vue.use(VueRouter);

export const routes = [
  {
    path: "/",
    name: "Login",
    component: () =>
      import(/* webpackChunkName: "login" */ "../views/login/Login"),
    meta: {
      title: "智慧设施-登录"
    }
  },
  {
    path: "/login",
    component: () =>
      import(/* webpackChunkName: "login" */ "../views/login/Login"),
    meta: {
      title: "智慧设施-登录"
    }
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: () =>
      import(
        /* webpackChunkName: "dashboard" */ "../views/dashboard/Dashboard"
      ),
    meta: {
      title: "智慧设施-首页"
    }
  },
  {
    path: "/gateway",
    component: Layout,
    // redirect: "noRedirect",
    children: [
      {
        path: "/gateway/index",
        name: "Gateway",
        component: () =>
          import(/* webpackChunkName: "gateway" */ "../views/gateway/Gateway"),
        meta: {
          title: "智慧设施-集中器",
          name: "集中器管理",
          icon: "icon-gateway",
          noCache: true,
          jumpPath: "/gateway/index"
        }
      },
      {
        path: "/device/index",
        name: "Device",
        component: () =>
          import(/* webpackChunkName: "device" */ "../views/device/Device"),
        meta: {
          title: "智慧设施-记录仪",
          name: "记录仪管理",
          icon: "icon-set-up",
          noCache: true,
          jumpPath: "/device/index"
        }
      },
      {
        path: "/gateway/detail/:id",
        name: "GatewayDetail",
        hidden: true,
        component: () =>
          import(
            /* webpackChunkName: "gatewayDetail" */ "../views/gateway/GatewayDetail"
          ),
        meta: {
          title: "智慧设施-集中器详情",
          name: "集中器详情",
          icon: "icon-networkequipment",
          noCache: true,
          jumpPath: "/gateway/detail/:id"
        }
      }
    ]
  },
  {
    path: "/lab",
    component: () => import("../views/labDevice"),
    meta: {
      title: "智慧设施-实验室设备管理"
    }
  }
];

const router = new VueRouter({
  routes
});

export default router;
