import i18next from "i18next";
import Backend from "i18next-fs-backend";

export const i18nClient = () =>
  i18next.use(Backend).init({
    backend: {
      loadPath: "locales/{{lng}}.json",
    },
    fallbackLng: "en",
    preload: ["en", "es"],
  });

export { i18next };
