import { Link, useSearchParams } from "@solidjs/router";
import {
  Component,
  createEffect,
  createSignal,
  For,
  Match,
  Switch,
} from "solid-js";

const BookList: Component = () => {
  // hook
  const [sParams, setSParams] = useSearchParams();
  const [confirmFilter, setConfirmFilter] = [
    () => sParams.filter || "",
    (filter: string) => setSParams({ filter, page: 0 }),
  ];
  const [backend, setBackend] = [
    () => sParams.backend || "ndl",
    (backend: string) => setSParams({ backend, page: 0 }),
  ];
  const [page, setPage] = [
    () => parseInt(sParams.page) || 0,
    (page: number) => setSParams({ page }),
  ];
  const [filter, setFilter] = createSignal(confirmFilter());
  const [books, setBooks] = createSignal({ status: "EMPTY" });

  // fetch books
  createEffect(async () => {
    if (confirmFilter().trim() == "") {
      setBooks({ status: "EMPTY" });
      return;
    }

    setBooks({ status: "LOADING" });

    const query = new URLSearchParams({
      filter: confirmFilter(),
      page_size: "20",
      page: page().toString(),
      backend: backend(),
    });

    const res = await fetch(
      "https://tpu-libres-api-v2.azurewebsites.net/book?" + query
    );

    setBooks({ ...(await res.json()), status: "OK" });
  });

  // view
  return (
    <div class="m-auto w-[1024px] p-5">
      <div class="mb-3 rounded border border-solid border-slate-400 p-3">
        <div class="mb-3 font-bold">本検索</div>
        <input
          type="text"
          class="mr-3 rounded border border-solid border-slate-400 p-2"
          value={filter()}
          onInput={(e) => setFilter(e.currentTarget.value)}
          onChange={(e) => setConfirmFilter(e.currentTarget.value)}
          placeholder="ドメイン駆動設計"
        />
        <select
          class="rounded border border-solid border-slate-400 p-2"
          value={backend()}
          onChange={(e) => setBackend(e.currentTarget.value)}
        >
          <option value="ndl">NDL</option>
          <option value="rakuten">Rakuten Books</option>
          <option value="google">Google Books</option>
        </select>
      </div>
      <Switch>
        <Match when={books().status == "EMPTY"}>
          <div class="text-center text-slate-400">文字を入力してください</div>
        </Match>
        <Match when={books().status == "LOADING"}>
          <div class="text-center text-slate-400">取得中</div>
        </Match>
        <Match when={books().status == "OK"}>
          <div class="mb-3 text-center">
            該当数: {books().total_count}, ページ: {page() + 1} /{" "}
            {Math.ceil(books().total_count / 20)}
          </div>
          <div class="flex flex-col gap-3">
            <For each={books().items}>
              {(item) => (
                <Link
                  href={
                    item.isbn
                      ? "/book/" + item.isbn + "?backend=" + backend()
                      : "#"
                  }
                >
                  <div class="flex gap-3 rounded border border-solid border-slate-400 p-3">
                    <img
                      class="aspect-[0.7] w-[20%] bg-slate-100"
                      alt=""
                      src={item.image_url}
                    />
                    <div class="w-[80%]">
                      <div class="font-bold">{item.title}</div>
                      <div>{item.creators.join(",")}</div>
                      <div>{item.publishers.join(",")}</div>
                      <div class="text-slate-400">
                        {item.isbn || "利用不可能"}
                      </div>
                    </div>
                  </div>
                </Link>
              )}
            </For>
            <div class="text-center">
              <button onClick={() => setPage(Math.max(0, page() - 1))}>
                前
              </button>
              <span class="mx-3">
                {page() + 1} / {Math.ceil(books().total_count / 20)}
              </span>
              <button
                onClick={() =>
                  setPage(
                    Math.min(
                      page() + 1,
                      Math.ceil(books().total_count / 20) - 1
                    )
                  )
                }
              >
                次
              </button>
            </div>
          </div>
        </Match>
      </Switch>
    </div>
  );
};

export default BookList;
