import React from "react";
import PAGINATIONSTYLE from "../../styles/components/features/pagination.module.css";
import Textfield from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";

const Pagination = ({ page, total, limit, setPage, setLimit }) => {
  const totalPages = Math.ceil(total / limit);

  const setLimitEntries = (e) => {
    setLimit(e.target.value);
    setPage(1);
  };

  //next button
  const next = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  //previous button
  const previous = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  //show display
  const showDisplay = () => {
    if (total === 0) {
      return "Showing 0 to 0 of 0 entries";
    } else if (page === totalPages) {
      return `Showing ${
        limit * (page - 1) + 1
      } to ${total} of ${total} entries`;
    } else {
      return `Showing ${limit * (page - 1) + 1} to ${
        limit * page
      } of ${total} entries`;
    }
  };

  const entriesOption = [
    {
      id: 1,
      name: "DEFAULT",
      value: "8",
    },
    {
      id: 2,
      name: "20",
      value: "20",
    },
    {
      id: 3,
      name: "30",
      value: "30",
    },
    {
      id: 4,
      name: "50",
      value: "50",
    },
  ];

  return (
    <div className={PAGINATIONSTYLE["pagination-container"]}>
      <div className={PAGINATIONSTYLE["pagination-container__wrapper"]}>
        {total > 0 && (
          <>
            <span className={PAGINATIONSTYLE["show-entries"]}>
              {" "}
              Show entries by:{" "}
            </span>
            <Textfield
              inputProps={{
                sx: {
                  color: "#000",
                  padding: "0 15px",
                  fontSize: "13px",
                },
              }}
              select
              className={PAGINATIONSTYLE["pagination-limitselect"]}
              onChange={(e) => setLimitEntries(e)}
              value={limit}
            >
              {entriesOption.map((option, index) => (
                <MenuItem
                  key={index}
                  id={index}
                  value={option.value}
                  style={{ fontSize: "14px" }}
                >
                  {option.name}
                </MenuItem>
              ))}
            </Textfield>

            <button
              className={PAGINATIONSTYLE["pagination-container__prev-button"]}
              onClick={previous}
            >
              PREV
            </button>
            <button
              className={PAGINATIONSTYLE["pagination-container__next-button"]}
              onClick={next}
            >
              NEXT
            </button>

            <span className={PAGINATIONSTYLE["show-entries"]}>
              {showDisplay()}
            </span>
          </>
        )}
      </div>
    </div>
  );
};

export default Pagination;
