import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { formatMoney, fullName } from '../format';
import { Chevron } from './Icons';
import { StatusBadge } from './ui';

const CardLink = styled(Link)`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.color.line};
  background: ${({ theme }) => theme.color.white};
  color: inherit;
  text-decoration: none;
  box-shadow: 0 1px 2px rgba(4, 38, 28, 0.04);

  @media (hover: hover) {
    &:hover { border-color: ${({ theme }) => theme.color.green}; }
  }
`;

const Top = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
`;

const Reference = styled.span`
  font-family: ${({ theme }) => theme.mono};
  font-weight: 700;
  letter-spacing: 0.04em;
`;

const Person = styled.span`
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.02em;
`;

const Meta = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.color.inkSoft};
  font-size: 14px;
  line-height: 1.4;
`;

const Foot = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const Pills = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const Pill = styled.span`
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  background: ${({ theme, $ok }) => ($ok ? theme.color.successSoft : theme.color.warningSoft)};
  color: ${({ theme, $ok }) => ($ok ? theme.color.success : theme.color.warning)};
`;

const Open = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  color: ${({ theme }) => theme.color.green};
  font-size: 14px;
  font-weight: 700;

  svg { width: 16px; height: 16px; }
`;

export function ApplicationCard({ application }) {
  const name = fullName(application.customer);
  return (
    <CardLink
      to={`/applications/${application.reference}`}
      aria-label={`Open application ${application.reference} for ${name}`}
    >
      <Top>
        <Reference>{application.reference}</Reference>
        <StatusBadge status={application.status} />
      </Top>
      <Person>{name}</Person>
      <Meta>
        {application.product.name}
        <br />
        {formatMoney(application.product.approvedLimit)} approved · {application.customer.city}
      </Meta>
      <Foot>
        <Pills>
          <Pill $ok={application.documents.identity}>
            {application.documents.identity ? 'Identity attached' : 'Identity needed'}
          </Pill>
          <Pill $ok={application.documents.address}>
            {application.documents.address ? 'Address attached' : 'Address needed'}
          </Pill>
        </Pills>
        <Open>
          Open
          <Chevron />
        </Open>
      </Foot>
    </CardLink>
  );
}
