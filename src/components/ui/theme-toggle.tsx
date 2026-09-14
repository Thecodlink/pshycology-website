import { Moon, Sun } from "lucide-react";

import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme";
import { Button } from "@/components/ui/button";

export function ThemeToggle({ className }: { className?: string }) {
  const { toggleTheme } = useTheme();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
      className={cn("size-9 rounded-full", className)}
      onClick={toggleTheme}
    >
      <Sun size={18} className="hidden dark:inline-block" />
      <Moon size={18} className="dark:hidden" />
    </Button>
  );
}
