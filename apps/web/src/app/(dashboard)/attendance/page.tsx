"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const MOCK_ROSTER = [
  { id: "1", roll: "101", name: "Ayesha Siddiqua", status: "PRESENT" },
  { id: "2", roll: "102", name: "Tanvir Ahmed", status: "PRESENT" },
  { id: "3", roll: "103", name: "Fatima Noor", status: "ABSENT" },
  { id: "4", roll: "104", name: "Mahmudul Hasan", status: "PRESENT" },
  { id: "5", roll: "105", name: "Sultana Razia", status: "LATE" },
];

export default function AttendancePage() {
  const [roster, setRoster] = React.useState(MOCK_ROSTER);

  const toggleStatus = (id: string) => {
    setRoster((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const nextStatus = s.status === "PRESENT" ? "ABSENT" : s.status === "ABSENT" ? "LATE" : "PRESENT";
        return { ...s, status: nextStatus };
      }),
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Class Roster Attendance</h1>
          <p className="text-muted-foreground">Class 10 — Section A (Morning Shift)</p>
        </div>
        <Button>Submit Roster Batch</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Student List (Tap to toggle status)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {roster.map((student) => (
              <div
                key={student.id}
                onClick={() => toggleStatus(student.id)}
                className="flex items-center justify-between py-3 cursor-pointer hover:bg-muted/50 px-2 rounded-md transition-colors"
              >
                <div>
                  <span className="font-mono text-sm font-bold text-muted-foreground mr-3">Roll {student.roll}</span>
                  <span className="font-medium text-foreground">{student.name}</span>
                </div>
                <Badge
                  variant={
                    student.status === "PRESENT"
                      ? "success"
                      : student.status === "ABSENT"
                      ? "destructive"
                      : "warning"
                  }
                >
                  {student.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
