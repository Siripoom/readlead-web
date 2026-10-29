import Link from "next/link";
import {
  LEGAL_DOCUMENTS,
  LEGAL_DOC_IDS,
  LEGAL_DOC_LABELS,
  legalDocHref,
  type LegalDocId,
} from "@/lib/legal-content";
import styles from "./LegalDocsView.module.css";

export function LegalDocsView({ initialDoc }: { initialDoc: LegalDocId }) {
  const document = LEGAL_DOCUMENTS[initialDoc];

  return (
    <div className={styles.root} data-legal-page>
      <div className={styles.shell}>
        <aside className={styles.sidebar}>
          <p className={styles.group}>เอกสารและข้อตกลง</p>
          <nav className={styles.documents} aria-label="เอกสารและข้อตกลง">
            {LEGAL_DOC_IDS.map((doc) => (
              <Link
                key={doc}
                href={legalDocHref(doc)}
                replace
                aria-current={doc === initialDoc ? "page" : undefined}
                className={styles.docLink}
              >
                {LEGAL_DOC_LABELS[doc]}
              </Link>
            ))}
          </nav>
          <div className={styles.contents}>
            <p className={styles.group}>หัวข้อในเอกสารนี้</p>
            <nav className={styles.toc} aria-label="หัวข้อในเอกสารนี้">
              {document.sections.map((section) => (
                <a key={section.id} href={`#${section.id}`}>
                  {section.heading}
                </a>
              ))}
            </nav>
          </div>
        </aside>
        <div className={styles.main}>
          <article className={styles.page}>
            <h1>{document.title}</h1>
            <p className={styles.updated}>{document.updatedLabel}</p>
            {document.sections.map((section) => (
              <section key={section.id} id={section.id}>
                <h2>{section.heading}</h2>
                {section.body}
              </section>
            ))}
            <div className={styles.contact}>{document.contact}</div>
          </article>
        </div>
      </div>
    </div>
  );
}
