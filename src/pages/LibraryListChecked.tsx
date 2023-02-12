import { Link, useSearchParams } from "@solidjs/router";
import { createEffect, createSignal, For, Match, Switch } from "solid-js";
import {
  createReserveLink,
  HolderStateComponent,
  SwitcherComponent,
} from "./Utils";

const LibraryListChecked = () => {
  // hook
  const [sParams] = useSearchParams();
  const [page, setPage] = createSignal(0);
  const [holders, setHolders] = createSignal({ status: "EMPTY" });

  // fetch holders
  createEffect(async () => {
    setHolders({ status: "LOADING" });

    const query = new URLSearchParams({
      isbn: sParams.isbn,
      page_size: "20",
      page: page().toString(),
    });

    const res = await fetch(
      "https://tpu-libres-api-v2.azurewebsites.net/holder_all_query?" + query
    );

    const body = await res.json();

    setHolders({ ...body, status: "OK" });
  });

  // view
  return (
    <div class="mx-auto w-[1024px] p-5">
      <SwitcherComponent
        isbn={sParams.isbn}
        backend={sParams.backend}
        select={1}
      />

      <Switch>
        <Match when={holders().status == "OK"}>
          <div class="mb-3 text-center">
            該当数: {holders().total_count}, ページ: {page() + 1} /{" "}
            {Math.ceil(holders().total_count / 20)}
          </div>

          <div class="flex flex-col gap-3">
            <For each={holders().items}>
              {(item) => (
                <Link
                  href={createReserveLink(
                    sParams.isbn,
                    sParams.backend,
                    item.library_name
                  )}
                >
                  <div class="rounded border border-solid border-slate-400 p-3">
                    <div class="font-bold">{item.library_name}</div>
                    <HolderStateComponent state={item.state} />
                    <div class="text-slate-400">CINII</div>
                  </div>
                </Link>
              )}
            </For>

            <div class="text-center">
              <button onClick={(_) => setPage((prev) => Math.max(0, prev - 1))}>
                前
              </button>
              <span class="mx-3">
                {page() + 1} / {Math.ceil(holders().total_count / 20)}
              </span>
              <button
                onClick={(_) =>
                  setPage((prev) =>
                    Math.min(
                      prev + 1,
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
        <Match when={holders().status == "LOADING"}>
          <div class="text-center text-slate-400">読み込み中</div>
        </Match>
        <Match when={holders().status == "EMPTY"}>
          <div class="text-center text-slate-400">準備中</div>
        </Match>
      </Switch>
    </div>
  );
};

export default LibraryListChecked;
