// =========================================================================
// 1. LE DICTIONNAIRE DE CONFIGURATION (L'objet de correspondance)
// =========================================================================
// Cet objet sert de table de correspondance (mapping).
// Pour chaque clé (ex: 'disponible'), on associe un tableau contenant :
// [0] Le texte à afficher à l'écran, [1] La classe CSS de couleur correspondante.
//reel ndoukou
const CONFIG = {
  disponible: ['Disponible', 'badge-dispo'],
  occupe: ['Occupé', 'badge-occupe'],
  verifie: ['✓ Bien vérifié', 'badge-verifie'],
  incomplet: ['Annonce incomplète', 'badge-incomplet'],
};

// =========================================================================
// 2. LE COMPOSANT REACT EXPORTÉ
// =========================================================================
/**
 * Composant réutilisable pour afficher des badges de statut stylisés (Ex: Disponible, Occupé, etc.).
 * @param {string} props.type - Le type de badge attendu (doit correspondre à une clé de CONFIG)
 */
export default function Badge({ type }) {
  // DESTRUCTURING : On va chercher dans l'objet CONFIG la clé qui a été passée en paramètre.
  // Si type = 'disponible', CONFIG['disponible'] renvoie ['Disponible', 'badge-dispo'].
  // Grâce aux crochets [texte, classe], on extrait directement :
  // - texte = 'Disponible'
  // - classe = 'badge-dispo'
  const [texte, classe] = CONFIG[type];

  // RENDU JSX : On retourne la structure HTML du badge.
  // - className : Utilise les "Template Literals" (les backticks ` `) pour fusionner la classe globale
  //   '.badge' avec la classe de couleur spécifique reçue dynamiquement (ex: 'badge-dispo').
  // - {texte} : Injecte le libellé traduit au milieu de la balise.
  return <span className={`badge ${classe}`}>{texte}</span>;
}
