import { Poem } from '../types';

export const INITIAL_POEMS: Poem[] = [
  {
    id: 'p-001',
    slug: 'les-heures-feutrees',
    titre: 'Les Heures Feutrées',
    extrait: 'Il existe une lueur entre le jour qui s’éteint et la nuit qui prend soin d’assembler nos fragments.',
    contenu: `Il existe une lueur
Entre le jour qui s’éteint
Et la nuit qui prend soin
D’assembler nos fragments.

Dans le creux de la chambre,
Les ombres portent la douceur
Des promesses inutiles
Et des gestes suspendus.

J’écoute le froissement du temps,
Léger comme une mémoire
Qu’on n’ose trop toucher
De peur qu’elle ne s’effrite.

Tu m’as dit : la lumière ne meurt pas,
Elle s’apprivoise ailleurs.`,
    datePublication: '12 Avril 2026',
    theme: 'Introspection',
    readingTime: '2 min',
    audioDuration: '1:45',
    audioUrl: 'https://cdn.freesound.org/previews/568/568241_11861866-lq.mp3',
    statut: 'publié',
    likesCount: 142
  },
  {
    id: 'p-002',
    slug: 'empreinte-du-vent',
    titre: 'L’Empreinte du Vent sur l’Écorce',
    extrait: 'Apprendre la patience des arbres qui gardent la trace du soleil bien après le crépuscule.',
    contenu: `Apprendre la patience des arbres
Qui gardent la trace du soleil
Bien après le crépuscule.

Respirer l’odeur de la terre humide
Quand l’automne s’installe sans bruit
Dans les plis de nos vestes.

Nous avons traversé la forêt des doutes,
Les pieds ancrés dans le silence,
Laissant aux oiseaux le soin
De chanter ce que nos lèvres retenaient.

Rien ne se perd tout à fait,
Seul le regard se déplace.`,
    datePublication: '28 Mars 2026',
    theme: 'Saisons',
    readingTime: '1.5 min',
    statut: 'publié',
    likesCount: 98
  },
  {
    id: 'p-003',
    slug: 'etraint-du-silence',
    titre: 'L’Étreinte du Silence',
    extrait: 'Tes mains ouvertes racontent les histoires que la voix n’a jamais su traduire.',
    contenu: `Tes mains ouvertes racontent
Les histoires que la voix
N’a jamais su traduire.

Il y a dans la lenteur des paumes
Une géographie sacrée,
Un territoire où la peur dépose ses armes.

Nous n’avons pas besoin d’élever la voix,
La chambre est pleine de vérités simples :
La tasse tiède,
Le souffle régulier,
La certitude d’être là.`,
    datePublication: '14 Février 2026',
    theme: 'Étreintes',
    readingTime: '2 min',
    audioDuration: '2:10',
    audioUrl: 'https://cdn.freesound.org/previews/568/568241_11861866-lq.mp3',
    statut: 'publié',
    likesCount: 215
  },
  {
    id: 'p-004',
    slug: 'brouillard-sur-la-jette',
    titre: 'Brouillard sur la Jetée',
    extrait: 'La mer avance sans rien promettre, comme une mémoire rétive qui se refuse au rivage.',
    contenu: `La mer avance sans rien promettre,
Comme une mémoire rétive
Qui se refuse au rivage.

J’ai compté les farillons
Dans le brouillard épais des 5 heures,
Chaque lueur était un prénom
Que j’avais failli oublier.

Marcher sur le bois mouillé,
Savoir que demain aura la couleur
D’un lin qu’on lave pour la première fois.`,
    datePublication: '03 Janvier 2026',
    theme: 'Mélancolie',
    readingTime: '1.5 min',
    statut: 'publié',
    likesCount: 167
  },
  {
    id: 'p-005',
    slug: 'crepuscule-intime',
    titre: 'Crépuscule Intime',
    extrait: 'Se lover dans l’encre des souvenirs pour y dessiner un abri plus vaste que la nuit.',
    contenu: `Se lover dans l’encre des souvenirs
Pour y dessiner un abri
Plus vaste que la nuit.

Quand la ville ferme ses fenêtres,
Il reste le bruissement des pages,
Cette conversation murmurée
Entre le papier et le désir.

Ne crains pas la pénombre,
C’est là que les choses vraies
Prennent leur relief.`,
    datePublication: '19 Novembre 2025',
    theme: 'Nocturnes',
    readingTime: '2 min',
    statut: 'publié',
    likesCount: 304
  }
];
