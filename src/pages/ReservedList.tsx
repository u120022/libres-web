import { Link, useNavigate, useSearchParams } from "@solidjs/router";
import Cookies from "js-cookie";
import {
  Component,
  createEffect,
  createSignal,
  For,
  Match,
  Switch,
} from "solid-js";
import { ReservedStateComponent } from "./Utils";

const ReservedList: Component = () => {
  // hook
  const navigate = useNavigate();
  const [sParams, setSParams] = useSearchParams();
  const [page, setPage] = [
    () => parseInt(sParams.page) || 0,
    (page: number) => setSParams({ page }),
  ];
  const [holders, setBooks] = createSignal({ status: "EMPTY" });

  // fetch books
  createEffect(async () => {
    const token = Cookies.get("TOKEN");

    if (!token) {
      navigate("/login");
      return;
    }

    setBooks({ status: "LOADING" });

    const req = {
      token: token,
      page_size: 20,
      page: page(),
    };

    const res = await fetch(
      "https://tpu-libres-api-v2.azurewebsites.net/reserve",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
      }
    );

    const body = await res.json();

    setBooks({ ...body, status: "OK" });
  });

  // view
  return (
    <div class="mx-auto w-[1024px] p-5">
      <div class="text-xl font-bold">予約の履歴</div>

      <Switch>
        <Match when={holders().status == "EMPTY"}>
          <div class="text-center text-slate-400">準備中</div>
        </Match>
        <Match when={holders().status == "LOADING"}>
          <div class="text-center text-slate-400">取得中</div>
        </Match>
        <Match when={holders().status == "OK" && holders().total_count == "0"}>
          <div class="text-center text-slate-400">予約はありません</div>
        </Match>
        <Match when={holders().status == "OK"}>
          <div class="mb-3 text-center">
            該当数: {holders().total_count}, ページ: {page() + 1} /{" "}
            {Math.ceil(holders().total_count / 20)}
          </div>
          <div class="flex flex-col gap-3">
            <For each={holders().items}>
              {(item) => {
                // hook
                const [book, setBook] = createSignal({ status: "EMPTY" });
                const [backend, setBackend] = createSignal("ndl");

                // fetch book
                createEffect(async () => {
                  setBook({ status: "LOADING" });

                  const res = await fetch(
                    "https://tpu-libres-api-v2.azurewebsites.net/book/" +
                      item.isbn +
                      "?backend=" +
                      backend()
                  );

                  const body = await res.json();

                  setBook({ ...body, status: "OK" });
                });

                // view
                return (
                  <div class="flex gap-3 rounded border border-solid border-slate-400 p-3">
                    <img
                      class="aspect-[0.7] w-[20%] bg-slate-100"
                      alt=""
                      src={book().image_url}
                    />
                    <div class="w-[80%]">
                      <Link
                        href={"/reserved/" + item.id + "?backend=" + backend()}
                      >
                        <div class="font-bold">
                          {book().title || "情報なし"}
                        </div>
                      </Link>
                      <div>{item.library_name}</div>
                      <div>
                        {new Date(item.staging_at + "Z").toLocaleString()}
                      </div>
                      <ReservedStateComponent state={item.state} />

                      <select
                        class="mt-2 rounded border border-solid border-slate-400 p-1"
                        value={backend()}
                        onChange={(e) => setBackend(e.currentTarget.value)}
                      >
                        <option value="ndl">NDL</option>
                        <option value="rakuten">Rakuten Books</option>
                        <option value="google">Google Books</option>
                      </select>
                    </div>
                  </div>
                );
              }}
            </For>
            <div class="text-center">
              <button onClick={() => setPage(Math.max(0, page() - 1))}>
                前
              </button>
              <span class="mx-3">
                {page() + 1} / {Math.ceil(holders().total_count / 20)}
              </span>
              <button
                onClick={() =>
                  setPage(
                    Math.min(
                      page() + 1,
                      Math.ceil(holders().total_count / 20) - 1
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

export default ReservedList;
