import { getTranslations } from 'next-intl/server';
import { AcceptInvitationClient } from '@/components/organization/accept-invitation-client';

export default async function AcceptInvitationPage({ params }: { params: { id: string } }) {
  const t = await getTranslations();
  
  return (
    <div className="pt-24">
      <AcceptInvitationClient invitationId={params.id} />
    </div>
  );
}