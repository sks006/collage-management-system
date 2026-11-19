import { getCurrentUser } from "@/lib/auth";
import { Bell, User } from "lucide-react";

export function Navbar() {
  const user = getCurrentUser();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-card px-6">
      <div className="font-semibold text-lg text-primary">School Management System</div>
      <div className="flex items-center space-x-4">
        <button className="rounded-full p-2 hover:bg-muted text-muted-foreground">
          <Bell className="h-5 w-5" />
        </button>
        <div className="flex items-center space-x-2 border-l pl-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <User className="h-4 w-4" />
          </div>
          <div className="text-left text-xs">
            <div className="font-medium text-foreground">{user.name}</div>
            <div className="text-muted-foreground">{user.roles[0]}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
