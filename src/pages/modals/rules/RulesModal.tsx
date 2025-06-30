import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import rulesData from "@/data/chessRules.json";

interface RulesModalProps {
  open: boolean;
  onClose: () => void;
  language: "en" | "hi";
  setLanguage: (lang: "en" | "hi") => void;
}

export default function RulesModal({
  open,
  onClose,
  language,
}: RulesModalProps) {
  const langContent = rulesData[language];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-black/90 text-white rounded-xl w-[90vw] max-w-md sm:max-w-lg md:max-w-xl p-4 sm:p-6">
        <DialogHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <DialogTitle className="text-xl sm:text-2xl font-bold text-yellow-400">
              {langContent.title}
            </DialogTitle>
            <Select>
              <SelectTrigger className="mr-3 w-full sm:w-[130px] bg-black border border-yellow-400 text-yellow-400 hover:border-yellow-500 text-sm">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent
                side="bottom"
                align="end"
                className="z-40 bg-black border border-yellow-400 text-white"
              >
                <SelectItem
                  value="en"
                  className="hover:bg-yellow-500 hover:text-black text-sm"
                >
                  English
                </SelectItem>
                <SelectItem
                  value="hi"
                  className="hover:bg-yellow-500 hover:text-black text-sm"
                >
                  हिन्दी
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </DialogHeader>

        <p className="text-sm sm:text-base text-gray-300 mt-2">
          {langContent.description}
        </p>

        <div className="space-y-2 text-sm sm:text-base mt-4">
          {langContent.rules.map((rule, idx) => (
            <p key={idx}>{rule}</p>
          ))}
        </div>

        <div className="mt-6 space-y-2">
          <h3 className="text-base sm:text-lg font-semibold text-yellow-400">
            {langContent.howPiecesMove}
          </h3>
          <ul className="text-sm sm:text-base text-white mt-2 space-y-2">
            {langContent.pieceMoves.map((move, idx) => (
              <li key={idx}>
                <strong>{move.piece}:</strong> {move.description}
              </li>
            ))}
          </ul>
        </div>

        <DialogFooter className="mt-6 flex justify-end">
          <Button
            className="bg-yellow-400 text-black hover:bg-yellow-500 text-sm sm:text-base"
            onClick={onClose}
          >
            {langContent.button}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
