import { Link, useParams, useSearchParams } from "@solidjs/router";
import { Component, createEffect, createSignal, Match, Switch } from "solid-js";

const Book: Component = () => {
  // hook
  const params = useParams();
  const [sParams] = useSearchParams();
  const [book, setBook] = createSignal({ status: "EMPTY" });

  // fetch book
  createEffect(async () => {
    setBook({ status: "LOADING" });

    const res = await fetch(
      "https://tpu-libres-api-v2.azurewebsites.net/book/" +
        sParams.backend +
        "/" +
        params.isbn
    );

    const body = await res.json();

    setBook({ ...body, status: "OK" });
  });

  // view
  return (
    <div class="mx-auto w-[1024px] p-5">
      <Switch>
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
        <Match when={book().status == "LOADING"}>
          <div>取得中</div>
        </Match>
      </Switch>
    </div>
  );
};

export default Book;
