"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type Cat = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  image_url: string | null;
};

export default function CategoryFilter() {
  const sp = useSearchParams();
  const router = useRouter();
  const cat = sp.get("cat") || "";

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Cat[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("categories")
        .select("id,name,slug,sort_order,image_url")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (!alive) return;

      if (!error) setItems((data ?? []).map((x: any) => ({ ...x, sort_order: Number(x.sort_order ?? 0) })));
      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, []);

  const activeSlug = useMemo(() => cat.trim(), [cat]);

  function setCat(slug: string | null) {
    const url = new URL(window.location.href);
    if (!slug) url.searchParams.delete("cat");
    else url.searchParams.set("cat", slug);
    router.push(url.pathname + "?" + url.searchParams.toString());
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant={!activeSlug ? "default" : "outline"}
        className="rounded-xl"
        onClick={() => setCat(null)}
        disabled={loading}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "All"}
      </Button>

      {items.map((c) => (
        <Button
          key={c.id}
          variant={activeSlug === c.slug ? "default" : "outline"}
          className="rounded-xl"
          onClick={() => setCat(c.slug)}
          disabled={loading}
        >
          {c.name}
        </Button>
      ))}
    </div>
  );
}