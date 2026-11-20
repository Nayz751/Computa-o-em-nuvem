import { NavLink } from 'react-router-dom';

const items = [
  { to: '/admin/enviar', label: 'Enviar fotos' },
  { to: '/admin/fotos', label: 'Fotografias publicadas' },
];

export function AdminNav() {
  return (
    <nav className="subnav" aria-label="Área do fotógrafo">
      {items.map((i) => (
        <NavLink key={i.to} to={i.to} className={({ isActive }) => (isActive ? 'subnav__link is-active' : 'subnav__link')}>{i.label}</NavLink>
      ))}
    </nav>
  );
}
