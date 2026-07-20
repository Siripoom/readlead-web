import { LoginView } from '@/components/auth/LoginView'

interface Props {
  searchParams: Promise<{ next?: string | string[] }>
}

export default function LoginPage({ searchParams }: Props) {
  return <LoginView searchParams={searchParams} presentation="page" />
}
