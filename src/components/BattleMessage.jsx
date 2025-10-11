import { useEffect, useState } from "react";

function BattleMessage({ battleMessage }) {
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    if (!battleMessage) {
      setDisplayText("");
      return;
    }

    setDisplayText(""); // reset immediately
    let index = -1;

    const interval = setInterval(() => {
      // safety check
      if (index >= battleMessage.length) {
        clearInterval(interval);
        return;
      }

      // append current character
      setDisplayText((prev) => prev + (battleMessage[index] || ""));
      index++;
    }, 40);

    return () => clearInterval(interval);
  }, [battleMessage]);

  return (
    <div className="w-half border-2 border-black bg-white text-black p-2 text-center text-sm font-mono whitespace-pre-line rounded-md">
      {displayText}
    </div>
  );
}

export default BattleMessage;
