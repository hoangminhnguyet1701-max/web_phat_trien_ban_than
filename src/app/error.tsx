"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="empty">
      <h2>Có một chút gián đoạn.</h2>
      <p>Bạn thử tải lại nhé. Chúng mình vẫn ở đây.</p>
      <button className="button" onClick={reset}>
        Thử lại
      </button>
    </div>
  );
}
