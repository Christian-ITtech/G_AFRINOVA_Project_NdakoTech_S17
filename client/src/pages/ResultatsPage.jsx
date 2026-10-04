import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchRecherche, fetchTous } from '../api/logements';
import LogementCard from '../components/LogementCard';

export default function ResultatsPage() {
  // 1. Outil pour aller lire les filtres écrits dans l'URL (?ville=...&type_bien=...)
  const [searchParams] = useSearchParams();
  const [logements, setLogements] = useState([]);
  const [chargement, setChargement] = useState(true);

  // 2. NOUVEL ÉTAT : Pour retenir le choix du tri de l'utilisateur (ex: croissant, décroissant)
  const [tri, setTri] = useState(''); 

  useEffect(() => {
    setChargement(true);
    
    // On extrait l'action spéciale "lister tout" ou les filtres classiques
    const action = searchParams.get('action');
    
    if (action === 'tous') {
      // Cas du bouton "Voir tous les logements"
      fetchTous()
        .then((data) => setLogements(data))
        .catch((err) => console.error(err))
        .finally(() => setChargement(false));
    } else {
      // Cas de la recherche filtrée par Ville, Quartier, Type, Eau, Électricité
      const filtres = {
        ville: searchParams.get('ville'),
        quartier: searchParams.get('quartier'),
        type_bien: searchParams.get('type_bien'),
        loyer_max: searchParams.get('loyer_max'),
        eau_courante: searchParams.get('eau_courante'),
        compteur_electrique: searchParams.get('compteur_electrique'),
      };

      fetchRecherche(filtres)
        .then((data) => setLogements(data.logements)) // data.logements contient le tableau normalisé
        .catch((err) => console.error(err))
        .finally(() => setChargement(false));
    }
  }, [searchParams]); // On rejoue dès que l'URL change

  // =========================================================================
  // 3. LA LOGIQUE DE TRI CÔTÉ FRONTEND (JavaScript)
  // =========================================================================
  // On crée une copie du tableau et on applique un tri dynamique selon l'état `tri`
  const logementsTries = [...logements].sort((a, b) => {
    if (tri === 'croissant') return a.loyer - b.loyer;       // Du moins cher au plus cher
    if (tri === 'decroissant') return b.loyer - a.loyer;     // Du plus cher au moins cher
    return 0; // Aucun tri par défaut (conserve l'ordre de la BDD)
  });

  if (chargement) return <p>Chargement des logements...</p>;

  return (
    <div className="page-resultats">
      
      {/* BARRE DE TRI HAUTE (Fait écho à la classe ".resultats-entete" de votre CSS) */}
      
      <div className="resultats-entete">
        
        <h2>{logementsTries.length} logement(s) trouvé(s)</h2>
        

        {/* Le sélecteur de tri qui modifie l'état `tri` au changement */}
        <select value={tri} onChange={(e) => setTri(e.target.value)}>
          <option value="">Tri par défaut</option>
          <option value="croissant">Loyer : Croissant</option>
          <option value="decroissant">Loyer : Décroissant</option>
        </select>
      </div>

      {/* AFFICHAGE DE LA GRILLE DES CARTES */}
      {logementsTries.length === 0 ? (
        <p className="message-vide">Aucun logement ne correspond à vos critères de confort.</p>
      ) : (
        <div className="grille-logements">
          {logementsTries.map((logement) => (
            <LogementCard key={logement.id} logement={logement} />
          ))}
        </div>
      )}
      
    </div>
  );
}
