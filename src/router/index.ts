import { createRouter, createWebHistory } from "@ionic/vue-router";
import { RouteRecordRaw } from "vue-router";
import TabsPage from "../views/TabsPage.vue";
import CarDetailsView from "@/views/CarDetailsView.vue";
import AddNewCarView from "@/views/AddNewCarView.vue";
import ModifyCarView from "@/views/ModifyCarView.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: "/tabs/tab1",
  },
  {
    path: "/tabs/",
    component: TabsPage,
    children: [
      {
        path: "",
        redirect: "/tabs/tab1",
      },
      {
        path: "tab1",
        component: () => import("@/views/CarListView.vue"),
      },
      {
        path: "/details:id",
        name: "CarDetailsView",
        props: true,
        component: CarDetailsView,
      },
      {
        path: "/addCar",
        name: "AddNewCarView",
        component: AddNewCarView,
      },
      {
        path: "/modify:id",
        name: "ModifyCarView",
        props: true,
        component: ModifyCarView,
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
