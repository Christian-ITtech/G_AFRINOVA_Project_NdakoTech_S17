# NDAKO TECH : Application web (Front-end)

Interface de la plateforme de recherche de logements à **Brazzaville** et **Pointe-Noire**. Le visiteur filtre les annonces, consulte une fiche détaillée avec le loyer ferme (aucune commission) et contacte directement le gestionnaire par WhatsApp ou par téléphone.

![Page d'accueil NDAKO TECH](./public/page.png)

| | |
|---|---|
| **Stack** | React, Vite, React Router, CSS (variables) |
| **Port de développement** | `5173` |
| **API consommée** | `http://localhost:5000/api` (voir `server/README.md`) |
| **Prérequis** | Node.js 20.19+ ou 22.12+ (exigence de Vite) |

**Sommaire** : [Démarrage](#démarrage-rapide) · [Configuration](#variables-denvironnement) · [Architecture](#architecture) · [Pages](#pages-et-routes) · [Composants](#composants) · [API](#communication-avec-lapi) · [Règles d'affichage](#règles-daffichage) · [Style](#style-et-charte-graphique) · [Équipe](#organisation-de-léquipe) · [Workflow Git](#workflow-git) · [Conventions](#conventions-de-code) · [Déploiement](#build-et-déploiement) · [Dépannage](#dépannage)

---

## Démarrage rapide

Le front a besoin de l'API : lancer d'abord le serveur (voir `server/README.md`).

```bash
cd client
cp .env.example .env         # puis vérifier VITE_API_URL
npm install
npm run dev                  # http://localhost:5173
```

| Script | Rôle |
|---|---|
| `npm run dev` | Serveur de développement avec rechargement automatique |
| `npm run build` | Compile le site dans `dist/` (même commande que la production) |
| `npm run preview` | Sert le build local pour le tester |
| `npm run lint` | Vérifie le code avec ESLint |

Le front et l'API sont **deux programmes séparés** : il faut deux terminaux, un par dossier.

## Variables d'environnement

Fichier `client/.env`, jamais commité (seul `.env.example` est versionné).

| Variable | Rôle | Exemple |
|---|---|---|
| `VITE_API_URL` | Adresse de base de l'API, **avec `/api`**, sans `/` final | `http://localhost:5000/api` |

- Seules les variables qui commencent par **`VITE_`** sont visibles par le code React.
- Tout ce qui se trouve dans ce fichier finit **dans le code envoyé au navigateur** : jamais de mot de passe ni de clé secrète.
- Vite lit le `.env` au démarrage : après toute modification, **relancer `npm run dev`**.
- En production, la valeur est lue **au moment du build** : la modifier impose de reconstruire le site.

---

## Architecture

```
client/
├── public/                      # Fichiers à adresse fixe (favicon, hero)
├── docs/accueil.png             # Capture utilisée dans ce README
├── index.html
├── .env.example
└── src/
    ├── main.jsx                 # Point d'entrée : monte React et le routeur
    ├── App.jsx                  # Définition des routes
    ├── index.css                # Variables, polices, styles généraux (importe pages.css)
    ├── pages.css                # Styles des pages et des composants
    ├── api/                     # Appels vers l'API (logement.js)
    ├── components/              # Briques d'interface réutilisables
    │   ├── Layout.jsx           # Cadre commun : Navbar, contenu, Footer
    │   ├── Navbar.jsx
    │   ├── Footer.jsx
    │   ├── SearchForm.jsx
    │   ├── LogementCard.jsx
    │   ├── PhotoGallery.jsx
    │   └── Badge.jsx
    ├── pages/                   # Un fichier par écran
    │   ├── HomePage.jsx
    │   ├── ResultatsPage.jsx
    │   ├── FichePage.jsx
    │   ├── PublierPage.jsx
    │   └── InscriptionPage.jsx
    └── utils/format.js          # Formatage (loyer en FCFA, dates en français)
```

| Dossier | Rôle | Règle |
|---|---|---|
| `api/` | Seule porte vers le serveur | Aucun `fetch` ailleurs dans le code |
| `components/` | Éléments réutilisables | Reçoivent leurs données par **props**, ne connaissent pas l'API |
| `pages/` | Un écran = une route | Chargent les données (via `api/`) et assemblent les composants |
| `utils/` | Fonctions simples sans React | Pas de `useState` ni de `useEffect` |

**Trajet des données** pour une recherche :

```
pages/ResultatsPage  ->  api/logement.js  ->  API Express  ->  PostgreSQL
        |                                          |
        v                                          v
 components/LogementCard  <------  JSON (logements, message, total)
```

## Pages et routes

| Route | Page | Contenu |
|---|---|---|
| `/` | `HomePage` | Hero, formulaire de recherche (ville, quartier, type de logement, loyer maximum, eau courante, compteur électrique), accès à tous les logements |
| `/resultats` | `ResultatsPage` | Liste des logements trouvés, ou message clair si aucun ne correspond |
| `/logements/:id` | `FichePage` | Galerie, loyer, équipements, statut daté, badges, contact |
| `/publier` | `PublierPage` | Formulaire d'annonce en **démonstration** : rien n'est enregistré |
| `/inscription` | `InscriptionPage` | Écran de connexion en **démonstration** : aucune création de compte |

Toutes les pages s'affichent dans `Layout` (Navbar en haut, Footer en bas) grâce à `<Outlet />`.

## Composants

| Composant | Rôle |
|---|---|
| `Layout` | Cadre commun à toutes les pages |
| `Navbar` | Logo, liens Accueil et Publier une annonce, bouton Connexion ; le lien de la page courante est mis en évidence |
| `Footer` | Pied de page : villes couvertes, mention « aucune commission » |
| `SearchForm` | Formulaire de recherche ; le champ quartier dépend de la ville choisie et reste désactivé tant qu'aucune ville n'est sélectionnée |
| `LogementCard` | Carte d'un logement : photo, loyer en FCFA, quartier, statut, badges |
| `PhotoGallery` | Galerie de la fiche : photo principale et miniatures |
| `Badge` | Étiquettes : Disponible, Occupé, Bien vérifié, Annonce incomplète |

---

## Communication avec l'API

Le navigateur appelle l'API avec `fetch`, à partir de `VITE_API_URL`. La référence complète des routes, des paramètres et des erreurs est dans `server/README.md`. Voici ce que le front utilise :

| Endpoint | Usage dans l'application |
|---|---|
| `GET /quartiers?ville=` | Remplit la liste déroulante des quartiers |
| `GET /logements?ville=...` | Recherche filtrée (résultats) |
| `GET /logements/tous` | Liste complète, sans filtre |
| `GET /logements/:id` | Fiche détaillée |

**À savoir côté front :**

- `ville` est **obligatoire** pour la recherche : sans elle, l'API répond `400`.
- Les autres critères sont facultatifs et se cumulent : `quartier`, `loyer_max`, `type_bien`, `eau_courante`, `compteur_electrique`, `tri`.
- La liste de résultats arrive sous la forme `{ total, message, resultats }`. En l'absence de résultat, le statut reste `200` : afficher le champ `message`.
- Les photos sont des **chemins relatifs** (`/images/...`) servis par l'API : le front doit les préfixer par l'adresse du serveur, c'est-à-dire `VITE_API_URL` sans le `/api` final.
- Les erreurs de validation renvoient `{ erreur, champs }`, avec une clé par paramètre fautif.
- Pour un bien occupé, `contact` vaut `null`.

## Règles d'affichage

| Situation | Comportement attendu |
|---|---|
| Bien **occupé** | Badge « Occupé », boutons WhatsApp et Appeler **désactivés ou masqués** |
| Bien **vérifié** | Badge « Bien vérifié » en liste et sur la fiche |
| **Sans photo** | Badge « Annonce incomplète » et message à la place de la galerie |
| **Date inconnue** | Mention « date de mise à jour inconnue » |
| **Caution inconnue** | Afficher le message fourni par l'API (« Caution à confirmer… ») au lieu d'un montant |
| **Loyer** | Toujours en FCFA, sans frais ni commission ajoutés (loyer ferme) |
| **Contact WhatsApp** | Message prérempli mentionnant le bien (titre, référence, quartier) |
| **Connexion lente** | Texte et loyers visibles avant les images (`loading="lazy"` sur les `<img>`) |

---

## Style et charte graphique

Les couleurs, polices et arrondis sont des **variables CSS** définies dans `:root` (`src/index.css`). Les couleurs ne s'écrivent jamais en dur dans les composants : on modifie la variable, et tout le site suit.

| Variable | Valeur | Usage |
|---|---|---|
| `--vert` | `#1e5f45` | Navigation, boutons, titres |
| `--vert-fonce` | `#103324` | Pied de page, survol des boutons |
| `--orange` | `#e8962e` | Accents, bouton Connexion, badge vérifié |
| `--creme` | `#f8f4ec` | Fond des pages et des champs |
| `--blanc` | `#ffffff` | Cartes et formulaires |
| `--texte` | `#1f2937` | Texte principal |
| `--bordure` | `#e5e0d5` | Contours et séparateurs |
| `--erreur` | `#b91c1c` | Messages d'erreur |
| `--rayon` | `12px` | Arrondi des cartes et champs |

**Polices** (Google Fonts, importées en tête de `index.css`) : **Outfit** pour les titres (`--police-titre`) et **Source Sans 3** pour le texte (`--police-texte`), avec `system-ui` en secours.

**Organisation** : `index.css` contient les variables, la base et les styles généraux, puis importe `pages.css`, qui regroupe les styles des pages et des composants. Le site est **responsive** : la grille et les formulaires passent en une colonne sous 720 px.

---

## Organisation de l'équipe

Chaque développeur est responsable d'un dossier et travaille sur sa propre branche.

| Branche | Responsable | Dossier | Fichiers |
|---|---|---|---|
| `feature/front-components` | Réel | `components` | `Badge.jsx`, `Footer.jsx`, `Layout.jsx`, `LogementCard.jsx`, `Navbar.jsx`, `PhotoGallery.jsx`, `SearchForm.jsx` |
| `feature/front-api` | Gédéon | `api` | `logement.js` |
| `feature/front-pages` | guyverma | `pages` | `FichePage.jsx`, `HomePage.jsx`, `InscriptionPage.jsx`, `PublierPage.jsx`, `ResultatsPage.jsx` |
| `feature/front-style` | gaevie | `style` | `index.css`, `pages.css` |

Toute modification **en dehors de son dossier** se discute d'abord avec son responsable, pour éviter les conflits.

## Workflow Git

La branche **`main` est protégée** : on n'y pousse jamais directement. Tout le code y entre par une **Pull Request**, relue et approuvée par **un autre développeur**, puis **fusionnée dans `main` juste après la review**.

```bash
git checkout main
git pull origin main
git checkout -b feature/front-components

# ... coder, tester dans le navigateur ...

git add <fichiers>
git status                       # aucun .env, aucun node_modules
git commit -m "feat: ajout du composant Badge"
git push -u origin feature/front-components
```

1. Ouvrir une **Pull Request vers `main`** sur GitHub.
2. Demander la **review d'un autre développeur** (jamais l'auteur lui-même).
3. Corriger les remarques éventuelles sur la même branche.
4. Après approbation, **fusionner dans `main`** immédiatement, puis supprimer la branche.
5. Chacun récupère `main` (`git pull origin main`) avant de créer sa prochaine branche.

**Nom des branches** : `feature/front-<sujet>`, ou `fix/front-<sujet>` pour un bug. En minuscules, avec des tirets, sans espace ni accent.

**Messages de commit** : `type: description courte`, avec `feat`, `fix`, `docs`, `chore`, `test` ou `refactor`.

**Avant d'ouvrir une Pull Request :**

- [ ] `npm run build` se termine sans erreur
- [ ] `npm run lint` ne signale aucune erreur
- [ ] Les pages concernées s'affichent, avec l'API lancée
- [ ] Aucun `.env` ni `node_modules` dans le commit
- [ ] Je n'ai modifié que mon dossier (ou prévenu son responsable)

---

## Conventions de code

- Composants et fichiers de composants en **PascalCase** (`LogementCard.jsx`) ; fonctions et variables en **camelCase**.
- Composants fonctionnels et hooks uniquement.
- **Aucun appel réseau dans un composant** : tout passe par `api/`.
- Les composants restent simples : données par props, événements remontés par des fonctions (`onClick`, `onSubmit`).
- Une `key` unique et stable dans chaque liste (l'identifiant du logement, pas l'index).
- Gérer les **trois états** de chaque chargement : chargement, erreur, succès.
- Formatage (loyer, dates) dans `utils/format.js`, jamais recopié dans les composants.
- Couleurs et polices via les **variables CSS**. Classes CSS en minuscules, séparées par des tirets.

## Build et déploiement

Le front se publie comme un **site statique** (Render). Réglages :

| Champ | Valeur |
|---|---|
| Root Directory | `client` |
| Build Command | `npm install && npm run build` |
| Publish Directory | `dist` |
| Variable | `VITE_API_URL` = adresse de l'API suivie de `/api` |
| Règle de réécriture | `/*` vers `/index.html` (nécessaire à React Router) |

Après le déploiement du site, mettre son adresse dans `CLIENT_URL` côté API pour autoriser les appels (CORS). La procédure complète est décrite dans le **Guide de déploiement sur Render**.

---

## Dépannage

| Symptôme | Cause probable | Solution |
|---|---|---|
| `Failed to resolve import ...` | Fichier absent, mal placé ou mal nommé | Vérifier le chemin et la casse du nom dans l'import |
| Page blanche | Erreur JavaScript | Lire la première ligne rouge de la console (`F12`) |
| Aucune donnée affichée | API éteinte, ou `VITE_API_URL` fausse | Lancer l'API, vérifier `.env`, relancer `npm run dev` |
| Console : `blocked by CORS policy` | `CLIENT_URL` du serveur différente de l'adresse du front | Mettre exactement `http://localhost:5173`, sans `/` final |
| Photos cassées | Fichier absent côté serveur, ou chemin non préfixé | Tester `http://localhost:5000/images/<fichier>` |
| Styles absents ou couleurs transparentes | `index.css` non importé, ou variables `:root` manquantes | Vérifier `import './index.css'` dans `main.jsx` |
| `404` en rechargeant `/resultats` en ligne | Règle de réécriture absente | Ajouter `/*` vers `/index.html` |
| Le build échoue | Version de Node trop ancienne, ou erreur de code | Utiliser Node 20.19+, lancer `npm run build` en local |
