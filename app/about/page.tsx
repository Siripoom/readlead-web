import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import styles from "./About.module.css";

export const metadata: Metadata = {
  title: "เกี่ยวกับเรา · ReadLead",
  description:
    "เรื่องราว เป้าหมาย และคุณค่าของ ReadLead แพลตฟอร์มนิยาย หนังสือเสียง และเว็บตูน พร้อมช่องทางติดต่อเรา",
};

export default function AboutPage() {
  return (
    <div className={styles.root} data-about-page>
      <div className={styles.stage}>
        <section className={styles["hero"]}>
          <Image
            className={styles["hero-img"]}
            src="/about/hero.jpg"
            alt=""
            width={2172}
            height={724}
            unoptimized
            loading="eager"
          />
          <div className={styles["hero-in"]}>
            <span className={styles["eyebrow"]} style={{ fontSize: 14 }}>
              เกี่ยวกับเรา
            </span>
            <h1>
              อ่านทุกเรื่องที่คุณชอบ
              <br />
              <span>ในที่เดียว</span>
            </h1>
            <div className={styles["hero-sub"]}>
              นิยาย หนังสือเสียง และเว็บตูนคุณภาพ
              <br />
              ดื่มด่ำทุกเรื่องราว ครบทุกอารมณ์
            </div>
            <div className={styles["hero-cta"]}>
              <Link className={styles["btn-red"]} href="/">
                <svg
                  width="19"
                  height="19"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="2"
                >
                  <path d="M2 4h7a3 3 0 0 1 3 3v13a2.5 2.5 0 0 0-2.5-2.5H2z" />
                  <path d="M22 4h-7a3 3 0 0 0-3 3v13a2.5 2.5 0 0 1 2.5-2.5H22z" />
                </svg>
                ดูผลงานทั้งหมด
              </Link>
            </div>
          </div>
        </section>

        <section className={styles["story"]}>
          <Image
            className={styles["story-bg"]}
            src="/about/story.jpg"
            alt=""
            width={1575}
            height={998}
            unoptimized
          />
          <div className={styles["story-slot"]}></div>
          <div className={styles["story-tx"]}>
            <span className={styles["eyebrow"]} style={{ fontSize: 14 }}>
              เรื่องราวของเรา
            </span>
            <h2>ทำไมต้องที่นี่</h2>
            <p>
              เราเริ่มต้นจากความเชื่อว่า การอ่านควรเป็นเรื่องง่าย สนุก
              และเข้าถึงได้ทุกคน
            </p>
            <p>
              จึงสร้างแพลตฟอร์มที่รวบรวมนิยาย หนังสือเสียง
              และเว็บตูนไว้ในที่เดียว
              พร้อมระบบที่ออกแบบมาเพื่อให้ทุกคนค้นพบเรื่องโปรดได้ง่ายที่สุด
            </p>
            <p>
              เรามุ่งมั่นพัฒนาอย่างต่อเนื่องเพื่อมอบประสบการณ์การอ่านที่ดีที่สุดให้กับคุณ
            </p>
          </div>
        </section>

        <section className={styles["sec"] + " " + styles["mission"]}>
          <div className={styles["sec-head"]}>
            <span className={styles["eyebrow"]}>OUR MISSION</span>
            <h2>เป้าหมายของเรา</h2>
          </div>
          <div className={styles["mrow"]}>
            <div className={styles["mitem"]}>
              สร้างประสบการณ์
              <br />
              การอ่านที่ดีที่สุด
            </div>
            <div className={styles["mitem"]}>
              สนับสนุนนักเขียน
              <br />
              และนักสร้างสรรค์
            </div>
            <div className={styles["mitem"]}>
              เข้าถึงได้ง่าย
              <br />
              สำหรับทุกคน
            </div>
            <div className={styles["mitem"]}>
              พัฒนาอย่างต่อเนื่อง
              <br />
              ไม่หยุดนิ่ง
            </div>
          </div>
        </section>

        <section className={styles["sec"] + " " + styles["why"]}>
          <div className={styles["sec-head"]}>
            <span className={styles["eyebrow"]}>WHY CHOOSE US</span>
            <h2>ทำไมต้องเลือกเรา</h2>
          </div>
          <div className={styles["wtext"]}>
            <p>
              บริษัท รีดลีด จำกัด เป็นผู้พัฒนาและดูแลแพลตฟอร์ม{" "}
              <span className={styles["brand"]}>ReadLead</span>{" "}
              ผู้ให้บริการพื้นที่จัดเก็บและตัวกลางเชื่อมนักเขียนกับนักอ่าน
              ภายใต้ข้อตกลงการใช้งาน นโยบายความเป็นส่วนตัว (PDPA)
              และข้อตกลงนักเขียนที่เปิดเผยต่อสาธารณะ เรารวบรวมนิยาย หนังสือเสียง
              และเว็บตูนคุณภาพจากหลากหลายหมวดหมู่
              พร้อมอัปเดตเนื้อหาอย่างสม่ำเสมอ บนแพลตฟอร์มที่ออกแบบให้ใช้งานง่าย
              รวดเร็ว และรองรับทุกอุปกรณ์ โดยให้ความสำคัญกับประสิทธิภาพ
              ความเสถียร และความปลอดภัยของข้อมูล
              เพื่อมอบประสบการณ์ที่ดีที่สุดแก่ทั้งนักอ่านและนักเขียน
            </p>
          </div>
        </section>

        <section className={styles["sec"] + " " + styles["vals"]}>
          <div className={styles["sec-head"]}>
            <span className={styles["eyebrow"]}>OUR VALUES</span>
            <h2>คุณค่าที่เราเชื่อมั่น</h2>
          </div>
          <div className={styles["vcards"]}>
            <div className={styles["vcard"]}>
              <div className={styles["vtop"]}>
                <h3>
                  Reader First<small>ให้ความสำคัญกับผู้อ่าน</small>
                </h3>
              </div>
              <p>ทุกการตัดสินใจเพื่อประสบการณ์ที่ดีที่สุดของคุณ</p>
            </div>
            <div className={styles["vcard"]}>
              <div className={styles["vtop"]}>
                <h3>
                  Innovation<small>พัฒนาไม่หยุด</small>
                </h3>
              </div>
              <p>ค้นหาวิธีการสร้างใหม่ ๆ เพื่อยกระดับประสบการณ์การอ่านเสมอ</p>
            </div>
            <div className={styles["vcard"]}>
              <div className={styles["vtop"]}>
                <h3>
                  Trust<small>เชื่อถือได้</small>
                </h3>
              </div>
              <p>คอนเทนต์และระบบที่ปลอดภัย เชื่อถือได้ โปร่งใส</p>
            </div>
            <div className={styles["vcard"]}>
              <div className={styles["vtop"]}>
                <h3>
                  Growth<small>เติบโตไปพร้อมกัน</small>
                </h3>
              </div>
              <p>เติบโตและสนับสนุนนักเขียนและชุมชนของเราไปด้วยกัน</p>
            </div>
          </div>
        </section>

        <section className={styles["fc"]}>
          <div className={styles["contact"]}>
            <Image
              className={styles["contact-bg"]}
              src="/about/contact.jpg"
              alt=""
              width={2172}
              height={724}
              unoptimized
            />
            <span className={styles["eyebrow"]}>CONTACT US</span>
            <h2>ติดต่อเรา</h2>
            <div className={styles["csub"]}>
              เราพร้อมให้บริการและตอบทุกข้อสงสัย
            </div>
            <div className={styles["cicons"]}>
              <div className={styles["cic"]}>
                <Image
                  src="/about/line.png"
                  alt=""
                  width={38}
                  height={38}
                  unoptimized
                />
                <div className={styles["cn"]}>Line</div>
                <div className={styles["cs"]}>@readnow</div>
              </div>
              <div className={styles["cic"]}>
                <Image
                  src="/about/facebook.png"
                  alt=""
                  width={38}
                  height={38}
                  unoptimized
                />
                <div className={styles["cn"]}>Facebook</div>
                <div className={styles["cs"]}>ReadNow</div>
              </div>
              <div className={styles["cic"]}>
                <Image
                  src="/about/email.png"
                  alt=""
                  width={38}
                  height={38}
                  unoptimized
                />
                <div className={styles["cn"]}>Email</div>
                <div className={styles["cs"]}>support@readnow.com</div>
              </div>
              <div className={styles["cic"]}>
                <Image
                  src="/about/support.png"
                  alt=""
                  width={38}
                  height={38}
                  unoptimized
                />
                <div className={styles["cn"]}>คุยช่วยเหลือ</div>
                <div className={styles["cs"]}>ช่วยเหลือตลอด 24 ชม.</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
