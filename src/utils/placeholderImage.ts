import type { PhotoTone } from '../models';

export const TONE_COLOR: Record<PhotoTone, string> = { orange: '#ff6b3d', blue: '#58b6ff', yellow: '#ffd157' };

/** Gera uma imagem PNG simulando o "original" das fotos de exemplo (sem marca d'água). */
export function renderOriginalPlaceholder(tone: PhotoTone, title: string): string {
  const canvas = document.createElement('canvas');
  canvas.width = 1600;
  canvas.height = 1000;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  const color = TONE_COLOR[tone];
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1600, 1000);
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(160, 120, 1280, 760);
  ctx.fillStyle = color;
  ctx.fillRect(300, 330, 260, 380);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(660, 280, 200, 480);
  ctx.fillStyle = color;
  ctx.fillRect(960, 390, 300, 320);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 34px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${title} — ORIGINAL (SIMULADA)`, 800, 820);
  return canvas.toDataURL('image/png');
}
