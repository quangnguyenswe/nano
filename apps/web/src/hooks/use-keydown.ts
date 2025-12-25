import { useEffect } from "react";

export function useKeydown(keyName: string, callback: any, deps: any[] = []) {
  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (
        !keyName.startsWith("mod_") &&
        event.key.toLocaleLowerCase() === keyName.toLocaleLowerCase()
      ) {
        callback(event);
      } else if (
        keyName.startsWith('mod_') &&
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === keyName.replace("mod_", "").toLowerCase()
      ) {
        event?.preventDefault();
        callback?.(event);
      }
    };

    window.addEventListener("keydown", listener);
    return () => {
      window.removeEventListener("keydown", listener);
    };
  }, deps);
}
