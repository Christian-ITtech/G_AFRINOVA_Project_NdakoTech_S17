# NDAKO TECH : API Backend

API REST de la plateforme de recherche de logements à **Brazzaville** et **Pointe-Noire** : recherche filtrée, fiche d'un logement et liste des quartiers. Loyer ferme, aucune commission.

| | |
|---|---|
| **Stack** | Node.js 18+, Express 5 (ES modules), PostgreSQL (`pg`) |
| **Port** | `5000` |
| **URL de base** | `http://localhost:5000/api` |
| **Accès** | Lecture seule, sans authentification |

**Sommaire** : [Démarrage](#démarrage-rapide) · [Configuration](#variables-denvironnement) · [Structure](#structure) · [Base de données](#base-de-données) · [Référence API](#référence-api) · [Règles de gestion](#règles-de-gestion) · [Tests Postman](#tests-postman) · [Workflow Git](#workflow-git) · [Limites connues](#limites-connues) · [Dépannage](#dépannage)

---

## Démarrage rapide

Prérequis : **Node.js 18+** et **PostgreSQL**.

```bash
# 1. Base de données : créer une base vide, puis charger le schéma et les données
psql -d <nom_base> -f schema.sql
psql -d <nom_base> -f seed.sql

# 2. Serveur
cp .env.example .env         # puis renseigner les valeurs
npm install
npm run dev                  # http://localhost:5000
```

La console doit afficher `Serveur lancé sur http://localhost:5000`, puis `Connexion à la base de données réussie`.

| Script | Commande | Usage |
|---|---|---|
| `npm run dev` | `nodemon src/server.js` | Développement, redémarrage automatique |
| `npm start` | `node src/server.js` | Production |

> `schema.sql` crée des types et des tables : il ne se relance pas sur une base déjà initialisée (recréer la base). `seed.sql` **vide les tables** avant de les remplir et peut être relancé à volonté.

## Variables d'environnement

Fichier `server/.env`, **jamais commité** (il contient le mot de passe de la base). Seul `.env.example` est versionné.

| Variable | Rôle | Exemple |
|---|---|---|
| `PORT` | Port de l'API (défaut `5000`) | `5000` |
| `CLIENT_URL` | Origine autorisée par CORS, sans `/` final (défaut `http://localhost:5173`) | `http://localhost:5173` |
| `DB_HOST` | Hôte PostgreSQL | `localhost` |
| `DB_PORT` | Port PostgreSQL | `5432` |
| `DB_USER` | Utilisateur de la base | `postgres` |
| `DB_PASSWORD` | Mot de passe de la base | `votre_mot_de_passe` |
| `DB_NAME` | Nom de la base | `Immobilier_db` |
| `NODE_ENV` | Facultatif. En `production`, les erreurs 500 ne détaillent plus la cause | `production` |

## Structure

```
server/
├── public/images/                 # Photos des logements, servies sur /images/...
├── schema.sql                     # Types, tables, index, triggers
├── seed.sql                       # Données de démonstration
├── Diagram ER.png                 # Diagramme entité-relation
├── .env.example
└── src/
    ├── server.js                  # Point d'entrée : charge .env, lance l'écoute
    ├── app.js                     # CORS, JSON, /images, /api, 404, erreurs
    ├── config/database.js         # Pool PostgreSQL + test de connexion
    ├── routes/
    │   ├── index.js               # /api, /api/hello, monte les routes ci-dessous
    │   ├── logementRoute.js       # /api/logements
    │   └── quartierRoute.js       # /api/quartiers
    ├── controllers/               # logementController.js, quartierController.js
    ├── models/logementModel.js    # Requêtes SQL (listerTous, rechercher, trouverParId, quartiersParVille)
    └── middlewares/               # validateRecherche.js, validateId.js, errorHandler.js
```

Flux d'une requête : **route** → **validation** (qui construit `req.filtres`) → **contrôleur** → **modèle** (SQL paramétré) → JSON. Les valeurs de l'utilisateur ne sont jamais concaténées dans le SQL, et le tri passe par une liste blanche.

---

## Base de données

![Diagramme ER](./Diagram%20ER.png)

| Table | Rôle | Colonnes principales |
|---|---|---|
| `utilisateur` | Gestionnaire du bien (contact) | `nom`, `prenom`, `telephone` (unique), `statut` |
| `logement` | Annonce | `titre`, `ville`, `quartier`, `adresse`, `type_bien`, `loyer`, `caution_mois`, `eau_courante`, `compteur_electrique`, `statut`, `verifie`, `date_mise_a_jour` |
| `photo` | Photos d'un logement | `logement_id`, `url`, `ordre` |
| `signalement` | Signalements d'annonces (table prête, **aucune route pour l'instant**) | `logement_id`, `motif`, `statut` |

