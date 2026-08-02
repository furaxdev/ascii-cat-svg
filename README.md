# ascii-cat-svg

Petit service Express qui génère à la volée des SVG animés sur le thème chat, pour être linkés dans un README GitHub : fond transparent, style "hacker" néon, SVG pur (pas de canvas, pas de rendu image côté serveur).

## Endpoints

### `GET /cat` — chat assis

```
 /\_/\
( o.o )
 > ^ <
/|   |\
(_)   (_)
```

Clignement des yeux, léger balancement, queue qui remue.

### `GET /cat/sleep` — chat qui dort

```
 /\_/\
( -.- )
  )   (
 (__ __)
```

Respiration douce + "z Z z" flottants.

### `GET /quote` — fait aléatoire sur les chats

Badge texte avec une citation/fact différent à chaque chargement.

### `GET /visits` — compteur de vues

Badge `🐾 views: N`, persistant via un Gist GitHub privé (voir [Configuration](#configuration)).

## Paramètres de query communs

| Param    | Valeurs                    | Défaut   | Endpoints concernés |
|----------|----------------------------|----------|----------------------|
| `speed`  | `slow`, `normal`, `fast`   | `normal` | `/cat`, `/cat/sleep` |
| `colors` | `green`, `blue`, `purple`  | `green`  | tous |

## Lancer en local

```bash
npm install
npm start
# http://localhost:3000/cat, /cat/sleep, /quote, /visits
```

## Configuration

`/visits` a besoin de deux variables d'environnement :

| Variable       | Description |
|----------------|-------------|
| `GIST_ID`      | ID du Gist privé servant de stockage (fichier `counter.json` contenant `{"count":0}`) |
| `GITHUB_TOKEN` | Token GitHub classique avec **uniquement** le scope `gist` |

Sans ces variables, `/visits` répond en 503 avec un badge `views: ?`.

## Déploiement sur Render.com

1. Pousser ce dossier sur un repo GitHub.
2. Sur [render.com](https://dashboard.render.com), **New > Blueprint**, sélectionner le repo — `render.yaml` configure le build (`npm install`) et le start (`npm start`) sur le plan free.
3. Ajouter `GIST_ID` et `GITHUB_TOKEN` dans les variables d'environnement du service (Dashboard > Environment).

## Utilisation dans un README

Service déployé et live : **https://ascii-cat-svg.onrender.com**

```markdown
[![Sitting Cat](https://ascii-cat-svg.onrender.com/cat?colors=purple)](https://github.com/furaxdev/ascii-cat-svg)
[![Sleeping Cat](https://ascii-cat-svg.onrender.com/cat/sleep?colors=blue)](https://github.com/furaxdev/ascii-cat-svg)
![Cat Fact](https://ascii-cat-svg.onrender.com/quote)
![Views](https://ascii-cat-svg.onrender.com/visits)
```

> Note : le plan gratuit de Render met le service en veille après inactivité ; le premier chargement peut prendre quelques secondes (cold start).
