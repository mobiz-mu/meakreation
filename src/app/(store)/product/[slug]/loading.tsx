export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="aspect-[4/5] animate-pulse rounded-[28px] bg-neutral-200" />
        <div className="space-y-4">
          <div className="h-4 w-24 animate-pulse rounded bg-neutral-200" />
          <div className="h-10 w-3/4 animate-pulse rounded bg-neutral-200" />
          <div className="h-6 w-32 animate-pulse rounded bg-neutral-200" />
          <div className="h-24 w-full animate-pulse rounded bg-neutral-200" />
          <div className="h-12 w-40 animate-pulse rounded-full bg-neutral-200" />
        </div>
      </div>
    </div>
  );
}