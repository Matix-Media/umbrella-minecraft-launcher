<script lang="ts" setup>
import VButton from "@/components/VButton.vue";
import { useAccounts } from "@/stores/accounts";
import { useI18n } from "vue-i18n";
import PlayerHead from "@/components/PlayerHead.vue";
const msmc = require("msmc");
// Components

const { t } = useI18n();
const accounts = useAccounts();
const authManager = new msmc.Auth("select_account");

async function addAccount() {
    const xboxManager = await authManager.launch("nwjs");
    const token = await xboxManager.getMinecraft();
    console.log("Auth successful:", token);
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
            v-for="account in accounts.accounts"
            :key="account.uuid"
        >
            <player-head :uuid="account.uuid" class="head" />
            <div class="info">
                <span class="username">{{ account.username }}</span>
                <span class="type">{{ t("accounts.type.microsoft") }}</span>
            </div>
            <v-button icon="delete" variant="danger" icon-size="35" />
        </div>
    </div>
</template>

<style lang="scss" scoped>
.accounts {
    padding: calc(var(--header-height) + 25px) 80px 0 80px;

    .add {
        margin-bottom: 25px;
    }

    .account {
        display: grid;
        align-items: center;
        grid-template-columns: auto 1fr auto;
        padding: 6px;
        background-color: var(--bg-2);
        border-radius: 4px;
        color: white;

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
