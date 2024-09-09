import { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useContext } from "react";
import { AuthContext } from "../store/AuthProvider";

export default function Inscription() {
  //variables
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  const { createUser } = useContext(AuthContext);

  // States
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    if (loading) return;

    setLoading(true);

    createUser(data.email, data.password)
      .then((userCredential) => {
        setLoading(false);
        navigate("/connection");
      })
      .catch((error) => {
        setLoading(false);
        const { code, message } = error;
        if (code == "auth/email-already-in-use") {
          toast.error("Cet email est utilisé.");
        } else {
          toast.error(code);
        }
      });
  };
  return (
    <>
      <h1 className="mt-5 text-center">Inscription</h1>
      <div className=" mx-5 mt-5 px-3 py-4 border border-dark border-2 rounded">
        <Form
          // className="mx-5 mt-5 px-3 py-4  "
          onSubmit={handleSubmit(onSubmit)}
        >
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Adresse mail</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
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
            {/* <Form.Text className="text-muted">
            We'll never share your email with anyone else.
          </Form.Text> */}
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>Mot de passe</Form.Label>
            <Form.Control
              type="password"
              placeholder="Password"
              {...register("password", {
                required: true,
                minLength: {
                  value: 8,
                  message:
                    "Le mot de passe ne peut pas contenir moins de 8 caractères",
                },
              })}
            />
            {errors.password && (
              <p className="text-danger">{errors.password.message}</p>
            )}
          </Form.Group>
          <Form.Group className="mb-3" controlId="formBasicCheckbox">
            <Form.Check type="checkbox" label="Check me out" />
          </Form.Group>
          <Button
            variant="primary"
            type="submit"
            disabled={loading}
            className="w-100"
          >
            S'inscrire
          </Button>
        </Form>

        <div className="text-center pt-1">
          <Link to="/connection">Déja un compte ?</Link>
        </div>
      </div>
    </>
  );
}
