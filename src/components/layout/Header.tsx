
import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { Logo } from './Logo';

export function Header() {
  const { currentUser, logout, notifications, markNotificationAsRead } = useApp();
  const { notify } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isPhotographer = currentUser?.role === 'photographer';
  const userNotifications = notifications.filter((n) => n.userId === currentUser?.id);
  const unreadCount = userNotifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    setMenuOpen(false);
    setNavOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    const onDown = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };

    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);

    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const handleLogout = async () => {
    await logout();
    notify('info', 'Você saiu da sua conta.');
    navigate('/');
  };

  const link = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'nav__link is-active' : 'nav__link';

  return (
    <header className="header">
      <div className="header__inner">
        <Logo />

        <button
          type="button"
          className="header__burger"
          aria-expanded={navOpen}
          aria-controls="main-nav"
          aria-label="Abrir menu"
          onClick={() => setNavOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav
          id="main-nav"
          className={navOpen ? 'nav is-open' : 'nav'}
          aria-label="Principal"
        >
          <NavLink to="/" end className={link}>
            Mural
          </NavLink>

          <NavLink to="/como-funciona" className={link}>
            Como funciona
          </NavLink>

          {isPhotographer ? (
            <>
              <NavLink to="/admin/enviar" className={link}>
                Publicar fotos
              </NavLink>

              <NavLink to="/admin/fotos" className={link}>
                Minhas fotos
              </NavLink>
            </>
          ) : (
            <NavLink to="/para-fotografos" className={link}>
              Para fotógrafos
            </NavLink>
          )}
          {currentUser && (
            <div className="nav__notifications">
              <button
                type="button"
                className="nav__notification-btn"
                aria-label={`Notificações: ${unreadCount} não lidas`}
                aria-expanded={notificationsOpen}
                onClick={() => setNotificationsOpen((v) => !v)}
              >
                <svg className="nav__notification-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z" /><path d="M10 20a2 2 0 0 0 4 0" /></svg>
                {unreadCount > 0 && <span className="nav__notification-dot">{unreadCount}</span>}
              </button> 

              {notificationsOpen && (
                <div className="menu">
                  <strong>Notificações</strong>
                  {userNotifications.length === 0 ? (
                    <p>Você ainda não tem notificações.</p>
                  ) : (
                    userNotifications.map((notification) => (
                      <Link
                        key={notification.id}
                        to={`/foto/${notification.photoId}`}
                        onClick={() => {
                          markNotificationAsRead(notification.id);
                          setNotificationsOpen(false);
                        }}
                      >
                        {notification.message}
                        {!notification.isRead && <strong> • Nova</strong>}
                      </Link>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
          <div className="nav__account" ref={menuRef}>
            {currentUser ? (
              <>
                <button
                  type="button"
                  className="btn btn--dark btn--sm"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen((v) => !v)}
                >
                  {currentUser.name.split(' ')[0]} ▾
                </button>

                {menuOpen && (
                  <div className="menu" role="menu">
                    <p className="menu__who">
                      {currentUser.handle}
                      <small>
                        {isPhotographer ? 'Fotógrafo(a)' : 'Usuário comum'}
                      </small>
                    </p>

                    <Link role="menuitem" to="/perfil">
                      Meu perfil
                    </Link>

                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                    >
                      Sair
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Link to="/entrar" className="btn btn--dark btn--sm">
                Entrar
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
