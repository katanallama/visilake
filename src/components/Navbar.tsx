import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

import Bar from "./Bar";
import Logo from "../components/Logo";
import SearchBar from "./ListPage/SearchBar";

export default function Navbar() {
  const router = useRouter();
  const setGlobalFilter = () => {};
  const isCurrentPage = (path: string) => router.pathname === path;

  return (
    <nav className="relative z-30 col-start-2 col-end-9 flex items-center justify-between pl-5">
      <Bar
        angle={-22.4}
        width={"100%"}
        height="100%"
        style={{
          right: `10px`,
          position: "absolute",
        }}
      />

      {!isCurrentPage("/ListPage") ? (
        <button
          className="fixed z-40 ml-5 min-w-[10vw] rounded-md bg-transparent px-4 py-2 text-white hover:bg-blue hover:shadow-lg"
          onClick={() => {
            void router.push("/ListPage");
          }}
        >
          <span className="">
            <FontAwesomeIcon icon={faMagnifyingGlass} className="pr-2" />
            View Jobs
          </span>
        </button>
      ) : (
        <div className="flex items-center">
          <SearchBar setGlobalFilter={setGlobalFilter} />
        </div>
      )}

      <Logo style={{ width: "285px", height: "100px", marginRight: "0px" }} />
    </nav>
  );
}
