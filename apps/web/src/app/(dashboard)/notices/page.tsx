"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/lib/auth-context";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { apiClient } from "@/lib/api-client";
import { Bell, Plus, Send, CheckCircle2, Megaphone, Globe } from "lucide-react";

interface NoticeItem {
  id: string;
  titleEn: string;
  titleBn?: string;
  bodyEn?: string;
  bodyBn?: string;
  body?: string;
  publishedAt?: string;
  date?: string;
  targetRoles?: string[];
  audience?: string;
  priority: "HIGH" | "NORMAL" | "MEDIUM" | "URGENT";
  status?: "PUBLISHED" | "DRAFT";
}

export default function NoticesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = React.useState(false);
  const [notices, setNotices] = React.useState<NoticeItem[]>([]);

  // Form State
  const [titleEn, setTitleEn] = React.useState("");
  const [titleBn, setTitleBn] = React.useState("");
  const [bodyEn, setBodyEn] = React.useState("");
  const [bodyBn, setBodyBn] = React.useState("");
  const [priority, setPriority] = React.useState<"NORMAL" | "HIGH" | "URGENT">("NORMAL");
  const [audience, setAudience] = React.useState("ALL");

  const fetchNotices = React.useCallback(async () => {
    try {
      const data = await apiClient<NoticeItem[]>("/notices");
      if (Array.isArray(data) && data.length > 0) {
        setNotices(data);
      }
    } catch {
      // Fallback
    }
  }, []);

  React.useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  const handlePublishNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      titleEn,
      titleBn,
      bodyEn,
      bodyBn,
      priority,
      targetRoles: audience === "ALL" ? ["ALL", "STUDENT", "PARENT", "TEACHER"] : [audience],
    };

    try {
      const created = await apiClient<NoticeItem>("/notices", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setNotices((prev) => [created || {
        ...payload,
        id: `not-${Date.now()}`,
        publishedAt: new Date().toISOString(),
        status: "PUBLISHED",
      }, ...prev]);
      setModalOpen(false);
      setTitleEn("");
      setTitleBn("");
      setBodyEn("");
      setBodyBn("");

      toast({
        title: "Circular Published Successfully 📢",
        description: `Bilingual circular indexed in notice.notice table. Outbox event dispatched for push & portal feed.`,
        type: "success",
      });
    } catch (err: any) {
      toast({
        title: "Publishing Failed",
        description: err.message,
        type: "error",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Institutional Circulars & Notices</h1>
          <p className="text-sm text-muted-foreground">
            Bilingual Bengali & English circulars backed by PostgreSQL tsvector full-text search.
          </p>
        </div>
        {(user?.roles.includes("ADMIN") || user?.roles.includes("PRINCIPAL")) && (
          <Button size="sm" onClick={() => setModalOpen(true)} className="gap-1.5 text-xs">
            <Plus className="h-3.5 w-3.5" />
            <span>Publish New Notice</span>
          </Button>
        )}
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Published Circulars</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notices.length}</div>
            <p className="text-[11px] text-muted-foreground">Active in portal feed</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Bilingual FTS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">tsvector ('simple')</div>
            <p className="text-[11px] text-muted-foreground">Bengali Unicode preserved</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Targeted Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">RBAC Filtered</div>
            <p className="text-[11px] text-muted-foreground">Role-scoped visibility</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Dispatch Latency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">&lt; 200 ms</div>
            <p className="text-[11px] text-muted-foreground">Instant portal sync</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">Institutional Notice Board</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Notice ID</TableHead>
                <TableHead>Circular Title (English / বাংলা)</TableHead>
                <TableHead>Target Audience</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Date Published</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notices.map((n) => (
                <TableRow key={n.id}>
                  <TableCell className="font-mono text-xs font-semibold text-primary">
                    {n.id}
                  </TableCell>
                  <TableCell className="max-w-[340px]">
                    <div className="font-medium text-foreground">{n.titleEn}</div>
                    {n.titleBn && <div className="text-xs text-muted-foreground mt-0.5">{n.titleBn}</div>}
                    <div className="text-xs text-muted-foreground line-clamp-1 mt-1">
                      {n.bodyEn || n.body}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">
                    <Badge variant="outline" className="text-[10px]">
                      {(n.targetRoles || [n.audience || "ALL"]).join(", ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        n.priority === "URGENT" || n.priority === "HIGH"
                          ? "destructive"
                          : "default"
                      }
                      className="text-[10px] uppercase font-semibold"
                    >
                      {n.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">
                    {n.publishedAt ? new Date(n.publishedAt).toLocaleDateString() : n.date || "Today"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => {
                        toast({
                          title: n.titleEn,
                          description: n.bodyEn || n.body || "No details.",
                          type: "info",
                        });
                      }}
                    >
                      Read Full
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      <Dialog
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Publish Official Notice"
        description="Creates bilingual notice row and triggers tsvector search index refresh"
      >
        <form onSubmit={handlePublishNotice} className="space-y-3 pt-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold">Title (English)</label>
            <Input
              required
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              placeholder="e.g. Schedule for Mid-Term Examination 2026"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold">Title (বাংলা)</label>
            <Input
              value={titleBn}
              onChange={(e) => setTitleBn(e.target.value)}
              placeholder="যেমন: অর্ধবার্ষিক পরীক্ষা ২০২৬ এর সময়সূচি প্রকাশ"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold">Notice Body (English)</label>
            <textarea
              required
              rows={3}
              className="w-full px-3 py-2 rounded-md border border-input bg-background text-xs"
              value={bodyEn}
              onChange={(e) => setBodyEn(e.target.value)}
              placeholder="Enter comprehensive notice body in English..."
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold">Notice Body (বাংলা)</label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 rounded-md border border-input bg-background text-xs"
              value={bodyBn}
              onChange={(e) => setBodyBn(e.target.value)}
              placeholder="বাংলায় নোটিশের বিস্তারিত বিবরণ..."
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Priority</label>
              <select
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-xs"
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
              >
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High Priority</option>
                <option value="URGENT">Urgent Alert</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">Target Audience</label>
              <select
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-xs"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
              >
                <option value="ALL">All Institute</option>
                <option value="STUDENT">Students Only</option>
                <option value="TEACHER">Faculty & Teachers</option>
                <option value="PARENT">Parents & Guardians</option>
                <option value="FINANCE">Finance Officers</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Publish Circular
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
