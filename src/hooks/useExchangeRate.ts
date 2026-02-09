import { useQuery } from '@tanstack/react-query';
import type { ExchangeRate } from '@/lib/types';

async function fetchExchangeRate(): Promise<ExchangeRate> {
  const response = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
  if (!response.ok) {
    throw new Error('Error al obtener tasa de cambio');
  }
  const data = await response.json();
  return {
    promedio: data.promedio,
    fechaActualizacion: data.fechaActualizacion,
  };
}

export function useExchangeRate() {
  return useQuery({
    queryKey: ['exchangeRate'],
    queryFn: fetchExchangeRate,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  });
}
