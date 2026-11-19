import { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { cancelApplication } from '../api/mockApi';
import { CANCEL_REASONS } from '../constants';
import { formatDate, formatDateTime, formatMoney, formatMonth, formatShortDate, fullName } from '../format';
import { useApplication } from '../hooks/useApplication';
import { SelectedApplication } from '../components/SelectedApplication';
import {
  Actions,
  BackLink,
  Button,
  ButtonLink,
  Card,
  CardTitle,
  Field,
  FieldError,
  FieldGrid,
  Hint,
  LoadingBlock,
  Modal,
  Notice,
  PageTitle,
  ProgressTrack,
  Select,
  Split,
  Stack,
  TextArea,
} from '../components/ui';
import { useParams } from 'react-router-dom';

const Hero = styled.section`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  border-radius: 16px;
  background: ${({ theme }) => theme.color.white};
  border: 1px solid ${({ theme }) => theme.color.line};
  border-top: 4px solid ${({ theme }) => theme.color.green};

  @media (min-width: 720px) {
    padding: 20px;
  }
`;

const Product = styled.p`
  margin: 6px 0 0;
  color: ${({ theme }) => theme.color.inkSoft};
  font-size: 16px;
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
`;

const Stat = styled.div`
  min-width: 0;
  padding: 10px;
  border-radius: 12px;
  background: ${({ theme }) => theme.color.paper};
  border: 1px solid ${({ theme }) => theme.color.line};

  span {
    display: block;
    color: ${({ theme }) => theme.color.muted};
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  strong {
    display: block;
    margin-top: 4px;
    font-size: 15px;
    line-height: 1.3;
  }
`;

const Timeline = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const TimeItem = styled.li`
  position: relative;
  padding-left: 28px;

  &::before {
    content: '';
    position: absolute;
    left: 5px;
    top: 16px;
    bottom: -20px;
    width: 2px;
    background: ${({ theme }) => theme.color.line};
  }

  &:last-child::before { display: none; }

  strong { display: block; font-size: 15px; }
  span {
    display: block;
    margin-top: 2px;
    color: ${({ theme }) => theme.color.inkSoft};
    font-size: 14px;
    line-height: 1.4;
  }
`;

const Dot = styled.i`
  position: absolute;
  left: 0;
  top: 4px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${({ theme, $state }) => {
    if ($state === 'bad') return theme.color.danger;
    if ($state === 'wait') return theme.color.line;
    if ($state === 'current') return theme.color.warning;
    return theme.color.green;
  }};
`;

const DocList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const DocRow = styled.li`
  display: grid;
  grid-template-columns: 72px 1fr;
  gap: 12px;
  align-items: center;
`;

const ThumbButton = styled.button`
  width: 72px;
  height: 72px;
  padding: 0;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.color.line};
  overflow: hidden;
  background: #10241c;
  cursor: pointer;

  img { width: 100%; height: 100%; object-fit: cover; }
`;

const EmptyThumb = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 10px;
  border: 1px dashed ${({ theme }) => theme.color.line};
  display: grid;
  place-items: center;
  color: ${({ theme }) => theme.color.muted};
  font-size: 12px;
  font-weight: 700;
`;

const DocCopy = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;

  strong { font-size: 15px; }
  span {
    color: ${({ theme }) => theme.color.inkSoft};
    font-size: 14px;
  }
`;

const TextLink = styled(ButtonLink)`
  width: fit-content;
  min-height: 36px;
  margin-top: 4px;
  padding: 6px 0;
  background: transparent;
  color: ${({ theme }) => theme.color.green};
`;

const Line = styled.span`
  display: block;
`;

const AccountNumber = styled.p`
  margin: 8px 0 0;
  font-family: ${({ theme }) => theme.mono};
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 0.04em;
`;

const FullImage = styled.img`
  width: 100%;
  max-height: 70vh;
  object-fit: contain;
  border-radius: 12px;
  background: #10241c;
`;

function addressLines(address) {
  return [address.line1, address.line2, address.city, address.postcode].filter(Boolean);
}

function DetailList({ items }) {
  return (
    <FieldGrid>
      {items.map((item) => (
        <div key={item.label}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </FieldGrid>
  );
}

export function ApplicationPage() {
  const { reference: rawReference = '' } = useParams();
  const { application, setApplication, error, loading, reload, reference } = useApplication(rawReference);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [preview, setPreview] = useState(null);
  const closeCancel = useCallback(() => setCancelOpen(false), []);
  const closePreview = useCallback(() => setPreview(null), []);

  useEffect(() => {
    document.title = `${reference || 'Application'} · ID&Go`;
  }, [reference]);

  if (loading) {
    return (
      <Stack>
        <BackLink to="/">Search</BackLink>
        <LoadingBlock />
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

  const locked = application.status === 'cancelled' || application.status === 'activated';
  const ready = application.status === 'ready_to_activate';
  const bothDocuments = application.documents.identity && application.documents.address;
  const name = fullName(application.customer);

  const timeline = [
    {
      title: 'Submitted online',
      detail: formatDateTime(application.appliedAt),
      state: 'done',
    },
    {
      title: 'Credit decision',
      detail: `${application.decision} · ${formatMoney(application.product.approvedLimit)}`,
      state: 'done',
    },
    {
      title: 'Identity and address',
      detail: bothDocuments
        ? 'Both photographs are attached'
        : 'Photographs still required before activation',
      state: bothDocuments ? 'done' : application.status === 'cancelled' ? 'wait' : 'current',
    },
    application.status === 'cancelled'
      ? {
          title: 'Application cancelled',
          detail: `${application.cancellation.reason} · ${formatDateTime(application.cancellation.cancelledAt)}`,
          state: 'bad',
        }
      : {
          title: 'Card account',
          detail: application.account
            ? `Active from ${formatDateTime(application.account.activatedAt)}`
            : 'Not activated',
          state: application.account ? 'done' : 'wait',
        },
  ];

  return (
    <Stack $gap={16}>
      <BackLink to="/">Search</BackLink>
      <Hero>
        <SelectedApplication application={application} />
        <div>
          <PageTitle>{name}</PageTitle>
          <Product>{application.product.name}</Product>
        </div>
        <Stats>
          <Stat>
            <span>Approved limit</span>
            <strong>{formatMoney(application.product.approvedLimit)}</strong>
          </Stat>
          <Stat>
            <span>Channel</span>
            <strong>{application.channel}</strong>
          </Stat>
          <Stat>
            <span>Applied</span>
            <strong>{formatShortDate(application.appliedAt)}</strong>
          </Stat>
        </Stats>
        {application.status === 'cancelled' ? null : (
          <ProgressTrack current={application.status === 'activated' ? 'done' : ready ? 'activate' : 'application'} />
        )}
        {application.status === 'cancelled' ? (
          <Notice tone="danger">
            Cancelled on {formatDateTime(application.cancellation.cancelledAt)} by {application.cancellation.cancelledBy}. {application.cancellation.reason}
            {application.cancellation.note ? ` ${application.cancellation.note}` : ''}
          </Notice>
        ) : null}
        {application.account ? (
          <div>
            <Hint>Credit card account</Hint>
            <AccountNumber>{application.account.maskedPan}</AccountNumber>
            <Hint>Opened by {application.account.activatedBy} on {formatDateTime(application.account.activatedAt)}</Hint>
          </div>
        ) : null}
        {!locked ? (
          <Stack $gap={10}>
            <Hint>
              {ready
                ? 'Both photographs are attached. Activate the card account, or review the documents first.'
                : 'The customer applied online. Continue by photographing identity and proof of address.'}
            </Hint>
            <Actions>
              <ButtonLink to={ready ? `/applications/${reference}/activate` : `/applications/${reference}/documents`}>
                {ready ? 'Activate card account' : 'Continue application'}
              </ButtonLink>
              {ready ? (
                <ButtonLink to={`/applications/${reference}/documents`} $variant="secondary">
                  Review documents
                </ButtonLink>
              ) : null}
              <Button $variant="danger" onClick={() => setCancelOpen(true)}>
                Cancel application
              </Button>
            </Actions>
          </Stack>
        ) : null}
      </Hero>

      <Split>
        <Stack>
          <Card>
            <CardTitle>Applicant</CardTitle>
            <DetailList
              items={[
                { label: 'Date of birth', value: formatDate(application.customer.dateOfBirth) },
                { label: 'Nationality', value: application.customer.nationality },
                { label: 'Mobile', value: application.customer.mobile },
                { label: 'Email', value: application.customer.email },
                { label: 'Employment', value: application.employment.status },
                { label: 'Employer', value: application.employment.employer },
                { label: 'Annual income', value: formatMoney(application.employment.income) },
              ]}
            />
          </Card>
          <Card>
            <CardTitle>Progress</CardTitle>
            <Timeline>
              {timeline.map((item) => (
                <TimeItem key={item.title}>
                  <Dot $state={item.state} aria-hidden="true" />
                  <strong>{item.title}</strong>
                  <span>{item.detail}</span>
                </TimeItem>
              ))}
            </Timeline>
          </Card>
        </Stack>

        <Stack>
          <Card>
            <CardTitle>Online application</CardTitle>
            <DetailList
              items={[
                { label: 'Product', value: application.product.name },
                { label: 'Product code', value: application.product.code },
                { label: 'Requested limit', value: formatMoney(application.product.requestedLimit) },
                { label: 'Approved limit', value: formatMoney(application.product.approvedLimit) },
                { label: 'Representative APR', value: application.product.apr },
                { label: 'Decision', value: application.decision },
              ]}
            />
          </Card>
          <Card>
            <CardTitle>Residential address</CardTitle>
            <DetailList
              items={[
                {
                  label: 'Address',
                  value: addressLines(application.address).map((line) => (
                    <Line key={line}>{line}</Line>
                  )),
                },
                { label: 'Resident since', value: formatMonth(application.address.residentSince) },
              ]}
            />
          </Card>
          <Card>
            <CardTitle>Documents</CardTitle>
            <DocList>
              <DocumentRow
                label="Identity"
                document={application.documents.identity}
                href={`/applications/${reference}/documents#identity`}
                locked={locked}
                onPreview={setPreview}
              />
              <DocumentRow
                label="Proof of address"
                document={application.documents.address}
                href={`/applications/${reference}/documents#address`}
                locked={locked}
                onPreview={setPreview}
              />
            </DocList>
          </Card>
          {application.account ? (
            <Card>
              <CardTitle>Activated account</CardTitle>
              <DetailList
                items={[
                  { label: 'Account number', value: application.account.accountNumber },
                  { label: 'Card number', value: application.account.maskedPan },
                  { label: 'Activated', value: formatDateTime(application.account.activatedAt) },
                  { label: 'Activated by', value: application.account.activatedBy },
                  ...(application.account.note
                    ? [{ label: 'Desk note', value: application.account.note }]
                    : []),
                ]}
              />
            </Card>
          ) : null}
        </Stack>
      </Split>

      {cancelOpen ? (
        <CancelDialog
          reference={reference}
          name={name}
          onClose={closeCancel}
          onCancelled={(updated) => {
            setApplication(updated);
            setCancelOpen(false);
          }}
        />
      ) : null}

      {preview ? (
        <Modal title={preview.documentType} onClose={closePreview}>
          <FullImage src={preview.dataUrl} alt={`${preview.documentType} attached to ${reference}`} />
          <Hint>{preview.fileName}</Hint>
        </Modal>
      ) : null}
    </Stack>
  );
}

function DocumentRow({ label, document, href, locked, onPreview }) {
  return (
    <DocRow>
      {document ? (
        <ThumbButton type="button" onClick={() => onPreview(document)} aria-label={`View ${label} photograph`}>
          <img src={document.dataUrl} alt="" />
        </ThumbButton>
      ) : (
        <EmptyThumb>None</EmptyThumb>
      )}
      <DocCopy>
        <strong>{label}</strong>
        <span>{document ? document.documentType : 'Not attached'}</span>
        {document ? (
          <span>
            {formatShortDate(document.uploadedAt)} · {document.uploadedBy}
          </span>
        ) : null}
        {!locked ? (
          <TextLink to={href} $variant="ghost">
            {document ? 'Replace' : 'Add photograph'}
          </TextLink>
        ) : null}
      </DocCopy>
    </DocRow>
  );
}

function CancelDialog({ reference, name, onClose, onCancelled }) {
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const updated = await cancelApplication(reference, { reason, note });
      onCancelled(updated);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <Modal title="Cancel application" onClose={onClose} dismissable={!busy}>
      <form onSubmit={onSubmit}>
        <Stack>
          <Hint>
            This closes {reference} for {name}. The online application cannot be continued after cancellation.
          </Hint>
          <Field>
            Reason
            <Select
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              data-autofocus="true"
              required
            >
              <option value="">Choose a reason</option>
              {CANCEL_REASONS.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </Select>
          </Field>
          <Field>
            Desk note, optional
            <TextArea
              value={note}
              maxLength={240}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Add any context for the case record"
            />
            <Hint>{note.length}/240</Hint>
          </Field>
          {error ? <FieldError role="alert">{error}</FieldError> : null}
          <Actions>
            <Button type="submit" $variant="danger" busy={busy} disabled={!reason}>
              {busy ? 'Cancelling…' : 'Confirm cancellation'}
            </Button>
            <Button $variant="secondary" onClick={onClose} disabled={busy}>
              Keep application
            </Button>
          </Actions>
        </Stack>
      </form>
    </Modal>
  );
}
