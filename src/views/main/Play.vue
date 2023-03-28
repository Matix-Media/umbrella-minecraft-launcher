<script lang="ts" setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { TransitionSlide } from "@morev/vue-transitions";
import { useAccounts } from "@/stores/accounts";
import { useInstances } from "@/stores/instances";

// Components
import PlayerHead from "../../components/PlayerHead.vue";

const { t } = useI18n();
const accounts = useAccounts();
const instances = useInstances();
</script>

<template>
    <div class="play">
        <div class="content">
            <transition-slide
                appear
                :offset="[0, -150]"
                :duration="1000"
                :delay="100"
            >
                <img
                    class="logo"
                    src="@/assets/logos/java-edition.webp"
                    alt="Minecraft: Java Edition"
                />
            </transition-slide>

            <div class="controls">
                <div class="account">
                    <player-head
                        class="head"
                        :uuid="accounts.selected.uuid"
                        v-if="accounts.selected"
                    />
                    <div class="head alt" v-else></div>
                    <button class="dropdown">
                        <mdicon name="menu-down" size="45" />
                    </button>
                </div>
                <div class="profile">
                    <button class="start">
                        <span class="action">{{ t("play.play") }}</span>
                        <span class="instance">{{
                            instances.selected?.name
                        }}</span>
                    </button>
                    <button class="dropdown">
                        <mdicon name="menu-down" size="45" />
                    </button>
                </div>
            </div>
        </div>

        <div class="bottom-blur"></div>
    </div>
</template>

<style lang="scss" scoped>
.play {
    position: relative;
    min-height: 100vh;
    background-color: #64785e;
    background: url("@/assets/backgrounds/1.19.webp");
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;

    .bottom-blur {
        content: "";
        position: absolute;
        z-index: 0;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        backdrop-filter: blur(50px);
        -webkit-mask: linear-gradient(
            180deg,
            transparent 0%,
            transparent 76.41%,
            black 93.65%
        );
    }

    .content {
        position: relative;
        box-sizing: border-box;
        padding-top: var(--header-height);
        z-index: 1;
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-direction: column;

        .logo {
            margin-top: 20px;
            height: 75px;
        }

        .controls {
            margin-bottom: 20px;
            display: flex;
            gap: 10px;

            .account {
                display: flex;
                gap: 1px;
                filter: drop-shadow(var(--shadow-sm));

                .head {
                    height: 55px;
                    width: 55px;
                    border-radius: 4px 0 0 4px;
                    box-shadow: var(--shadow-sm);
                }

                .dropdown {
                    background-color: #304033;
                    border-radius: 0 4px 4px 0;
                    color: white;
                    width: 45px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: none;
                }
            }

            .profile {
                display: flex;
                gap: 1px;
                filter: drop-shadow(var(--shadow-sm-primary));

                .start {
                    height: 55px;
                    background-color: var(--primary);
                    border: none;
                    color: white;
                    border-radius: 4px 0 0 4px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    padding: 0 20px;

                    .action {
                        font-size: 24px;
                        font-weight: 500;
                    }

                    .instance {
                        font-weight: 400;
                        font-size: 14px;
                        text-align: left;
                        width: 245px;
                    }
                }

                .dropdown {
                    background-color: var(--primary);
                    border-radius: 0 4px 4px 0;
                    color: white;
                    width: 45px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: none;
                }
            }
        }
    }
}
</style>
