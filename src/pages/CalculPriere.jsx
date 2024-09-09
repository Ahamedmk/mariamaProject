import React, { useState, useContext, useEffect } from "react";
import { PrayerContext } from "../context/PrayerContext";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../store/AuthProvider";

function CalculPriere() {
  const [years, setYears] = useState(0);
  const [months, setMonths] = useState(0);
  const [days, setDays] = useState(0);
  const [menstruationDays, setMenstruationDays] = useState(0);
  const { logOut, user } = useContext(AuthContext); // Utiliser AuthContext pour l'utilisateur connecté
  const navigate = useNavigate();
  const { calculatePrayerCounts } = useContext(PrayerContext); // Utiliser PrayerContext

  useEffect(() => {
    if (!user) {
      navigate("/connection"); // Si l'utilisateur n'est pas connecté, redirige vers la connexion
    }
  }, [user, navigate]);

  // Fonction de calcul et d'enregistrement
  const handleCalculate = () => {
    const totalDays = parseInt(years) * 365 + parseInt(months) * 30 + parseInt(days); // Calculer le nombre total de jours sans prière
    const totalMenstruationDays = menstruationDays * (parseInt(years) * 12 + parseInt(months)); // Calculer le nombre de jours de menstruation
  
    // Calculer et enregistrer les prières à rattraper
    calculatePrayerCounts(totalDays, totalMenstruationDays);
  
    // Rediriger vers le journal
    navigate("/journal");
  };

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "0 auto" }}>
      <h2>Calcul du nombre de prières à rattraper</h2>
      <div>
        <label>Nombre d'années sans prière :</label>
        <input
          type="number"
          value={years}
          onChange={(e) => setYears(e.target.value)}
          min="0"
        />
      </div>
      <div>
        <label>Nombre de mois sans prière :</label>
        <input
          type="number"
          value={months}
          onChange={(e) => setMonths(e.target.value)}
          min="0"
        />
      </div>
      <div>
        <label>Nombre de jours sans prière :</label>
        <input
          type="number"
          value={days}
          onChange={(e) => setDays(e.target.value)}
          min="0"
        />
      </div>
      <div>
        <label>Nombre moyen de jours de menstruation par mois :</label>
        <input
          type="number"
          value={menstruationDays}
          onChange={(e) => setMenstruationDays(e.target.value)}
          min="0"
        />
      </div>
      <button onClick={handleCalculate}>Calculer</button>
      <button onClick={() => logOut()}>Déconnexion</button>
    </div>
  );
}

export default CalculPriere;
