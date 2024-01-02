import { persistentAtom } from "@nanostores/persistent";

export const isDrawable = persistentAtom("isDrawable", true);
export const erase = persistentAtom("erase", 0);
