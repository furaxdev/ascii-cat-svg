# ascii-cat-svg

Petit service Express qui génère à la volée des SVG animés sur le thème chat, pour être linkés dans un README GitHub : fond transparent, style "hacker" néon, SVG pur (pas de canvas, pas de rendu image côté serveur).

## Endpoints

### `GET /cat` — chat assis

[![Sitting Cat](https://ascii-cat-svg.onrender.com/cat?colors=purple)](https://github.com/furaxdev/ascii-cat-svg)

Clignement des yeux, léger balancement, queue qui remue.

### `GET /cat/sleep` — chat qui dort

[![Sleeping Cat](https://ascii-cat-svg.onrender.com/cat/sleep?colors=blue)](https://github.com/furaxdev/ascii-cat-svg)

Respiration douce + "z Z z" flottants.

### `GET /quote` — fait aléatoire sur les chats

![Cat Fact](https://ascii-cat-svg.onrender.com/quote)

<small>Badge texte avec une citation/fact différent à chaque chargement.</small>

### `GET /visits` — compteur de vues

![Visit counter](https://ascii-cat-svg.onrender.com/visits?key=furaxdev&colors=blue&glow=off)

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

## Utilisation dans un README

Service déployé et live : **https://ascii-cat-svg.onrender.com**

```markdown
[![Sitting Cat](https://ascii-cat-svg.onrender.com/cat?colors=purple)](https://github.com/furaxdev/ascii-cat-svg)
[![Sleeping Cat](https://ascii-cat-svg.onrender.com/cat/sleep?colors=blue)](https://github.com/furaxdev/ascii-cat-svg)
![Cat Fact](https://ascii-cat-svg.onrender.com/quote)
![Views](https://ascii-cat-svg.onrender.com/visits)
```

> Note : le plan gratuit de Render met le service en veille après inactivité ; le premier chargement peut prendre quelques secondes (cold start).
