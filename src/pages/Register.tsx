import { useNavigate } from "@solidjs/router";
import { Component, createSignal, Match, Switch } from "solid-js";

const Register: Component = () => {
  // hook
  const navigate = useNavigate();
  const [status, setStatus] = createSignal({ status: "EMPTY" });

  // register
  const register = async (e) => {
    setStatus({ status: "LOADING" });

    const req = {
      email: e.currentTarget.email.value,
      password: e.currentTarget.password.value,
      fullname: e.currentTarget.fullname.value,
      address: e.currentTarget.address.value,
    };

    const res = await fetch(
      "https://tpu-libres-api-v2.azurewebsites.net/user_create",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
      }
    );

    if (res.status == 200) {
      navigate("/successful");
    }

    setStatus({ status: "ERROR" });
  };

  // view
  return (
    <div class="mx-auto w-[480px] p-5">
      <div class="mb-5 text-center text-xl font-bold">新規登録</div>

      <Switch>
        <Match when={status().status == "LOADING"}>
          <div class="mb-3 text-center text-slate-400">手続き中</div>
        </Match>
        <Match when={status().status == "ERROR"}>
          <div class="mb-3 text-center text-rose-600">手続きに失敗しました</div>
        </Match>
      </Switch>

      <form class="mb-5" method="dialog" onSubmit={register}>
        <div class="mb-5">
          <div>氏名</div>
          <input
            type="text"
            name="fullname"
            class="w-full rounded border border-solid border-slate-400 p-2"
            placeholder="山田太郎"
            required
          />
        </div>

        <div class="mb-5">
          <div>住所</div>
          <input
            type="text"
            name="address"
            class="w-full rounded border border-solid border-slate-400 p-2"
            placeholder="富山県射水市黒河5130"
            required
          />
        </div>

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
            value="新規登録"
            class="w-1/2 cursor-pointer rounded bg-slate-200 py-2"
          />
        </div>
      </form>
    </div>
  );
};

export default Register;
