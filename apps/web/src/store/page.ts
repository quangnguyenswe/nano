import { create } from "zustand";

interface PageState {
  pageProgressMessage: string | undefined;
}

interface PageActions {
  setPageProgressMessage: (message: string | undefined) => void;
}

export const usePageStore = create<PageState & PageActions>((set) => ({
  pageProgressMessage: '',
  setPageProgressMessage: (message) =>
    set(() => ({ pageProgressMessage: message })),
}));

export const usePageProgressMessage = () =>
  usePageStore((state) => state.pageProgressMessage);