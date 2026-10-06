import { useEffect, useState } from 'react';

export default function useRelogio() {
  const [agora, setAgora] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setAgora(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);
  return agora;
}
