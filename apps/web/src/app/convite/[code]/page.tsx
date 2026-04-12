import { redirect } from 'next/navigation';

type Props = {
  params: Promise<{ code: string }>;
};

export default async function ConvitePage({ params }: Props) {
  const { code } = await params;
  // Links de convite foram substituídos por códigos manuais.
  // Redireciona para o onboarding — o usuário digita o código lá.
  redirect(`/onboarding?code=${code}`);
}
