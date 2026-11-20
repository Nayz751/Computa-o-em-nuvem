/**
 * Aplica uma marca d'água SIMULADA no navegador e devolve uma prévia reduzida.
 * Em produção, esta etapa deve ser feita por um serviço de backend; o original não deve ficar no cliente.
 */
export async function applyWatermark(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Não foi possível ler a imagem "${file.name}".`));
      img.src = url;
    });
    const scale = Math.min(1, 900 / Math.max(image.width, image.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(image.width * scale);
    canvas.height = Math.round(image.height * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Seu navegador não suporta o processamento de imagens.');
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(-Math.PI / 6);
    ctx.font = `bold ${Math.max(16, canvas.width / 24)}px sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.strokeStyle = 'rgba(26,26,26,0.25)';
    ctx.textAlign = 'center';
    const text = 'TRACEMARK / FOTO DE PROVA';
    const step = Math.max(60, canvas.height / 5);
    for (let y = -canvas.height; y < canvas.height; y += step) {
      ctx.strokeText(text, 0, y);
      ctx.fillText(text, 0, y);
    }
    ctx.restore();
    return canvas.toDataURL('image/jpeg', 0.6);
  } finally {
    URL.revokeObjectURL(url);
  }
}
