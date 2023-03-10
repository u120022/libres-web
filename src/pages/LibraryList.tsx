import { Link, useSearchParams } from "@solidjs/router";
import {
  Component,
  createEffect,
  createSignal,
  For,
  Match,
  Switch,
} from "solid-js";
import { createReserveLink, SwitcherComponent } from "./Utils";

const LibraryList: Component = () => {
  // hook
  const [sParams, setSParams] = useSearchParams();
  const [confirmPrefecture, setConfirmPrefecture] = [
    () => sParams.prefecture,
    (prefecture: string) => setSParams({ prefecture, page: 0 }),
  ];
  const [confirmCity, setConfirmCity] = [
    () => sParams.city,
    (city: string) => setSParams({ city, page: 0 }),
  ];
  const [page, setPage] = [
    () => parseInt(sParams.page) || 0,
    (page: number) => setSParams({ page }),
  ];
  const [prefecture, setPrefecture] = createSignal(confirmPrefecture() || "");
  const [city, setCity] = createSignal(confirmCity() || "");
  const [libraryies, setLibraries] = createSignal({ status: "EMPTY" });

  // fetch libraries
  createEffect(async () => {
    if (confirmPrefecture().trim() == "" || confirmCity().trim() == "") {
      setLibraries({ status: "EMPTY" });
      return;
    }

    setLibraries({ status: "LOADING" });

    const query = new URLSearchParams({
      prefecture: confirmPrefecture(),
      city: confirmCity(),
      page_size: "20",
      page: page().toString(),
    });

    const res = await fetch(
      "https://tpu-libres-api-v2.azurewebsites.net/library?" + query
    );

    const body = await res.json();

    setLibraries({ ...body, status: "OK" });
  });

  // view
  return (
    <div class="mx-auto w-[1024px] p-5">
      <SwitcherComponent
        isbn={sParams.isbn}
        backend={sParams.backend}
        select={0}
      />

      <div class="mb-3 text-center">
        <input
          type="text"
          value={prefecture()}
          onInput={(e) => setPrefecture(e.currentTarget.value)}
          onChange={(e) => setConfirmPrefecture(e.currentTarget.value)}
          placeholder="富山県"
          class="mr-3 rounded border border-solid border-slate-400 p-2"
        />
        <input
          type="text"
          value={city()}
          onInput={(e) => setCity(e.currentTarget.value)}
          onChange={(e) => setConfirmCity(e.currentTarget.value)}
          placeholder="射水市"
          class="rounded border border-solid border-slate-400 p-2"
        />
      </div>

      <Switch>
        <Match when={libraryies().status == "EMPTY"}>
          <div class="text-center text-slate-400">
            都道府県とを市町村区を入力してください
          </div>
        </Match>
        <Match when={libraryies().status == "LOADING"}>
          <div class="text-center text-slate-400">取得中</div>
        </Match>
        <Match when={libraryies().status == "OK"}>
          <div class="mb-3 text-center">
            該当数: {libraryies().total_count}, ページ: {page() + 1} /{" "}
            {Math.ceil(libraryies().total_count / 20)}
          </div>

          <div class="flex flex-col gap-3">
            <For each={libraryies().items}>
              {(item) => (
                <Link
                  href={createReserveLink(
                    sParams.isbn,
                    sParams.backend,
                    item.name
                  )}
                >
                  <div class="rounded border border-solid border-slate-400 p-3">
                    <div class="font-bold">{item.name}</div>
                  </div>
                </Link>
              )}
            </For>

            <div class="text-center">
              <button onClick={() => setPage(Math.max(0, page() - 1))}>
                前
              </button>
              <span class="mx-3">
                {page() + 1} / {Math.ceil(libraryies().total_count / 20)}
              </span>
              <button
                onClick={() =>
                  setPage(
                    Math.min(
                      page() + 1,
                      Math.ceil(libraryies().total_count / 20) - 1
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

export default LibraryList;
