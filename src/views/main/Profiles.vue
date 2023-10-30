<script lang="ts" setup>
import LoadingOverlay from "@/components/LoadingOverlay.vue";
import Overlay from "@/components/Overlay.vue";
import VButton from "@/components/VButton.vue";
import VText from "@/components/VText.vue";
import { useInstanceManager } from "@/stores/instanceManager";
import { nextTick, ref } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const instanceManager = useInstanceManager();
const addInstanceOpen = ref(false);
const loading = ref(false);
const name = ref("");
const nameBox = ref<InstanceType<typeof VText>>();

function showAddInstance() {
    addInstanceOpen.value = true;
    nextTick(() => {
        nameBox.value?.focus();
    });
}

async function createInstance() {
    if (name.value.trim().length == 0) return;

    loading.value = true;
    await instanceManager.createInstance({ name: name.value });
    addInstanceOpen.value = false;
    setTimeout(() => (loading.value = false), 1000);
}
</script>

<template>
    <div class="instances">
        <v-button variant="primary" icon="plus" class="add" @click="showAddInstance">
            {{ t("profiles.add") }}
        </v-button>

        <div class="instance" v-for="instance in instanceManager.instances" :key="instance.name">
            <div class="info">
                <span class="name">{{ instance.name }}</span>
                <span class="type">{{ t("profiles.type.minecraft") }}</span>
                <span class="version">{{ instance.version }}</span>
            </div>
            <v-button class="delete" icon="delete" variant="danger" icon-size="35" />
        </div>

        <div class="no-instances" v-if="instanceManager.instances.length == 0">
            <mdicon name="package-variant-closed-remove" size="106" />
            <span>{{ t("profiles.noProfiles") }}</span>
        </div>
    </div>
    <overlay v-model="addInstanceOpen">
        <form class="add-instance" @submit.prevent="createInstance">
            <label>
                <p class="label">Name</p>
                <v-text v-model="name" ref="nameBox" placeholder="e.g.: My Profile" />
            </label>
            <v-button variant="primary" icon="plus" class="add"> Create </v-button>
        </form>
    </overlay>
    <loading-overlay :loading="loading" />
</template>

<style lang="scss" scoped>
.add-instance {
    width: 325px;
    display: flex;
    flex-direction: column;

    label {
        width: auto;
        .label {
            margin: 0;
            margin-bottom: 3px;
            color: var(--text-secondary);
            font-size: 12px;
            font-weight: 500;
        }
    }

    .add {
        margin-top: 6px;
        align-self: flex-end;
    }
}

.instances {
    padding: calc(var(--header-height) + 25px) 80px 0 80px;

    .add {
        margin-bottom: 25px;
    }

    .no-instances {
        margin-top: 50px;
        color: var(--highlight);
        display: flex;
        flex-direction: column;
        align-items: center;
        font-weight: 600;
        font-size: 24px;
    }

    .instance {
        display: grid;
        align-items: center;
        grid-template-columns: 1fr auto;
        padding: 6px;
        padding-left: 15px;
        background-color: var(--bg-2);
        border-radius: 4px;
        color: white;
        margin-bottom: 10px;
        grid-template-columns: auto auto 1fr;

        .info {
            display: grid;
            flex-direction: column;

            .name {
                font-weight: 500;
                font-size: 16px;
                grid-row: 1 / 1;
                grid-column: 1 / 4;
            }

            .type {
                margin-top: 1px;
                font-weight: 400;
                font-size: 12px;
                color: rgba(255, 255, 255, 0.5);
                grid-row: 2 / 2;
                grid-column: 1 / 1;
            }

            .version {
                padding: 1px;
                font-size: 12px;
                background-color: var(--secondary);
                color: rgba(255, 255, 255, 0.5);
                border-radius: 4px;
                grid-row: 2 / 2;
                margin-left: 5px;
            }
        }

        .delete {
            grid-column: 4 / 4;
        }
    }
}
</style>
