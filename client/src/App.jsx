// =========================================================================
// 1. LES IMPORTATIONS DES OUTILS DE NAVIGATION
// =========================================================================
// - Routes : C'est le conteneur principal qui examine l'adresse URL actuelle du navigateur.
// - Route : C'est une règle d'aiguillage individuelle (Si l'URL est 'X', alors affiche le composant 'Y').
import { Routes, Route } from 'react-router-dom';

// =========================================================================
// 2. LES IMPORTATIONS DE VOS COMPOSANTS ET PAGES
// =========================================================================
import Layout from './components/Layout';               // Le squelette commun (Navbar + Footer)
import HomePage from './pages/HomePage';                 // Page d'accueil (avec le formulaire de recherche)
import ResultatsPage from './pages/ResultatsPage';       // Page qui liste les logements trouvés
import FichePage from './pages/FichePage';               // Page de détails d'un logement (avec la galerie photo)
import PublierPage from './pages/PublierPage';           // Page de formulaire pour ajouter un logement
import InscriptionPage from './pages/InscriptionPage';   // Page de création de compte pour les gestionnaires

// =========================================================================
// 3. LE COMPOSANT PRINCIPAL (Le centre d'aiguillage)
// =========================================================================
function App() {
  return (
    // <Routes> surveille l'URL du navigateur en temps réel. 
    // Dès que l'adresse change, il cherche la règle <Route> correspondante ci-dessous.
    <Routes>
      
      {/* ─── ENCAPSULATION PAR LE LAYOUT (Routes imbriquées) ───
          Remarquez que cette route n'a pas de "path" (chemin). Elle sert de cadre global.
          Toutes les routes écrites à l'intérieur vont automatiquement hériter du composant <Layout />.
          Cela signifie que la Navbar et le Footer entourent toutes les pages listées ci-dessous ! */}
      <Route element={<Layout />}>
        
        {/* RÈGLE 1 : La Page d'accueil
            Si l'adresse est juste la racine du site (ex: http://localhost:5173/) */}
        <Route path="/" element={<HomePage />} />
        
        {/* RÈGLE 2 : La Page des résultats de recherche
            Si l'adresse est '/resultats' (ex: http://localhost:5173/resultats?ville=Brazzaville) */}
        <Route path="/resultats" element={<ResultatsPage />} />
        
        {/* RÈGLE 3 : La Fiche détaillée (Route dynamique)
            Le symbole ":id" est une variable magique. Il dit à React : "Accepte n'importe quel chiffre ou identifiant après /logements/".
            Si l'URL est '/logements/4', React affiche la page FichePage, et cette page saura qu'elle doit charger le logement numéro 4. */}
        <Route path="/logements/:id" element={<FichePage />} />
        
        {/* RÈGLE 4 : La Page de publication d'annonce
            Si l'adresse est '/publier' (ex: http://localhost:5173/publier) */}
        <Route path="/publier" element={<PublierPage />} />
        
        {/* RÈGLE 5 : La Page d'inscription
            Si l'adresse est '/inscription' (ex: http://localhost:5173/inscription) */}
        <Route path="/inscription" element={<InscriptionPage />} />
        
      </Route>
      
    </Routes>
  );
}

export default App;
