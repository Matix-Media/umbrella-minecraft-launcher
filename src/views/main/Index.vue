<script lang="ts" setup>
import { useAccountManager } from "@/stores/accountManager";
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { TransitionFade } from "@morev/vue-transitions";
import Logger from "@/lib/Logger";
import { useInstanceManager } from "@/stores/instanceManager";

// https://stackoverflow.com/questions/20648881/can-you-css-blur-based-on-a-gradient-mask
const logger = new Logger("Root");
const { t } = useI18n();
const route = useRoute();
const loading = ref(true);
const loadingState = ref<"starting" | "accounts" | "minecraft">("starting");
const accountManager = useAccountManager();
const instanceManager = useInstanceManager();

onMounted(async () => {
    try {
        loadingState.value = "accounts";
        await accountManager.load();
        loadingState.value = "minecraft";
        await instanceManager.load();
    } catch (err) {
        logger.error("Error during loading:", err);
    }
    loading.value = false;
    logger.log("Done loading");
    setTimeout(() => {
        document.body.classList.remove("loading");
    }, 1000);
});
</script>

<template>
    <div class="nav" :class="{ 'light-bg': !route.meta.providesBackground }">
        <router-link :to="{ name: 'Play' }">
            {{ t("play.title") }}
        </router-link>
        <router-link :to="{ name: 'Profiles' }">
            {{ t("profiles.title") }}
        </router-link>
        <router-link :to="{ name: 'Accounts' }">
            {{ t("accounts.title") }}
        </router-link>
        <router-link :to="{ name: 'Settings' }">
            {{ t("settings.title") }}
        </router-link>
    </div>
    <router-view v-if="!loading" />
    <transition-fade :duration="1000">
        <div class="loading" v-if="loading">
            <mdicon name="loading" spin size="48" />
            <p class="explaination">
                {{ t("loading." + loadingState) }}
            </p>
        </div>
    </transition-fade>
</template>

<style lang="scss">
body.loading {
    overflow: hidden;
}
</style>

<style lang="scss" scoped>
.loading {
    position: absolute;
    background-color: var(--bg);
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 99;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: white;

    .explaination {
        color: var(--text-secondary);
        font-weight: 600;
    }
}

.nav {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: var(--header-height);
    backdrop-filter: blur(7.5px);
    background-color: rgba(0, 0, 0, 0.55);
    z-index: 5;
    display: flex;
    justify-content: center;

    &.light-bg {
        background-color: rgba(0, 0, 0, 0.2);
    }

    a {
        height: 100%;
        color: white;
        text-decoration: none;
        font-weight: 500;
        font-size: 15px;
        padding: 0 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;

        &.router-link-active {
            background-color: rgba(0, 0, 0, 0.3);
        }
    }
}
</style>
