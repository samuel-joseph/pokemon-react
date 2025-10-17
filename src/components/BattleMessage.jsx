import { useEffect, useState } from "react";

function BattleMessage({ battleMessage }) {
  const [displayText, setDisplayText] = useState("");

  // useEffect(() => {
  //   if (!battleMessage) {
  //     setDisplayText("");
  //     return;
  //   }

  //   setDisplayText(""); // reset immediately

  //   // Split message into sentences; fallback to full message if regex fails
  //   const sentences = battleMessage.match(/[^.!?]+[.!?]?/g) || [battleMessage];
  //   let index = 0;

  //   const interval = setInterval(() => {
  //     if (index >= sentences.length) {
  //       clearInterval(interval);
  //       return;
  //     }

  //     const sentence = sentences[index];
  //     if (sentence) {
  //       setDisplayText((prev) => prev + sentence.trim() + " ");
  //     }
  //     index++;
  //   }, 1000); // adjust speed between sentences

  //   return () => clearInterval(interval);
  // }, [battleMessage]);

  return (
    <div className="w-half border-2 border-black bg-white text-black p-2 text-center text-sm font-mono whitespace-pre-line rounded-md">
      {displayText}
    </div>
  );
}

export default BattleMessage;
