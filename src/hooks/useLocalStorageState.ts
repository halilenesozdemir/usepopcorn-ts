import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { WatchedMovie } from "../types/WatchedMovie";

export const useLocalStorageState = (
  initialState: WatchedMovie[],
  key: string,
): [WatchedMovie[], Dispatch<SetStateAction<WatchedMovie[]>>] => {
  const [value, setValue] = useState<WatchedMovie[]>(() => {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : initialState;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [value, key]);

  return [value, setValue];
};
