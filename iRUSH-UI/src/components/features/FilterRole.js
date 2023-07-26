import React from "react";
import { Autocomplete, TextField } from "@mui/material";
import FILTERSTYLE from "styles/components/features/filterstyle.module.css";

const FilterRole = ({ setRole }) => {
  const filteroptions = [
    {
      id: 1,
      name: "USER_SUPERADMIN",
    },
    {
      id: 2,
      name: "USER_ADMIN",
    },
    {
      id: 3,
      name: "CLERK_HELPDESKSUPPORT",
    },
    {
      id: 4,
      name: "CLERK_ITSUPPORT",
    },
  ];

  const onSelectChange = (event, value) => {
    if (value) {
      setRole({ role: value.name });
    } else {
      setRole({ role: " " });
    }
  };

  return (
    <>
      <div className={FILTERSTYLE["filter-container"]}>
        <div className={FILTERSTYLE["filter-container__wrapper"]}>
          <Autocomplete
            size="small"
            onChange={onSelectChange}
            options={filteroptions}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => option.name === value.name}
            renderInput={(params) => (
              <TextField fullWidth {...params} label="FILTER BASED ON ROLE" />
            )}
          />
        </div>
      </div>
    </>
  );
};

export default FilterRole;
