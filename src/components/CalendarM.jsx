import { useState, useContext, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import CommentDisplay from "./CommentDisplay";
import { PrayerContext } from "../context/PrayerContext";
import { AuthContext } from "../store/AuthProvider";
import { ref, get, set, update } from "firebase/database";
import { db } from "../firebase";

function CalendarM() {
  const [value, setValue] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState({});
  const [selectedPrayers, setSelectedPrayers] = useState({
    Soubh: false,
    Dohr: false,
    Asr: false,
    Maghrib: false,
    Icha: false,
  });

  const { logOut, user } = useContext(AuthContext);
  const { prayerCounts, setPrayerCounts } = useContext(PrayerContext);

  useEffect(() => {
    if (user) {
      fetchUserData(user.uid);
      fetchComments(user.uid);
    }
  }, [user]);

  // Récupération des prières et commentaires depuis Firebase
  const fetchUserData = async (userId) => {
    try {
      const prayerCountsRef = ref(db, `users/${userId}/prayerCounts`);
      const snapshot = await get(prayerCountsRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        setPrayerCounts(data);
        console.log("Données de prières récupérées :", data);
      } else {
        console.log("Aucune donnée trouvée pour cet utilisateur.");
      }
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des données de prière :",
        error
      );
    }
  };

  const fetchComments = async (userId) => {
    try {
      const commentsRef = ref(db, `users/${userId}/comments`);
      const snapshot = await get(commentsRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        setComments(data);
        console.log("Commentaires récupérés :", data);
      } else {
        console.log("Aucun commentaire trouvé pour cet utilisateur.");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des commentaires :", error);
    }
  };

  // Sauvegarde des commentaires et mise à jour des prières dans Firebase
  const handleSaveComment = async () => {
    const formattedDate = format(value, "yyyy-MM-dd");
    const updatedPrayerCounts = { ...prayerCounts };

    Object.keys(selectedPrayers).forEach((prayer) => {
      if (selectedPrayers[prayer]) {
        updatedPrayerCounts[prayer] = Math.max(
          0,
          updatedPrayerCounts[prayer] - 1
        );
      }
    });

    setPrayerCounts(updatedPrayerCounts);

    const newComments = {
      ...comments,
      [formattedDate]: {
        comment,
        prayers: { ...selectedPrayers },
      },
    };

    setComments(newComments);

    try {
      const userRef = ref(db, `users/${user.uid}`);

      // Sauvegarde des commentaires
      const commentsRef = ref(
        db,
        `users/${user.uid}/comments/${formattedDate}`
      );
      await set(commentsRef, {
        comment,
        prayers: selectedPrayers,
      });

      // Mise à jour des prières dans Firebase
      const prayerCountsRef = ref(db, `users/${user.uid}/prayerCounts`);
      await update(prayerCountsRef, updatedPrayerCounts);

      console.log("Commentaire et prières mis à jour avec succès !");
    } catch (error) {
      console.error(
        "Erreur lors de la sauvegarde du commentaire et de la mise à jour des prières :",
        error
      );
    }

    setShowModal(false);
  };

  // Fonction pour réouvrir la modale pour modifier le commentaire et les prières
  const handleEditComment = () => {
    setShowModal(true);
  };

  const handleChange = (date) => {
    setValue(date);
    const existingComment = comments[format(date, "yyyy-MM-dd")];
    if (existingComment) {
      setComment(existingComment.comment);
      setSelectedPrayers(existingComment.prayers);
      setShowModal(false);
    } else {
      setComment("");
      setSelectedPrayers({
        Soubh: false,
        Dohr: false,
        Asr: false,
        Maghrib: false,
        Icha: false,
      });
      setShowModal(true);
    }
  };

  const formattedDate = format(value, "dd MMMM yyyy", { locale: fr });

  return (
    <div className="p-4 border border-primary">
      <Button variant="link" onClick={() => logOut()}>
        Déconnexion
      </Button>
      <Calendar className="mx-auto" onChange={handleChange} value={value} />

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Ajouter/Modifier un commentaire</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="prayers">
              <Form.Label>Sélectionner les prières rattrapées :</Form.Label>
              {["Soubh", "Dohr", "Asr", "Maghrib", "Icha"].map((prayer) => (
                <Form.Check
                  key={prayer}
                  type="checkbox"
                  label={prayer}
                  name={prayer}
                  checked={selectedPrayers[prayer]}
                  onChange={(e) =>
                    setSelectedPrayers({
                      ...selectedPrayers,
                      [prayer]: e.target.checked,
                    })
                  }
                />
              ))}
            </Form.Group>
            <Form.Group controlId="comment">
              <Form.Label>Commentaire</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Fermer
          </Button>
          <Button variant="primary" onClick={handleSaveComment}>
            Enregistrer
          </Button>
        </Modal.Footer>
      </Modal>

      <CommentDisplay
        comment={comments[format(value, "yyyy-MM-dd")]?.comment}
        date={formattedDate}
        onEdit={handleEditComment} // Passe la fonction d'édition à CommentDisplay
      />

      <div className="text-center mt-3">
        <h5>Prières restantes :</h5>
        <ul>
          {Object.entries(prayerCounts).map(([prayer, count]) => (
            <li key={prayer}>
              {prayer} : {count} prières restantes
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default CalendarM;
