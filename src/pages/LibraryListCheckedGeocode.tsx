import { Link, useSearchParams } from "@solidjs/router";
import { createEffect, createSignal, For, Match, Switch } from "solid-js";
import { getDistance } from "geolib";
import {
  asyncGeocodePosition,
  createReserveLink,
  HolderStateComponent,
  SwitcherComponent,
} from "./Utils";

const LibraryListCheckedGeocode = () => {
  // hook
  const [sParams] = useSearchParams();
  const [geocode, setGeocode] = createSignal({ status: "EMPTY" });
  const [holders, setHolders] = createSignal({ status: "EMPTY" });

  // fetch holders
  createEffect(async () => {
    const geocodePosition = await asyncGeocodePosition();

    setGeocode({
      latitude: geocodePosition.coords.latitude,
      longitude: geocodePosition.coords.longitude,
      status: "OK",
    });

    setHolders({ status: "LOADING" });

    // fetch nearly library

    const query = new URLSearchParams({
      latitude: geocode().latitude.toString(),
      longitude: geocode().longitude.toString(),
      limit: "6",
    });

    const res = await fetch(
      "https://tpu-libres-api-v2.azurewebsites.net/library_geocode?" + query
    );

    const body = await res.json();

    const library_names = body.items.map((item) => item.name).join(",");

    // fetch holders

    const _query = new URLSearchParams({
      isbn: sParams.isbn,
      library_names: library_names,
    });

    const _res = await fetch(
      "https://tpu-libres-api-v2.azurewebsites.net/holder?" + _query
    );

    const _body = await _res.json();

    // merge geocode
    _body.items = _body.items.map((_item) => ({
      ..._item,
      geocode: body.items.find((item) => _item.library_name == item.name)
        .geocode,
    }));

    setHolders({ ..._body, status: "OK" });
  });

  // view
  return (
    <div class="mx-auto w-[1024px] p-5">
      <SwitcherComponent
        isbn={sParams.isbn}
        backend={sParams.backend}
        select={2}
      />

      <div class="flex flex-col gap-3">
        <Switch>
          <Match when={holders().status == "EMPTY"}>
            <div class="text-center text-slate-400">準備中</div>
          </Match>
          <Match when={holders().status == "LOADING"}>
            <div class="text-center text-slate-400">取得中</div>
          </Match>
          <Match when={holders().status == "OK"}>
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
                    <div>
                      {getDistance(geocode(), {
                        latitude: item.geocode[0],
                        longitude: item.geocode[1],
                      }) / 1000}
                      km
                    </div>
                    <HolderStateComponent state={item.state} />
                    <div class="text-slate-400">CALIL</div>
                  </div>
                </Link>
              )}
            </For>
          </Match>
        </Switch>
      </div>
    </div>
  );
};

export default LibraryListCheckedGeocode;
