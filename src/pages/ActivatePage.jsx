import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { activateAccount } from '../api/mockApi';
import { colleague } from '../constants';
import { formatAccount, formatDateTime, formatMoney, fullName } from '../format';
import { useApplication } from '../hooks/useApplication';
import { SelectedApplication } from '../components/SelectedApplication';
import {
  Actions,
  BackLink,
  Button,
  ButtonLink,
  Card,
  CardTitle,
  CheckRow,
  Field,
  FieldError,
  Hint,
  LoadingBlock,
  Modal,
  Notice,
  PageTitle,
  ProgressTrack,
  Stack,
  TextArea,
} from '../components/ui';

const Checks = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Check = styled.li`
  display: grid;
  grid-template-columns: 28px 1fr;
  gap: 10px;
  align-items: start;

  strong { display: block; font-size: 15px; }
  span {
    display: block;
    margin-top: 2px;
    color: ${({ theme }) => theme.color.inkSoft};
    font-size: 14px;
  }
`;

const Mark = styled.span`
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  font-size: 14px;
  font-weight: 700;
  background: ${({ theme, $ok }) => ($ok ? theme.color.successSoft : theme.color.warningSoft)};
  color: ${({ theme, $ok }) => ($ok ? theme.color.success : theme.color.warning)};
`;

const AccountNumber = styled.p`
  margin: 12px 0 4px;
  font-family: ${({ theme }) => theme.mono};
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 0.04em;
`;

const SuccessMark = styled.div`
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: ${({ theme }) => theme.color.green};
  color: white;
  font-size: 28px;
  font-weight: 700;
`;

