import React from "react";
import { Box, InputAdornment, TextField } from "@mui/material";
import FILTERSTYLE from "styles/components/features/filterstyle.module.css";
import SEARCHICON from "assets/images/svg/search.svg";

const Search = ({
  setSearch,
  searchTicket,
  searchReference,
  searchCategory,
  searchVoidReason,
  searchRejectReason,
  searchClerkName,
  searchResolveReason,
}) => {
  return (
    <div className={FILTERSTYLE["search-container"]}>
      <div className={FILTERSTYLE["search-container__wrapper"]}>
        <Box sx={{ display: "flex", alignItems: "flex-end" }}>
          <TextField
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <img
                    src={SEARCHICON}
                    alt=""
                    className={FILTERSTYLE["search-icon"]}
                  />
                </InputAdornment>
              ),
            }}
            type="text"
            className={FILTERSTYLE["search-input"]}
            label={
              searchTicket
                ? "FIND TICKET NO."
                : searchReference
                ? "FIND REFERENCE NO."
                : searchClerkName
                ? "FIND CLERK BY EMAIL"
                : searchCategory
                ? "FIND CATEGORY NAME"
                : searchVoidReason
                ? "FIND VOID REASON"
                : searchRejectReason
                ? "FIND REJECT REASON"
                : searchResolveReason
                ? "FIND RESOLUTION NAME"
                : null
            }
            onChange={({ currentTarget: input }) => setSearch(input.value)}
          />
        </Box>
      </div>
    </div>
  );
};

export default Search;
