import React from "react";
import { Autocomplete, TextField } from "@mui/material";
import FILTERSTYLE from "styles/components/features/filterstyle.module.css";

const FilterPriority = ({ priority, setPriority }) => {
  const filteroptions = [
    {
      id: 1,
      name: "High",
    },
    {
      id: 2,
      name: "Mid",
    },
    {
      id: 3,
      name: "Low",
    },
  ];

  const onSelectChange = (event, value) => {
    if (value) {
      setPriority({ priority: value.name });
    } else {
      setPriority({ priority: " " });
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
              <TextField
                fullWidth
                {...params}
                label="FILTER BASED ON PRIORITY"
              />
            )}
          />
        </div>
      </div>
    </>
  );
};

export default FilterPriority;
