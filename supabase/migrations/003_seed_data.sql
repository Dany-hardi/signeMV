-- ============================================================
-- Migration 003 : Données de seed (données initiales)
-- ============================================================

-- Profil de la poétesse MV
INSERT INTO poete (nom, prenom, bio_courte, bio, email_contact, reseaux_sociaux)
VALUES (
  'MV',
  '',
  'Poétesse contemporaine. Écriture de l''intime, ancrée dans la matière et la lenteur.',
  'Je construis ce site non comme un catalogue, mais comme une liseuse de papier numérique — un endroit feutré où les mots peuvent respirer sans être asphyxiés par le bruit permanent des écrans. Mes poèmes naissent de gestes simples : l''observation d''un rayon d''automne sur la table en bois, le silence d''une pièce après un départ.',
  'contact@mv-poesie.com',
  '{"instagram": null, "substack": null, "goodreads": null}'::JSONB
);

-- Tags initiaux
INSERT INTO tags (nom, slug, couleur) VALUES
  ('nature',         'nature',         '#5B6B5C'),
  ('mémoire',        'memoire',        '#6E4A58'),
  ('temps',          'temps',          '#5B6B8C'),
  ('corps',          'corps',          '#8C5A4C'),
  ('lumière',        'lumiere',        '#B8860B'),
  ('nuit',           'nuit',           '#3D3B5C'),
  ('silence',        'silence',        '#7A6E5C'),
  ('eau',            'eau',            '#4A7B8C'),
  ('amour',          'amour',          '#8C4A6E'),
  ('deuil',          'deuil',          '#4A4A4A'),
  ('renaissance',    'renaissance',    '#5C7A5C'),
  ('ville',          'ville',          '#6C6864');

-- Poèmes de seed (depuis INITIAL_POEMS du frontend)
-- Note: collection_id sera rempli après lookup du slug de collection

DO $$
DECLARE
  col_introspection UUID;
  col_saisons       UUID;
  col_etreintes     UUID;
  col_melancolie    UUID;
  col_nocturnes     UUID;
