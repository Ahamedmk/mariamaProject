import { createContext, useState, useEffect, useContext } from "react";
import { ref, get, set } from "firebase/database"; // Firebase functions
import { db } from "../firebase"; // Firebase instance
import { AuthContext } from "../store/AuthProvider"; // Pour accéder à l'utilisateur connecté

export const PrayerContext = createContext();

export const PrayerProvider = ({ children }) => {
  const [prayerCounts, setPrayerCounts] = useState({
    Soubh: 0,
    Dohr: 0,
    Asr: 0,
    Maghrib: 0,
    Icha: 0,
  });

  const { user } = useContext(AuthContext); // Récupérer l'utilisateur connecté

  // Fonction pour récupérer les données de Firebase
  const fetchPrayerCounts = async (userId) => {
    try {
      const prayerCountsRef = ref(db, `users/${userId}/prayerCounts`);
      const snapshot = await get(prayerCountsRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        setPrayerCounts(data); // Mettre à jour l'état avec les données récupérées
        console.log("Données de prières récupérées :", data); // Debugging
      } else {
        console.log("Aucune donnée trouvée pour cet utilisateur.");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des données de prière :", error);
    }
  };

  // Utilisation de useEffect pour récupérer les données lors de la connexion de l'utilisateur
  useEffect(() => {
    if (user) {
      fetchPrayerCounts(user.uid);
    }
  }, [user]);

  // Fonction pour calculer les prières à rattraper
  const calculatePrayerCounts = (totalDays, menstruationDays) => {
    const prayerDays = totalDays - menstruationDays;
    const prayersToCatchUp = prayerDays * 5;
  
    const updatedPrayerCounts = {
      Soubh: Math.floor(prayersToCatchUp / 5),
      Dohr: Math.floor(prayersToCatchUp / 5),
      Asr: Math.floor(prayersToCatchUp / 5),
      Maghrib: Math.floor(prayersToCatchUp / 5),
      Icha: Math.floor(prayersToCatchUp / 5),
    };
  
    // Mettre à jour l'état local
    setPrayerCounts(updatedPrayerCounts);
  
    // Enregistrement dans Firebase après calcul
    if (user) {
      const userRef = ref(db, `users/${user.uid}`); // Utilisation de la référence utilisateur
  
      set(userRef, {
        prayerCounts: updatedPrayerCounts,
        isSetupComplete: true, // Ajout de la clé isSetupComplete
      })
        .then(() => {
          console.log("Données de prières et isSetupComplete enregistrées dans Firebase");
        })
        .catch((error) => {
          console.error("Erreur lors de l'enregistrement des données :", error);
        });
    }
  };
  

  return (
    <PrayerContext.Provider value={{ prayerCounts, setPrayerCounts, calculatePrayerCounts }}>
      {children}
    </PrayerContext.Provider>
  );
};
