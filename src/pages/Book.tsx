import { Link, useParams, useSearchParams } from "@solidjs/router";
import { Component, createEffect, createSignal, Match, Switch } from "solid-js";

const Book: Component = () => {
  // hook
  const params = useParams();
  const [sParams, setSParams] = useSearchParams();
  const [backend, setBackend] = [
    () => sParams.backend || "ndl",
    (backend: string) => setSParams({ backend }),
  ];
  const [book, setBook] = createSignal({ status: "EMPTY" });

  // fetch book
  createEffect(async () => {
    setBook({ status: "LOADING" });

    const res = await fetch(
      "https://tpu-libres-api-v2.azurewebsites.net/book/" +
        params.isbn +
        "?backend=" +
        backend()
    );

    if (res.status == 200) {
      const body = await res.json();
      setBook({ ...body, status: "OK" });
      return;
    }

    setBook({ status: "NOT_FOUND" });
  });

  // view
  return (
    <div class="mx-auto w-[1024px] p-5">
      <div class="text-center">
        <select
          value={backend()}
          onChange={(e) => setBackend(e.currentTarget.value)}
          class="mb-3 rounded border border-solid border-slate-400 p-1"
        >
          <option value="ndl">NDL</option>
          <option value="rakuten">Rakuten Books</option>
          <option value="google">Google Books</option>
        </select>
      </div>

      <Switch>
        <Match when={book().status == "LOADING"}>
          <div class="text-center text-slate-400">準備中</div>
        </Match>
        <Match when={book().status == "LOADING"}>
          <div class="text-center text-slate-400">取得中</div>
        </Match>
        <Match when={book().status == "NOT_FOUND"}>
          <div class="text-center text-slate-400">見つかりませんでした</div>
        </Match>
        <Match when={book().status == "OK"}>
          <div class="mb-10 text-4xl font-bold">{book().title}</div>
          <div class="mb-10 flex gap-3">
            <img
              class="aspect-[0.7] w-[50%] bg-slate-100"
              src={book().image_url}
              alt=""
            />
            <div class="w-[50%]">
              <div class="font-bold">著者</div>
              <div>{book().creators.join(" ") || "情報なし"}</div>
              <div class="font-bold">出版者</div>
              <div>{book().publishers.join(" ") || "情報なし"}</div>
              <div class="font-bold">説明</div>
              <div>{book().descriptions.join("\n") || "情報なし"}</div>
              <div class="font-bold">キーワード</div>
              <div>{book().keywords.join(" ") || "情報なし"}</div>
              <div class="font-bold">出版年</div>
              <div>{book().issued_at || "情報なし"}</div>
            </div>
          </div>
          <div class="text-center">
            <Link
              class="inline-block w-1/4 rounded bg-slate-200 py-3"
              href={
                "/library?isbn=" + book().isbn + "&backend=" + sParams.backend
              }
            >
              予約する
            </Link>
          </div>
        </Match>
      </Switch>
    </div>
  );
};

export default Book;