BEGIN
  SELECT id INTO col_introspection FROM collections WHERE slug = 'introspection';
  SELECT id INTO col_saisons       FROM collections WHERE slug = 'saisons';
  SELECT id INTO col_etreintes     FROM collections WHERE slug = 'etreintes';
  SELECT id INTO col_melancolie    FROM collections WHERE slug = 'melancolie';
  SELECT id INTO col_nocturnes     FROM collections WHERE slug = 'nocturnes';

  INSERT INTO poemes (
    slug, titre, contenu, extrait, statut, collection_id,
    reading_time_minutes, audio_url, audio_duration_secondes,
    likes_count, publie_le, is_featured
  ) VALUES
  (
    'les-heures-feutrees',
    'Les Heures Feutrées',
    'Il existe une lueur
Entre le jour qui s''éteint
Et la nuit qui prend soin
D''assembler nos fragments.

Dans le creux de la chambre,
Les ombres portent la douceur
Des promesses inutiles
Et des gestes suspendus.

J''écoute le froissement du temps,
Léger comme une mémoire
Qu''on n''ose trop toucher
De peur qu''elle ne s''effrite.

Tu m''as dit : la lumière ne meurt pas,
Elle s''apprivoise ailleurs.',
    'Il existe une lueur entre le jour qui s''éteint et la nuit qui prend soin d''assembler nos fragments.',
    'publie', col_introspection, 2.0,
    'https://cdn.freesound.org/previews/568/568241_11861866-lq.mp3', 105,
    142, '2026-04-12 00:00:00+00', TRUE
  ),
  (
    'empreinte-du-vent',
    'L''Empreinte du Vent sur l''Écorce',
    'Apprendre la patience des arbres
Qui gardent la trace du soleil
Bien après le crépuscule.

Respirer l''odeur de la terre humide
Quand l''automne s''installe sans bruit
Dans les plis de nos vestes.

Nous avons traversé la forêt des doutes,
Les pieds ancrés dans le silence,
Laissant aux oiseaux le soin
De chanter ce que nos lèvres retenaient.

Rien ne se perd tout à fait,
Seul le regard se déplace.',
    'Apprendre la patience des arbres qui gardent la trace du soleil bien après le crépuscule.',
    'publie', col_saisons, 1.5,
    NULL, NULL,
    98, '2026-03-28 00:00:00+00', FALSE
  ),
  (
    'etreinte-du-silence',
    'L''Étreinte du Silence',
    'Tes mains ouvertes racontent
Les histoires que la voix
N''a jamais su traduire.

Il y a dans la lenteur des paumes
Une géographie sacrée,
Un territoire où la peur dépose ses armes.

Nous n''avons pas besoin d''élever la voix,
La chambre est pleine de vérités simples :
La tasse tiède,
Le souffle régulier,
La certitude d''être là.',
    'Tes mains ouvertes racontent les histoires que la voix n''a jamais su traduire.',
    'publie', col_etreintes, 2.0,
    'https://cdn.freesound.org/previews/568/568241_11861866-lq.mp3', 130,
    215, '2026-02-14 00:00:00+00', FALSE
  ),
  (
    'brouillard-sur-la-jetee',
    'Brouillard sur la Jetée',
    'La mer avance sans rien promettre,
Comme une mémoire rétive
Qui se refuse au rivage.

J''ai compté les farillons
Dans le brouillard épais des 5 heures,
Chaque lueur était un prénom
Que j''avais failli oublier.

Marcher sur le bois mouillé,
Savoir que demain aura la couleur
D''un lin qu''on lave pour la première fois.',
    'La mer avance sans rien promettre, comme une mémoire rétive qui se refuse au rivage.',
    'publie', col_melancolie, 1.5,
    NULL, NULL,
    167, '2026-01-03 00:00:00+00', FALSE
  ),
  (
    'crepuscule-intime',
    'Crépuscule Intime',
    'Se lover dans l''encre des souvenirs
Pour y dessiner un abri
Plus vaste que la nuit.

Quand la ville ferme ses fenêtres,
Il reste le bruissement des pages,
Cette conversation murmurée
Entre le papier et le désir.

Ne crains pas la pénombre,
C''est là que les choses vraies
Prennent leur relief.',
    'Se lover dans l''encre des souvenirs pour y dessiner un abri plus vaste que la nuit.',
    'publie', col_nocturnes, 2.0,
    NULL, NULL,
    304, '2025-11-19 00:00:00+00', FALSE
  );
END $$;

-- Citations extraites des poèmes seed
DO $$
DECLARE
  p1 UUID; p2 UUID; p3 UUID; p4 UUID; p5 UUID;
BEGIN
  SELECT id INTO p1 FROM poemes WHERE slug = 'les-heures-feutrees';
  SELECT id INTO p2 FROM poemes WHERE slug = 'empreinte-du-vent';
  SELECT id INTO p3 FROM poemes WHERE slug = 'etreinte-du-silence';
  SELECT id INTO p4 FROM poemes WHERE slug = 'brouillard-sur-la-jetee';
  SELECT id INTO p5 FROM poemes WHERE slug = 'crepuscule-intime';

  INSERT INTO citations (poeme_id, texte, is_vedette) VALUES
    (p1, 'La lumière ne meurt pas, elle s''apprivoise ailleurs.', TRUE),
    (p1, 'J''écoute le froissement du temps, léger comme une mémoire qu''on n''ose trop toucher.', FALSE),
    (p2, 'Rien ne se perd tout à fait, seul le regard se déplace.', TRUE),
    (p3, 'Il y a dans la lenteur des paumes une géographie sacrée.', FALSE),
    (p4, 'Chaque lueur était un prénom que j''avais failli oublier.', FALSE),
    (p5, 'C''est là que les choses vraies prennent leur relief.', TRUE);
END $$;
