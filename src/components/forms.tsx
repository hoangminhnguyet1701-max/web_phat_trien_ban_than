"use client";
import {
  startTransition,
  useActionState,
  useEffect,
  useState,
  type FormEvent,
} from "react";
import { signIn, signOut } from "next-auth/react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Smile,
  Meh,
  Frown,
  LoaderCircle,
  LogOut,
} from "lucide-react";
import { register, createGoal, checkIn, type FormState } from "@/app/actions";
import { categories } from "@/lib/challenges";
import { CategoryIcon } from "./ui";

// Explicit submission keeps the user's draft when a server action returns an error.
function useDraftForm(
  action: (state: FormState, form: FormData) => Promise<FormState>,
) {
  const [state, dispatch, pending] = useActionState(action, {} as FormState);
  useEffect(() => {
    if (state.destination) window.location.assign(state.destination);
  }, [state.destination]);
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || state.destination || state.success) return;
    const form = new FormData(event.currentTarget);
    startTransition(() => dispatch(form));
  }
  return {
    state,
    pending: pending || Boolean(state.destination) || Boolean(state.success),
    onSubmit,
  };
}
export function Logout() {
  return (
    <button className="logout" onClick={() => signOut({ callbackUrl: "/" })}>
      <LogOut size={18} /> Đăng xuất
    </button>
  );
}
function Submit({
  pending,
  children,
}: {
  pending: boolean;
  children: React.ReactNode;
}) {
  return (
    <button className="button" type="submit" disabled={pending}>
      {pending ? (
        <>
          <LoaderCircle className="spin" size={18} /> Đang lưu...
        </>
      ) : (
        children
      )}
    </button>
  );
}
export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const { state, onSubmit, pending: registering } = useDraftForm(register);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  useEffect(() => {
    if (state.success) window.location.href = "/login?registered=1";
  }, [state.success]);
  async function login(form: FormData) {
    if (pending) return;
    setPending(true);
    setError("");
    try {
      const result = await signIn("credentials", {
        email: form.get("email"),
        password: form.get("password"),
        redirect: false,
      });
      if (result?.ok) window.location.href = "/dashboard";
      else
        setError(
          result?.error === "TooManyAttempts"
            ? "Mình tạm nghỉ một chút nhé. Có nhiều lần đăng nhập chưa đúng, bạn thử lại sau 15 phút."
            : "Email hoặc mật khẩu chưa đúng. Bạn thử lại nhé.",
        );
    } catch {
      setError("Không thể kết nối. Vui lòng thử lại.");
    } finally {
      setPending(false);
    }
  }
  return (
    <form
      method="post"
      onSubmit={
        mode === "login"
          ? (event) => {
              event.preventDefault();
              void login(new FormData(event.currentTarget));
            }
          : onSubmit
      }
      className="form-stack"
    >
      {mode === "register" && (
        <label>
          Tên của bạn
          <input
            name="name"
            placeholder="Chúng mình nên gọi bạn là gì?"
            autoComplete="name"
            required
            maxLength={80}
          />
        </label>
      )}
      <label>
        Email
        <input
          type="email"
          name="email"
          placeholder="ban@email.com"
          autoComplete="email"
          required
          maxLength={254}
        />
      </label>
      <label>
        Mật khẩu
        <input
          type="password"
          name="password"
          placeholder="Ít nhất 8 ký tự"
          minLength={8}
          maxLength={128}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          required
        />
      </label>
      {(state.error || error) && (
        <p className="error-text" role="alert">
          {state.error || error}
        </p>
      )}
      <Submit pending={pending || registering}>
        {mode === "register" ? "Tạo tài khoản" : "Đăng nhập"}{" "}
        <ArrowRight size={18} />
      </Submit>
      <p className="form-bottom">
        {mode === "register" ? "Đã có tài khoản?" : "Bạn mới ở đây?"}{" "}
        <Link href={mode === "register" ? "/login" : "/register"}>
          {mode === "register" ? "Đăng nhập" : "Tạo tài khoản miễn phí"}
        </Link>
      </p>
    </form>
  );
}
export function GoalForm() {
  const { state, onSubmit, pending } = useDraftForm(createGoal);
  return (
    <form method="post" onSubmit={onSubmit} className="form-stack goal-form">
      <label>
        Bạn muốn thay đổi điều gì?
        <input
          name="title"
          placeholder="Ví dụ: Tôi muốn đọc sách mỗi ngày"
          required
          maxLength={160}
        />
        <small>Một mục tiêu cụ thể sẽ giúp bạn dễ bắt đầu hơn.</small>
      </label>
      <fieldset>
        <legend>Chọn nhóm mục tiêu</legend>
        <div className="category-options">
          {Object.entries(categories).map(([key, value]) => (
            <label className="choice category-choice" key={key}>
              <input
                type="radio"
                name="category"
                value={key}
                defaultChecked={key === "reading"}
              />
              <CategoryIcon category={key} />
              <span>{value.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend>Bạn muốn đi cùng mục tiêu bao lâu?</legend>
        <div className="options">
          {[7, 14, 21, 30].map((n) => (
            <label className="choice" key={n}>
              <input
                type="radio"
                name="duration"
                value={n}
                defaultChecked={n === 21}
              />
              <b>{n} ngày</b>
              {n === 21 && <small>Vừa đủ để bắt nhịp</small>}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend>Bắt đầu ở mức độ nào?</legend>
        <div className="options">
          {[
            ["easy", "Nhẹ nhàng", "Từng bước thật nhỏ"],
            ["medium", "Vừa sức", "Một chút thử thách"],
            ["hard", "Thử sức", "Sẵn sàng tiến xa"],
          ].map(([key, title, desc]) => (
            <label className="choice" key={key}>
              <input
                type="radio"
                name="startLevel"
                value={key}
                defaultChecked={key === "easy"}
              />
              <b>{title}</b>
              <small>{desc}</small>
            </label>
          ))}
        </div>
      </fieldset>
      <label>
        Điều gì khiến mục tiêu này quan trọng với bạn?{" "}
        <span className="muted">(tùy chọn)</span>
        <textarea
          name="reason"
          rows={3}
          maxLength={1000}
          placeholder="Một lời nhắc cho những ngày cần thêm động lực..."
        />
      </label>
      {state.error && (
        <p role="alert" className="error-text">
          {state.error}
        </p>
      )}
      <Submit pending={pending}>
        Bắt đầu hành trình của tôi <ArrowRight size={18} />
      </Submit>
      <p className="muted fine">
        Bạn không cần hoàn hảo. Chỉ cần sẵn lòng bắt đầu.
      </p>
    </form>
  );
}
export function CheckInForm({ id, taskId }: { id: string; taskId: string }) {
  const { state, onSubmit, pending } = useDraftForm(checkIn.bind(null, id));
  return (
    <form method="post" onSubmit={onSubmit} className="form-stack">
      <input type="hidden" name="taskId" value={taskId} />
      <fieldset>
        <legend>Hôm nay bạn đã thực hiện nhiệm vụ chưa?</legend>
        <div className="options">
          <label className="choice">
            <input
              type="radio"
              name="completed"
              value="yes"
              required
              defaultChecked
            />
            <Check size={22} />
            <b>Mình đã hoàn thành</b>
          </label>
          <label className="choice">
            <input type="radio" name="completed" value="no" />
            <b>Hôm nay chưa trọn vẹn</b>
            <small>Không sao, ngày mai mình tiếp tục</small>
          </label>
        </div>
      </fieldset>
      <fieldset>
        <legend>Nhiệm vụ hôm nay có vừa sức với bạn?</legend>
        <div className="options">
          {[
            ["easy", "Dễ", Smile],
            ["medium", "Vừa sức", Meh],
            ["hard", "Khó", Frown],
          ].map(([key, label, Icon]) => {
            const FeelingIcon = Icon as typeof Smile;
            return (
              <label className="choice feeling" key={String(key)}>
                <input
                  type="radio"
                  name="feeling"
                  value={String(key)}
                  required
                />
                <FeelingIcon size={26} />
                <b>{String(label)}</b>
              </label>
            );
          })}
        </div>
      </fieldset>
      <label>
        Một vài dòng cho hôm nay <span className="muted">(tùy chọn)</span>
        <textarea
          name="note"
          maxLength={2000}
          rows={4}
          placeholder="Bạn cảm thấy thế nào? Có điều gì muốn ghi nhớ?"
        />
      </label>
      <p className="info">
        Lộ trình ngày mai sẽ được điều chỉnh theo cảm nhận của bạn.
      </p>
      {state.error && (
        <div role="alert" className="error-text">
          <p>{state.error}</p>
          <button
            type="button"
            className="text-link"
            onClick={() => window.location.reload()}
          >
            Tải lại nhiệm vụ hôm nay
          </button>
        </div>
      )}
      <Submit pending={pending}>
        Lưu check-in hôm nay <Check size={18} />
      </Submit>
    </form>
  );
}
