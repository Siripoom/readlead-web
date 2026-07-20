import { RegisterView } from '@/components/auth/RegisterView'

interface Props {
  searchParams: Promise<{ next?: string | string[] }>
}

export default function RegisterModalPage({ searchParams }: Props) {
  return <RegisterView searchParams={searchParams} presentation="modal" />
}
