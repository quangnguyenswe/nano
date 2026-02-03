// eslint-disable-next-line no-restricted-imports
import {
  atom,
  createStore,
  type PrimitiveAtom,
  type WritableAtom,
} from "jotai";
import { createIsolation } from "jotai-scope";

const jotai = createIsolation();

export { atom, PrimitiveAtom, WritableAtom };
export const { useAtom, useSetAtom, useAtomValue, useStore } = jotai;
export const MessageJotaiProvider: ReturnType<
  typeof createIsolation
>["Provider"] = jotai.Provider;

export const MessageJotaiStore: ReturnType<typeof createStore> = createStore();
