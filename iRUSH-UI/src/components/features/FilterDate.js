import React from "react";
import FILTERSTYLE from "styles/components/features/filterstyle.module.css";
import moment from "moment";

const FilterDate = ({ setDateFrom, setDateTo }) => {
  const handleChangeDateFrom = (e) => {
    const formattedDate = moment(e.target.value).format("YYYY-MM-DD");
    setDateFrom({ dateFrom: formattedDate });

    if (e.target.value === "") {
      setDateFrom({ dateFrom: new Date(0) });
    }
  };

  const handleChangeDateTo = (e) => {
    const formattedDate = moment(e.target.value).format("YYYY-MM-DD");
    setDateTo({ dateTo: formattedDate });

    if (e.target.value === "") {
      setDateTo({ dateTo: new Date() });
    }
  };

  return (
    <>
      <div className={FILTERSTYLE["filter-container"]}>
        <div className={FILTERSTYLE["filter-container__wrapper"]}>
          <div className={FILTERSTYLE["form-control__date"]}>
            <span> From: </span>
            <input
              type="date"
              className={FILTERSTYLE["formdate-input"]}
              onChange={handleChangeDateFrom}
              max={moment().format("YYYY-MM-DD")}
            />
            <span> To: </span>
            <input
              type="date"
              className={FILTERSTYLE["formdate-input"]}
              onChange={handleChangeDateTo}
              max={moment().format("YYYY-MM-DD")}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default FilterDate;
