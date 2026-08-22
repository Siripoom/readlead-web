'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  LEGAL_DOCUMENTS,
  LEGAL_DOC_IDS,
  LEGAL_DOC_LABELS,
  legalDocHref,
  type LegalDocId,
} from '@/lib/legal-content'

export function LegalDocsView({ initialDoc }: { initialDoc: LegalDocId }) {
  const [activeDoc, setActiveDoc] = useState(initialDoc)
  const router = useRouter()
  const document = LEGAL_DOCUMENTS[activeDoc]

  function selectDoc(doc: LegalDocId) {
    if (doc === activeDoc) return
    setActiveDoc(doc)
    router.replace(legalDocHref(doc), { scroll: false })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="flex flex-col lg:flex-row">
      <aside className="shrink-0 px-4 pt-6 sm:px-6 lg:sticky lg:top-13.75 lg:h-[calc(100vh-55px)] lg:w-62.5 lg:overflow-y-auto lg:border-r lg:border-[#e9eaef] lg:px-4.5 lg:py-6.5 xl:pl-10">
        <p className="mb-1.75 px-2.25 text-[11px] font-extrabold tracking-[.2px] text-[#191b22]">เอกสารและข้อตกลง</p>
        <nav className="mb-4.5 flex gap-1.5 overflow-x-auto pb-1 lg:mb-0 lg:flex-col lg:overflow-visible lg:pb-0">
          {LEGAL_DOC_IDS.map((doc) => (
            <button
              key={doc}
              type="button"
              onClick={() => selectDoc(doc)}
              className={cn(
                'mb-0.5 flex shrink-0 items-center gap-1.75 whitespace-nowrap rounded-lg px-2.25 py-1.5 text-left text-[12.5px] transition-colors',
                doc === activeDoc
                  ? 'bg-[#f6e4e7] font-extrabold text-[#cc4452]'
                  : 'text-[#4b5061] hover:bg-[#f0f1f4]',
              )}
            >
              <FileText className="h-3.5 w-3.5 shrink-0" />
              {LEGAL_DOC_LABELS[doc]}
            </button>
          ))}
        </nav>

        <p className="mb-1.75 mt-4.5 hidden px-2.25 text-[11px] font-extrabold tracking-[.2px] text-[#191b22] lg:block">หัวข้อในเอกสารนี้</p>
        <nav className="hidden lg:block">
          {document.sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="ml-1 block truncate border-l-2 border-transparent px-2.25 py-1 text-[11.5px] text-[#8b91a0] transition-colors hover:text-[#191b22]"
            >
              {section.heading}
            </a>
          ))}
        </nav>
      </aside>

      <main className="flex min-w-0 flex-1 justify-center px-4 py-11 sm:px-6 lg:px-10">
        <article className="w-full max-w-180">
          <h1 className="text-[31px] font-black tracking-[-0.3px] text-[#191b22]">{document.title}</h1>
          <p className="mb-7.5 mt-2 text-xs text-[#8b91a0]">{document.updatedLabel}</p>

          {document.sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-20">
              <h2 className="mb-3 mt-9.5 text-[19.5px] font-extrabold tracking-[-0.2px] text-[#191b22] first:mt-0">
                {section.heading}
              </h2>
              {section.body}
            </section>
          ))}

          <div className="mt-7.5 rounded-xl border border-[#e9eaef] bg-[#fafafb] px-4.75 py-3.75 text-[13px] text-[#4b5061]">
            {document.contact}
          </div>
        </article>
      </main>
    </div>
  )
}

export function LegalDocsSkeleton() {
  return (
    <div className="mx-auto flex max-w-7xl gap-8 px-4 py-10 sm:px-6 xl:px-10">
      <div className="hidden w-60 shrink-0 lg:block">
        <div className="h-4 w-24 animate-pulse rounded bg-[#f1f3f5]" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="h-8 w-64 animate-pulse rounded bg-[#f1f3f5]" />
        <div className="mt-4 h-4 w-48 animate-pulse rounded bg-[#f1f3f5]" />
      </div>
    </div>
  )
}
