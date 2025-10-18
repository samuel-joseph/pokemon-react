import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTeam } from "./TeamContext";
import { regions } from "../helper/region";
import { getToken } from "../services/authService";
import { updateRecord, incrementRegionWin, getRecord } from "../services/recordService";

const BattleResult = ({ outcome }) => {
  const navigate = useNavigate();
  const {
    team,
    setTeam,
    setNpcTeam,
    setNpc,
    addTrophy,
    npc,
    trophy,
    region,
    inventory,
    setInventory,
    name,
  } = useTeam();

  useEffect(() => {
    if (outcome === "win") handleWin();
    else handleLoss();
  }, [outcome]);

  // 🏆 Handle winning logic
  const handleWin = async () => {
    const token = getToken();
    // setInventory((prev) => [...prev, ...team]);
    if (token && name!== "") {
      try {
        // Check existing records first
        const response = await getRecord(name);

        // If player already has this region, increment its win count
        const regionExists = response.record.some(
          (r) => r.region.toLowerCase() === region.toLowerCase()
        );

        // Remove duplicates by 'pokemon'
        const pokemon = team

        if (regionExists) {
          await incrementRegionWin(name, region, pokemon);
        } else {
          await updateRecord(name, { region, pokemon, win: 1 });
        }

        // Update trophy progress if region newly cleared
        const index = regions.findIndex((r) => r === region);
        if (trophy !== index + 1) addTrophy();

      } catch (err) {
        console.error("Error updating win record:", err);
      }

      setTimeout(() => resetAndRedirect(), 3000);
    } else {
      setTimeout(() => { 
        navigate("/signup");
      },3000)
    }
  };

  const handleLoss = () => {
    setTimeout(() => resetAndRedirect(), 3000);
  };

  const resetAndRedirect = () => {
    setTeam([]);
    setInventory([]);
    setNpc([]);
    setNpcTeam([]);

    setNpcTeam(
      npc?.gymLeaders?.[0]?.pokemon?.map((p) => ({
        ...p,
        currentHP: p.hp,
      })) || []
    );

    navigate("/region", { replace: true });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-gray-700 p-6">
      {outcome === "win" ? (
        <>
          <h1 className="text-5xl sm:text-6xl font-extrabold text-green-400 mb-4 animate-bounce text-center">
            🎉 Congratulations! 🎉
          </h1>
          <p className="text-xl sm:text-2xl text-white text-center">
            You defeated the Champion of {region}!
          </p>
        </>
      ) : (
        <>
          <h1 className="text-5xl sm:text-6xl font-extrabold text-red-600 mb-4 animate-pulse text-center">
            ❌ You Lost ❌
          </h1>
          <p className="text-xl sm:text-2xl text-white text-center">
            Better luck next time! Try again to defeat the Champion of {region}.
          </p>
        </>
      )}

      <div className="mt-8">
        <p className="text-gray-300 italic animate-pulse">
          Redirecting back to regions...
        </p>
      </div>
    </div>
  );
};

export default BattleResult;




// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useTeam } from "./TeamContext";
// import { regions } from "../helper/region";
// import { getToken } from "../services/authService";

// const BattleResult = ({ outcome }) => {
//   const navigate = useNavigate();
//   const {
//     setTeam,
//     setNpcTeam,
//     setNpc,
//     addTrophy,
//     npc,
//     trophy,
//     region,
//     inventory,
//     setInventory,
//     name,
//   } = useTeam();

//   const isGuest = getToken();

//   const [showSignupPrompt, setShowSignupPrompt] = useState(false);

//   useEffect(() => {
//     if (outcome === "win" && isGuest) {
//       setShowSignupPrompt(true);
//       return;
//     }

//     const timer = setTimeout(() => {
//       resetAndRedirect();
//     }, 3000);

//     return () => clearTimeout(timer);
//   }, [outcome, isGuest]);

//   const resetAndRedirect = () => {
//     setTeam([]);
//     setInventory([]);
//     setNpc([]);
//     setNpcTeam([]);

//     setNpcTeam(
//       npc?.gymLeaders?.[0]?.pokemon?.map((p) => ({
//         ...p,
//         currentHP: p.hp,
//       })) || []
//     );

//     const index = regions.findIndex((r) => r === region);

//     if (outcome === "win" && trophy !== index + 1) {
//       addTrophy();
//     }

//     navigate("/region", { replace: true });
//   };

//   const handleContinueGuest = () => {
//     setShowSignupPrompt(false);
//     resetAndRedirect();
//   };

//   const handleSignup = () => {
//     // Redirect to signup page but include progress info
//     navigate("/signup", {
//       state: { inventory, region, trophy },
//     });
//   };

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-gray-700 p-6 relative">
//       {outcome === "win" ? (
//         <>
//           <h1 className="text-5xl sm:text-6xl font-extrabold text-green-400 mb-4 animate-bounce text-center">
//             🎉 Congratulations! 🎉
//           </h1>
//           <p className="text-xl sm:text-2xl text-white text-center">
//             You defeated the Champion of {region}!
//           </p>
//         </>
//       ) : (
//         <>
//           <h1 className="text-5xl sm:text-6xl font-extrabold text-red-600 mb-4 animate-pulse text-center">
//             ❌ You Lost ❌
//           </h1>
//           <p className="text-xl sm:text-2xl text-white text-center">
//             Better luck next time! Try again to defeat the Champion of {region}.
//           </p>
//         </>
//       )}

//       <div className="mt-8">
//         <p className="text-gray-300 italic animate-pulse">
//           Redirecting back to regions...
//         </p>
//       </div>

//       {/* ✅ Signup Prompt */}
//       {showSignupPrompt && (
//         <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center">
//           <div className="bg-white p-6 rounded-xl shadow-lg text-center w-80">
//             <h2 className="text-xl font-bold mb-4">Save your progress?</h2>
//             <p className="text-gray-600 mb-6">
//               Create an account to keep your trophies and Pokémon!
//             </p>
//             <div className="flex justify-around">
//               <button
//                 onClick={handleContinueGuest}
//                 className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
//               >
//                 Continue as Guest
//               </button>
//               <button
//                 onClick={handleSignup}
//                 className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
//               >
//                 Sign Up
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default BattleResult;
