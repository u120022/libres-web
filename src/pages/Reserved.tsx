import { useNavigate, useParams, useSearchParams } from "@solidjs/router";
import Cookies from "js-cookie";
import { Component, createEffect, createSignal, Show } from "solid-js";
import { ReservedStateComponent } from "./Utils";

const Reserved: Component = () => {
  // hook
  const navigate = useNavigate();
  const params = useParams();
  const [sParams, setSParams] = useSearchParams();
  const [backend, setBackend] = [
    () => sParams.backend || "ndl",
    (backend: string) => setSParams({ backend }),
  ];
  const [reserved, setReserved] = createSignal({ status: "EMPTY" });
  const [book, setBook] = createSignal({ status: "EMPTY" });
  const [library, setLibrary] = createSignal({ status: "EMPTY" });

  // fetch
  createEffect(async () => {
    // phantom reactive value
    backend();

    // reserved
    const token = Cookies.get("TOKEN");
    if (!token) {
      navigate("/login");
      return;
    }

    const req = { token };
    const resReserved = await fetch(
      "https://tpu-libres-api-v2.azurewebsites.net/reserve/" + params.id,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
      }
    );
    const bodyReserved = await resReserved.json();

    setReserved({ ...bodyReserved, status: "OK" });

    // book
    const resBook = await fetch(
      "https://tpu-libres-api-v2.azurewebsites.net/book/" +
        reserved().isbn +
        "?backend=" +
        backend()
    );
    const bodyBook = await resBook.json();

    setBook({ ...bodyBook, status: "OK" });

    // library
    const resLibrary = await fetch(
      "https://tpu-libres-api-v2.azurewebsites.net/library/" +
        reserved().library_name
    );
    const bodyLinrary = await resLibrary.json();

    setLibrary({ ...bodyLinrary, status: "OK" });
  });

  // view
  return (
    <div class="mx-auto w-[1024px] p-5">
      <div class="mb-5 text-center text-xl font-bold">予約した本の確認</div>
      <Show
        when={
          reserved().status == "OK" &&
          book().status == "OK" &&
          library().status == "OK"
        }
        fallback={<div class="text-center text-slate-400">取得中</div>}
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
          <div class="mb-3 text-xl font-bold">{book().title || "情報なし"}</div>
          <div class="font-bold">著者</div>
          <div>{book().creators.join(" ") || "情報なし"}</div>
          <div class="font-bold">出版者</div>
          <div>{book().publishers.join(" ") || "情報なし"}</div>
          <div class="font-bold">説明</div>
          <div>{book().descriptions.join("\n") || "情報なし"}</div>
          <select
            value={backend()}
            onChange={(e) => setBackend(e.currentTarget.value)}
            class="mt-2 rounded border border-solid border-slate-400 p-1"
          >
            <option value="ndl">NDL</option>
            <option value="rakuten">Rakuten Books</option>
            <option value="google">Google Books</option>
          </select>
        </div>

        <div class="mb-3 text-center text-xl font-bold">
          <ReservedStateComponent state={reserved().state} />
        </div>
      </Show>
    </div>
  );
};

export default Reserved;
