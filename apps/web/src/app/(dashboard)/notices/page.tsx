"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/lib/auth-context";
import { Bell, Plus, Send, CheckCircle2 } from "lucide-react";

interface NoticeItem {
  id: string;
  titleEn: string;
  titleBn: string;
  body: string;
  date: string;
  audience: string;
  priority: "HIGH" | "NORMAL" | "URGENT";
  status: "PUBLISHED" | "DRAFT";
  author: string;
}

export default function NoticesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = React.useState(false);

  const [notices, setNotices] = React.useState<NoticeItem[]>([
    {
      id: "1",
      titleEn: "Half-Yearly Examination 2026 Schedule Published",
      titleBn: "অর্ধবার্ষিক পরীক্ষা ২০২৬ এর রুটিন প্রকাশ",
      body: "The routine for the upcoming Half-Yearly examinations has been published on the student portal. Admit cards will be issued from December 5th.",
      date: "2026-11-20",
      audience: "STUDENT, PARENT",
      priority: "HIGH",
      status: "PUBLISHED",
      author: "Principal's Office",
    },
    {
      id: "2",
      titleEn: "Notice Regarding Victory Day Holiday Observance",
      titleBn: "মহান বিজয় দিবস উপলক্ষে কলেজ ছুটি সংক্রান্ত বিজ্ঞপ্তি",
      body: "College will remain closed on 16th December on the occasion of Victory Day. Flag hoisting and cultural assembly will commence at 08:30 AM in the college auditorium.",
      date: "2026-11-18",
      audience: "ALL",
      priority: "NORMAL",
      status: "PUBLISHED",
      author: "Academic Administration",
    },
    {
      id: "3",
      titleEn: "Staff Academic Council Meeting (Term 1 Review)",
      titleBn: "শিক্ষক একাডেমিক কাউন্সিলের জরুরি সভা",
      body: "All faculty members are requested to attend the council meeting at the Conference Hall tomorrow at 02:30 PM. Agenda includes period close validation and syllabus coverage.",
      date: "2026-11-15",
      audience: "TEACHER",
      priority: "HIGH",
      status: "PUBLISHED",
      author: "Vice Principal",
    },
  ]);

  // Form State
  const [titleEn, setTitleEn] = React.useState("");
  const [titleBn, setTitleBn] = React.useState("");
  const [body, setBody] = React.useState("");
  const [audience, setAudience] = React.useState("ALL");
  const [priority, setPriority] = React.useState<"NORMAL" | "HIGH" | "URGENT">("HIGH");

  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    const newNotice: NoticeItem = {
      id: String(Date.now()),
      titleEn,
      titleBn: titleBn || titleEn,
      body,
      date: new Date().toISOString().split("T")[0]!,
      audience,
      priority,
      status: "PUBLISHED",
      author: user?.name || "Dr. Rafiqul Islam (Principal)",
    };

    setNotices([newNotice, ...notices]);
    setModalOpen(false);
    setTitleEn("");
    setTitleBn("");
    setBody("");

    toast({
      title: "Notice Published & Broadcasted 📢",
      description: `Dispatched to audience: ${audience}. Deduplicated SMS outbox jobs created for guardians.`,
      type: "success",
    });
  };

  const handleBroadcast = (notice: NoticeItem) => {
    toast({
      title: "Broadcast Retriggered",
      description: `Notice '${notice.titleEn}' sent to ${notice.audience} via SMS and mobile app push.`,
      type: "success",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Institutional Notices</h1>
          <p className="text-muted-foreground">
            Bilingual announcements, emergency broadcasts, and role-targeted circulars.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setModalOpen(true)} className="gap-1.5 text-xs">
            <Plus className="h-3.5 w-3.5" />
            <span>Draft Notice</span>
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {notices.map((n) => (
          <Card key={n.id} className="border-l-4 border-l-primary hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-lg font-bold text-foreground">{n.titleEn}</CardTitle>
                  <div className="text-sm text-muted-foreground font-bengali mt-0.5">{n.titleBn}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={n.priority === "HIGH" || n.priority === "URGENT" ? "destructive" : "secondary"}>
                    {n.priority}
                  </Badge>
                  <Badge variant="outline">Audience: {n.audience}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-foreground/90 leading-relaxed">{n.body}</p>
              <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
                <span>Published on {n.date} by {n.author}</span>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600 font-medium">✓ Broadcasted</span>
                  <Button variant="ghost" size="sm" className="h-6 text-[11px] gap-1" onClick={() => handleBroadcast(n)}>
                    <Send className="h-3 w-3" />
                    <span>Re-send</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Draft Notice Modal */}
      <Dialog
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="Draft & Publish Institutional Notice"
        description="Publish announcements with dual English & Bangla text and target specific audiences."
      >
        <form onSubmit={handleCreateNotice} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold">Title (English)</label>
            <Input
              required
              placeholder="e.g. Annual Sports Meet 2026 Registration"
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold">Title (বাংলা)</label>
            <Input
              placeholder="e.g. বার্ষিক ক্রীড়া প্রতিযোগিতা ২০২৬ সংক্রান্ত বিজ্ঞপ্তি"
              value={titleBn}
              onChange={(e) => setTitleBn(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Target Audience</label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="w-full h-10 px-3 rounded-md border bg-background text-xs"
              >
                <option value="ALL">Everyone (All Roles)</option>
                <option value="STUDENT, PARENT">Students & Parents</option>
                <option value="TEACHER">Teaching Faculty</option>
                <option value="STAFF">All Institutional Staff</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full h-10 px-3 rounded-md border bg-background text-xs"
              >
                <option value="HIGH">High (Important)</option>
                <option value="NORMAL">Normal</option>
                <option value="URGENT">Urgent (Emergency)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold">Notice Body</label>
            <textarea
              required
              rows={4}
              placeholder="Write the full circular announcement here..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full p-3 rounded-md border bg-background text-xs focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">Publish & Broadcast</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
