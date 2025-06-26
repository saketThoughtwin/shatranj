import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import "@/pages/loadingscreen/LoadingScreen.css";

const LoadingScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setCompleted(true);
          return 100;
        }
        return prev + 1;
      });
    }, 40);

    return () => clearInterval(interval);
  }, []);

  // 🚨 Trigger `onComplete()` only after hitting 100%
  useEffect(() => {
    if (completed) {
      const timeout = setTimeout(() => {
        onComplete();
      }, 200); // slight delay for UX smoothness

      return () => clearTimeout(timeout);
    }
  }, [completed, onComplete]);

  return (
    <div className="loading-overlay">
      <div className="blurred-backdrop" />
      <Card className="loading-card">
        <CardContent className="flex flex-col items-center gap-6 p-10 w-full">
          <h1 className="text-2xl md:text-3xl font-extrabold text-yellow-400 text-center">
            ♛ Loading Shatranj...
          </h1>
          <Progress
            value={progress}
            className="w-full h-4 bg-gray-700 [&>div]:bg-yellow-400"
          />
          <p className="text-sm text-white">{progress}%</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoadingScreen;
