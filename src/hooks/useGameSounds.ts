import { useEffect, useRef } from "react";

export const useGameSounds = (isMuted: boolean) => {
  const audioRef = useRef<HTMLAudioElement | null>(null); // 🎵 background music
  const moveSoundRef = useRef<HTMLAudioElement | null>(null); // ✅ normal move
  const captureSoundRef = useRef<HTMLAudioElement | null>(null); // ❌ capture
  const checkSoundRef = useRef<HTMLAudioElement | null>(null); // ⚠️ check or checkmate

  // Initial setup
  useEffect(() => {
    // Load audio files
    audioRef.current = new Audio(
      "https://res.cloudinary.com/ddfp1evfo/video/upload/v1750668928/videoplayback_vpzpip.mp3"
    );
    moveSoundRef.current = new Audio(
      "https://res.cloudinary.com/ddfp1evfo/video/upload/v1751366493/piece_sound_aq8daj.wav"
    );
    captureSoundRef.current = new Audio(
      "https://res.cloudinary.com/ddfp1evfo/video/upload/v1751369882/capture_sound_lmlwl9.mp3"
    );
    checkSoundRef.current = new Audio(
      "https://res.cloudinary.com/ddfp1evfo/video/upload/v1751371006/checkmate_ntbyei.mp3"
    );

    // Background music loop
    audioRef.current.loop = true;

    const volume = isMuted ? 0 : 1;

    // Set volume for all
    audioRef.current.volume = volume;
    moveSoundRef.current.volume = volume;
    captureSoundRef.current.volume = volume;
    checkSoundRef.current.volume = volume;

    // Try playing music (may fail until user interacts)
    const playMusic = async () => {
      try {
        await audioRef.current?.play();
      } catch (err) {
        console.warn("User interaction needed to start music:", err);
      }
    };
    playMusic();

    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  // Update volumes when mute changes
  useEffect(() => {
    const volume = isMuted ? 0 : 1;

    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      audioRef.current.volume = volume;
    }

    if (moveSoundRef.current) moveSoundRef.current.volume = volume;
    if (captureSoundRef.current) captureSoundRef.current.volume = volume;
    if (checkSoundRef.current) checkSoundRef.current.volume = volume;
  }, [isMuted]);

  // Play with fade logic
  const playMoveSoundWithFade = () => {
    if (!moveSoundRef.current || !audioRef.current) return;

    audioRef.current.volume = isMuted ? 0 : 0.2;

    moveSoundRef.current.currentTime = 0;
    moveSoundRef.current.volume = isMuted ? 0 : 1;
    moveSoundRef.current.play();

    setTimeout(() => {
      if (audioRef.current && !isMuted) {
        audioRef.current.volume = 1;
      }
    }, 700);
  };

  const playCaptureSoundWithFade = () => {
    if (!captureSoundRef.current || !audioRef.current) return;

    audioRef.current.volume = isMuted ? 0 : 0.2;

    captureSoundRef.current.currentTime = 0;
    captureSoundRef.current.volume = isMuted ? 0 : 1;
    captureSoundRef.current.play();

    setTimeout(() => {
      if (audioRef.current && !isMuted) {
        audioRef.current.volume = 1;
      }
    }, 700);
  };

  const playCheckSoundWithFade = () => {
    if (!checkSoundRef.current) return;
    checkSoundRef.current.currentTime = 0;
    checkSoundRef.current.volume = isMuted ? 0 : 1;
    checkSoundRef.current.play();
  };

  return {
    playMoveSoundWithFade,
    playCaptureSoundWithFade,
    playCheckSoundWithFade,
    audioRef, // 👈 now you can control background music manually
  };
};
