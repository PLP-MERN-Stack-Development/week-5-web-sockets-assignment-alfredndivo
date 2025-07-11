const audio = new Audio('/notif.mp3'); // Place notif.mp3 in /public/

export const playSound = () => {
  try {
    audio.currentTime = 0;
    audio.play();
  } catch (err) {
    console.warn('Sound play failed:', err);
  }
};
