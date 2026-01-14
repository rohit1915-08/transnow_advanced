"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Volume2, Loader2, Speech, Snowflake } from "lucide-react";
import WorldBackground from "@/components/WorldBackground";

export default function Home() {
  const [text, setText] = useState<string>("");
  const [translation, setTranslation] = useState<string>("");
  const [targetLangCode, setTargetLangCode] = useState<string>("hi-IN");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSnowing, setIsSnowing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length) setVoices(v);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const supportedLanguages = [
    { code: "hi-IN", name: "Hindi (India)" },
    { code: "bn-IN", name: "Bengali (India)" },
    { code: "ta-IN", name: "Tamil (India)" },
    { code: "te-IN", name: "Telugu (India)" },
    { code: "mr-IN", name: "Marathi (India)" },
    { code: "gu-IN", name: "Gujarati (India)" },
    { code: "kn-IN", name: "Kannada (India)" },
    { code: "ml-IN", name: "Malayalam (India)" },
    { code: "pa-IN", name: "Punjabi (India)" },
    { code: "en-US", name: "English (USA)" },
    { code: "es-ES", name: "Spanish (Spain)" },
    { code: "fr-FR", name: "French (France)" },
    { code: "de-DE", name: "German (Germany)" },
    { code: "ja-JP", name: "Japanese (Japan)" },
    { code: "zh-CN", name: "Chinese (Mandarin)" },
    { code: "ru-RU", name: "Russian" },
    { code: "ar-SA", name: "Arabic" },
  ];

  const speak = (txt: string) => {
    if (!txt) return;

    const voice =
      voices.find((v) => v.lang === targetLangCode) ||
      voices.find((v) => v.lang.startsWith(targetLangCode.split("-")[0]));

    if (voice) {
      console.log("Using local browser voice:", voice.name);
      const utterance = new SpeechSynthesisUtterance(txt);
      utterance.voice = voice;
      utterance.lang = targetLangCode;
      utterance.rate = 0.9;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
      return;
    }

    console.log("Local voice missing. Fetching from Proxy...");
    const langBase = targetLangCode.split("-")[0];
    const url = `/api/tts?text=${encodeURIComponent(txt)}&lang=${langBase}`;
    const audio = new Audio(url);
    audio.play().catch((e) => console.error("Playback failed:", e));
  };

  const getMimeType = () => {
    const types = ["audio/webm", "audio/mp4", "audio/ogg", "audio/wav"];
    for (const type of types) {
      if (
        typeof MediaRecorder !== "undefined" &&
        MediaRecorder.isTypeSupported(type)
      ) {
        return type;
      }
    }
    return "audio/webm";
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });

      const mimeType = getMimeType();
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const extension = mimeType
          .split("/")[1]
          .replace("codecs=opus", "")
          .replace(";", "");
        await processAudio(audioBlob, extension);
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setText("");
      setTranslation("");
    } catch (e) {
      alert("Mic Error. Check Permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  };

  const processAudio = async (blob: Blob, extension: string) => {
    const formData = new FormData();
    formData.append("file", blob, `recording.${extension}`);

    const selectedLangObj = supportedLanguages.find(
      (l) => l.code === targetLangCode
    );
    formData.append(
      "language",
      selectedLangObj ? selectedLangObj.name : "English"
    );

    try {
      const res = await fetch("/api/process-audio", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      setText(data.original);
      setTranslation(data.translated);
      speak(data.translated);
    } catch (e: any) {
      console.error(e);
      setText(`Error: ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="relative min-h-screen text-white overflow-hidden font-sans">
      <WorldBackground isSnowing={isSnowing} />
      <div className="relative z-10 flex flex-col min-h-screen bg-black/40 ">
        <header className="p-6 border-b border-white/10 flex flex-col md:flex-row gap-4 justify-between items-center bg-black/20">
          <div className="flex items-center gap-2">
            <Speech className="text-blue-400 w-8 h-8" />
            <h1 className="text-2xl font-bold tracking-tighter">
              Trans<span className="text-blue-400">Now</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className=" text-xs font-bold text-white/50 uppercase tracking-widest">
              Snow
            </span>
            <button
              onClick={() => setIsSnowing(!isSnowing)}
              className={`
                group relative h-8 w-8 rounded-full transition-all duration-300 border border-white/10 cursor-pointer
                ${
                  isSnowing
                    ? "bg-teal-900/40 border-blue-500/30"
                    : "bg-neutral-900/50 hover:bg-neutral-800"
                }
              `}
              title="Toggle Snow"
            >
              <div
                className={`
                  absolute top-1 h-6 w-6 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center
                  ${
                    isSnowing
                      ? "left-1 bg-blue-400"
                      : "left-1 bg-neutral-600 group-hover:bg-neutral-500"
                  }
                `}
              >
                <Snowflake
                  className={`w-3.5 h-3.5 ${
                    isSnowing
                      ? "text-black animate-spin-slow"
                      : "text-neutral-300"
                  }`}
                />
              </div>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-white/60 uppercase tracking-widest hidden md:inline">
                To:
              </span>
              <select
                value={targetLangCode}
                onChange={(e) => setTargetLangCode(e.target.value)}
                className="bg-black/50 border border-blue-500/30 text-blue-100 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-400 transition-all cursor-pointer hover:bg-black/70"
              >
                {supportedLanguages.map((lang) => (
                  <option
                    key={lang.code}
                    value={lang.code}
                    className="bg-neutral-900 text-white"
                  >
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-12">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            className={`
                relative w-32 h-32 rounded-full flex items-center justify-center
                transition-all duration-300s]
                ${
                  isRecording
                    ? "bg-blue-900/90 scale-110"
                    : "bg-white-500/20 hover:bg-white-500/30"
                }
                ${isProcessing ? "animate-pulse cursor-not-allowed" : ""}
                border border-white/20 backdrop-blur-md
              `}
          >
            {isProcessing ? (
              <Loader2 className="w-10 h-10 animate-spin text-white-200" />
            ) : (
              <Mic
                className={`w-10 h-10 ${
                  isRecording ? "text-white" : "text-blue-400"
                }`}
              />
            )}
            {isRecording && (
              <div className="absolute inset-0 rounded-full border border-white animate-ping opacity-50" />
            )}
          </button>

          <p className="text-white/80 tracking-widest uppercase text-sm font-semibold">
            {isRecording
              ? "Listening..."
              : isProcessing
              ? "Translating..."
              : "Tap to Speak"}
          </p>

          <div className="grid md:grid-cols-2 gap-6 w-full max-w-5xl">
            <div className="min-h-50 p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md flex flex-col transition-all hover:bg-white/10">
              <span className="text-xs uppercase text-white/40 mb-4 font-bold tracking-wider">
                Original
              </span>
              <p className="text-xl text-white/90 leading-relaxed font-light">
                {text || "..."}
              </p>
            </div>

            <div className="min-h-50 p-6 rounded-2xl border border-blue-500/30 bg-blue-900/10 backdrop-blur-md flex flex-col transition-all hover:bg-blue-900/20">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs uppercase text-blue-400/60 font-bold tracking-wider">
                  {
                    supportedLanguages.find((l) => l.code === targetLangCode)
                      ?.name
                  }
                </span>
                {translation && (
                  <Volume2
                    onClick={() => speak(translation)}
                    className="w-5 h-5 text-blue-400 cursor-pointer hover:text-white"
                  />
                )}
              </div>
              <p className="text-2xl text-blue-50 font-medium leading-relaxed">
                {translation || "..."}
              </p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-4 right-4 z-50">
          <p className="text-[10px] md:text-xs font-mono text-white/50 hover:text-white/60 transition-colors select-none">
            © @rohit1915-08
          </p>
        </div>
      </div>
    </main>
  );
}
