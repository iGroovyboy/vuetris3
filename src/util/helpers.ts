import SoundMove from "@/assets/move.wav";
import SoundExplosion from "@/assets/explosion.wav";
import SoundFall from "@/assets/fall.wav";
import SoundGameOver from "@/assets/gameover.wav";

export const clone = (obj: unknown) => JSON.parse(JSON.stringify(obj));

// play wav audio file from assets folder
export const playSound = async (sound: string) => {
  const soundsMap = {
    move: SoundMove,
    explosion: SoundExplosion,
    fall: SoundFall,
    gameover: SoundGameOver,
  };

  const audio = new Audio(soundsMap[sound]);
  audio.play();
};
