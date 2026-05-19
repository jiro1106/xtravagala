export type LogoStyle = 'l1' | 'l2' | 'l3' | 'l4';

export interface Logo {
  id: string;
  name: string;
  style: LogoStyle;
}

export const logos: Logo[] = [
  { id: 'northbeat', name: 'Northbeat', style: 'l1' },
  { id: 'hush', name: 'Hush Hours', style: 'l2' },
  { id: 'frame', name: 'FRAME×FRAME', style: 'l3' },
  { id: 'soft', name: 'soft·assembly', style: 'l4' },
  { id: 'loma', name: 'Loma Studio', style: 'l1' },
  { id: 'pier', name: 'Pier 17', style: 'l2' },
  { id: 'northshore', name: 'NORTHSHORE', style: 'l3' },
  { id: 'quiet', name: 'quiet·collective', style: 'l4' },
];
