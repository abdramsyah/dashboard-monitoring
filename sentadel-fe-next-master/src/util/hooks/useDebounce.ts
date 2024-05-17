import { useRef } from "react";

const useDebounce = () => {
  const timeout = useRef<ReturnType<typeof setTimeout>>();

  return (callback: () => void, delay = 300) => {
    clearTimeout(timeout.current);
    timeout.current = setTimeout(callback, delay);
  };
};

export default useDebounce;
