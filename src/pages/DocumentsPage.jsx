import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { uploadDocument } from '../api/mockApi';
import { ADDRESS_TYPES, IDENTITY_TYPES } from '../constants';
import { formatDateTime, fullName } from '../format';
import { createDemonstrationImage, readImageFile } from '../images';
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
  Hint,
  LoadingBlock,
  Modal,
  Notice,
  PageTitle,
  ProgressTrack,
  Select,
  Stack,
} from '../components/ui';

const Layout = styled.div`
  display: grid;
  gap: 16px;

  @media (min-width: 800px) {
    grid-template-columns: 1fr 1fr;
    align-items: start;
  }
`;

const Slot = styled(Card)`
  scroll-margin-top: 88px;
`;

const PhotoWell = styled.div`
  border-radius: 12px;
  background: #10241c;
  padding: 10px;

  img {
    max-height: 240px;
    width: auto;
    max-width: 100%;
    margin: 0 auto;
    object-fit: contain;
  }
`;

const FileName = styled.p`
  margin: 8px 0 0;
  font-size: 13px;
  color: ${({ theme }) => theme.color.muted};
  overflow-wrap: anywhere;
`;

const HiddenFile = styled.input`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

const CameraStage = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Preview = styled.video`
  width: 100%;
  max-height: 360px;
  border-radius: 12px;
  background: #10241c;
  object-fit: cover;
