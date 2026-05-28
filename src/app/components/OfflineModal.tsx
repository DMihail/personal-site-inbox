import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
interface OfflineModalProps {
  isOpen: boolean;
  onRetry: () => void;
  onContinue: () => void;
  lastSync?: Date;
}

export function OfflineModal({ isOpen, onRetry, onContinue, lastSync }: OfflineModalProps) {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="glass-elevated border-glass-border max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-cyan/10 flex items-center justify-center">
              <WifiOff className="h-6 w-6 text-cyan" />
            </div>
            <div>
              <DialogTitle>You're offline</DialogTitle>
              <p className="text-meta mt-1 text-text-muted">No internet connection</p>
            </div>
          </div>
          <DialogDescription className="text-text-secondary">
            Connection to the communication service was lost. Some features may be temporarily unavailable.
          </DialogDescription>
          {lastSync && (
            <div className="mt-3 border-t border-glass-border pt-3">
              <p className="text-meta text-text-muted">
                Last synced: {lastSync.toLocaleTimeString()}
              </p>
            </div>
          )}
        </DialogHeader>
        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={onContinue}
            className="glass border-glass-border hover:bg-glass-elevated"
          >
            Continue Offline
          </Button>
          <Button
            onClick={onRetry}
            className="bg-cyan hover:bg-cyan/90 text-background"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Connection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
