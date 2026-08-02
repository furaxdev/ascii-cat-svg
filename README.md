# ascii-cat-svg

Petit service Express qui génère à la volée un SVG animé d'un chat ASCII assis (clignement des yeux + léger balancement), pour être linké dans un README GitHub.

```
 /\_/\
( o.o )
 > ^ <
/|   |\
(_)   (_)
```

## Lancer en local

```bash
npm install
npm start
# puis ouvrir http://localhost:3000/cat dans un navigateur
```

## Endpoint

`GET /cat`

Paramètres de query optionnels :

| Param    | Valeurs               | Défaut  |
|----------|------------------------|---------|
| `theme`  | `dark`, `light`        | `dark`  |
| `speed`  | `slow`, `normal`, `fast` | `normal` |
| `colors` | `green`, `blue`, `purple` | `green` |

Exemple : `/cat?theme=dark&speed=fast&colors=purple`

Réponse : `image/svg+xml`, SVG pur (pas de canvas, pas de rendu image côté serveur).

## Déploiement sur Render.com

1. Pousser ce dossier sur un repo GitHub (repo dédié ou sous-dossier).
2. Sur [render.com](https://dashboard.render.com), **New > Blueprint**, sélectionner le repo — `render.yaml` est déjà présent et configure tout (build `npm install`, start `npm start`, plan free).
   - Ou via la Render CLI : `render blueprint launch` depuis ce dossier une fois connecté (`render login`).
3. Une fois déployé, Render donne une URL du type `https://ascii-cat-svg.onrender.com`.

## Utilisation dans un README

Service déployé et live : **https://ascii-cat-svg.onrender.com/cat**

```markdown
[![Sitting Cat](https://ascii-cat-svg.onrender.com/cat?theme=dark&colors=purple)](https://github.com/furaxdev/ascii-cat-svg)
```

> Note : le plan gratuit de Render met le service en veille après inactivité ; le premier chargement peut prendre quelques secondes (cold start).
