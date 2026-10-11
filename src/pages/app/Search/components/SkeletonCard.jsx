// Loading placeholders that mirror the grid/list result layouts.
// `animate-pulse` is Tailwind built-in; the global prefers-reduced-motion block
// in main.css already neutralises it, so no extra JS is needed.
const BLOCK = 'bg-slate-200 dark:bg-slate-700 rounded';

function GridSkeleton() {
  return (
    <div className="glass rounded-3xl overflow-hidden card-shadow animate-pulse">
      <div className={`aspect-[3/4] ${BLOCK} rounded-none`} />
      <div className="p-5 bg-white dark:bg-slate-800 space-y-3">
        <div className={`h-4 w-28 ${BLOCK}`} />
        <div className="flex gap-2">
          <div className={`h-5 w-20 ${BLOCK}`} />
          <div className={`h-5 w-24 ${BLOCK}`} />
        </div>
        <div className="flex gap-2 pt-1">
          <div className={`h-10 flex-1 ${BLOCK} rounded-xl`} />
          <div className={`h-10 flex-[2] ${BLOCK} rounded-xl`} />
        </div>
      </div>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="glass rounded-2xl overflow-hidden card-shadow flex flex-col md:flex-row items-stretch animate-pulse">
      <div className={`md:w-48 h-48 flex-shrink-0 ${BLOCK} rounded-none`} />
      <div className="flex-1 p-4 md:p-5 space-y-3">
        <div className={`h-5 w-40 ${BLOCK}`} />
        <div className={`h-4 w-28 ${BLOCK}`} />
        <div className="flex gap-2">
          <div className={`h-5 w-20 ${BLOCK}`} />
          <div className={`h-5 w-24 ${BLOCK}`} />
        </div>
        <div className="flex gap-2 pt-1">
          <div className={`h-9 w-32 ${BLOCK} rounded-xl`} />
          <div className={`h-9 w-32 ${BLOCK} rounded-xl`} />
        </div>
      </div>
    </div>
  );
}

/** Renders `count` skeletons in the active `view` layout (grid | list). */
export default function SkeletonCard({ view = 'grid', count = 6 }) {
  const items = Array.from({ length: count });
  if (view === 'list') {
    return (
      <div className="space-y-3">
        {items.map((_, i) => <ListSkeleton key={i} />)}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((_, i) => <GridSkeleton key={i} />)}
    </div>
  );
}
