<script lang="ts" setup>
import VButton from "@/components/VButton.vue";
import { useAccountManager } from "@/stores/accountManager";
import { useI18n } from "vue-i18n";
import type _msmc from "msmc";
import { ref } from "vue";
import PlayerHead from "@/components/PlayerHead.vue";
import LoadingOverlay from "@/components/LoadingOverlay.vue";

const msmc = require("msmc");

const { t } = useI18n();
const accountManager = useAccountManager();
const authManager: _msmc.Auth = new msmc.Auth("select_account");
const loading = ref(false);

async function addAccount() {
    loading.value = true;
    try {
        const xboxManager = await authManager.launch("nwjs");
        const minecraft = await xboxManager.getMinecraft();
        const token = minecraft.getToken(true);
        accountManager.add(token);
        await accountManager.save();
    } catch (err) {
        console.error("Error adding account:", err);
    }
    loading.value = false;
}
</script>

<template>
    <div class="accounts">
        <v-button
            variant="primary"
            icon="plus"
            class="add"
            @click="addAccount"
            >{{ t("accounts.add") }}</v-button
        >

        <div
            class="account"
            v-for="account in accountManager.accounts"
            :key="account.profile.id"
        >
            <player-head :uuid="account.profile.id" class="head" />
            <div class="info">
                <span class="username">{{ account.profile.name }}</span>
                <span class="type">{{ t("accounts.type.microsoft") }}</span>
            </div>
            <v-button icon="delete" variant="danger" icon-size="35" />
        </div>

        <div class="no-accounts" v-if="accountManager.accounts.length == 0">
            <mdicon name="account-alert-outline" size="106" />
            <span>{{ t("accounts.noAccounts") }}</span>
        </div>
    </div>
    <loading-overlay :loading="loading" />
</template>

<style lang="scss" scoped>
.accounts {
    padding: calc(var(--header-height) + 25px) 80px 0 80px;

    .add {
        margin-bottom: 25px;
    }

    .no-accounts {
        margin-top: 50px;
        color: var(--highlight);
        display: flex;
        flex-direction: column;
        align-items: center;
        font-weight: 600;
        font-size: 24px;
    }

    .account {
        display: grid;
        align-items: center;
        grid-template-columns: auto 1fr auto;
        padding: 6px;
        background-color: var(--bg-2);
        border-radius: 4px;
        color: white;
        margin-bottom: 10px;

        .head {
            width: 45px;
            height: 45px;
            border-radius: 4px;
            margin-right: 8px;
        }

        .info {
            display: flex;
            flex-direction: column;

            .username {
                font-weight: 500;
                font-size: 16px;
            }

            .type {
                font-weight: 400;
                font-size: 12px;
                color: rgba(255, 255, 255, 0.5);
            }
        }
    }
}
</style>
