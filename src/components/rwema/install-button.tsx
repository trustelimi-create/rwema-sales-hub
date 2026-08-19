import { Download, Check } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useInstallPrompt } from "@/lib/use-install-prompt";

export function InstallButton({ className }: { className?: string }) {
  const { canInstall, installed, install } = useInstallPrompt();

  if (installed) {
    return (
      <div className={className}>
        <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Check className="size-4 text-[var(--color-success)]" /> Rwema is installed
        </p>
      </div>
    );
  }

  return (
    <Button
      size="lg"
      className={className}
      onClick={async () => {
        const result = await install();
        if (result === "unavailable") {
          toast("Install Rwema", {
            description:
              "Open this app in Chrome (Android/desktop) and choose “Install app”, or on iPhone use Share → Add to Home Screen.",
          });
        }
      }}
    >
      <Download className="size-5" />
      Install Rwema
    </Button>
  );
}
