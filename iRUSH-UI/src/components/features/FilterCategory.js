import React, { useState, useEffect } from "react";
import FILTERSTYLE from "../../styles/components/features/filterstyle.module.css";
import { instance } from "../../api/axios";

const FilterCategory = ({ setCategory }) => {
  const [categories, setCategories] = useState([]);

  const onSelectChange = ({ currentTarget: input }) => {
    setCategory({ category: input.value });
  };

  useEffect(() => {
    const fetchCategories = async () => {
      await instance
        .get("/settings/fetchcategory")
        .then((response) => {
          setCategories(response.data);
        })
        .catch((error) => console.log(error));
    };

    fetchCategories();
  }, []);

  return (
    <>
      <div className={FILTERSTYLE["categoryfilter-container"]}>
        <div className={FILTERSTYLE["filter-container__wrapper"]}>
          <span> Category: </span>
          <select
            className={FILTERSTYLE["filter-select"]}
            onChange={onSelectChange}
          >
            <option value="All">Show All</option>
            {categories.map((category) => (
              <option key={category._id} value={category.categoryName}>
                {category.categoryName}
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
};

export default FilterCategory;
