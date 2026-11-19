import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { signIn, isSignedIn } from '../auth/session';
import { colleague } from '../constants';
import { Button, Card, Hint, Kicker, PageTitle, Stack } from '../components/ui';

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const Panel = styled(Card)`
  width: min(460px, 100%);
  margin: 12px auto 0;

  button { width: 100%; }
`;

const Loader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-height: 148px;
  justify-content: center;
  text-align: center;

  strong { font-size: 18px; }
  span {
    color: ${({ theme }) => theme.color.inkSoft};
    font-size: 15px;
  }
`;

const Spinner = styled.span`
  width: 36px;
  height: 36px;
  margin-bottom: 6px;
  border-radius: 50%;
  border: 3px solid ${({ theme }) => theme.color.greenSoft};
  border-top-color: ${({ theme }) => theme.color.green};
  animation: ${spin} 0.7s linear infinite;
`;

const Account = styled.p`
  margin: 0;
  padding: 12px 14px;
  border-radius: 12px;
  background: ${({ theme }) => theme.color.paper};
  color: ${({ theme }) => theme.color.inkSoft};
  font-size: 14px;
  line-height: 1.45;

  strong { color: ${({ theme }) => theme.color.ink}; }
`;

export function SignInPage() {
  const navigate = useNavigate();
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    document.title = 'Sign in · ID&Go';
  }, []);

  if (isSignedIn()) {
    return <Navigate to="/" replace />;
  }

  async function onSignIn() {
    setSigningIn(true);
    await new Promise((resolve) => {
      window.setTimeout(resolve, 1400);
    });
    signIn(colleague);
    navigate('/', { replace: true });
  }

  return (
    <Panel>
      <Stack $gap={16}>
        <div>
          <Kicker>Single sign-on</Kicker>
          <PageTitle>Sign in to ID&Go</PageTitle>
          <Hint>
            Use your colleague single sign-on to open the credit card application desk.
          </Hint>
        </div>
        <Account>
          This demonstration signs you in as <strong>{colleague.name}</strong>, {colleague.team}. No password is sent anywhere.
        </Account>
        {signingIn ? (
          <Loader role="status" aria-live="polite">
            <Spinner aria-hidden="true" />
            <strong>Signing you in</strong>
            <span>Checking your single sign-on session</span>
          </Loader>
        ) : (
          <Button type="button" onClick={onSignIn}>
            Sign in with single sign-on
          </Button>
        )}
      </Stack>
    </Panel>
  );
}
