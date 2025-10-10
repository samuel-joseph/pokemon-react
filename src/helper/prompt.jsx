export const prompt = (
  attacker, move, defender, outcome, hpRemaining
) => {
  return`
    You are a Pokémon battle commentator. Write one very short, exciting sentence about this battle event:
    {
      "attacker": "${attacker}",
      "move": "${move}",
      "defender": "${defender}",
      "outcome": "${outcome}",
      "hpRemaining": ${hpRemaining}
    }`;
}


      const handleSendMessage = async () => {
        if (message.trim()) {
          setResponses(prev => [...prev, { type: 'user', text: message }]);
          setMessage('');
          try {
            const aiResponse = await puter.ai.chat(message, { model: 'gpt-5-nano' }); // Or other models
            setResponses(prev => [...prev, { type: 'ai', text: aiResponse.text }]);
          } catch (error) {
            console.error("Error communicating with AI:", error);
            setResponses(prev => [...prev, { type: 'ai', text: 'Error: Could not get a response.' }]);
          }
        }
      };