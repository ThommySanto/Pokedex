// Pagina di conferma prima di passare alla ricerca per elemento
export default function ConfirmTypeSearch({ onConfirm, onCancel }) {
  return (
    <div className="confirm">
      <h2>Cerca per elemento?</h2>
      <p>La ricerca per nome sarà sostituita dai filtri per elemento, come Fuoco o Acqua. Potrai tornare indietro quando vuoi.</p>
      <div className="confirm__actions">
        <button className="btn btn--ghost" onClick={onCancel}>B Annulla</button>
        <button className="btn btn--primary" onClick={onConfirm}>A Conferma</button>
      </div>
    </div>
  );
}
