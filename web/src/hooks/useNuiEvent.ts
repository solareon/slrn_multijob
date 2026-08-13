import { useEffect, useRef } from "react";

interface NuiMessage<T> {
  action: string;
  data?: T;
}

export function useNuiEvent<T>(action: string, handler: (data?: T) => void) {
  const savedHandler = useRef(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const listener = (event: MessageEvent<NuiMessage<T>>) => {
      if (event.data?.action === action) {
        savedHandler.current(event.data.data);
      }
    };

    window.addEventListener("message", listener);
    return () => window.removeEventListener("message", listener);
  }, [action]);
}
