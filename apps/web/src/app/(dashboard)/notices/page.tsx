import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function NoticesPage() {
  const notices = [
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
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Institutional Notices</h1>
          <p className="text-muted-foreground">
            Bilingual announcements, emergency broadcasts, and role-targeted circulars.
          </p>
        </div>
        <div className="space-x-2">
          <Button variant="outline">Audience Settings</Button>
          <Button>Draft Notice</Button>
        </div>
      </div>

      <div className="space-y-4">
        {notices.map((n) => (
          <Card key={n.id} className="border-l-4 border-l-primary hover:shadow-sm transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-lg font-bold text-foreground">{n.titleEn}</CardTitle>
                  <div className="text-sm text-muted-foreground font-bengali mt-0.5">{n.titleBn}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={n.priority === "HIGH" ? "destructive" : "secondary"}>
                    {n.priority}
                  </Badge>
                  <Badge variant="outline">
                    Audience: {n.audience}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-foreground/90 leading-relaxed">{n.body}</p>
              <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
                <span>Published on {n.date} by {n.author}</span>
                <span className="text-green-600 font-medium">✓ Broadcasted via SMS & Web</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
