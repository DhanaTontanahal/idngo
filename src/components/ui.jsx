import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import styled, { css } from 'styled-components';
import { STATUS_META } from '../constants';

const buttonCss = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 48px;
  padding: 12px 18px;
  border-radius: 10px;
  border: 1px solid transparent;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.2;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.15s ease;

  &:active:not(:disabled) { transform: translateY(1px); }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  ${({ $variant = 'primary', theme }) => {
    if ($variant === 'secondary') {
      return `
        background: ${theme.color.white};
        color: ${theme.color.green};
        border-color: ${theme.color.green};
        &:hover:not(:disabled) { background: ${theme.color.greenSoft}; }
      `;
    }
    if ($variant === 'danger') {
      return `
        background: ${theme.color.white};
        color: ${theme.color.danger};
        border-color: #E4B4B1;
        &:hover:not(:disabled) { background: ${theme.color.dangerSoft}; }
      `;
    }
    if ($variant === 'ghost') {
      return `
        background: transparent;
        color: ${theme.color.greenDark};
        &:hover:not(:disabled) { background: ${theme.color.greenSoft}; }
      `;
    }
    return `
      background: ${theme.color.green};
      color: ${theme.color.white};
      &:hover:not(:disabled) { background: ${theme.color.greenDark}; }
    `;
  }}
`;

const StyledButton = styled.button`${buttonCss}`;
export const ButtonLink = styled(Link)`${buttonCss}`;

const Spinner = styled.span`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid currentColor;
  border-right-color: transparent;
  animation: spin 0.7s linear infinite;
`;

export function Button({ type = 'button', busy = false, disabled, children, ...props }) {
  return (
    <StyledButton type={type} disabled={disabled || busy} aria-busy={busy || undefined} {...props}>
      {busy ? <Spinner aria-hidden="true" /> : null}
      {children}
    </StyledButton>
  );
}

export const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ $gap = 16 }) => `${$gap}px`};
`;

export const Card = styled.section`
  background: ${({ theme }) => theme.color.white};
  border: 1px solid ${({ theme }) => theme.color.line};
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 1px 2px rgba(4, 38, 28, 0.04);

  @media (min-width: 720px) {
    padding: 20px;
  }
`;

export const CardTitle = styled.h2`
  margin: 0 0 14px;
  font-size: 18px;
  letter-spacing: -0.01em;
`;

export const Kicker = styled.p`
  margin: 0 0 6px;
  color: ${({ theme }) => theme.color.green};
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

export const PageTitle = styled.h1`
  margin: 0;
  font-size: 28px;
  line-height: 1.15;
  letter-spacing: -0.03em;

  @media (min-width: 720px) {
    font-size: 34px;
  }
`;

export const Lede = styled.p`
  margin: 8px 0 0;
  color: ${({ theme }) => theme.color.inkSoft};
  font-size: 16px;
  line-height: 1.5;
  max-width: 65ch;
`;

export const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-weight: 600;
  font-size: 14px;
`;

const control = css`
  width: 100%;
  min-height: 48px;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.color.line};
  background: ${({ theme }) => theme.color.white};
  color: ${({ theme }) => theme.color.ink};
  font-size: 16px;
  font-weight: 500;

  &::placeholder { color: #7d8e86; font-weight: 400; }

  &:focus {
    outline: 3px solid rgba(0, 103, 71, 0.28);
    border-color: ${({ theme }) => theme.color.green};
  }
`;

export const Input = styled.input`${control}`;
export const Select = styled.select`${control}`;
export const TextArea = styled.textarea`
  ${control}
  min-height: 96px;
  resize: vertical;
  line-height: 1.45;
`;

export const Hint = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.color.muted};
  font-size: 13px;
  font-weight: 400;
  line-height: 1.45;
`;

export const FieldError = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.color.danger};
  font-size: 14px;
  font-weight: 600;
`;

const Banner = styled.div`
  padding: 12px 14px;
  border-radius: 12px;
  font-size: 15px;
  line-height: 1.45;
  background: ${({ theme, $tone }) => theme.color[`${$tone}Soft`] || theme.color.infoSoft};
  color: ${({ theme, $tone }) => theme.color[$tone] || theme.color.info};
  border: 1px solid ${({ theme, $tone }) => theme.color[`${$tone}Soft`] || theme.color.line};
`;

export function Notice({ tone = 'info', children }) {
  return (
    <Banner $tone={tone} role={tone === 'danger' ? 'alert' : 'status'}>
      {children}
    </Banner>
  );
}

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  width: fit-content;
  max-width: 100%;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.3;
  background: ${({ theme, $tone }) => theme.color[`${$tone}Soft`]};
  color: ${({ theme, $tone }) => theme.color[$tone]};

  &::before {
    content: '';
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: currentColor;
    flex: none;
  }
`;

export function StatusBadge({ status }) {
  const meta = STATUS_META[status] || { label: status, tone: 'info' };
  return <Badge $tone={meta.tone}>{meta.label}</Badge>;
}

export const FieldGrid = styled.dl`
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px 24px;
  margin: 0;

  @media (min-width: 560px) {
    grid-template-columns: 1fr 1fr;
  }

  div { min-width: 0; }

  dt {
    margin: 0;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: ${({ theme }) => theme.color.muted};
  }

  dd {
    margin: 3px 0 0;
    font-size: 16px;
    font-weight: 600;
    line-height: 1.4;
    overflow-wrap: anywhere;
  }
