import { Link, useNavigate } from "@solidjs/router";
import Cookies from "js-cookie";
import { Component, createSignal, Match, Switch } from "solid-js";

const Login: Component = () => {
  // hook
  const navigate = useNavigate();
  const [status, setStatus] = createSignal({ status: "EMPTY" });

  // login
  const login = async (e) => {
    setStatus({ status: "LOADING" });

    const req = {
      email: e.currentTarget.email.value,
      password: e.currentTarget.password.value,
    };

    const res = await fetch(
      "https://tpu-libres-api-v2.azurewebsites.net/user_login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
      }
    );

    if (res.status == 200) {
      const token = await res.json();
      Cookies.set("TOKEN", token);
      navigate("/user");
    }

    setStatus({ status: "ERROR" });
  };

  // view
  return (
    <div class="mx-auto w-[480px] p-5">
      <div class="mb-5 text-center text-xl font-bold">ログイン</div>

      <Switch>
        <Match when={status().status == "LOADING"}>
          <div class="mb-3 text-center text-slate-400">手続き中</div>
        </Match>
        <Match when={status().status == "ERROR"}>
          <div class="mb-3 text-center text-rose-600">手続きに失敗しました</div>
        </Match>
      </Switch>

      <form class="mb-5" method="dialog" onSubmit={login}>
        <div class="mb-5">
          <div>メールアドレス</div>
          <input
            type="email"
            name="email"
            class="w-full rounded border border-solid border-slate-400 p-2"
            placeholder="books@example.com"
            required
          />
        </div>

        <div class="mb-10">
          <div>パスワード</div>
          <input
            type="password"
            name="password"
            class="w-full rounded border border-solid border-slate-400 p-2"
            placeholder="********"
            required
          />
        </div>

        <div class="text-center">
          <input
            type="submit"
            value="ログイン"
            class="w-1/2 cursor-pointer rounded bg-slate-200 py-2"
          />
        </div>
      </form>

      <div class="text-center">
        <Link
          href="/register"
          class="inline-block w-1/2 rounded bg-slate-200 py-2"
        >
          新規登録
        </Link>
      </div>
    </div>
  );
};

export default Login;
