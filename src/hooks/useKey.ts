import { useEffect } from "react";

export const useKey = (eventCode: string, action: () => void) => {
  useEffect(() => {
    const callbackFn = (e: KeyboardEvent) => {
      if (e.code.toLowerCase() === eventCode.toLowerCase()) {
        action?.();
      }
    };

    document.addEventListener("keydown", callbackFn);
    return () => {
      document.removeEventListener("keydown", callbackFn);
    };
  }, [action, eventCode]);
};
