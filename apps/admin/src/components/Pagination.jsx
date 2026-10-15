// Simple prev/next pager driven by total/page/limit from the API.
export default function Pagination({ page, limit, total, onChange }) {
  const totalPages = Math.max(1, Math.ceil((total || 0) / (limit || 1)));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  if (!total || totalPages <= 1) {
    return (
      <div className="flex items-center justify-between py-3 text-sm text-slate-500">
        <span>{total || 0} total</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between py-3 text-sm text-slate-600">
      <span>
        Page {page} of {totalPages} · {total} total
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={!canPrev}
          onClick={() => onChange(page - 1)}
          className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={!canNext}
          onClick={() => onChange(page + 1)}
          className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
