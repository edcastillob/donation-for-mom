 export function formatBs(amount: number): string {
   return new Intl.NumberFormat('es-VE', {
     style: 'decimal',
     minimumFractionDigits: 2,
     maximumFractionDigits: 2,
   }).format(amount);
 }
 
 export function formatUsd(amount: number): string {
   return new Intl.NumberFormat('en-US', {
     style: 'currency',
     currency: 'USD',
   }).format(amount);
 }