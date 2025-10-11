import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;

const elevenlabs = new ElevenLabsClient({ apiKey: ELEVENLABS_API_KEY });

export const speakEleven = async (text) => {
  try {
    // Convert text to speech (returns ReadableStream in browser)
    const audioStream = await elevenlabs.textToSpeech.convert(
      "JBFqnCBsd6RMkjVDRZzb",
      {
        text,
        modelId: "eleven_multilingual_v2",
        outputFormat: "mp3_44100_128",
        voiceSettings: { stability: 0.75, similarityBoost: 0.75 },
      }
    );

    // Read the stream into a Blob
    const reader = audioStream.getReader();
    const chunks = [];
    let done, value;
    while ((({ done, value } = await reader.read()), !done)) {
      chunks.push(value);
    }
    const audioBlob = new Blob(chunks, { type: "audio/mpeg" });

    // Play the audio
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    await audio.play(); // must be triggered by user interaction
  } catch (err) {
    console.error("Error generating TTS:", err);
  }
};

export const speakSynthesis = async (text) => {
  if (!text || !window.speechSynthesis) return;

  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();

    // Optional settings
    utterance.voice = voices.find((v) => v.lang === "en-US") || null;
    utterance.lang = "en-US";
    utterance.volume = 1;
    utterance.pitch = 0.15;
    utterance.rate = 0.5;

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();

    window.speechSynthesis.speak(utterance);
  });
};