**Relations** : `utilisateur` 1-N `logement` 1-N `photo` et `signalement`. Suppression en cascade (utilisateur, logement, puis photo et signalement).

| Type énuméré | Valeurs |
|---|---|
| `type_bien` | `appartement`, `maison`, `studio`, `chambre`, `villa`, `autre` |
| `statut_logement` | `disponible`, `occupe` |
| `statut_signalement` | `nouveau`, `en_cours`, `traite`, `rejete` |
| `motif_signalement` | `fausse_information`, `prix_incorrect`, `logement_inexistant`, `photo_incorrecte`, `annonce_deja_occupee`, `autre` |

**Contraintes** : `loyer >= 0` ; `caution_mois >= 0` ou `NULL` (= caution à confirmer) ; `UNIQUE (logement_id, ordre)` sur `photo` (`ordre = 0` est la photo de couverture) ; `updated_at` mis à jour par des triggers.

**Images** : la base ne stocke que le **chemin** (`/images/<fichier>`). Les fichiers sont dans `server/public/images/`, servis par Express. Le nom enregistré dans `seed.sql` doit être identique au nom du fichier, casse et extension comprises.

---

## Référence API

Toutes les routes sont en `GET` et répondent en JSON.

| Endpoint | Rôle | Fonctionnalité |
|---|---|---|
| `/api` | Présentation de l'API (message, version) | |
| `/api/hello` | Test de communication | |
| `/api/quartiers?ville=` | Quartiers d'une ville | F1 |
| `/api/logements?ville=` | Recherche filtrée et triée | F1, F2, F9 |
| `/api/logements/tous` | Liste complète, tous statuts | |
| `/api/logements/:id` | Fiche détaillée | F3, F4, F6 |

### `GET /api` et `GET /api/hello`

`/api` renvoie `{ message, version, auteur }`. `/api/hello` renvoie `{ "message": "Bonjour depuis Express !" }` : route d'exemple pour tester la liaison avec React.

### `GET /api/quartiers`

Alimente la liste déroulante des quartiers.

| Paramètre | Requis | Valeurs |
|---|---|---|
| `ville` | Oui | `Brazzaville` ou `Pointe-Noire` (casse ignorée) |

```bash
curl "http://localhost:5000/api/quartiers?ville=Brazzaville"
```

```json
{ "ville": "Brazzaville", "quartiers": ["Bacongo", "Makélékélé", "..."] }
```

Les quartiers sont distincts et triés, tous statuts de logement confondus. Erreur `400` si `ville` est absente ou inconnue.

### `GET /api/logements`

Recherche de logements. Les logements **occupés sont exclus** (RG-01). Sans `quartier` ni `loyer_max`, la recherche porte sur toute la ville. Les filtres se **cumulent** (ET).

| Paramètre | Requis | Description |
|---|---|---|
| `ville` | **Oui** | `Brazzaville` ou `Pointe-Noire` (casse ignorée) |
| `quartier` | Non | Un quartier (ex. `Bacongo`, `Tié-Tié`), casse ignorée |
| `loyer_max` | Non | Nombre **strictement positif** en FCFA (`100000` ou `100 000`). Vide : ignoré (RG-02) |
| `type_bien` | Non | `appartement`, `maison`, `studio`, `chambre`, `villa` ou `autre` |
| `eau_courante` | Non | `true` : uniquement les biens avec eau courante |
| `compteur_electrique` | Non | `true` : uniquement les biens avec compteur électrique |
| `tri` | Non | `loyer_asc` : loyer croissant (F9). Sans `tri` : mises à jour les plus récentes d'abord, dates inconnues en dernier |

```bash
curl "http://localhost:5000/api/logements?ville=Pointe-Noire&loyer_max=130000&tri=loyer_asc"
curl "http://localhost:5000/api/logements?ville=Brazzaville&type_bien=studio&eau_courante=true&compteur_electrique=true"
```

