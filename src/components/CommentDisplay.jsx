import React from "react";

function CommentDisplay({ comment, date, onEdit }) {
  return (
    <div className="mt-4 p-3 border border-secondary">
      <h5>Commentaire pour le {date} :</h5>
      <p>{comment || "Aucun commentaire pour cette date."}</p>
      <button onClick={onEdit} className="btn btn-warning">
        Modifier le commentaire et les prières
      </button>
    </div>
  );
}

export default CommentDisplay;
