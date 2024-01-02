import { persistentAtom } from "@nanostores/persistent";

export const isLock = persistentAtom("isLock", false);
export const erase = persistentAtom("erase", 0);
