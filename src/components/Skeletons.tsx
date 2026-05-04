export function DishCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-orange-50">
      <div className="skeleton h-44 w-full" />
      <div className="p-4 space-y-3">
        <div className="flex justify-between gap-2">
          <div className="skeleton h-5 w-3/4 rounded-lg" />
          <div className="skeleton h-5 w-12 rounded-lg" />
        </div>
        <div className="skeleton h-3 w-full rounded-lg" />
        <div className="skeleton h-3 w-2/3 rounded-lg" />
        <div className="flex justify-between items-center">
          <div className="skeleton h-7 w-16 rounded-lg" />
          <div className="skeleton h-9 w-20 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function VendorCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-orange-50">
      <div className="skeleton h-36 w-full" />
      <div className="p-4 pt-8 space-y-3">
        <div className="flex justify-between gap-2">
          <div className="skeleton h-5 w-2/3 rounded-lg" />
          <div className="skeleton h-5 w-12 rounded-lg" />
        </div>
        <div className="skeleton h-3 w-full rounded-lg" />
        <div className="flex gap-3">
          <div className="skeleton h-3 w-20 rounded-lg" />
          <div className="skeleton h-3 w-16 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="w-full h-[70vh] skeleton rounded-3xl" />
  );
}

export function GridSkeleton({ count = 8, type = "dish" }: { count?: number; type?: "dish" | "vendor" }) {
  return (
    <div className={`grid gap-5 ${type === "dish" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}>
      {Array.from({ length: count }).map((_, i) =>
        type === "dish" ? <DishCardSkeleton key={i} /> : <VendorCardSkeleton key={i} />
      )}
    </div>
  );
}
