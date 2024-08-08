export type RandomInt = (qtdMin: number, qtdMax?: number) => number;
export function randomInt(qtdMin: number, qtdMax?: number): number {
  const rand = qtdMax
    ? Math.random() * (qtdMax - qtdMin) + qtdMin
    : Math.random() * qtdMin;

  return Math.floor(rand);
}
