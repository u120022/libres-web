import { Link } from "@solidjs/router";
import { Component } from "solid-js";

const Header: Component = () => {
  return (
    <div class="sticky top-0 z-20 mb-6 bg-slate-100 p-5 text-center">
      <Link href="/book" class="mr-5 text-lg font-bold">
        本の検索
      </Link>
      <Link href="/reserved" class="mr-5 text-lg font-bold">
        予約履歴
      </Link>
      <Link href="/user" class="mr-5 text-lg font-bold">
        個人情報
      </Link>
    </div>
  );
};

export default Header;
