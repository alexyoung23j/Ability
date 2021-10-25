import { useEffect, useState } from 'react';

export function useCount(dependency: any, log = true) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (log) {
      console.log(count);
    }
    setCount(count + 1);
  }, [dependency]);
}
