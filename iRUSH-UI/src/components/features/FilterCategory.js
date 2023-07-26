import React, { useState, useEffect } from "react";
import { Autocomplete, TextField } from "@mui/material";
import FILTERSTYLE from "styles/components/features/filterstyle.module.css";
import { instance } from "api/axios";

const FilterCategory = ({ category, setCategory }) => {
  const [categories, setCategories] = useState([]);
  const [categoryValue, setCategoryValue] = useState({ category: " " });

  const onSelectChange = (event, value) => {
    if (value) {
      let categoryValue = value.categoryName;
      setCategoryValue({ categoryName: categoryValue });
      setCategory({ category: categoryValue });
    } else {
      setCategoryValue({ category: " " });
      setCategory({ category: " " });
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await instance.get("/settings/fetchcategory");
        setCategories(response.data);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          window.location.href = "/login";
        }
      }
    };

    fetchCategories();
  }, []);

  return (
    <>
      <div className={FILTERSTYLE["categoryfilter-container"]}>
        <div className={FILTERSTYLE["filter-container__wrapper"]}>
          <Autocomplete
            size="small"
            onChange={onSelectChange}
            options={categories}
            getOptionLabel={(option) => option.categoryName}
            renderInput={(params) => (
              <TextField
                fullWidth
                {...params}
                label="FILTER BASED ON CATEGORY"
              />
            )}
          />
        </div>
      </div>
    </>
  );
};

export default FilterCategory;
