import { useNavigate, useSearchParams } from "@solidjs/router";
import Cookies from "js-cookie";
import {
  Component,
  createEffect,
  createSignal,
  Match,
  Show,
  Switch,
} from "solid-js";
import { HolderStateComponent } from "./Utils";

const Reserve: Component = () => {
  // hook
  const navigate = useNavigate();
  const [sParams] = useSearchParams();
  const [book, setBook] = createSignal({ status: "EMPTY" });
  const [library, setLibrary] = createSignal({ status: "EMPTY" });
  const [holder, setHolder] = createSignal({ status: "EMPTY" });
  const [status, setStatus] = createSignal({ status: "EMPTY" });

  // fetch book
  createEffect(async () => {
    const res = await fetch(
      "https://tpu-libres-api-v2.azurewebsites.net/book/" +
        sParams.isbn +
        "?backend=" +
        sParams.backend
    );
    const body = await res.json();

    setBook({ ...body, status: "OK" });
  });

  // fetch library
  createEffect(async () => {
    const res = await fetch(
      "https://tpu-libres-api-v2.azurewebsites.net/library/" +
        sParams.library_name
    );
    const body = await res.json();

    setLibrary({ ...body, status: "OK" });
  });

  // fetch holder
  createEffect(async () => {
    const query = new URLSearchParams({
      isbn: sParams.isbn,
      library_names: sParams.library_name,
    });

    const res = await fetch(
      "https://tpu-libres-api-v2.azurewebsites.net/holder?" + query
    );

    if (res.status == 200) {
      const body = await res.json();
      setHolder({ ...body.items[0], status: "OK" });
      return;
    }

    setHolder({ status: "NOT_FOUND" });
  });

  // reserve
  const reserve = async () => {
    const token = Cookies.get("TOKEN");

    if (!token) {
      navigate("/login");
      return;
    }

    setStatus({ status: "LOADING" });

    const req = {
      token,
      isbn: book().isbn,
      library_name: library().name,
    };

    const res = await fetch(
      "https://tpu-libres-api-v2.azurewebsites.net/reserve_create",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
      }
    );

    if (res.status === 200) {
      navigate("/successful");
      return;
    }

    setStatus({ status: "ERROR" });
  };

  // view
  return (
    <div class="mx-auto w-[1024px] p-5">
      <div class="mb-5 text-center text-xl font-bold">予約の確認</div>
      <Switch fallback={<div class="text-center text-slate-400">取得中</div>}>
        <Match when={holder().status == "NOT_FOUND"}>
          <div class="text-center text-slate-400">
            図書館の照合に失敗しました
          </div>
        </Match>
        <Match
          when={
            book().status == "OK" &&
            library().status == "OK" &&
            holder().status == "OK"
          }
        >
          <div class="mb-3 rounded border border-solid border-slate-400 p-3">
            <div class="mb-3 text-xl font-bold">{library().name}</div>
            <div class="font-bold">住所</div>
            <div>{library().address}</div>
            <div class="font-bold">電話番号</div>
            <div>{library().postcode}</div>
            <div class="font-bold">URL</div>
            <a href={library().url}>{library().url}</a>
          </div>

          <div class="mb-3 rounded border border-solid border-slate-400 p-3">
            <div class="mb-3 text-xl font-bold">{book().title}</div>
            <div class="font-bold">著者</div>
            <div>{book().creators.join(" ") || "情報なし"}</div>
            <div class="font-bold">出版者</div>
            <div>{book().publishers.join(" ") || "情報なし"}</div>
            <div class="font-bold">説明</div>
            <div>{book().descriptions.join("\n") || "情報なし"}</div>
          </div>

          <div class="mb-3 text-center text-xl font-bold">
            <HolderStateComponent state={holder().state} />
          </div>

          <Show when={holder().state == "Reservable"}>
            <Switch>
              <Match when={status().status == "LOADING"}>
                <div class="mb-3 text-center text-slate-400">手続き中</div>
              </Match>
              <Match when={status().status == "ERROR"}>
                <div class="mb-3 text-center text-rose-600">
                  手続きに失敗しました
                </div>
              </Match>
            </Switch>
            <div class="mb-3 text-center">
              <button class="w-1/4 rounded bg-slate-200 py-3" onClick={reserve}>
                予約を完了する
              </button>
            </div>
          </Show>
        </Match>
      </Switch>
    </div>
  );
};

export default Reserve;
