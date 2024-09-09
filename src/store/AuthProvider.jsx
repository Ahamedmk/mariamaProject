import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { createContext, useEffect, useState } from "react";
import { auth } from "../firebase";
import { ref, get } from "firebase/database"; // Importer pour Realtime Database
import { db } from "../firebase"; // Instance de la base de données

export const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Stocker l'utilisateur
  const [loading, setLoading] = useState(true); // Stocker l'état de chargement
  const [newUser, setNewUser] = useState(false); // Indiquer si c'est un nouvel utilisateur

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe(); // Nettoyage lors du démontage
  }, []);

  // Fonction pour déconnecter l'utilisateur
  const logOut = () => {
    setNewUser(false); // Réinitialiser l'état newUser lors de la déconnexion
    return signOut(auth);
  };

  // Fonction pour inscrire un utilisateur
  const createUser = async (email, password) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    setNewUser(true); // Indiquer que c'est un nouvel utilisateur
    return userCredential.user; // Retourner l'utilisateur pour la gestion ultérieure
  };

  // Fonction pour connecter un utilisateur existant
  const loginUser = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential; // IMPORTANT : Retourner `userCredential` pour que l'objet utilisateur soit bien renvoyé
  };

  // Vérifier si l'utilisateur a complété sa configuration après la connexion
  const verifyUserSetup = async (user) => {
    try {
      const userRef = ref(db, `users/${user.uid}`);
      const snapshot = await get(userRef);
  
      if (snapshot.exists()) {
        const userData = snapshot.val();
        console.log("Données de l'utilisateur :", userData);
        
        // Si isSetupComplete n'existe pas ou est false, retourne false
        return userData.isSetupComplete === true;
      } else {
        console.log("Aucune donnée trouvée pour cet utilisateur.");
        return false;
      }
    } catch (error) {
      console.error("Erreur lors de la vérification de la configuration utilisateur :", error);
      return false;
    }
  };
  
  
  

  const authValue = {
    user,
    loading,
    newUser, // Expose l'état newUser dans le contexte
    logOut,
    createUser,
    loginUser, // Fonction de connexion
    verifyUserSetup, // Expose la fonction pour l'utiliser dans les composants
  };

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
