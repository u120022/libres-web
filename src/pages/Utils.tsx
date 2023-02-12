import { Link } from "@solidjs/router";
import { Component, Match, Switch } from "solid-js";

export const asyncGeocodePosition = () =>
  new Promise<GeolocationPosition>((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(resolve, reject)
  );

export const createReserveLink = (
  isbn: string,
  backend: string,
  library_name: string
) => {
  const query = new URLSearchParams({
    isbn: isbn,
    backend: backend,
    library_name: library_name,
  });

  return "/reserve?" + query;
};

export const HolderStateComponent: Component<{ state: string }> = (props) => {
  return (
    <Switch>
      <Match when={props.state == "Nothing"}>
        <div class="text-slate-400">蔵書なし</div>
      </Match>
      <Match when={props.state == "Exists"}>
        <div class="text-green-600">蔵書あり</div>
      </Match>
      <Match when={props.state == "Reservable"}>
        <div class="text-green-600">予約可能</div>
      </Match>
      <Match when={props.state == "Reserved"}>
        <div class="text-slate-400">予約済み</div>
      </Match>
      <Match when={props.state == "Borrowed"}>
        <div class="text-slate-400">貸出済み</div>
      </Match>
      <Match when={props.state == "Inplace"}>
        <div class="text-slate-400">持ち出し不可</div>
      </Match>
    </Switch>
  );
};

export const ReservedStateComponent: Component<{ state: string }> = (props) => {
  return (
    <Switch>
      <Match when={props.state == "Staging"}>
        <div class="text-slate-400">予約手続き中</div>
      </Match>
    </Switch>
  );
};

export const SwitcherComponent: Component<{
  isbn: string;
  backend: string;
  select: number;
}> = (props) => {
  const query = new URLSearchParams({
    isbn: props.isbn,
    backend: props.backend,
  });

  // view
  return (
    <div class="mb-5 text-center">
      <Link
        href={"/library?" + query}
        class={
          "mr-3 rounded border border-solid border-slate-400 p-2" +
          (props.select == 0 ? " bg-slate-200" : "")
        }
      >
        図書館一覧
      </Link>
      <Link
        href={"/library_checked?" + query}
        class={
          "mr-3 rounded border border-solid border-slate-400 p-2" +
          (props.select == 1 ? " bg-slate-200" : "")
        }
      >
        確認済み
      </Link>
      <Link
        href={"/library_checked_geocode?" + query}
        class={
          "rounded border border-solid border-slate-400 p-2" +
          (props.select == 2 ? " bg-slate-200" : "")
        }
      >
        確認済み(位置情報)
      </Link>
    </div>
  );
};
