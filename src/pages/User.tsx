import { useNavigate } from "@solidjs/router";
import Cookies from "js-cookie";
import {
  Component,
  createEffect,
  createSignal,
  Match,
  Show,
  Switch,
} from "solid-js";

const User: Component = () => {
  // hook
  const navigate = useNavigate();
  const [user, setUser] = createSignal({ status: "EMPTY" });
  const [status, setStatus] = createSignal({ status: "EMPTY" });

  // fetch user
  createEffect(async () => {
    const token = Cookies.get("TOKEN");

    if (!token) {
      navigate("/login");
      return;
    }

    setUser({ status: "LOADING" });

    const res = await fetch(
      "https://tpu-libres-api-v2.azurewebsites.net/user_get",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      }
    );

    const body = await res.json();

    setUser({ ...body, status: "OK" });
  });

  // logout
  const logout = async () => {
    setStatus({ status: "LOADING" });

    const token = Cookies.get("TOKEN");

    if (!token) {
      navigate("/login");
      return;
    }

    const res = await fetch(
      "https://tpu-libres-api-v2.azurewebsites.net/user_logout",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      }
    );

    if (res.status == 200) {
      Cookies.remove("TOKEN");
      navigate("/");
      return;
    }

    setStatus({ status: "ERROR" });
  };

  // view
  return (
    <div class="mx-auto w-[480px] p-5">
      <div class="mb-10 text-xl font-bold">ユーザ情報</div>

      <Switch>
        <Match when={status().status == "LOADING"}>
          <div class="mb-3 text-center text-slate-400">手続き中</div>
        </Match>
        <Match when={status().status == "ERROR"}>
          <div class="mb-3 text-center text-rose-600">手続きに失敗しました</div>
        </Match>
      </Switch>

      <Show
        when={user().status == "OK"}
        fallback={<div class="text-center text-slate-400">取得中</div>}
      >
        <div class="mb-2 font-bold">氏名</div>
        <div class="mb-3 w-full rounded bg-slate-100 p-2">
          {user().fullname}
        </div>
        <div class="mb-2 font-bold">住所</div>
        <div class="mb-3 w-full rounded bg-slate-100 p-2">{user().address}</div>
        <div class="mb-2 font-bold">メールアドレス</div>
        <div class="mb-3 w-full rounded bg-slate-100 p-2">{user().email}</div>
        <div class="mb-2 font-bold">パスワード</div>
        <div class="mb-10 w-full rounded bg-slate-100 p-2">********</div>
        <div class="text-center">
          <button class="rounded bg-slate-200 p-2" onClick={logout}>
            ログアウト
          </button>
        </div>
      </Show>
    </div>
  );
};

export default User;
