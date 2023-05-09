import React from "react";
import FILTERSTYLE from "../../styles/components/features/filterstyle.module.css";

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

  const onSelectChange = ({ currentTarget: input }) => {
    setPriority({ priority: input.value });
  };

  return (
    <>
      <div className={FILTERSTYLE["filter-container"]}>
        <div className={FILTERSTYLE["filter-container__wrapper"]}>
          <span> Priority: </span>
          <select
            className={FILTERSTYLE["filter-select"]}
            onChange={onSelectChange}
          >
            <option value="All">Show All</option>
            {filteroptions.map((option) => (
              <option key={option.id} value={option.name}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
};

export default FilterPriority;
