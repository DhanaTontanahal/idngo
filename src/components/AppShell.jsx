import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { getSession, isSignedIn, signOut } from '../auth/session';
import { IdMark, UserIcon } from './Icons';

const Skip = styled.a`
  position: absolute;
  left: 12px;
  top: -48px;
  z-index: 50;
  padding: 8px 12px;
  border-radius: 8px;
  background: ${({ theme }) => theme.color.white};
  color: ${({ theme }) => theme.color.greenDeep};
  font-weight: 700;

  &:focus { top: 12px; }
`;

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 20;
  background: ${({ theme }) => theme.color.greenDeep};
  color: ${({ theme }) => theme.color.white};
  box-shadow: inset 0 -3px 0 ${({ theme }) => theme.color.greenBright};
`;

const HeaderInner = styled.div`
  width: min(960px, 100%);
  margin: 0 auto;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const Brand = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  color: inherit;
  text-decoration: none;
`;

const Mark = styled.span`
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: ${({ theme }) => theme.color.greenBright};
  color: ${({ theme }) => theme.color.white};

  svg { width: 28px; height: 28px; }
`;

const Word = styled.span`
  display: flex;
  flex-direction: column;
  line-height: 1.05;
`;

const Name = styled.span`
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1;
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  min-width: 0;
`;

const Colleague = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`;

const UserCopy = styled.div`
  min-width: 0;
  text-align: right;

  strong {
    display: block;
    font-size: 14px;
    font-weight: 700;
    line-height: 1.2;
    white-space: nowrap;
  }

  span {
    display: block;
    margin-top: 2px;
    font-size: 12px;
    line-height: 1.2;
    color: rgba(255, 255, 255, 0.78);
    white-space: nowrap;
  }

  @media (max-width: 640px) {
    display: none;
  }
`;

const AvatarButton = styled.button`
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: ${({ theme }) => theme.color.white};
  color: ${({ theme }) => theme.color.greenDeep};
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.28);
  cursor: pointer;

  svg {
    width: 22px;
    height: 22px;
    display: block;
  }

  &[aria-expanded='true'] {
    box-shadow: 0 0 0 2px ${({ theme }) => theme.color.white}, 0 0 0 4px ${({ theme }) => theme.color.greenBright};
  }
`;

const Menu = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 30;
  min-width: 196px;
  padding: 8px;
  border-radius: 12px;
  background: ${({ theme }) => theme.color.white};
  color: ${({ theme }) => theme.color.ink};
  box-shadow: 0 12px 28px rgba(4, 38, 28, 0.18);
`;

const MenuIdentity = styled.div`
  padding: 8px 10px 10px;
  border-bottom: 1px solid ${({ theme }) => theme.color.line};

  strong {
    display: block;
    font-size: 14px;
  }

  span {
    display: block;
    margin-top: 2px;
    color: ${({ theme }) => theme.color.muted};
    font-size: 12px;
  }
`;

const Logout = styled.button`
  width: 100%;
  min-height: 44px;
  margin-top: 6px;
  padding: 8px 10px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: ${({ theme }) => theme.color.danger};
  font-size: 15px;
  font-weight: 700;
  text-align: left;
  cursor: pointer;

  &:hover { background: ${({ theme }) => theme.color.dangerSoft}; }
`;

const Clock = styled.time`
  flex: 0 0 auto;
  text-align: right;
  font-variant-numeric: tabular-nums;
  line-height: 1.15;

  strong {
    display: block;
    font-size: 13px;
    font-weight: 700;
  }

  span {
    display: block;
    margin-top: 2px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.78);
  }
`;

const Main = styled.main`
  width: min(960px, 100%);
  margin: 0 auto;
  padding: 20px 16px 48px;

  @media (min-width: 720px) {
    padding: 32px 24px 72px;
  }
`;

function useNow() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return now;
}

export function AppShell({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const now = useNow();
  const signedIn = isSignedIn();
  const session = signedIn ? getSession() : null;
  const dateLabel = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(now);
  const timeLabel = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(now);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    function onPointerDown(event) {
      if (!menuRef.current?.contains(event.target)) setMenuOpen(false);
    }
    function onKeyDown(event) {
      if (event.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  function onLogout() {
    setMenuOpen(false);
    signOut();
    navigate('/sign-in', { replace: true });
  }

  return (
    <>
      <Skip href="#main">Skip to content</Skip>
      <Header>
        <HeaderInner>
          <Brand to={signedIn ? '/' : '/sign-in'}>
            <Mark>
              <IdMark />
            </Mark>
            <Word>
              <Name>ID&Go</Name>
            </Word>
          </Brand>
          <Right>
            {session ? (
              <Colleague ref={menuRef}>
                <UserCopy>
                  <strong>{session.name}</strong>
                  <span>{session.team}</span>
                </UserCopy>
                <AvatarButton
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  aria-label={`Account menu for ${session.name}`}
                  onClick={() => setMenuOpen((open) => !open)}
                >
                  <UserIcon />
                </AvatarButton>
                {menuOpen ? (
                  <Menu role="menu" aria-label="Account">
                    <MenuIdentity>
                      <strong>{session.name}</strong>
                      <span>{session.team}</span>
                    </MenuIdentity>
                    <Logout type="button" role="menuitem" onClick={onLogout}>Log out</Logout>
                  </Menu>
                ) : null}
              </Colleague>
            ) : null}
            <Clock dateTime={now.toISOString()} aria-label={`${dateLabel} ${timeLabel}`}>
              <strong>{dateLabel}</strong>
              <span>{timeLabel}</span>
            </Clock>
          </Right>
        </HeaderInner>
      </Header>
      <Main id="main">{children}</Main>
    </>
  );
}
