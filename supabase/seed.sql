-- =============================================================================
-- XtravaGala — Seed Data
-- Runs on `supabase db reset`.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- cities (from frontend/src/data/cities.ts)
-- -----------------------------------------------------------------------------
insert into public.cities (id, name, image_url, sort_order) values
  ('manila',    'Manila',                 'https://images.unsplash.com/photo-1598258710957-db8614c2881e?auto=format&fit=crop&w=1600&q=80', 1),
  ('bgc',       'Bonifacio Global City',  'https://images.unsplash.com/photo-1718850114860-58f2a00cf8f5?auto=format&fit=crop&w=1200&q=80', 2),
  ('makati',    'Makati City',            'https://images.unsplash.com/photo-1607282729548-e1d13feae36f?auto=format&fit=crop&w=1200&q=80', 3),
  ('cebu',      'Cebu City',              'https://images.unsplash.com/photo-1505261476952-32e25cbfc755?auto=format&fit=crop&w=1200&q=80', 4),
  ('davao',     'Davao City',             'https://images.unsplash.com/photo-1649177422020-2bbbe0a023c2?auto=format&fit=crop&w=1200&q=80', 5),
  ('quezon',    'Quezon City',            'https://images.unsplash.com/photo-1618326889227-8cf3c304ced8?auto=format&fit=crop&w=1200&q=80', 6),
  ('iloilo',    'Iloilo City',            'https://images.unsplash.com/photo-1583685133115-90748ccbe274?auto=format&fit=crop&w=1200&q=80', 7),
  ('cdo',       'Cagayan de Oro',         'https://images.unsplash.com/photo-1643254181429-19ec3b9db009?auto=format&fit=crop&w=1200&q=80', 8),
  ('baguio',    'Baguio City',            'https://images.unsplash.com/photo-1580127252363-1d29a1ff0603?auto=format&fit=crop&w=1200&q=80', 9),
  ('bacolod',   'Bacolod City',           'https://images.unsplash.com/photo-1599914195435-d50222bbd2ca?auto=format&fit=crop&w=1200&q=80', 10),
  ('zamboanga', 'Zamboanga City',         'https://images.unsplash.com/photo-1710191987214-9d82cd48de77?auto=format&fit=crop&w=1200&q=80', 11),
  ('gensan',    'General Santos City',    'https://images.unsplash.com/photo-1519101739220-83f6a14852ca?auto=format&fit=crop&w=1200&q=80', 12)
on conflict (id) do nothing;

-- -----------------------------------------------------------------------------
-- categories (from frontend/src/data/categories.ts)
-- -----------------------------------------------------------------------------
insert into public.categories (id, label, svg_content, sort_order) values
  ('music',      'Live music',     '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>', 1),
  ('nightlife',  'Nightlife',      '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>', 2),
  ('food',       'Food & drink',   '<path d="M6 2v6a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V2"/><path d="M6 2h12"/><path d="M12 11v11"/><path d="M8 22h8"/>', 3),
  ('workshops',  'Workshops',      '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>', 4),
  ('outdoors',   'Outdoors',       '<circle cx="12" cy="12" r="9"/><path d="M12 3a14 14 0 0 1 0 18"/><path d="M12 3a14 14 0 0 0 0 18"/><path d="M3 12h18"/>', 5),
  ('holidays',   'Holidays',       '<rect x="4" y="6" width="16" height="14" rx="2"/><path d="M8 2v4"/><path d="M16 2v4"/><path d="M4 10h16"/>', 6),
  ('hobbies',    'Hobbies',        '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>', 7),
  ('business',   'Business',       '<rect x="2" y="6" width="20" height="14" rx="2"/><path d="M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>', 8)
on conflict (id) do nothing;

-- -----------------------------------------------------------------------------
-- Admin promotion
-- Run AFTER signing up once with admin@xtravagala.com via the app.
-- Safe to leave in seed.sql: it's a no-op until that auth user exists.
-- -----------------------------------------------------------------------------
update public.profiles
set is_admin = true,
    full_name = 'XtravaGala Admin'
where id = (select id from auth.users where email = 'admin@xtravagala.com');
