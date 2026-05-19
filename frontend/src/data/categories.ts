export interface Category {
  id: string;
  label: string;
  svgContent: string;
}

export const categories: Category[] = [
  {
    id: 'music',
    label: 'Live music',
    svgContent: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  },
  {
    id: 'nightlife',
    label: 'Nightlife',
    svgContent: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
  },
  {
    id: 'food',
    label: 'Food & drink',
    svgContent: '<path d="M6 2v6a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V2"/><path d="M6 2h12"/><path d="M12 11v11"/><path d="M8 22h8"/>',
  },
  {
    id: 'workshops',
    label: 'Workshops',
    svgContent: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  },
  {
    id: 'outdoors',
    label: 'Outdoors',
    svgContent: '<circle cx="12" cy="12" r="9"/><path d="M12 3a14 14 0 0 1 0 18"/><path d="M12 3a14 14 0 0 0 0 18"/><path d="M3 12h18"/>',
  },
  {
    id: 'holidays',
    label: 'Holidays',
    svgContent: '<rect x="4" y="6" width="16" height="14" rx="2"/><path d="M8 2v4"/><path d="M16 2v4"/><path d="M4 10h16"/>',
  },
  {
    id: 'hobbies',
    label: 'Hobbies',
    svgContent: '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>',
  },
  {
    id: 'business',
    label: 'Business',
    svgContent: '<rect x="2" y="6" width="20" height="14" rx="2"/><path d="M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>',
  },
];
