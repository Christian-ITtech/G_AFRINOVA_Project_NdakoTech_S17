// =========================================================================
// 1. LES IMPORTATIONS
// =========================================================================
// useState est le Hook fondamental de React pour gérer la mémoire (l'état) d'un composant.
// Ici, il va retenir quelle photo est actuellement affichée en grand à l'écran.
import { useState } from 'react';

// =========================================================================
// 2. LE COMPOSANT REACT (La galerie interactive)
// =========================================================================
/**
 * Affiche une image principale interactive avec une liste de miniatures cliquables.
 * @param {string[]} props.photos - Le tableau contenant les URLs complètes de vos images
 * @param {string} props.titre - Le titre du logement (pour l'accessibilité des images)
 */
export default function PhotoGallery({ photos, titre }) {
  // DÉCLARATION DE L'ÉTAT : 
  // - index : Contient le numéro de la photo active (commence à 0, soit la 1ère photo).
  // - setIndex : La fonction magique qui permettra de changer ce numéro et de forcer React à redessiner l'écran.
  const [index, setIndex] = useState(0);

  // ÉCRAN DE SECOURS (Cas limite) :
  // Si le tableau ne contient absolument aucune image, on arrête le composant ici
  // et on renvoie un rectangle vide élégant géré par la classe ".galerie-vide" de votre CSS.
  if (photos.length === 0) {
    return <div className="galerie-vide">Aucune photo pour ce logement</div>;
  }

  return (
    <div className="galerie">
      
      {/* 2.1 PHOTO PRINCIPALE (Le grand format)
          - src : Va chercher l'URL située à la position du numéro actif dans le tableau (ex: photos[0], photos[1]).
          - alt : Construit dynamiquement une description pour les malvoyants (ex: "Chambre à Makélékélé, photo 1").
          - className : Applique le style ".galerie-principale" (hauteur max de 460px et rognage propre). */}
      <img 
        className="galerie-principale" 
        src={photos[index]} 
        alt={`${titre}, photo ${index + 1}`} 
      />

      {/* 2.2 ZONE DES MINIATURES
          Rendu conditionnel : On affiche la liste des petites images SEULEMENT s'il y a plus d'une photo.
          Inutile d'afficher une liste de miniatures si le logement n'a qu'une seule image ! */}
      {photos.length > 1 && (
        // Cette div correspond à la ligne horizontale défilante (.galerie-miniatures) de votre CSS
        <div className="galerie-miniatures">
          
          {/* Boucle .map() : On parcourt chaque URL d'image du tableau une par une */}
          {photos.map((p, i) => (
            
            // Chaque miniature est encapsulée dans un bouton pour être accessible au clavier
            <button
              key={p} // Identifiant unique requis par React (ici l'URL elle-même)
              type="button"
              
              // CLASSE DYNAMIQUE : Si l'index de la boucle (i) est égal à la photo affichée en grand (index),
              // on lui ajoute la classe '.actif'. Votre CSS va alors dessiner une jolie bordure verte autour.
              className={i === index ? 'actif' : ''}
              
              // ÉVÉNEMENT AU CLIC : Quand on clique sur cette miniature, on appelle setIndex(i).
              // L'état change, la valeur "index" prend le numéro de la miniature, et tout l'écran se met à jour !
              onClick={() => setIndex(i)}
              
              // Accessibilité : Permet aux lecteurs d'écran d'énoncer l'action du bouton
              aria-label={`Voir la photo ${i + 1}`}
            >
              {/* L'image miniature proprement dite (88px par 64px dans votre CSS).
                  Elle est chargée avec loading="lazy" pour économiser la bande passante de l'utilisateur. */}
              <img src={p} alt="" loading="lazy" />
              
            </button>
          ))}
          
        </div>
      )}
      
    </div>
  );
}
