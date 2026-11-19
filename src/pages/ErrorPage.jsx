import { useEffect } from 'react';
import styled from 'styled-components';
import { isSignedIn } from '../auth/session';
import { Button, ButtonLink, Card, Hint, Stack } from '../components/ui';

const ERRORS = {
  401: {
    title: 'Sign-in required',
    message: 'Your colleague session is not active. Sign in with single sign-on to open the desk.',
  },
  404: {
    title: 'Page not found',
    message: 'That address is not part of ID&Go. Check the link, or go back to search.',
  },
  500: {
    title: 'Something went wrong',
    message: 'The desk could not complete that request. Refresh the page, or return to search and try again.',
  },
};

const Code = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.color.green};
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const Title = styled.h1`
  margin: 4px 0 0;
  font-size: 32px;
  line-height: 1.15;
  letter-spacing: -0.03em;
`;

const Mark = styled.div`
  width: 56px;
  height: 56px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: ${({ theme, $code }) => ($code === '500' ? theme.color.dangerSoft : theme.color.greenSoft)};
  color: ${({ theme, $code }) => ($code === '500' ? theme.color.danger : theme.color.greenDark)};
  font-size: 18px;
  font-weight: 700;
`;

export function ErrorPage({ code = '404' }) {
  const error = ERRORS[code] || ERRORS[404];
  const signedIn = isSignedIn();

  useEffect(() => {
    document.title = `${error.title} · ID&Go`;
  }, [error.title]);

  return (
    <Card>
      <Stack $gap={14}>
        <Mark $code={code} aria-hidden="true">{code}</Mark>
        <div>
          <Code>Error {code}</Code>
          <Title>{error.title}</Title>
          <Hint>{error.message}</Hint>
        </div>
        <Stack $gap={10}>
          {code === '500' ? (
            <Button type="button" onClick={() => window.location.reload()}>
              Try again
            </Button>
          ) : null}
          {signedIn ? (
            <ButtonLink to="/" $variant={code === '500' ? 'secondary' : 'primary'}>
              Search by reference
            </ButtonLink>
          ) : (
            <ButtonLink to="/sign-in">Sign in with single sign-on</ButtonLink>
          )}
        </Stack>
      </Stack>
    </Card>
  );
}
