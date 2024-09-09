import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../store/AuthProvider";
import { toast } from "react-toastify";

export default function Connection() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { loginUser, verifyUserSetup } = useContext(AuthContext); // Ajout de `verifyUserSetup`
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); // Gestion du chargement

  

  const onSubmit = async (data) => {
    if (loading) return;
  
    setLoading(true);
  
    try {
      console.log("Tentative de connexion avec", data.email);
      const userCredential = await loginUser(data.email, data.password); // Connexion de l'utilisateur
  
      if (userCredential) {
        console.log("Utilisateur connecté avec succès :", userCredential.user);
  
        // Vérifie si l'utilisateur a complété sa configuration
        const isSetupComplete = await verifyUserSetup(userCredential.user); // Fais attention au temps de réponse ici
        console.log("Vérification de la configuration terminée :", isSetupComplete);
  
        setLoading(false);
  
        // Redirection selon isSetupComplete
        if (isSetupComplete) {
          console.log("Redirection vers /journal");
          navigate("/journal");
        } else {
          console.log("Redirection vers /calcul-priere");
          navigate("/calcul-priere");
        }
      }
    } catch (error) {
      console.error("Erreur lors de la connexion :", error);
      setLoading(false);
      const { code } = error;
  
      // Gestion des erreurs de connexion
      if (code === "auth/user-not-found") {
        toast.error("Cet email n'est pas utilisé.");
      } else if (code === "auth/wrong-password") {
        toast.error("Mot de passe incorrect.");
      } else {
        toast.error("Erreur lors de la connexion.");
      }
    }
  };
  

  return (
    <>
      <h1 className="mt-5 text-center">Connexion</h1>
      <div className="mx-auto mt-5 px-3 py-4 w-50 border border-dark border-2 rounded">
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Adresse mail</Form.Label>
            <Form.Control
              type="email"
              placeholder="Entrez votre email"
              {...register("email", {
                required: true,
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                  message: "Renseignez une adresse valide",
                },
              })}
            />
            {errors.email && (
              <p className="text-danger">{errors.email.message}</p>
            )}
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>Mot de passe</Form.Label>
            <Form.Control
              type="password"
              placeholder="Entrez votre mot de passe"
              {...register("password", {
                required: true,
                minLength: {
                  value: 8,
                  message: "Le mot de passe doit contenir au moins 8 caractères",
                },
              })}
            />
            {errors.password && (
              <p className="text-danger">{errors.password.message}</p>
            )}
          </Form.Group>

          <Button variant="primary" type="submit" className="w-100" disabled={loading}>
            {loading ? "Connexion en cours..." : "Se connecter"}
          </Button>
        </Form>

        <Link to="/inscription">
          <Button variant="success" className="mx-auto mt-4 w-100">
            Créer un nouveau compte
          </Button>
        </Link>
      </div>
    </>
  );
}
