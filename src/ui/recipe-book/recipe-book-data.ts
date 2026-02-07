export type RecipeCard = {
  title: string;
  time: string;
  difficulty: string;
  blurb: string;
  badge: string;
  image: string;
  imageAlt: string;
  ingredients: string[];
  steps: string[];
};

export const DEFAULT_RECIPES: RecipeCard[] = [
  {
    title: "Mona's Dinkelbrot",
    time: '1 h 5 min',
    difficulty: 'Einfach',
    blurb: 'Ein sehr einfaches Brot mit Übernachtgare und knuspriger Kruste.',
    badge: 'Mona Core',
    image: '/recipes/dinkelmona.png',
    imageAlt: 'Dinkelbrot',
    ingredients: [
      '10 g frische Hefe',
      '450 g lauwarmes Wasser',
      '600 g Dinkelmehl (Type 630)',
      '15 g Salz',
      '10 g Zucker',
    ],
    steps: [
      'Hefe im lauwarmen Wasser auflösen, dann alle Zutaten kurz mit einem Löffel verrühren (nicht kneten).',
      'Teig abgedeckt 8–12 Stunden im Kühlschrank reifen lassen.',
      'Topf (Gusseisen oder ofenfest) im Ofen auf 250 °C Ober-/Unterhitze vorheizen.',
      'Teig auf bemehltes Backpapier stürzen, über die Seiten falten und mit Papier in den heißen Topf setzen.',
      '30 Minuten mit Deckel backen, dann auf 200 Â°C reduzieren und weitere 20 Minuten ohne Deckel backen.',
    ],
  },
  {
    title: 'Pizzateig',
    image: '/recipes/pizzateig.png',
    imageAlt: 'Pizzateig',
    time: '1 h 15 min',
    difficulty: 'Einfach',
    blurb: 'Klassischer Pizzateig mit kurzer Gehzeit.',
    badge: 'Brot',
    ingredients: [
      '250 ml lauwarmes Wasser',
      '1 Wuerfel frische Hefe (ca. 42 g)',
      '1 Prise Zucker',
      '2 EL Oel',
      '500 g Mehl (plus etwas zum Arbeiten)',
      '1 TL Salz',
    ],
    steps: [
      'Hefe im lauwarmen Wasser mit Zucker und Salz verruehren und 10-15 Minuten gehen lassen.',
      'Mehl und Salz mischen, Hefewasser und Oel zugeben und mindestens 5 Minuten kneten, bis der Teig glatt ist.',
      'Abgedeckt an einem warmen Ort etwa 40 Minuten gehen lassen.',
      'Teig teilen, rund ausrollen, bei 240 Grad (Umluft 220) belegen und ca. 15 Minuten backen.',
    ],
  },
  {
    title: 'Focaccia',
    image: '/recipes/pita.png',
    imageAlt: 'Focaccia',
    time: '1 h 55 min',
    difficulty: 'Einfach',
    blurb: 'Italienisches Fladenbrot mit Olivenoel und Rosmarin.',
    badge: 'Brot',
    ingredients: [
      '500 g Mehl (Type 405)',
      '21 g Frischhefe (oder 7 g Trockenhefe)',
      '1 EL Olivenoel',
      '300 ml lauwarmes Wasser',
      '1 Prise Zucker',
      '2 TL Salz',
      'Olivenoel fuer die Form und den Belag',
      'Meersalz',
      'frischer Rosmarin',
    ],
    steps: [
      'Hefe in lauwarmem Wasser mit Olivenoel verruehren.',
      'Mehl mit Salz und Zucker mischen, Hefewasser zugeben und etwa 10 Minuten zu einem glatten Teig kneten.',
      'Teig abgedeckt ca. 45 Minuten ruhen lassen.',
      'Teig in eine geoelte Form geben, in die Ecken druecken, Olivenoel darueber geben und Mulden eindruecken.',
      'Mit Meersalz und Rosmarin bestreuen, nochmals ca. 45 Minuten ruhen lassen.',
      'Bei 200 Grad Umluft etwa 20-25 Minuten backen.',
    ],
  },
];
