// import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

// const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;

// const elevenlabs = new ElevenLabsClient({ apiKey: ELEVENLABS_API_KEY });

// export const speak = async (text) => {
//   try {
//     // Convert text to speech (returns ReadableStream in browser)
//     const audioStream = await elevenlabs.textToSpeech.convert(
//       "JBFqnCBsd6RMkjVDRZzb",
//       {
//         text,
//         modelId: "eleven_multilingual_v2",
//         outputFormat: "mp3_44100_128",
//         voiceSettings: { stability: 0.75, similarityBoost: 0.75 },
//       }
//     );

//     // Read the stream into a Blob
//     const reader = audioStream.getReader();
//     const chunks = [];
//     let done, value;
//     while ((({ done, value } = await reader.read()), !done)) {
//       chunks.push(value);
//     }
//     const audioBlob = new Blob(chunks, { type: "audio/mpeg" });

//     // Play the audio
//     const audioUrl = URL.createObjectURL(audioBlob);
//     const audio = new Audio(audioUrl);
//     await audio.play(); // must be triggered by user interaction
//   } catch (err) {
//     console.error("Error generating TTS:", err);
//   }
// };

export const speak = async (text) => {
  if (!text || !window.speechSynthesis) return;

  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);

    // Optional settings
    utterance.lang = "en-US"; // language
    utterance.pitch = 1; // voice pitch
    utterance.rate = 1.1; // speed (0.5 - 2)
    utterance.volume = 1; // volume (0 - 1)

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();

    window.speechSynthesis.speak(utterance);
  });
};
