# TransNow

### One voice. Every language.

**TransNow** is a next-generation real-time translator that breaks language barriers with zero latency. It combines state-of-the-art AI models (Whisper & Llama 3) with a stunning 3D interactive UI to deliver instant, accurate, and voice-enabled translations.

![TransNow Demo](public/demo-screenshot.png)
_(Replace with your actual screenshot)_

## Features

- ** Real-Time Speech Recognition:** High-fidelity transcription using **Whisper Large V3**.
- ** Context-Aware Translation:** Powered by **Llama 3.3 (70B Versatile)** for nuanced understanding.
- ** Hybrid Voice Output:** Smart client-side synthesis with a **Server-Side Proxy Fallback** to guarantee audio playback on any device.
- ** Immersive 3D UI:** Interactive 3D backgrounds powered by **Spline**.
- ** Edge-Ready Architecture:** Optimized for Vercel deployment with stateless API routes.

---

## Architecture & Real-Time Processing Details

TransNow captures high-fidelity audio, processes it via Groq's AI cloud, and synthesizes speech instantly. Here is the deep dive into the engineering:

### 1. Real-Time Streaming Mechanics

- **Capture:** Uses the `MediaRecorder` API to capture audio blobs (WebM/Opus). We do not rely on the browser's native text recognition (Web Speech API) to ensure higher accuracy across accents.
- **Transport:** Audio is sent as a multipart `FormData` payload via a single HTTP POST request to our Next.js edge API.
- **Visual Feedback:** The 3D background interacts with the user state (recording vs. processing) to provide visual cues without layout shifts.

### 2. Speech-to-Text (STT) Pipeline

- **Engine:** Groq Cloud (Whisper Large V3).
- **Optimization:** We strip silence and force language detection on the server side. Unlike browser-based STT, this handles background noise and technical jargon significantly better.
- **Latency Drivers:** The primary latency factor is the upload speed of the audio blob. We optimize this by using compressed Opus codecs (`audio/webm;codecs=opus`).

### 3. Translation Layer

- **Engine:** Llama 3.3 (70B Versatile) via Groq.
- **Prompt Engineering:** The system prompt is strictly tuned to return _only_ the translated string without conversational filler ("Here is the translation..."), ensuring clean output for the TTS engine.
- **Context:** Currently operates on a "single-turn" basis. Each translation is independent, ensuring stateless scalability.

### 4. Text-to-Speech (TTS) Pipeline (The "Hybrid" Approach)

- **Primary Strategy (Client-Side):** The app first attempts to use `window.speechSynthesis`. This provides zero-latency, offline playback if the user has the specific Language Pack (e.g., "Hindi India") installed.
- **Fallback Strategy (Server Proxy):** If the browser lacks the voice (common on mobile/fresh OS installs), the client automatically hits our internal API route `/api/tts`.
- **The Proxy:** This route acts as a middleman to fetch audio streams from Google's TTS servers, bypassing CORS restrictions and browser security blocks, ensuring the user _always_ hears the translation.

### 5. Latency Considerations

Total round-trip time is optimized by:

1.  **Groq LPU Inference:** Whisper and Llama run on Linear Processing Units (LPUs), delivering results 10x faster than traditional GPUs.
2.  **Parallel Execution:** UI updates (text rendering) happen instantly while the audio buffer is still loading.
3.  **Asset Optimization:** The 3D Spline scene is loaded asynchronously to prevent blocking the main thread during interaction.

---

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React, Tailwind CSS
- **3D Graphics:** Spline (`@splinetool/react-spline`)
- **AI Inference:** Groq SDK (Whisper V3 + Llama 3.3)
- **Audio Handling:** HTML5 MediaRecorder + Web Audio API

---

## Getting Started

### 1. Clone the Repository

```bash
git clone [https://github.com/rohit1915-08/transnow-advanced.git](https://github.com/rohit1915-08/transnow-advanced.git)
cd transnow-advanced
```