```json
{
  "total": 3,
  "message": null,
  "resultats": [
    {
      "id": 8,
      "titre": "Appartement 2 pièces Tié-Tié",
      "ville": "Pointe-Noire",
      "quartier": "Tié-Tié",
      "type_bien": "appartement",
      "loyer": 120000,
      "statut": "disponible",
      "verifie": true,
      "date_mise_a_jour": "2026-09-29T10:00:00.000Z",
      "photo_principale": "/images/appartement-tie-tie-1.jpg",
      "incomplet": false,
      "date_inconnue": false
    }
  ]
}
```

| Champ | Signification |
|---|---|
| `loyer` | Nombre (FCFA) |
| `photo_principale` | Première photo du bien, `null` s'il n'en a aucune |
| `incomplet` | `true` si le bien n'a aucune photo (RG-03) |
| `date_inconnue` | `true` si `date_mise_a_jour` est `null` (RG-04) |

La recherche **ne renvoie pas** `eau_courante` ni `compteur_electrique` (voir [Limites connues](#limites-connues)).

**Aucun résultat** : statut `200`, `total: 0`, `resultats: []` et un `message` à afficher :
`Aucun logement ne correspond à vos critères. Essayez d'élargir votre recherche (autre quartier ou loyer maximum plus élevé).`

### `GET /api/logements/tous`

Liste complète, **sans validation ni filtre**, **y compris les biens occupés** (la clause RG-01 est commentée dans le modèle). Triée par mise à jour décroissante.

```json
{ "total": 13, "resultats": [ { "id": 1, "titre": "...", "ville": "...", "quartier": "...", "type_bien": "...", "loyer": 75000, "eau_courante": true, "compteur_electrique": true, "statut": "disponible", "verifie": true, "date_mise_a_jour": "...", "photo_principale": "...", "incomplet": false, "date_inconnue": false } ] }
```

Cette route doit rester **déclarée avant `/:id`**, sinon `tous` serait interprété comme un identifiant.

### `GET /api/logements/:id`

Fiche complète. Un bien **occupé** reste consultable, mais sans contact. `id` doit être un entier strictement positif.

```bash
curl "http://localhost:5000/api/logements/1"
```

```json
{
  "id": 1,
  "titre": "Studio meublé Bacongo",
  "description": "Studio meublé, proche des transports.",
  "ville": "Brazzaville",
  "quartier": "Bacongo",
  "adresse": "Rue des Palmiers",
  "type_bien": "studio",
  "loyer": 75000,
  "caution_mois": 2,
  "cout_entree": 225000,
  "message_caution": null,
  "eau_courante": true,
  "compteur_electrique": true,
  "statut": "disponible",
  "verifie": true,
  "date_mise_a_jour": "2026-10-01T10:00:00.000Z",
  "date_inconnue": false,
  "photos": ["/images/studio-bacongo-1.jpg", "/images/studio-bacongo-2.jpg"],
  "incomplet": false,
  "champs_manquants": [],
  "gestionnaire": { "nom": "Mabiala", "prenom": "Jean" },
  "contact": {
    "telephone": "+242060000001",
    "appel": "tel:+242060000001",
    "whatsapp": "https://wa.me/242060000001"
  }
}
```

| Champ | Description |
|---|---|
| `cout_entree` | `loyer x (1 + caution_mois)`, arrondi (RG-07). `null` si la caution est inconnue |
| `message_caution` | `Caution à confirmer avec le propriétaire du bien` si `caution_mois` est `null` (RG-08), sinon `null` |
| `champs_manquants` | Parmi `description`, `quartier`, `adresse`, `date_mise_a_jour`, ceux qui sont vides (à afficher « non renseigné ») |
| `photos` | Tableau de chemins relatifs, classés par `ordre`. À préfixer par l'adresse du serveur |
| `incomplet` | `true` si le bien n'a aucune photo (RG-03) |
| `contact` | `null` si le bien est **occupé**. Le lien WhatsApp ne contient pas de message prérempli |

### Erreurs

| Code | Cas | Corps |
|---|---|---|
| `400` | Paramètre invalide | `{ "erreur": "Paramètres invalides.", "champs": { "<paramètre>": "<message>" } }` |
| `404` | Logement inexistant | `{ "erreur": "Ce logement n'existe pas." }` |
| `404` | Route inexistante | `{ "erreur": "Route introuvable." }` |
| `500` | Erreur serveur ou base | `{ "erreur": "Une erreur est survenue sur le serveur.", "detail": "..." }` (`detail` absent en production) |

Cas de `400` : `ville` absente ou non prise en charge (`/logements`, `/quartiers`) ; `loyer_max` non numérique ou inférieur ou égal à 0 ; `type_bien` ou `tri` inconnu ; `id` non entier ou inférieur ou égal à 0. L'objet `champs` contient une clé par paramètre fautif (ex. `champs.loyer_max`).

---

## Règles de gestion

| Code | Règle |
|---|---|
| RG-01 | Un logement **occupé** n'apparaît pas dans la recherche |
| RG-02 | `loyer_max` exclut tout bien au-dessus du montant ; une valeur vide est ignorée |
| RG-03 | Un logement **sans photo** est `incomplet` |
| RG-04 | Une `date_mise_a_jour` nulle est signalée par `date_inconnue` |
| RG-07 | Coût d'entrée = `loyer x (1 + caution_mois)` |
| RG-08 | Caution inconnue : `cout_entree` nul et message « Caution à confirmer… » |
| | Le contact (`tel:`, WhatsApp) n'est renvoyé que si le bien est **disponible** |

## Données de démonstration

`seed.sql` charge **3 gestionnaires, 13 logements et 24 photos**. Les identifiants sont stables (la numérotation repart de zéro à chaque exécution).

| id | Logement | Ville | Cas particulier |
|---|---|---|---|
| 1 | Studio meublé Bacongo | Brazzaville | Vérifié, complet (cas nominal) |
| 2 | Appartement 3 pièces Poto-Poto | Brazzaville | |
| 3 | Chambre simple Talangaï | Brazzaville | |
| 4 | Maison 4 pièces Moungali | Brazzaville | **Occupé** |
| 5 | Villa standing Plateau des 15 ans | Brazzaville | Vérifié |
| 6 | Studio Ouenzé | Brazzaville | **Sans photo**, caution inconnue |
| 7 | Chambre Makélékélé | Brazzaville | **Date inconnue** |
| 8 | Appartement 2 pièces Tié-Tié | Pointe-Noire | Vérifié |
| 9 | Studio Loandjili | Pointe-Noire | |
| 10 | Maison Mongo-Mpoukou | Pointe-Noire | **Occupé**, vérifié |
| 11 | Chambre Lumumba | Pointe-Noire | |
| 12 | Villa Ngoyo | Pointe-Noire | |
| 13 | Appartement Mvou-Mvou | Pointe-Noire | Caution inconnue |

Recherche attendue : **6** biens à Brazzaville et **5** à Pointe-Noire (les 2 occupés sont exclus).

---

## Tests Postman

Importer `NdakoTech_postman_collection.json`. La variable `baseUrl` vaut `http://localhost:5000/api`. **Lancer `seed.sql` avant les tests.**

| Dossier | Requêtes | Ce qui est vérifié |
|---|---|---|
| 0 - Général | 1 | `/hello` répond |
| 1 - Quartiers | 4 | Les deux villes, `400` sans ville ou avec une ville inconnue |
| 2 - Recherche et liste | 9 | Toute la ville (6 et 5 biens), quartier, loyer max, tri croissant, loyer vide ignoré, bien sans photo, aucun résultat |
| 3 - Fiche logement | 6 | Fiche complète (id 1), sans photo ni caution (id 6), occupé sans contact (id 4), date inconnue (id 7), `404`, `400` |
| 4 - Cas d'erreur de validation | 6 | `loyer_max` invalide, ville absente ou inconnue, tri inconnu, route inexistante |

Total : **26 requêtes**, toutes doivent passer avant une Pull Request. Non couverts par la collection : `GET /api`, `/logements/tous` et les filtres `type_bien`, `eau_courante`, `compteur_electrique`.

---

## Workflow Git

Branches principales : `main` (stable, déployée) et `develop` (intégration). **Aucun push direct** sur l'une ni l'autre : tout passe par une Pull Request.

**Nom d'une branche** : `type/back-description-courte`, en minuscules, avec des tirets, sans espace ni accent. Elle part de `develop` (sauf `hotfix/`, qui part de `main`).

| Préfixe | Usage | Exemple |
|---|---|---|
| `feature/` | Nouvelle fonctionnalité | `feature/back-recherche` |
| `fix/` | Correction de bug | `fix/back-filtre-loyer` |
| `chore/` | Configuration, dépendances | `chore/back-socle` |
| `docs/` | Documentation | `docs/back-readme` |
| `test/` | Tests | `test/back-postman` |
| `hotfix/` | Correction urgente depuis `main` | `hotfix/back-connexion-bd` |

```bash
git checkout develop && git pull origin develop
git checkout -b feature/back-recherche
# ... coder, tester avec Postman ...
git add <fichiers>
git commit -m "feat: ajout de la recherche par quartier et loyer maximum"
git push -u origin feature/back-recherche
# Pull Request vers develop, relue par un autre membre, puis suppression de la branche
```

**Commits** : `type: description courte` avec `feat`, `fix`, `docs`, `chore`, `test` ou `refactor`.

| # | Tâche | Branche | Qui |
|---|---|---|---|
| 1 | Socle : app, serveur, connexion BD, gestion d'erreurs | `chore/back-socle` | Christian |
| 2 | Base de données : schéma, seed, images | `feature/back-base-donnees` | Christian |
| 3 | Recherche et liste (F1, F2, F9) | `feature/back-recherche` | Marlong |
| 4 | Fiche logement (F3, F4, F6) | `feature/back-fiche-logement` | Lorion |
| 5 | Quartiers par ville (F1) | `feature/back-quartiers` | Lorion |
| 6 | Tests Postman | `test/back-postman` | Marlong |
| 7 | README et déploiement | `docs/back-readme`, `feature/back-deploiement` | Christian |

Ordre conseillé : 1 et 2, puis 3, 4 et 5 en parallèle, puis 6 et 7.

**Règles d'équipe** : une Pull Request = une tâche, relue par un autre membre ; ne jamais commiter `.env` ni `node_modules` (lire `git status` avant chaque commit) ; se mettre à jour chaque jour depuis `develop` ; `logementModel.js`, `logementController.js` et `logementRoute.js` sont partagés entre Marlong et Lorion : chacun ajoute ses fonctions dans **sa propre section** et fusionne par petites Pull Requests ; déploiement depuis `main` uniquement, variables d'environnement configurées sur l'hébergeur.

---

## Limites connues

| # | Constat | Piste |
|---|---|---|
| 1 | `rechercher` ne sélectionne pas `eau_courante` ni `compteur_electrique` : une liste de résultats ne peut pas afficher les équipements | Ajouter ces deux colonnes au `SELECT` de `rechercher` |
| 2 | `eau_courante` et `compteur_electrique` : toute valeur non vide autre que `true` est lue comme `false` (filtre inversé, sans erreur). La branche d'erreur prévue pour `false` n'est jamais atteinte | N'accepter que `true`/`false` et renvoyer `400` sinon |
| 3 | `/logements/tous` renvoie aussi les biens occupés | Décommenter la clause `WHERE` du modèle, ou garder le comportement et filtrer côté front |
| 4 | `react-router-dom` figure dans les dépendances de `server/package.json` : c'est une dépendance du front | `npm uninstall react-router-dom` |
| 5 | Le pool PostgreSQL n'a ni `DATABASE_URL` ni SSL : une base distante (hébergée) risque d'être refusée | Prévoir `ssl` dans `config/database.js` pour le déploiement |
| 6 | Si la base est injoignable, le serveur démarre quand même et seul un message est affiché ; les requêtes renvoient ensuite `500` | Lire la console au démarrage |

## Dépannage

| Symptôme | Cause probable | Solution |
|---|---|---|
| `ERR_CONNECTION_REFUSED` sur `localhost:5000` | Serveur arrêté ou planté | Lancer `npm run dev` et lire la dernière erreur |
| `Erreur lors de la connexion à la base de données` | PostgreSQL éteint ou variables `DB_*` fausses | Vérifier `.env` et que PostgreSQL tourne |
| `Cannot use import statement outside a module` | `"type": "module"` absent de `package.json` | L'ajouter (le backend est en ES modules) |
| `relation "logement" does not exist` | Tables non créées | Exécuter `schema.sql`, puis `seed.sql` |
| `type "type_bien" already exists` | `schema.sql` relancé sur une base déjà initialisée | Recréer la base |
| `Cannot GET /images/...` | Fichier absent ou nom différent de celui du seed | Comparer `server/public/images/` et `seed.sql` |
| `blocked by CORS policy` côté front | `CLIENT_URL` incorrect | Mettre exactement l'adresse du front, sans `/` final |
| Résultats inattendus après un test | Base modifiée | Relancer `seed.sql` |