export function ActivatePage() {
  const { reference: rawReference = '' } = useParams();
  const { application, setApplication, error, loading, reload, reference } = useApplication(rawReference);
  const [attested, setAttested] = useState(false);
  const [note, setNote] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');
  const closeConfirm = useCallback(() => {
    if (!busy) setConfirming(false);
  }, [busy]);

  useEffect(() => {
    document.title = `Activate · ${reference} · ID&Go`;
  }, [reference]);

  if (loading) {
    return (
      <Stack>
        <BackLink to={`/applications/${reference}`}>Back to application</BackLink>
        <LoadingBlock label="Loading account activation" />
      </Stack>
    );
  }

  if (error || !application) {
    return (
      <Stack>
        <BackLink to="/">Search</BackLink>
        <Notice tone="danger">{error?.message || 'That application could not be retrieved.'}</Notice>
        <Button onClick={reload}>Try again</Button>
      </Stack>
    );
  }

  const name = fullName(application.customer);
  const missingIdentity = !application.documents.identity;
  const missingAddress = !application.documents.address;
  const ready = !missingIdentity && !missingAddress && application.status !== 'cancelled' && application.status !== 'activated';

  async function confirmActivate() {
    setBusy(true);
    setFormError('');
    try {
      const updated = await activateAccount(reference, { attested: true, note });
      setApplication(updated);
      setConfirming(false);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (application.status === 'activated' && application.account) {
    return (
      <Stack>
        <BackLink to={`/applications/${reference}`}>Back to {reference}</BackLink>
        <Card>
          <SuccessMark aria-hidden="true">✓</SuccessMark>
          <PageTitle>Card account opened</PageTitle>
          <Hint>
            The credit card account for {name} is active. The card number below is masked for the desk.
          </Hint>
          <AccountNumber>{formatAccount(application.account.accountNumber)}</AccountNumber>
          <Hint>Account number</Hint>
          <p><strong>{application.account.maskedPan}</strong></p>
          <Hint>
            {application.product.name} · {formatMoney(application.product.approvedLimit)} limit
            <br />
            Activated by {application.account.activatedBy} on {formatDateTime(application.account.activatedAt)}
          </Hint>
          {application.account.note ? <Hint>Desk note: {application.account.note}</Hint> : null}
          <Actions>
            <ButtonLink to="/">Find another application</ButtonLink>
            <ButtonLink to={`/applications/${reference}`} $variant="secondary">
              View application
            </ButtonLink>
          </Actions>
        </Card>
      </Stack>
    );
  }

  return (
    <Stack $gap={16}>
      <BackLink to={`/applications/${reference}`}>Back to {reference}</BackLink>
      <div>
        <PageTitle>Activate card account</PageTitle>
        <Hint>Open the credit card account associated with this online application.</Hint>
      </div>
      <SelectedApplication application={application} />
      {application.status === 'cancelled' ? null : <ProgressTrack current="activate" />}

      {application.status === 'cancelled' ? (
        <Notice tone="danger">This application is cancelled, so the card account cannot be activated.</Notice>
      ) : null}

      {!ready && application.status !== 'cancelled' ? (
        <Notice tone="warning">
          Attach {missingIdentity ? 'an identity document' : ''}
          {missingIdentity && missingAddress ? ' and ' : ''}
          {missingAddress ? 'a proof of address' : ''} before activation.
        </Notice>
      ) : null}

      <Card>
        <CardTitle>{name}</CardTitle>
        <Checks>
          <Check>
            <Mark $ok={application.decision === 'Approved in principle'}>✓</Mark>
            <div>
              <strong>Credit decision</strong>
              <span>
                {application.decision} · {formatMoney(application.product.approvedLimit)} · {application.product.name}
              </span>
            </div>
          </Check>
          <Check>
            <Mark $ok={!missingIdentity}>{missingIdentity ? '!' : '✓'}</Mark>
            <div>
              <strong>Identity</strong>
              <span>{application.documents.identity?.documentType || 'Not attached'}</span>
            </div>
          </Check>
          <Check>
            <Mark $ok={!missingAddress}>{missingAddress ? '!' : '✓'}</Mark>
            <div>
              <strong>Proof of address</strong>
              <span>{application.documents.address?.documentType || 'Not attached'}</span>
            </div>
          </Check>
        </Checks>
      </Card>

      {ready ? (
        <Card>
          <CardTitle>Colleague check</CardTitle>
          <Stack>
            <Hint>Activating as {colleague.name} ({colleague.id}), {colleague.team}.</Hint>
            <CheckRow>
              <input
                type="checkbox"
                checked={attested}
                onChange={(event) => setAttested(event.target.checked)}
              />
              <span>
                I confirm these photographs match {name} and meet acceptance standards for identity and proof of address.
              </span>
            </CheckRow>
            <Field>
              Desk note, optional
              <TextArea
                value={note}
                maxLength={240}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Record anything the next colleague should know"
              />
              <Hint>{note.length}/240</Hint>
            </Field>
            {formError ? <FieldError role="alert">{formError}</FieldError> : null}
            <Button disabled={!attested} onClick={() => setConfirming(true)}>
              Activate card account
            </Button>
            {!attested ? <Hint>Confirm the document check to continue.</Hint> : null}
          </Stack>
        </Card>
      ) : application.status !== 'cancelled' ? (
        <ButtonLink to={`/applications/${reference}/documents`}>Continue application</ButtonLink>
      ) : (
        <ButtonLink to="/" $variant="secondary">Back to search</ButtonLink>
      )}

      {confirming ? (
        <Modal title="Activate this account?" onClose={closeConfirm} dismissable={!busy}>
          <Stack>
            <Hint>
              This opens a {application.product.name} account for {name} with a limit of {formatMoney(application.product.approvedLimit)}. The action is recorded against {reference}.
            </Hint>
            {formError ? <FieldError role="alert">{formError}</FieldError> : null}
            <Actions>
              <Button data-autofocus="true" busy={busy} onClick={confirmActivate}>
                {busy ? 'Activating…' : 'Confirm activation'}
              </Button>
              <Button $variant="secondary" disabled={busy} onClick={closeConfirm}>
                Go back
              </Button>
            </Actions>
          </Stack>
        </Modal>
      ) : null}
    </Stack>
  );
}
