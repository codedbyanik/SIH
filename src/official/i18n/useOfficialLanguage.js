import { useLanguage } from "../../LanguageContext.jsx";
import { useOfficialT } from "./officialTranslations.js";

/* =========================================================
   Wraps the existing project-wide useLanguage() hook and
   attaches the Official Portal translation dictionary, so
   official pages get { language, isHindi, t, ... } from a
   single import without duplicating language state.
   ========================================================= */
export function useOfficialLanguage() {
  const languageState = useLanguage();
  const t = useOfficialT(languageState.language);

  return {
    ...languageState,
    isHindi: languageState.language === "hi",
    t,
  };
}
