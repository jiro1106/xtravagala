import { useEffect } from 'react';

const BRAND = 'Xtravagala';
const DEFAULT_TITLE = 'Xtravagala — Discover events in the Philippines';

export function useDocumentTitle(title: string | null | undefined) {
  useEffect(() => {
    document.title = title ? `${title} · ${BRAND}` : DEFAULT_TITLE;
  }, [title]);
}
