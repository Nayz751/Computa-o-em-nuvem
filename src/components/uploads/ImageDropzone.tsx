import { useId, useRef, useState, type DragEvent } from 'react';

interface Props { onFiles: (files: File[]) => void; disabled?: boolean }

export function ImageDropzone({ onFiles, disabled }: Props) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    setOver(false);
    if (!disabled) onFiles(Array.from(event.dataTransfer.files));
  };

  return (
    <div
      className={over ? 'dropzone is-over' : 'dropzone'}
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={handleDrop}
    >
      <p className="dropzone__title">Arraste as fotos aqui</p>
      <p className="dropzone__text">ou selecione arquivos JPG, JPEG ou PNG do seu computador</p>
      <label htmlFor={id} className={disabled ? 'btn btn--accent is-disabled' : 'btn btn--accent'} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inputRef.current?.click(); } }} tabIndex={disabled ? -1 : 0}>
        ＋ Selecionar fotos
      </label>
      <input
        ref={inputRef} id={id} className="visually-hidden" type="file" multiple accept="image/jpeg,image/png,.jpg,.jpeg,.png" disabled={disabled} tabIndex={-1}
        onChange={(e) => { onFiles(Array.from(e.target.files ?? [])); e.target.value = ''; }}
      />
    </div>
  );
}
