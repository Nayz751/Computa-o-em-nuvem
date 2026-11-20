export interface SelectedImage { key: string; file: File; url: string }

export function ImagePreviewList({ items, onRemove, disabled }: { items: SelectedImage[]; onRemove: (key: string) => void; disabled?: boolean }) {
  if (items.length === 0) return null;
  return (
    <ul className="previews" aria-label="Imagens selecionadas">
      {items.map((item) => (
        <li key={item.key} className="previews__item">
          <img src={item.url} alt={`Prévia de ${item.file.name}`} />
          <span className="previews__name" title={item.file.name}>{item.file.name}</span>
          <button type="button" className="previews__remove" onClick={() => onRemove(item.key)} disabled={disabled} aria-label={`Remover ${item.file.name}`}>×</button>
        </li>
      ))}
    </ul>
  );
}
