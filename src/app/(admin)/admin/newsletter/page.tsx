"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Mail, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type Subscriber = {
  id: number;
  email: string;
  source: string | null;
  created_at: string;
};

function formatDate(value?: string | null) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getErrorMessage(error: unknown) {
  if (!error) return "Unknown error";
  if (typeof error === "string") return error;

  if (typeof error === "object") {
    const e = error as {
      message?: string;
      details?: string;
      hint?: string;
      code?: string;
    };

    return (
      [e.message, e.details, e.hint, e.code ? `(code: ${e.code})` : ""]
        .filter(Boolean)
        .join(" | ") || "Unknown error"
    );
  }

  return "Unknown error";
}

export default function AdminNewsletterPage() {
  const [rows, setRows] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    setMessage("");

    try {
      const result = await supabase
        .from("newsletter_subscribers")
        .select("*")
        .order("created_at", { ascending: false });

      if (result.error) {
        console.error("Failed to load subscribers:", {
          error: result.error,
          result,
        });
        setMessage(getErrorMessage(result.error));
        setRows([]);
        setLoading(false);
        return;
      }

      setRows((result.data as Subscriber[]) || []);
      setLoading(false);
    } catch (error) {
      console.error("Unexpected subscribers load error:", error);
      setMessage(getErrorMessage(error));
      setRows([]);
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-950">
            Newsletter Subscribers
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            All emails collected from the Mea Kréation newsletter form.
          </p>
        </div>

        <Button variant="outline" className="rounded-xl" onClick={load}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {message ? (
        <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-700 shadow-sm">
          {message}
        </div>
      ) : null}

      <Card className="rounded-3xl border-neutral-200 shadow-sm">
        <CardHeader>
          <CardTitle>Subscribers</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex items-center gap-3 py-8 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading subscribers...
            </div>
          ) : rows.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-10 text-center text-sm text-muted-foreground">
              No subscribers yet.
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-neutral-200">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-neutral-50">
                    <tr className="text-left text-neutral-600">
                      <th className="px-4 py-3 font-medium">Email</th>
                      <th className="px-4 py-3 font-medium">Source</th>
                      <th className="px-4 py-3 font-medium">Created At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.id} className="border-t border-neutral-200">
                        <td className="px-4 py-3 text-neutral-900">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-neutral-400" />
                            {row.email}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-neutral-600">
                          {row.source || "—"}
                        </td>
                        <td className="px-4 py-3 text-neutral-600">
                          {formatDate(row.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}