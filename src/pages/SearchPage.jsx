import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { resetDemonstrationData, searchApplications } from '../api/mockApi';
import { ENDPOINTS } from '../constants';
import { normaliseReference } from '../format';
import { ApplicationCard } from '../components/ApplicationCard';
import { Button, Card, CardTitle, Field, FieldError, Hint, Input, Kicker, Lede, PageTitle, Stack } from '../components/ui';

const SearchAction = styled.div`
  button { width: 100%; }

  @media (min-width: 720px) {
    button { width: auto; min-width: 220px; }
  }
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const SectionHead = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;

  h2 { margin: 0; font-size: 20px; letter-spacing: -0.02em; }
  span { color: ${({ theme }) => theme.color.muted}; font-size: 14px; font-weight: 600; }
`;

const Details = styled.details`
  border-top: 1px solid ${({ theme }) => theme.color.line};
  padding-top: 12px;

  summary {
    min-height: 44px;
    display: flex;
    align-items: center;
    cursor: pointer;
    font-weight: 700;
    color: ${({ theme }) => theme.color.greenDark};
  }
`;

const EndpointList = styled.ul`
  list-style: none;
  margin: 8px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Endpoint = styled.li`
  display: grid;
  gap: 2px;

  @media (min-width: 720px) {
    grid-template-columns: 64px 1fr;
    gap: 10px 12px;
    align-items: baseline;
  }
`;

const Method = styled.span`
  width: fit-content;
  padding: 2px 6px;
  border-radius: 6px;
  background: ${({ theme, $method }) => ($method === 'GET' ? theme.color.greenSoft : '#E7F2FA')};
  color: ${({ theme, $method }) => ($method === 'GET' ? theme.color.greenDark : theme.color.info)};
  font-family: ${({ theme }) => theme.mono};
  font-size: 12px;
  font-weight: 700;
`;

const Path = styled.code`
  font-family: ${({ theme }) => theme.mono};
  font-size: 13px;
  overflow-wrap: anywhere;
`;

const ResetRow = styled.div`
  margin-top: 14px;
`;

const Purpose = styled.span`
  grid-column: 1 / -1;
  color: ${({ theme }) => theme.color.inkSoft};
  font-size: 14px;

  @media (min-width: 720px) {
    grid-column: 2;
  }
`;

export function SearchPage() {
  const navigate = useNavigate();
  const live = useRef(true);
  const [reference, setReference] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [results, setResults] = useState(null);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    live.current = true;
    return () => {
      live.current = false;
    };
  }, []);

  useEffect(() => {
    document.title = 'ID&Go · Retrieve an application';
  }, []);

  async function runSearch(value) {
    setSearchError('');
    setResults(null);
    setSearching(true);
    try {
      const found = await searchApplications(value);
      if (!live.current) return;
      if (found.length === 1) {
        navigate(`/applications/${found[0].reference}`);
        return;
      }
      setResults(found);
      if (found.length === 0) {
        setSearchError(`No application matches ${normaliseReference(value)}.`);
      }
    } catch (error) {
      if (live.current) setSearchError(error.message);
    } finally {
      if (live.current) setSearching(false);
    }
  }

  async function onReset() {
    setResetting(true);
    setSearchError('');
    setResults(null);
    setReference('');
    try {
      await resetDemonstrationData();
    } catch (error) {
      if (live.current) setSearchError(error.message);
    } finally {
      if (live.current) setResetting(false);
    }
  }

  return (
    <Stack $gap={22}>
      <div>
        <Kicker>Card fulfilment</Kicker>
        <PageTitle>Retrieve an application</PageTitle>
        <Lede>
          Enter the application reference number to retrieve the application details.
        </Lede>
      </div>

      <Card as="form" aria-label="Search by reference" onSubmit={(event) => {
        event.preventDefault();
        runSearch(reference);
      }}>
        <Stack $gap={12}>
          <Field htmlFor="reference">
            Application reference
            <Input
              id="reference"
              value={reference}
              onChange={(event) => setReference(event.target.value)}
              placeholder="e.g. CC482910"
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck="false"
              autoComplete="off"
              maxLength={20}
              aria-describedby="reference-hint"
            />
          </Field>
          <Hint id="reference-hint">Enter the reference from the customer’s online credit card application.</Hint>
          {searchError ? <FieldError role="alert">{searchError}</FieldError> : null}
          {!results && !searchError ? (
            <Hint>No application is shown until you retrieve one by reference number.</Hint>
          ) : null}
          <SearchAction>
            <Button type="submit" busy={searching}>
              {searching ? 'Retrieving…' : 'Retrieve application'}
            </Button>
          </SearchAction>
        </Stack>
      </Card>

      <div aria-live="polite">
        {results && results.length > 1 ? (
          <Stack>
            <SectionHead>
              <h2>Matching applications</h2>
              <span>{results.length} found</span>
            </SectionHead>
            <List>
              {results.map((application) => (
                <ApplicationCard key={application.reference} application={application} />
              ))}
            </List>
          </Stack>
        ) : null}
      </div>

      <Card>
        <CardTitle>Desk services</CardTitle>
        <Hint>These routes are mocked in the browser. Nothing leaves this browser.</Hint>
        <Details>
          <summary>Mock endpoints</summary>
          <EndpointList>
            {ENDPOINTS.map((endpoint) => (
              <Endpoint key={endpoint.path}>
                <Method $method={endpoint.method}>{endpoint.method}</Method>
                <Path>{endpoint.path}</Path>
                <Purpose>{endpoint.purpose}</Purpose>
              </Endpoint>
            ))}
          </EndpointList>
        </Details>
        <ResetRow>
          <Button $variant="ghost" busy={resetting} onClick={onReset}>
            {resetting ? 'Resetting…' : 'Reset demonstration data'}
          </Button>
        </ResetRow>
      </Card>
    </Stack>
  );
}
