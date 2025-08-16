export const playVoice = async (message: string) => {
  try {
    const res = await fetch("https://api.fpt.ai/hmi/tts/v5", {
      method: "POST",
      headers: {
        "api-key":
          process.env.TEXT_TO_SPEECH_KEY ||
          "JmoEolL3Is3UQk2uVTvQDlIWP3UByQfu",
        speed: "-1",
        voice: "banmai",
        "Content-Type": "text/plain",
      },
      body: message,
    });

    if (!res.ok) {
      console.error("FPT.AI TTS API lỗi:", await res.text());
      return;
    }

    const data = await res.json();
    const audioUrl = data.async;

    if (!audioUrl) {
      console.error("FPT.AI không trả về đường dẫn âm thanh.");
      return;
    }

    let ready = false;
    const maxRetries = 6;
    for (let i = 0; i < maxRetries; i++) {
      try {
        const check = await fetch(audioUrl, { method: "HEAD" });
        if (check.ok) {
          ready = true;
          break;
        }
      } catch {}
      await new Promise((r) => setTimeout(r, 1500));
    }

    if (!ready) {
      await new Promise((r) => setTimeout(r, 3000));
    }

    const ting = new Audio("/tingting.mp3");
    const audio = new Audio(audioUrl);
    await new Promise<void>((resolve, reject) => {
      audio.oncanplaythrough = () => resolve();
      audio.onerror = () =>
        reject(new Error("Không thể tải file âm thanh hoặc bị chặn CORS"));
    });

    await new Promise<void>((resolve) => {
      ting.onended = () => resolve();
      ting.onerror = () => resolve();
      ting.play();
    });
    await audio.play();
  } catch (err) {
    console.error("Lỗi khi phát âm thanh:", err);
  }
};
