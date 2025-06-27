import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface PromotionModalProps {
  promotion: {
    from: [number, number];
    to: [number, number];
    color: "white" | "black";
  } | null;
  onSelect: (type: string) => void;
  onClose: () => void;
  pieceIcons: Record<string, string>;
}

export default function PawnPromotionModal({
  promotion,
  onSelect,
  onClose,
  pieceIcons,
}: PromotionModalProps) {
  if (!promotion) return null;

  return (
    <Dialog open={!!promotion} onOpenChange={onClose}>
     <DialogContent className="bg-black text-white rounded-xl max-w-sm sm:max-w-md w-full">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Choose promotion piece
          </DialogTitle>
        </DialogHeader>

        <div className="flex justify-around gap-4 mt-4">
          {["Q", "R", "B", "N"].map((type) => {
            const pieceCode =
              promotion.color === "white" ? type : type.toLowerCase();
            return (
              <img
                key={type}
                src={pieceIcons[pieceCode]}
                className="promotion-option"
                alt={type}
                onClick={() => onSelect(type)}
              />
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
