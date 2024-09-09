import React, { useContext, Suspense, lazy, useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom"; // Import de Navigate et useNavigate pour la redirection
import { PrayerProvider } from "./context/PrayerContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/ReactToastify.css";
import { AuthContext } from "./store/AuthProvider";

// Lazy loading components
const CalendarM = lazy(() => import("./components/CalendarM"));
const CalculPriere = lazy(() => import("./pages/CalculPriere"));
const Inscription = lazy(() => import("./pages/Inscription"));
const Connection = lazy(() => import("./pages/Connection"));
const Loading = lazy(() => import("./pages/Loading"));

function AppContent() {
  const { createUser, loginUser, verifyUserSetup, user, newUser } = useContext(AuthContext); // Récupération des fonctions du contexte AuthContext
  const navigate = useNavigate(); // Utilisé pour rediriger l'utilisateur
  const [loading, setLoading] = useState(false); // État de chargement

  useEffect(() => {
    if (user) {
      const checkUserSetup = async () => {
        const isSetupComplete = await verifyUserSetup(user);
        if (isSetupComplete) {
          navigate("/journal");
        } else {
          navigate("/calcul-priere");
        }
      };
      checkUserSetup();
    }
  }, [user, navigate]); // Relance ce hook si l'utilisateur ou le navigateur change
  

  // Gestion de l'inscription
  const handleUserSignUp = async (email, password) => {
    setLoading(true); // Activer l'état de chargement
    await createUser(email, password); // Création de l'utilisateur via AuthContext
    setLoading(false); // Désactiver l'état de chargement
    navigate("/connection"); // Rediriger l'utilisateur vers la page de connexion après l'inscription
  };

  // Gestion de la connexion
  const handleUserLogin = async (email, password) => {
    setLoading(true); // Activer l'état de chargement
    const user = await loginUser(email, password); // Connexion de l'utilisateur via AuthContext
    const isSetupComplete = await verifyUserSetup(user); // Vérification si la configuration est complète
    setLoading(false); // Désactiver l'état de chargement

    if (isSetupComplete) {
      navigate("/journal"); // Redirection vers la page du journal si la configuration est complète
    } else {
      navigate("/calcul-priere"); // Redirection vers la page de configuration si non complète
    }
  };

  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {/* Si l'utilisateur est connecté et n'est pas un nouvel utilisateur */}
        {user && !newUser ? (
          <>
            <Route path="/journal" element={<CalendarM />} />
            <Route path="/calcul-priere" element={<CalculPriere />} />
            <Route path="*" element={<Navigate to="/journal" />} /> {/* Redirection par défaut si authentifié */}
          </>
        ) : (
          <>
            {/* Routes accessibles sans authentification ou si nouvel utilisateur */}
            <Route path="/inscription" element={<Inscription onSignUp={handleUserSignUp} />} />
            <Route path="/connection" element={<Connection onLogin={handleUserLogin} />} />
            <Route path="*" element={<Navigate to="/connection" />} /> {/* Redirection par défaut si non authentifié */}
          </>
        )}
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <>
      <ToastContainer theme="dark" position="bottom-right" />
      {/* PrayerProvider englobe les composants pour fournir le contexte des prières */}
      <PrayerProvider>
        <Router>
          <AppContent />
        </Router>
      </PrayerProvider>
    </>
  );
}
