# <img src="/public/favicon.svg" width="24"> [Bake n' Shake](https://bakeandshake.netlify.app) <img src="/public/favicon.svg" width="24">
Interactive 2D pixel art game that lets you run your own bakery.

## Prerequisites
`node@v22`   
`npm@v10.9`

## Development

To run the app:
```bash
npm i
npm run dev
```

To build the app:
```bash
npm run build
```

## 🎮 Controls

### Movement
| Key | Action |
|-----|--------|
| `Arrow Keys` or `WASD` | Move player in 4 directions |

### Interactions
| Key | Action |
|-----|--------|
| `E` | Talk to nearby NPC/Customer |
| `Space` or `Enter` | Skip dialog typing / Close dialog when complete |
| `Escape` | Close dialog immediately |

### Baking & Serving
| Key | Action |
|-----|--------|
| `B` | Baking workflow (context-sensitive) |
| `O` | Deliver order to nearby customer |


### Game Controls
| Key | Action |
|-----|--------|
| `P` | Pause/Resume game |

### Debug
| Key | Action |
|-----|--------|
| `D` | Toggle debug mode (shows collision boxes, FPS, player position) |

## 🗺️ Map Integration

Place your Tiled JSON export in the `/public` folder and load it:

```typescript
const game = new Game(canvas);
await game.loadCollisionsFromTiled('/map/bakery.json');
```

Your Tiled map should have an **Object Layer** named "Collision" with rectangle objects defining walls and obstacles.

## 🥐 NPCs

NPCs are configured in `src/data/npcs.ts`. Each NPC has:
- Position on the map
- Multiple dialog lines that cycle through
- Interaction radius
- Optional sprite image

## 🎯 Tech Stack

- **HTML5 Canvas**
- **CSS**
- **TypeScript**
- **Vite**
