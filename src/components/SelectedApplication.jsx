import styled from 'styled-components';
import { fullName } from '../format';
import { StatusBadge } from './ui';

const Strip = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
  padding: 12px 14px;
  border-radius: 12px;
  background: ${({ theme }) => theme.color.greenSoft};
`;

const Reference = styled.strong`
  font-family: ${({ theme }) => theme.mono};
  letter-spacing: 0.04em;
`;

const Name = styled.span`
  font-weight: 600;
`;

export function SelectedApplication({ application }) {
  return (
    <Strip>
      <Reference>{application.reference}</Reference>
      <Name>{fullName(application.customer)}</Name>
      <StatusBadge status={application.status} />
    </Strip>
  );
}