`;

export function DocumentsPage() {
  const { reference: rawReference = '' } = useParams();
  const { application, setApplication, error, loading, reload, reference } = useApplication(rawReference);
  const [types, setTypes] = useState({
    identity: IDENTITY_TYPES[0],
    address: ADDRESS_TYPES[0],
  });
  const [pending, setPending] = useState({ identity: null, address: null });
  const [busy, setBusy] = useState({ identity: false, address: false });
  const [notice, setNotice] = useState('');
  const [formError, setFormError] = useState('');
  const hydrated = useRef('');

  useEffect(() => {
    document.title = `Documents · ${reference} · ID&Go`;
  }, [reference]);

  useEffect(() => {
    if (!application || hydrated.current === application.reference) return;
    hydrated.current = application.reference;
    setTypes({
      identity: application.documents.identity?.documentType || IDENTITY_TYPES[0],
      address: application.documents.address?.documentType || ADDRESS_TYPES[0],
    });
    setPending({ identity: null, address: null });
    setNotice('');
    setFormError('');
  }, [application]);

  useEffect(() => {
    if (loading) return;
    const hash = window.location.hash;
    if (!hash) return;
    document.querySelector(hash)?.scrollIntoView({ block: 'start' });
  }, [loading, reference]);

  if (loading) {
    return (
      <Stack>
        <BackLink to={`/applications/${reference}`}>Back to application</BackLink>
        <LoadingBlock label="Loading documents" />
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

  const locked = application.status === 'activated' || application.status === 'cancelled';
  const bothAttached = application.documents.identity && application.documents.address;

  async function chooseFile(kind, file) {
    setFormError('');
    setNotice('');
    try {
      const image = await readImageFile(file);
      setPending((current) => ({ ...current, [kind]: image }));
    } catch (err) {
      setFormError(err.message);
    }
  }

  function useImage(kind, image) {
    setFormError('');
    setNotice('');
    setPending((current) => ({ ...current, [kind]: image }));
  }

  function useDemonstration(kind) {
    const label = types[kind];
    setFormError('');
    setNotice('');
    setPending((current) => ({
      ...current,
      [kind]: {
        fileName: `demonstration-${kind}.jpg`,
        dataUrl: createDemonstrationImage(label),
      },
    }));
  }

  async function attach(kind) {
    const image = pending[kind];
    if (!image) {
      setFormError('Add a photograph before attaching it to the application.');
      return;
    }
    setBusy((current) => ({ ...current, [kind]: true }));
    setFormError('');
    setNotice('');
    try {
      const updated = await uploadDocument(reference, {
        kind,
        documentType: types[kind],
        fileName: image.fileName,
        dataUrl: image.dataUrl,
      });
      setApplication(updated);
      setPending((current) => ({ ...current, [kind]: null }));
      const label = kind === 'identity' ? 'Identity' : 'Proof of address';
      setNotice(`${label} photograph attached to ${reference}.`);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setBusy((current) => ({ ...current, [kind]: false }));
    }
  }

  return (
    <Stack $gap={16}>
      <BackLink to={`/applications/${reference}`}>Back to {reference}</BackLink>
      <div>
        <PageTitle>Continue application</PageTitle>
        <Hint>
          {fullName(application.customer)} applied online. Photograph identity and proof of address, then attach each one to this application.
        </Hint>
      </div>
      <SelectedApplication application={application} />
      {application.status === 'cancelled' ? null : <ProgressTrack current="documents" />}
      {!locked ? (
        <Card>
          <CardTitle>Step 3</CardTitle>
          {bothAttached ? (
            <Stack $gap={12}>
              <Hint>Both photographs are attached. Continue to activate the card account.</Hint>
              <ButtonLink to={`/applications/${reference}/activate`}>Continue to step 3</ButtonLink>
            </Stack>
          ) : (
            <Stack $gap={12}>
              <Hint>
                Take or upload an identity photograph and a proof of address. Attach both, then continue to step 3.
              </Hint>
              <Button type="button" disabled>Continue to step 3</Button>
            </Stack>
          )}
        </Card>
      ) : null}
      {notice ? <Notice tone="success">{notice}</Notice> : null}
      {formError ? <Notice tone="danger">{formError}</Notice> : null}
      {locked ? (
        <Notice tone={application.status === 'activated' ? 'success' : 'danger'}>
          {application.status === 'activated'
            ? 'This account is active. Photographs can be viewed, and no further documents can be attached.'
            : 'This application is cancelled. Photographs can no longer be attached.'}
        </Notice>
      ) : null}

      <Layout>
        <DocumentSlot
          id="identity"
          title="Identity"
          description="Passport, driving licence, or national identity card."
          types={IDENTITY_TYPES}
          type={types.identity}
          onType={(value) => setTypes((current) => ({ ...current, identity: value }))}
          existing={application.documents.identity}
          pending={pending.identity}
          busy={busy.identity}
          locked={locked}
          onFile={(file) => chooseFile('identity', file)}
          onImage={(image) => useImage('identity', image)}
          onDemo={() => useDemonstration('identity')}
          onClear={() => setPending((current) => ({ ...current, identity: null }))}
          onAttach={() => attach('identity')}
        />
        <DocumentSlot
          id="address"
          title="Proof of address"
          description="A bill or statement dated within the last three months."
          types={ADDRESS_TYPES}
          type={types.address}
          onType={(value) => setTypes((current) => ({ ...current, address: value }))}
          existing={application.documents.address}
          pending={pending.address}
          busy={busy.address}
          locked={locked}
          onFile={(file) => chooseFile('address', file)}
          onImage={(image) => useImage('address', image)}
          onDemo={() => useDemonstration('address')}
          onClear={() => setPending((current) => ({ ...current, address: null }))}
          onAttach={() => attach('address')}
        />
      </Layout>

      {!locked ? (
        <Card>
          <CardTitle>Step 3</CardTitle>
          {bothAttached ? (
            <Stack $gap={12}>
              <Hint>Both documents are attached to {reference}. Continue when the photographs match the applicant.</Hint>
              <ButtonLink to={`/applications/${reference}/activate`}>Continue to step 3</ButtonLink>
            </Stack>
          ) : (
            <Stack $gap={12}>
              <Hint>Attach both photographs above to continue to activation.</Hint>
              <Button type="button" disabled>Continue to step 3</Button>
            </Stack>
          )}
        </Card>
      ) : null}
    </Stack>
  );
}

function DocumentSlot({
  id,
  title,
  description,
  types,
  type,
  onType,
  existing,
  pending,
  busy,
  locked,
  onFile,
  onImage,
  onDemo,
  onClear,
  onAttach,
}) {
  const shown = pending || existing;
  const uploadRef = useRef(null);
  const cameraFileRef = useRef(null);
  const [cameraOpen, setCameraOpen] = useState(false);

  return (
    <Slot id={id}>
      <CardTitle>{title}</CardTitle>
      <Hint>{description}</Hint>
      <Stack $gap={12}>
        {shown ? (
          <div>
            <PhotoWell>
              <img src={shown.dataUrl} alt={`${title} photograph`} />
            </PhotoWell>
            <FileName>
              {pending ? shown.fileName : `${shown.fileName} · attached ${formatDateTime(shown.uploadedAt)} by ${shown.uploadedBy}`}
            </FileName>
          </div>
        ) : (
          <Notice tone="warning">No photograph is attached yet.</Notice>
        )}

        {!locked ? (
          <>
            <Field>
              Document in the photograph
              <Select value={type} onChange={(event) => onType(event.target.value)}>
                {types.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </Select>
            </Field>
            <HiddenFile
              ref={uploadRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/*"
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = '';
                if (file) onFile(file);
              }}
            />
            <HiddenFile
              ref={cameraFileRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = '';
                if (file) onFile(file);
              }}
            />
            <Actions>
              <Button type="button" onClick={() => setCameraOpen(true)}>
                Take photo
              </Button>
              <Button type="button" $variant="secondary" onClick={() => uploadRef.current?.click()}>
                Upload photograph
              </Button>
              <Button type="button" busy={busy} disabled={!pending} onClick={onAttach}>
                {busy ? 'Attaching…' : existing ? 'Replace on application' : 'Attach to application'}
              </Button>
              <Button type="button" $variant="ghost" onClick={onDemo}>
                Use demonstration image
              </Button>
              {pending ? (
                <Button type="button" $variant="ghost" onClick={onClear}>
                  Remove selected photo
                </Button>
              ) : null}
            </Actions>
            {cameraOpen ? (
              <CameraCapture
                title={`${title} photograph`}
                onClose={() => setCameraOpen(false)}
                onCapture={(image) => {
                  onImage(image);
                  setCameraOpen(false);
                }}
                onUseCameraApp={() => cameraFileRef.current?.click()}
              />
            ) : null}
          </>
        ) : null}
      </Stack>
    </Slot>
  );
}

function CameraCapture({ title, onClose, onCapture, onUseCameraApp }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraError, setCameraError] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError('This browser cannot open the camera here. Use the camera app, or upload a photograph.');
        return;
      }
      const attempts = [
        { video: { facingMode: { ideal: 'environment' } }, audio: false },
        { video: true, audio: false },
      ];
      let stream;
      let lastError;
      for (const constraints of attempts) {
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraints);
          break;
        } catch (error) {
          lastError = error;
        }
      }
      if (!stream) {
        if (active) {
          setCameraError(lastError?.name === 'NotAllowedError'
            ? 'Camera access was blocked. Allow the camera, or upload a photograph.'
            : 'The camera could not be started. Use the camera app, or upload a photograph.');
        }
        return;
      }
      if (!active) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        await video.play();
        setReady(true);
      }
    }

    start();
    return () => {
      active = false;
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  function capture() {
    const video = videoRef.current;
    if (!video?.videoWidth) return;
    const maxEdge = 1280;
    const scale = Math.min(1, maxEdge / Math.max(video.videoWidth, video.videoHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
    canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    onCapture({
      fileName: `camera-${Date.now()}.jpg`,
      dataUrl: canvas.toDataURL('image/jpeg', 0.72),
    });
  }

  return (
    <Modal title={`Take photo · ${title}`} onClose={onClose}>
      <CameraStage>
        {cameraError ? <Notice tone="warning">{cameraError}</Notice> : null}
        <Preview ref={videoRef} autoPlay playsInline muted />
        <Actions>
          <Button type="button" onClick={capture} disabled={!ready || Boolean(cameraError)}>
            Capture photo
          </Button>
          <Button
            type="button"
            $variant="secondary"
            onClick={() => {
              onClose();
              onUseCameraApp();
            }}
          >
            Open camera app
          </Button>
          <Button type="button" $variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </Actions>
      </CameraStage>
    </Modal>
  );
}
