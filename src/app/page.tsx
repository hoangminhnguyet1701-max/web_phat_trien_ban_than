import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Sprout,
  Leaf,
  BookOpen,
  Heart,
  MoveUpRight,
} from "lucide-react";
import { Logo } from "@/components/ui";
export default function Landing() {
  return (
    <div className="landing">
      <header className="public-nav">
        <Logo />
        <nav>
          <a href="#cach-hoat-dong">Cách hoạt động</a>
          <a href="#danh-cho-ban">Dành cho bạn</a>
        </nav>
        <div className="nav-actions">
          <Link href="/login">Đăng nhập</Link>
          <Link href="/register" className="button small">
            Bắt đầu ngay <ArrowUpRight size={16} />
          </Link>
        </div>
      </header>
      <main>
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">
              <span /> NHỮNG BƯỚC NHỎ. THAY ĐỔI LỚN.
            </div>
            <h1>
              Ngày mai tốt hơn,
              <br />
              từ <em>một chút</em> hôm nay.
            </h1>
            <p>
              Biến mục tiêu lớn thành những việc nhỏ vừa sức.
              <br />
              Xây dựng thói quen tốt, theo nhịp của riêng bạn.
            </p>
            <Link href="/register" className="button">
              Bắt đầu hành trình của bạn <ArrowRight size={19} />
            </Link>
            <div className="hero-note">
              <Check size={16} /> Miễn phí để bắt đầu <span>·</span> Không áp
              lực hoàn hảo
            </div>
          </div>
          <div className="hero-art">
            <div className="art-orbit orbit-one" />
            <div className="art-orbit orbit-two" />
            <div className="plant-circle">
              <Sprout strokeWidth={0.9} />
            </div>
            <div className="floating-note note-top">
              <span className="round-icon">
                <BookOpen size={21} />
              </span>
              <div>
                <small>MỘT CHÚT HÔM NAY</small>
                <strong>Đọc 5 trang sách</strong>
              </div>
              <span className="note-check">
                <Check size={16} />
              </span>
            </div>
            <div className="floating-note note-bottom">
              <span className="streak-flame">☀</span>
              <div>
                <strong>Tốt hơn một chút mỗi ngày</strong>
                <small>Một khởi đầu nhỏ. Một phiên bản mới.</small>
              </div>
            </div>
            <span className="art-label">GROW AT YOUR OWN PACE</span>
            <Leaf className="art-leaf" strokeWidth={1} />
          </div>
        </section>
        <section className="belief">
          <p>
            Không cần một khởi đầu thật lớn.
            <br />
            Chỉ cần <strong>một bước nhỏ đủ để tiếp tục.</strong>
          </p>
          <span>Chúng mình ở đây để đồng hành, từng ngày.</span>
        </section>
        <section id="cach-hoat-dong" className="how section">
          <div className="section-heading">
            <span className="section-label">ĐƠN GIẢN ĐỂ BẮT ĐẦU</span>
            <h2>
              Mục tiêu của bạn.
              <br />
              Từng bước nhỏ của chúng mình.
            </h2>
          </div>
          <div className="steps">
            {[
              [
                "01",
                "Chọn điều bạn muốn thay đổi",
                "Đọc nhiều hơn, vận động một chút, hay bớt thời gian bên màn hình. Bắt đầu từ điều quan trọng với bạn.",
              ],
              [
                "02",
                "Nhận lộ trình vừa sức",
                "Chọn 7, 14, 21 hoặc 30 ngày. Mỗi ngày một nhiệm vụ nhỏ, đủ nhẹ nhàng để bạn muốn tiếp tục.",
              ],
              [
                "03",
                "Check-in và nhìn mình tiến bộ",
                "Chia sẻ cảm nhận mỗi ngày. Lộ trình sẽ thay đổi để phù hợp với nhịp của bạn.",
              ],
            ].map(([n, title, body]) => (
              <article key={n}>
                <span className="step-num">
                  {n}
                  <MoveUpRight size={22} />
                </span>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </section>
        <section id="danh-cho-ban" className="gentle section">
          <div className="gentle-art">
            <Sprout size={90} strokeWidth={1} />
            <p>
              Chậm một chút.
              <br />
              Vẫn đang lớn lên.
            </p>
          </div>
          <div>
            <span className="section-label">MỘT NƠI ĐỂ BẠN TIẾP TỤC</span>
            <h2>
              Thói quen tốt không cần
              <br />
              bắt đầu bằng áp lực.
            </h2>
            <p>
              Một ngày bỏ lỡ không xóa đi những cố gắng trước đó. Chúng mình
              giúp bạn quay lại và tìm nhịp phù hợp hơn.
            </p>
            <ul>
              <li>
                <Check size={19} /> Nhiệm vụ thay đổi theo cảm nhận của bạn
              </li>
              <li>
                <Check size={19} /> Nhìn thấy sự tiến bộ qua từng ngày
              </li>
              <li>
                <Heart size={19} /> Động viên nhẹ nhàng, không phán xét
              </li>
            </ul>
            <Link className="text-link" href="/register">
              Thử một bước nhỏ hôm nay <ArrowRight size={18} />
            </Link>
          </div>
        </section>
        <section className="closing section">
          <span className="icon-box">
            <Leaf />
          </span>
          <h2>
            Một chút hôm nay.
            <br />
            Rất khác vào ngày mai.
          </h2>
          <p>Hành trình của bạn có thể bắt đầu ngay từ đây.</p>
          <Link className="button" href="/register">
            Tạo mục tiêu đầu tiên <ArrowRight size={18} />
          </Link>
        </section>
      </main>
      <footer className="footer">
        <Logo />
        <p>
          Mỗi ngày không cần thay đổi thật nhiều.
          <br />
          Chỉ cần tiến bộ một chút.
        </p>
        <span>Được làm với sự dịu dàng ♡</span>
      </footer>
    </div>
  );
}
