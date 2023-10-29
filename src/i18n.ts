import { createI18n } from "vue-i18n";
import { nextTick } from "vue";
import en from "@/locales/en.json";

const i18n = createI18n({
    legacy: false,
    locale: "en" as string,
    fallbackLocale: "en",
    messages: { en } as { [key: string]: any },
});

export async function setLanguage(locale: string) {
    if (!i18n.global.availableLocales.includes(locale)) {
        const messages = await import(`./locales/${locale}.json`);
        i18n.global.setLocaleMessage(locale, messages);
    }
    i18n.global.locale.value = locale;
    document.querySelector("html")?.setAttribute("lang", locale);
    return nextTick();
}

export default i18n;
