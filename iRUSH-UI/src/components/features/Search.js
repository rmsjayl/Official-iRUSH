import React from "react";
import FILTERSTYLE from "../../styles/components/features/filterstyle.module.css";
import SEARCHICON from "../../assets/images/svg/search.svg";

const Search = ({ setSearch, searchTicket }) => {
  return (
    <div className={FILTERSTYLE["search-container"]}>
      <div className={FILTERSTYLE["search-container__wrapper"]}>
        <img src={SEARCHICON} alt="" className={FILTERSTYLE["search-icon"]} />

        <input
          type="text"
          className={FILTERSTYLE["search-input"]}
          placeholder={
            searchTicket ? "Search Ticket No." : "Search Reference No."
          }
          onChange={({ currentTarget: input }) => setSearch(input.value)}
        />
      </div>
    </div>
  );
};

export default Search;
