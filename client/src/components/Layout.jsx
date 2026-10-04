// =========================================================================
// 1. LES IMPORTATIONS
// =========================================================================
// Outlet est un composant magique de 'react-router-dom'.
// Il sert de "boîte vide" ou de zone d'injection dynamique pour afficher les composants des sous-routes.
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar'; // Barre de navigation supérieure (Logo, Menu, Connexion...)
import Footer from './Footer'; // Pied de page (Mentions légales, Copyright NdakoTech...)

// =========================================================================
// 2. LE COMPOSANT REACT (Gabarit global de l'application)
// =========================================================================
/**
 * Composant de mise en page commun (Layout).
 * Il définit la structure globale et visuelle identique présente sur toutes vos pages.
 */
export default function Layout() {
  return (
    // Conteneur principal de toute l'application (utile pour appliquer un flexbox ou une grille globale en CSS)
    <div className="app">
      
      {/* La barre de navigation s'affichera toujours en haut, peu importe la page où se trouve l'utilisateur */}
      <Navbar />
      
      {/* Zone principale qui englobe le contenu central pour lui appliquer des marges ou une taille minimale */}
      <main className="app-main">
        
        {/* C'EST ICI QUE LA MAGIE OPÈRE :
            Si l'utilisateur visite l'URL '/', <Outlet /> sera remplacé par le composant de la Page d'accueil.
            Si l'utilisateur visite '/logement/4', <Outlet /> sera remplacé par la Fiche détaillée du logement.
            Grâce à cela, la Navbar et le Footer ne sont rechargés qu'une seule fois ! */}
        <Outlet />
        
      </main>
      
      {/* Le pied de page s'affichera toujours tout en bas de toutes vos pages */}
      <Footer />
      
    </div>
  );
}
