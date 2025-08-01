export const playVoice = async (message: string) => {
  try {
    const res = await fetch("https://api.fpt.ai/hmi/tts/v5", {
      method: "POST",
      headers: {
        "api-key": process.env.TEXT_TO_SPEECH_KEY || "JmoEolL3Is3UQk2uVTvQDlIWP3UByQfu",
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

    // ✅ Thử kiểm tra HEAD (nếu không được, fallback chờ 3s)
    let ready = false;
    const maxRetries = 6; // tổng thời gian thử: ~3s
    for (let i = 0; i < maxRetries; i++) {
      try {
        const check = await fetch(audioUrl, { method: "HEAD" });
        if (check.ok) {
          ready = true;
          break;
        }
      } catch (err) {
        console.warn(`HEAD check thất bại lần ${i + 1}:`, err);
      }
      await new Promise((r) => setTimeout(r, 1500));
    }

    if (!ready) {
      console.warn("Không xác nhận được file có tồn tại qua HEAD, fallback chờ 3s...");
      await new Promise((r) => setTimeout(r, 3000));
    }

    // ✅ Tạo audio và chờ sẵn sàng
    const audio = new Audio(audioUrl);
    await new Promise<void>((resolve, reject) => {
      audio.oncanplaythrough = () => resolve();
      audio.onerror = () =>
        reject(new Error("Không thể tải file âm thanh hoặc bị chặn CORS"));
    });

    await audio.play();
  } catch (err) {
    console.error("Lỗi khi phát âm thanh:", err);
  }
};
