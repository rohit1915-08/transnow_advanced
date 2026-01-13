import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("file") as File;
    const targetLang = (formData.get("language") as string) || "English";

    if (!audioFile)
      return NextResponse.json({ error: "No audio file" }, { status: 400 });

    const transcription = await groq.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-large-v3",
      response_format: "json",
      language: "en",
    });

    const originalText = transcription.text;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Translate the following text into ${targetLang}. Return ONLY the translated text. Do not add quotes.`,
        },
        { role: "user", content: originalText },
      ],
      model: "llama-3.3-70b-versatile",
    });

    const translatedText = completion.choices[0]?.message?.content || "";

    return NextResponse.json({
      original: originalText,
      translated: translatedText,
    });
  } catch (error: any) {
    console.error("AI Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
