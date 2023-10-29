import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";

// Components
import Main from "./views/main/Index.vue";
import Play from "./views/main/Play.vue";
import Profiles from "./views/main/Profiles.vue";
import Accounts from "./views/main/Accounts.vue";
import Settings from "./views/main/Settings.vue";

const routes: RouteRecordRaw[] = [
    {
        path: "/",
        redirect: { name: "Play" },
    },
    {
        path: "/main",
        component: Main,
        children: [
            {
                path: "play",
                name: "Play",
                component: Play,
                meta: { providesBackground: true },
            },
            { path: "profiles", name: "Profiles", component: Profiles },
            { path: "accounts", name: "Accounts", component: Accounts },
            { path: "settings", name: "Settings", component: Settings },
        ],
    },
];

// 3. Create the router instance and pass the `routes` option
// You can pass in additional options here, but let's
// keep it simple for now.
const router = createRouter({
    // 4. Provide the history implementation to use. We are using the hash history for simplicity here.
    history: createWebHashHistory(),
    routes, // short for `routes: routes`
});

declare module "vue-router" {
    interface RouteMeta {
        providesBackground?: boolean;
    }
}

export default router;
