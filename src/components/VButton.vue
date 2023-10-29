<script lang="ts" setup>
import { useSlots } from "vue";

const props = withDefaults(
    defineProps<{
        variant: "primary" | "secondary" | "danger";
        icon?: string;
        iconSize?: number | string;
    }>(),
    { variant: "secondary" }
);
const slots = useSlots();
</script>

<template>
    <button
        :class="[
            {
                'icon-button': !slots.default && icon,
                'with-icon': icon && slots.default,
            },
            variant,
        ]"
    >
        <mdicon v-if="icon" :name="icon" :size="iconSize" class="icon" />
        <slot></slot>
    </button>
</template>

<style lang="scss" scoped>
button {
    --color: transparent;
    --hover: rgba(0, 0, 0, 0.3);
    --shadow: none;
    --shadow-hover: none;
    &.primary {
        --color: var(--primary);
        --hover: var(--primary-2);
        --shadow: var(--shadow-sm-primary);
    }
    &.danger {
        --hover: var(--danger);
        --shadow-hover: var(--shadow-sm-danger);
    }

    padding: 8px 15px;
    color: white;
    border: none;
    border-radius: 4px;
    background-color: var(--color);
    font-size: 15px;
    transition: background-color 0.2s, box-shadow 0.2s;
    box-shadow: var(--shadow);
    display: flex;
    align-items: center;

    &:hover {
        background-color: var(--hover);
        box-shadow: var(--shadow-hover);
    }

    &.with-icon {
        padding: 5px 15px 5px 5px;
    }

    .icon {
        margin-right: 10px;
    }

    &.icon-button {
        padding: 5px;

        .icon {
            margin: 0;
        }
    }
}
</style>
