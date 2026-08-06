// §19.2: "Yükleme durumlarında iskelet ekran kullanılarak algılanan
// performansın artırılması" — API'den veri gelene kadar bu gösterilir.
export default function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[4/5] w-full rounded-lg bg-black/[0.06]" />
      <div className="mt-3 h-3 w-2/3 rounded bg-black/[0.06]" />
      <div className="mt-2 h-3 w-1/3 rounded bg-black/[0.06]" />
    </div>
  );
}