`;

export const Split = styled.div`
  display: grid;
  gap: 16px;

  @media (min-width: 840px) {
    grid-template-columns: 1.15fr 0.85fr;
    align-items: start;
  }
`;

export const Actions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;

  a, button { width: 100%; }

  @media (min-width: 720px) {
    flex-direction: row;
    flex-wrap: wrap;

    a, button { width: auto; min-width: 200px; }
  }
`;

export const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  color: ${({ theme }) => theme.color.green};
  font-weight: 700;
  text-decoration: none;

  &:hover { text-decoration: underline; }
`;

const Track = styled.ol`
  list-style: none;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin: 0;
  padding: 0;
`;

const Step = styled.li`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  min-height: 58px;
  padding: 8px 10px;
  border-radius: 12px;
  border: 1px solid ${({ theme, $state }) => ($state === 'todo' ? theme.color.line : 'transparent')};
  background: ${({ theme, $state }) => {
    if ($state === 'current') return theme.color.green;
    if ($state === 'done') return theme.color.greenSoft;
    return theme.color.white;
  }};
  color: ${({ theme, $state }) => {
    if ($state === 'current') return theme.color.white;
    if ($state === 'done') return theme.color.greenDark;
    return theme.color.muted;
  }};

  span {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  strong {
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0;
    text-transform: none;
  }
`;

const STEP_LABELS = [
  { id: 'application', label: 'Application' },
  { id: 'documents', label: 'Documents' },
  { id: 'activate', label: 'Activate' },
];

export function ProgressTrack({ current }) {
  const index = current === 'done' ? 3 : STEP_LABELS.findIndex((step) => step.id === current);
  return (
    <Track aria-label="Application progress">
      {STEP_LABELS.map((step, stepIndex) => {
        const state = stepIndex < index ? 'done' : stepIndex === index ? 'current' : 'todo';
        return (
          <Step key={step.id} $state={state} aria-current={state === 'current' ? 'step' : undefined}>
            <span>{state === 'done' ? 'Done' : `Step ${stepIndex + 1}`}</span>
            <strong>{step.label}</strong>
          </Step>
        );
      })}
    </Track>
  );
}

const SkelCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.color.line};
  background: ${({ theme }) => theme.color.white};
`;

const Bar = styled.span`
  display: block;
  height: 14px;
  width: ${({ $w }) => $w};
  border-radius: 999px;
  background: linear-gradient(90deg, #e4eee9 25%, #f7fbf9 37%, #e4eee9 63%);
  background-size: 400% 100%;
  animation: shimmer 1.2s ease infinite;
`;

const Hidden = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
`;

export function LoadingBlock({ label = 'Loading application' }) {
  return (
    <SkelCard aria-busy="true" aria-live="polite">
      <Hidden>{label}</Hidden>
      <Bar $w="38%" />
      <Bar $w="72%" />
      <Bar $w="54%" />
    </SkelCard>
  );
}

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 40;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0;
  background: rgba(4, 38, 28, 0.56);

  @media (min-width: 720px) {
    align-items: center;
    padding: 24px;
  }
`;

const Dialog = styled.div`
  width: min(520px, 100%);
  max-height: min(92vh, 760px);
  overflow: auto;
  background: ${({ theme }) => theme.color.white};
  border-radius: 20px 20px 0 0;
  padding: 18px 16px calc(18px + env(safe-area-inset-bottom));
  box-shadow: ${({ theme }) => theme.shadow};

  &:focus { outline: none; }

  @media (min-width: 720px) {
    border-radius: 20px;
    padding: 22px;
  }
`;

const DialogHead = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;

  h2 {
    margin: 0;
    font-size: 22px;
    letter-spacing: -0.02em;
  }
`;

const IconButton = styled.button`
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 10px;
  background: ${({ theme }) => theme.color.paper};
  color: ${({ theme }) => theme.color.ink};
  font-size: 26px;
  line-height: 1;
  cursor: pointer;

  &:hover { background: ${({ theme }) => theme.color.greenSoft}; }
`;

export function Modal({ title, children, onClose, dismissable = true }) {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const preferred = node?.querySelector('[data-autofocus]');
    (preferred || node)?.focus();

    const onKey = (event) => {
      if (event.key === 'Escape' && dismissable) onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', onKey);
    };
  }, [dismissable, onClose]);

  return (
    <Backdrop onClick={() => { if (dismissable) onClose(); }}>
      <Dialog
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <DialogHead>
          <h2 id="dialog-title">{title}</h2>
          <IconButton type="button" onClick={onClose} aria-label="Close" disabled={!dismissable}>
            ×
          </IconButton>
        </DialogHead>
        {children}
      </Dialog>
    </Backdrop>
  );
}

export const CheckRow = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.color.line};
  border-radius: 12px;
  background: ${({ theme }) => theme.color.paper};
  font-weight: 600;
  line-height: 1.45;

  input {
    width: 22px;
    height: 22px;
    margin-top: 2px;
    accent-color: ${({ theme }) => theme.color.green};
    flex: none;
  }
`;
