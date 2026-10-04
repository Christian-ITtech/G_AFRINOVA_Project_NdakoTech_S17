import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchQuartiers } from '../api/logements';
import { VILLES, TYPES_BIEN } from '../utils/format'; // On importe la constante TYPES_BIEN

export default function SearchForm({ initial = {} }) {
  const navigate = useNavigate();
  const [ville, setVille] = useState(initial.ville || '');
  const [quartier, setQuartier] = useState(initial.quartier || '');
  const [loyerMax, setLoyerMax] = useState(initial.loyer_max || '');
  
  // ==========================================
  // 1. NOUVEAUX ÉTATS POUR LES FILTRES DEMANDÉS
  // ==========================================
  const [typeBien, setTypeBien] = useState(initial.type_bien || ''); // Filtre Type de bien
  const [eauCourante, setEauCourante] = useState(initial.eau_courante === 'true'); // Case Eau courante (booléen)
  const [compteurElectrique, setCompteurElectrique] = useState(initial.compteur_electrique === 'true'); // Case Électricité (booléen)

  const [quartiers, setQuartiers] = useState([]);
  const [erreur, setErreur] = useState('');

  // Chargement dynamique des quartiers selon la ville sélectionnée
  useEffect(() => {
    if (!ville) { setQuartiers([]); return; }
    let actif = true;
    fetchQuartiers(ville)
      .then((liste) => actif && setQuartiers(liste))
      .catch(() => actif && setQuartiers([]));
    return () => { actif = false; };
  }, [ville]);

  function changerVille(e) {
    setVille(e.target.value);
    setQuartier('');
    setErreur('');
  }

  // ==========================================
  // 2. FONCTION DE SOUMISSION AVEC LES NOUVEAUX FILTRES
  // ==========================================
  function soumettre(e) {
    e.preventDefault();
    if (!ville) return setErreur('Choisissez une ville pour filtrer précisément.');
    if (loyerMax !== '' && (Number.isNaN(Number(loyerMax)) || Number(loyerMax) < 0)) {
      return setErreur('Le loyer maximum doit être un nombre positif.');
    }

    // On prépare les paramètres de l'URL
    const params = new URLSearchParams({ ville });
    if (quartier) params.set('quartier', quartier);
    if (loyerMax !== '') params.set('loyer_max', loyerMax);
    
    // Ajout des nouveaux paramètres s'ils sont sélectionnés
    if (typeBien) params.set('type_bien', typeBien);
    if (eauCourante) params.set('eau_courante', 'true');
    if (compteurElectrique) params.set('compteur_electrique', 'true');

    // Redirection vers les résultats filtrés
    navigate(`/resultats?${params}`);
  }

  // ==========================================
  // 3. ACTION POUR LE BOUTON "LISTER TOUT"
  // ==========================================
  /**
   * Cette fonction contourne les filtres obligatoires et redirige
   * directement vers la page des résultats pour afficher l'ensemble du catalogue.
   */
  function listerTout() {
    navigate('/resultats?action=tous');
  }

  // ==========================================
  // 4. RENDU VISUEL DU FORMULAIRE ENRICHI
  // ==========================================
  return (
    <form className="recherche" onSubmit={soumettre}>
      {/* Grille principale des champs de saisie */}
      <div className="recherche-champs">
        
        {/* Ville */}
        <div className="champ">
          <label htmlFor="ville">Ville</label>
          <select id="ville" value={ville} onChange={changerVille}>
            <option value="">Choisir une ville</option>
            {VILLES.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>

        {/* Quartier */}
        <div className="champ">
          <label htmlFor="quartier">Quartier</label>
          <select id="quartier" value={quartier} onChange={(e) => setQuartier(e.target.value)} disabled={!ville}>
            <option value="">Tous les quartiers</option>
            {quartiers.map((q) => <option key={q} value={q}>{q}</option>)}
          </select>
        </div>

        {/* NOUVEAU CHAMP : Type de bien */}
        <div className="champ">
          <label htmlFor="typeBien">Type de logement</label>
          <select id="typeBien" value={typeBien} onChange={(e) => setTypeBien(e.target.value)}>
            <option value="">Tous les types</option>
            {/* On boucle dynamiquement sur le tableau TYPES_BIEN de format.js */}
            {TYPES_BIEN.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)} {/* Met la première lettre en majuscule */}
              </option>
            ))}
          </select>
        </div>

        {/* Loyer Maximum */}
        <div className="champ">
          <label htmlFor="loyer">Loyer maximum (FCFA)</label>
          <input
            id="loyer" type="number" min="0" inputMode="numeric" placeholder="Ex. 100000"
            value={loyerMax} onChange={(e) => setLoyerMax(e.target.value)}
          />
        </div>
      </div>

      {/* ==========================================
          5. NOUVELLE ZONE DES CASES À COCHER (Eau / Électricité)
          ========================================== */}
      {/* Ces classes correspondent à la structure de votre composant de formulaire (.cases de votre CSS) */}
      <div className="cases" style={{ marginTop: '12px', marginBottom: '12px' }}>
        <label>
          <input
            type="checkbox"
            checked={eauCourante}
            onChange={(e) => setEauCourante(e.target.checked)}
          />
          Eau courante obligatoirement
        </label>
        
        <label>
          <input
            type="checkbox"
            checked={compteurElectrique}
            onChange={(e) => setCompteurElectrique(e.target.checked)}
          />
          Compteur électrique individuel
        </label>
      </div>

      {erreur && <p className="champ-erreur" role="alert">{erreur}</p>}

      {/* ==========================================
          6. BOUTONS D'ACTIONS (Rechercher & Lister tout)
          ========================================== */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {/* Bouton de recherche classique */}
        <button type="submit" className="bouton bouton-vert" style={{ flex: 1 }}>
          Filtrer la recherche
        </button>

        {/* NOUVEAU BOUTON : Lister Tout
            Le type="button" est CRUCIAL ici pour éviter qu'un clic sur ce bouton ne valide le formulaire */}
        <button type="button" className="bouton" style={{ background: '#e8962e', color: '#fff' }} onClick={listerTout}>
          Voir tous les logements
        </button>
      </div>
    </form>
  );
}
