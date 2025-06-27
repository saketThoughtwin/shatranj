import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
  } from "@/components/ui/dialog";
  import { Button } from "@/components/ui/button";
  
  interface ConfirmNewGameModalProps {
    open: boolean;
    onCancel: () => void;
    onConfirm: () => void;
  }
  
  export default function ConfirmNewGameModal({
    open,
    onCancel,
    onConfirm,
  }: ConfirmNewGameModalProps) {
    return (
      <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="bg-black/80 text-white backdrop-blur-md rounded-xl max-w-sm sm:max-w-md px-4 sm:px-6 py-6">
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-semibold">
              Start New Game?
            </DialogTitle>
            <DialogDescription className="text-gray-300 text-sm">
              This will reset your current game. Are you sure you want to continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              className="bg-yellow-400 hover:bg-yellow-500 text-black"
            >
              Yes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }