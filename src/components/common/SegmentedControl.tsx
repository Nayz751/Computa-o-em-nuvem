interface Option<T extends string> { value: T; label: string }
interface Props<T extends string> { label: string; options: Option<T>[]; value: T; onChange: (value: T) => void }

export function SegmentedControl<T extends string>({ label, options, value, onChange }: Props<T>) {
  return (
    <div className="segmented" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" className={o.value === value ? 'segmented__item is-active' : 'segmented__item'} aria-pressed={o.value === value} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}
