import Link from "next/link";
import { BookOpen } from "lucide-react";
import { LEGAL_DOC_IDS, LEGAL_DOC_LABELS, legalDocHref } from "@/lib/legal-content";

const EXPLORE_LINKS = [
  { href: "/", label: "หน้าหลัก" },
  { href: "/ranking", label: "กระดานอันดับ" },
  { href: "/novel", label: "นิยาย" },
  { href: "/manga", label: "เว็บตูน" },
  { href: "/audiobook", label: "หนังสือเสียง" },
];

const ACCOUNT_LINKS = [
  { href: "/discover", label: "ค้นหา" },
  { href: "/login", label: "เข้าสู่ระบบ" },
  { href: "/register", label: "สมัครสมาชิก" },
  { href: "/dashboard", label: "แดชบอร์ดของฉัน" },
];

const CREATOR_LINKS = [{ href: "/writer", label: "สมัครเป็นนักเขียน" }];

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer data-site-footer className="border-t border-[#e9edf2] bg-white">
      <div data-footer-main className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 sm:px-6 lg:grid-cols-4 xl:px-10">
        <div className="col-span-2 lg:col-span-1">
          <Link
            href="/"
            aria-label="ReadLead หน้าหลัก"
            className="flex items-center gap-2 text-xl font-extrabold text-[#cc4452]"
          >
            <BookOpen className="h-[22px] w-[22px]" strokeWidth={2.5} />
            <span>ReadLead</span>
          </Link>
          <p className="mt-3 max-w-xs text-sm text-[#64748b]">
            แพลตฟอร์มนิยายจีนและคอนเทนต์ดิจิทัล สำหรับผู้รักการอ่าน
          </p>
        </div>

        <FooterColumn heading="สำรวจ" links={EXPLORE_LINKS} />
        <FooterColumn heading="บัญชี" links={ACCOUNT_LINKS} />
        <FooterColumn heading="นักเขียน" links={CREATOR_LINKS} />
      </div>

      <div data-footer-divider className="h-px bg-[#e9edf2]" />

      <div data-footer-bottom className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-6 text-xs text-[#94a3b8] sm:flex-row sm:justify-between sm:px-6 xl:px-10">
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-4">
          <p>© {currentYear} ReadLead · 阅先. สงวนลิขสิทธิ์.</p>
          <nav className="flex items-center gap-3">
            {LEGAL_DOC_IDS.map((doc) => (
              <Link
                key={doc}
                href={legalDocHref(doc)}
                className="transition-colors hover:text-[#cc4452]"
              >
                {LEGAL_DOC_LABELS[doc]}
              </Link>
            ))}
          </nav>
        </div>
        <p className="font-serif">阅先</p>
      </div>

      <p data-home-mobile-footer className="hidden px-3 py-[18px] text-center text-[11px] text-[#8a8894]">
        © {currentYear} ReadLead. สงวนลิขสิทธิ์ทุกประการ
      </p>
    </footer>
  );
}

function FooterColumn({
  heading,
  links,
}: {
  heading: string;
  links: ReadonlyArray<{ href: string; label: string }>;
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-[#1e293b]">{heading}</p>
      <ul className="mt-3 space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-[#64748b] transition-colors hover:text-[#cc4452]"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
