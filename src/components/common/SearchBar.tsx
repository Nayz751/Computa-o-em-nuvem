import type { FormEvent } from 'react';
import { useId } from 'react';

interface SearchBarProps {
  eyebrow?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  actionLabel?: string;
  compact?: boolean;
}

export function SearchBar({ eyebrow, placeholder, value, onChange, onSubmit, actionLabel = 'Buscar', compact }: SearchBarProps) {
  const id = useId();
  const submit = (event: FormEvent) => { event.preventDefault(); onSubmit?.(); };
  return (
    <form className={compact ? 'searchbar searchbar--compact' : 'searchbar'} role="search" onSubmit={submit}>
      <div className="searchbar__field">
        <label htmlFor={id} className="searchbar__eyebrow">{eyebrow ?? 'Buscar'}</label>
        <input id={id} type="search" className="searchbar__input" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
      <button type="submit" className="btn btn--dark">{actionLabel}</button>
    </form>
  );
}
