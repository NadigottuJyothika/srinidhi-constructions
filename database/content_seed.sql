-- Supplemental illustrative portfolio and service content.
-- Safe to re-run: project slugs and service titles are checked before insertion.
-- All new portfolio images are served from Unsplash; review image choices before production use.

START TRANSACTION;

UPDATE projects
SET description = CONCAT('Illustrative sample seed record; not a verified completed Srinidhi Constructions commission. ', description)
WHERE slug IN ('the-courtyard-house', 'nirvana-workspace')
  AND description NOT LIKE 'Illustrative sample seed record;%';

INSERT INTO projects (title,slug,description,location,category,status,cover_image)
SELECT 'Illustrative Concept: Terracotta Courtyard Villa','illustrative-terracotta-villa','Illustrative demo only; not a completed or commissioned Srinidhi Constructions project. A residential concept exploring shaded courtyards, textured brick, and generous daylight.','Bengaluru (Illustrative)','Residential','Planned','https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=82'
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE slug='illustrative-terracotta-villa');

INSERT INTO projects (title,slug,description,location,category,status,cover_image)
SELECT 'Illustrative Concept: Garden House','illustrative-garden-house','Illustrative demo only; not a completed or commissioned Srinidhi Constructions project. An independent-house concept shaped around a planted court and calm, practical living spaces.','Bengaluru (Illustrative)','Residential','Planned','https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=82'
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE slug='illustrative-garden-house');

INSERT INTO projects (title,slug,description,location,category,status,cover_image)
SELECT 'Illustrative Concept: Urban Apartment Living','illustrative-urban-apartment','Illustrative demo only; not a completed or commissioned Srinidhi Constructions project. A premium apartment interior concept using warm finishes and clear, flexible zones.','Bengaluru (Illustrative)','Residential','Planned','https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=82'
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE slug='illustrative-urban-apartment');

INSERT INTO projects (title,slug,description,location,category,status,cover_image)
SELECT 'Illustrative Concept: Lightwell Studio Offices','illustrative-lightwell-offices','Illustrative demo only; not a completed or commissioned Srinidhi Constructions project. A modern office concept with shared work areas, quiet rooms, and daylight-led planning.','Bengaluru (Illustrative)','Commercial','Planned','https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=82'
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE slug='illustrative-lightwell-offices');

INSERT INTO projects (title,slug,description,location,category,status,cover_image)
SELECT 'Illustrative Concept: Civic Corner Building','illustrative-civic-corner','Illustrative demo only; not a completed or commissioned Srinidhi Constructions project. A commercial-building study focused on a legible street frontage and adaptable floor plates.','Bengaluru (Illustrative)','Commercial','Planned','https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1400&q=82'
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE slug='illustrative-civic-corner');

INSERT INTO projects (title,slug,description,location,category,status,cover_image)
SELECT 'Illustrative Concept: Material Study Interior','illustrative-material-study','Illustrative demo only; not a completed or commissioned Srinidhi Constructions project. An interior-design study balancing natural materials, restrained detailing, and everyday function.','Bengaluru (Illustrative)','Planning','Planned','https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1400&q=82'
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE slug='illustrative-material-study');

INSERT INTO projects (title,slug,description,location,category,status,cover_image)
SELECT 'Illustrative Concept: Passive Light Residence','illustrative-passive-light-residence','Illustrative demo only; not a completed or commissioned Srinidhi Constructions project. A sustainable-architecture concept considering daylight, shade, and lower-impact material choices.','Bengaluru (Illustrative)','Planning','Planned','https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1400&q=82'
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE slug='illustrative-passive-light-residence');

INSERT INTO projects (title,slug,description,location,category,status,cover_image)
SELECT 'Illustrative Concept: A Home Renewed','illustrative-home-renewed','Illustrative demo only; not a completed or commissioned Srinidhi Constructions project. A renovation concept exploring how an existing home can be adapted with careful planning and a lighter touch.','Bengaluru (Illustrative)','Renovation','Planned','https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=82'
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE slug='illustrative-home-renewed');

INSERT INTO services (title,description,sort_order)
SELECT 'Architectural design','Illustrative service scope only; confirm current availability and project scope directly with Srinidhi Constructions.',5
WHERE NOT EXISTS (SELECT 1 FROM services WHERE LOWER(title)=LOWER('Architectural design'));

INSERT INTO services (title,description,sort_order)
SELECT 'Interior design','Illustrative service scope only; confirm current availability and project scope directly with Srinidhi Constructions.',6
WHERE NOT EXISTS (SELECT 1 FROM services WHERE LOWER(title)=LOWER('Interior design'));

INSERT INTO services (title,description,sort_order)
SELECT 'Structural engineering','Illustrative service scope only; confirm current availability and project scope directly with Srinidhi Constructions.',7
WHERE NOT EXISTS (SELECT 1 FROM services WHERE LOWER(title)=LOWER('Structural engineering'));

INSERT INTO services (title,description,sort_order)
SELECT 'Turnkey construction','Illustrative service scope only; confirm current availability and project scope directly with Srinidhi Constructions.',8
WHERE NOT EXISTS (SELECT 1 FROM services WHERE LOWER(title)=LOWER('Turnkey construction'));

INSERT INTO services (title,description,sort_order)
SELECT 'Project planning and consultation','Illustrative service scope only; confirm current availability and project scope directly with Srinidhi Constructions.',9
WHERE NOT EXISTS (SELECT 1 FROM services WHERE LOWER(title)=LOWER('Project planning and consultation'));

INSERT INTO services (title,description,sort_order)
SELECT 'Sustainable building solutions','Illustrative service scope only; confirm current availability and project scope directly with Srinidhi Constructions.',10
WHERE NOT EXISTS (SELECT 1 FROM services WHERE LOWER(title)=LOWER('Sustainable building solutions'));

INSERT INTO services (title,description,sort_order)
SELECT 'Landscape design','Illustrative service scope only; confirm current availability and project scope directly with Srinidhi Constructions.',11
WHERE NOT EXISTS (SELECT 1 FROM services WHERE LOWER(title)=LOWER('Landscape design'));

COMMIT;
