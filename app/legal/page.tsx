import type { Metadata } from 'next'
import { LegalDocsView } from '@/components/legal/LegalDocsView'
import { LEGAL_DOCUMENTS, parseLegalDoc } from '@/lib/legal-content'

type Props = {
  searchParams: Promise<{ doc?: string | string[] }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams
  const requestedDoc = Array.isArray(params.doc) ? params.doc[0] : params.doc
  const doc = parseLegalDoc(requestedDoc)
  return {
    title: `${LEGAL_DOCUMENTS[doc].title} · ReadLead`,
  }
}

export default async function LegalPage({ searchParams }: Props) {
  const params = await searchParams
  const requestedDoc = Array.isArray(params.doc) ? params.doc[0] : params.doc
  const initialDoc = parseLegalDoc(requestedDoc)

  return <LegalDocsView initialDoc={initialDoc} />
}
