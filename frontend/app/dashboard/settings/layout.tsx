import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Configurações | NoteSync',
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
