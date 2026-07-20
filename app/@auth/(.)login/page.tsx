import { LoginView } from '@/components/auth/LoginView'

interface Props {
  searchParams: Promise<{ next?: string | string[] }>
}

export default function LoginModalPage({ searchParams }: Props) {
  return <LoginView searchParams={searchParams} presentation="modal" />
}
