import { RegisterView } from '@/components/auth/RegisterView'

interface Props {
  searchParams: Promise<{ next?: string | string[] }>
}

export default function RegisterPage({ searchParams }: Props) {
  return <RegisterView searchParams={searchParams} presentation="page" />
}
