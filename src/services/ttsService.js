import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;

const elevenlabs = new ElevenLabsClient({ apiKey: ELEVENLABS_API_KEY });

export const speak = async (text) => {
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
