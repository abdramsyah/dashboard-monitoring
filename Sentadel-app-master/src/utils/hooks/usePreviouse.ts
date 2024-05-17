import { useEffect, useRef } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function usePrevious<T>(value: any) {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current as T;
}

export default usePrevious;
