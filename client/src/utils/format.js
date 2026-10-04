// =========================================================================
// 1. FORMATAGE DE LA DEVISE (Le Loyer)
// =========================================================================
/**
 * Aligne un prix numérique sur le standard monétaire francophone avec l'unité FCFA.
 * @param {number} montant - Le prix brut (ex: 25000)
 * @returns {string} Le prix joliment espacé (ex: "25 000 FCFA")
 */
export function formatLoyer(montant) {
  // Intl.NumberFormat('fr-FR') ajoute automatiquement les espaces pour les milliers.
  // On y ajoute simplement le suffixe textuel " FCFA".
  return `${new Intl.NumberFormat('fr-FR').format(montant)} FCFA`;
}

// =========================================================================
// 2. FORMATAGE DE LA DATE (Mise à jour de l'annonce)
// =========================================================================
/**
 * Convertit une date système (ISO de la base de données) en une date écrite en français courant.
 * @param {string|Date} date - La date brute (ex: "2026-10-03T22:00:00.000Z")
 * @returns {string|null} La date rédigée (ex: "3 octobre 2026") ou null si vide
 */
export function formatDate(date) {
  // Sécurité : Si la base de données ne renvoie aucune date, on renvoie null pour éviter de faire planter l'application
  if (!date) return null;
  
  // Convertit la chaîne de caractères en un véritable objet Date JavaScript,
  // puis la traduit en français grâce aux paramètres de configuration (day, month, year)
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',    // Affiche le jour sans zéro inutile (ex: "3" au lieu de "03")
    month: 'long',     // Écrit le mois en toutes lettres (ex: "octobre")
    year: 'numeric',   // Affiche l'année au complet (ex: "2026")
  });
}

// =========================================================================
// 3. CAPITALISATION DU TEXTE (Type de bien)
// =========================================================================
/**
 * Transforme la première lettre d'un mot en majuscule (Capitalize).
 * @param {string} type - Le type brut en minuscule (ex: "chambre")
 * @returns {string} Le type prêt pour l'affichage (ex: "Chambre")
 */
export function libelleType(type) {
  // type.charAt(0).toUpperCase() -> isole la première lettre et la passe en majuscule
  // type.slice(1) -> récupère le reste du mot à partir de la deuxième lettre sans y toucher
  return type ? type.charAt(0).toUpperCase() + type.slice(1) : '';
}

// =========================================================================
// 4. LES CONSTANTES ET MENUS DÉROULANTS (Données globales invariables)
// =========================================================================

// Liste officielle des catégories de logements gérées sur l'application
export const TYPES_BIEN = ['appartement', 'maison', 'studio', 'chambre', 'villa', 'autre'];

// Liste des localisations couvertes par la plateforme NdakoTech en République du Congo
export const VILLES = ['Brazzaville', 'Pointe-Noire'];
