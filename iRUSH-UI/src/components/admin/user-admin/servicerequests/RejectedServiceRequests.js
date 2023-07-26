import React, { useState, useEffect } from "react";
import SERVICEREQUESTSSTYLE from "styles/components/admin/user-admin/servicerequests/servicerequests.module.css";
import { instance } from "api/axios";
import FilterCategory from "components/features/FilterCategory";
import FilterDate from "components/features/FilterDate";
import Search from "components/features/Search";
import TableServiceRequestData from "components/common/TableServiceRequestData";
import Pagination from "components/features/Pagination";
import PieChart from "components/charts/PieChart";
import DoughnutChart2 from "components/charts/DoughnutChart2";
import moment from "moment";
import PieChart3 from "components/charts/PieChart3";

const RejectedServiceRequests = () => {
  const [rejectedServiceRequests, setRejectedServiceRequests] = useState([]);
  const [newRejectedServiceRequests, setNewRejectedServiceRequests] = useState(
    []
  );
  const [loggedUser, setLoggedUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );
  const [serviceRequestsLoading, setServiceRequestsLoading] = useState(false);
  //PAGINATION
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [total, setTotal] = useState("");
  //SEARCH TICKET NO.
  const [search, setSearch] = useState("");
  //FILTERING
  const [category, setCategory] = useState({ category: " " });
  const [dateFrom, setDateFrom] = useState({
    dateFrom: moment(0).format("YYYY-MM-DD"),
  });
  const [dateTo, setDateTo] = useState({
    dateTo: moment().format("YYYY-MM-DD"),
  });

  useEffect(() => {
    const getServiceRequests = async () => {
      setServiceRequestsLoading(true);
      const formattedDateFrom = moment(dateFrom.dateFrom).format("YYYY-MM-DD");
      const formattedDateTo = moment(dateTo.dateTo).format("YYYY-MM-DD");
      await instance
        .get(
          `/tickets/rejectedservicerequests?page=${page}&limit=${limit}&search=${search}&serviceCategory=${category.category}&dateFrom=${formattedDateFrom}&dateTo=${formattedDateTo}`
        )
        .then((res) => {
          setRejectedServiceRequests(res.data.rejectedServiceRequest);
          setLimit(res.data.limit);
          setTotal(res.data.total);
          setNewRejectedServiceRequests(
            res.data.filteredRejectedServiceRequests
          );
        })
        .catch((error) => {
          if (error.response.status === 401) {
            window.location.href = "/login";
          }
        });
      setServiceRequestsLoading(false);
    };

    const pushQueryToUrl = () => {
      const query = [];

      if (page) {
        query.push(`page=${page}`);
      }
      if (limit) {
        query.push(`limit=${limit}`);
      }
      if (search) {
        query.push(`search=${search}`);
      }
      if (category.category) {
        query.push(`serviceCategory=${category.category}`);
      }
      if (dateFrom.dateFrom) {
        query.push(`dateFrom=${dateFrom.dateFrom}`);
      }
      if (dateTo.dateTo) {
        query.push(`dateTo=${dateTo.dateTo}`);
      }

      window.history.pushState({}, "", `?${query.join("&")}`);
    };

    getServiceRequests();
    pushQueryToUrl();
  }, [page, limit, search, category, dateFrom, dateTo]);

  return (
    <>
      <div className={SERVICEREQUESTSSTYLE["dashboard-container"]}>
        <div className={SERVICEREQUESTSSTYLE["dashboard-container__wrapper"]}>
          <div className={SERVICEREQUESTSSTYLE["content-servicerequestreport"]}>
            <div
              className={SERVICEREQUESTSSTYLE["ticketcontainer-filtertickets"]}
            >
              <div className={SERVICEREQUESTSSTYLE["filtertickets-row"]}>
                <div
                  className={SERVICEREQUESTSSTYLE["filtertickets-firstcolumn"]}
                >
                  <FilterCategory
                    category={category}
                    setCategory={(category) => setCategory(category)}
                  />
                  <div className="filtertickets-datefilter">
                    <FilterDate
                      dateFrom={dateFrom}
                      setDateFrom={(dateFrom) => setDateFrom(dateFrom)}
                      dateTo={dateTo}
                      setDateTo={(dateTo) => setDateTo(dateTo)}
                    />
                  </div>
                </div>

                <div
                  className={SERVICEREQUESTSSTYLE["filtertickets-secondcolumn"]}
                >
                  <Search
                    searchReference
                    setSearch={(search) => setSearch(search)}
                  />
                </div>
              </div>
            </div>

            <div
              className={
                SERVICEREQUESTSSTYLE["content-servicerequestreport__wrapper"]
              }
            >
              <div
                className={
                  SERVICEREQUESTSSTYLE[
                    "content-servicerequestreport__container"
                  ]
                }
              >
                <TableServiceRequestData
                  header={"REJECTED SERVICE REQUESTS"}
                  rejectedServiceRequest
                  serviceRequestsLoading={serviceRequestsLoading}
                  dataServiceRequests={newRejectedServiceRequests}
                  setDataServiceRequests={setNewRejectedServiceRequests}
                  role={loggedUser[0].role}
                />
              </div>

              <Pagination
                page={page}
                limit={limit}
                total={total}
                setPage={(page) => setPage(page)}
                setLimit={(limit) => setLimit(limit)}
              />
            </div>

            <div
              className={SERVICEREQUESTSSTYLE["servicerequestreport-graphs"]}
            >
              <h4
                className={SERVICEREQUESTSSTYLE["servicerequestreport-header"]}
              >
                GRAPHS
              </h4>

              <div
                className={
                  SERVICEREQUESTSSTYLE["report-chart__priorityandstatus"]
                }
              >
                <DoughnutChart2
                  header={"REJECTED SERVICE REQUESTS BASED ON UNIT"}
                  data={rejectedServiceRequests}
                />
                <PieChart3
                  header={"REJECTED SERVICE REQUESTS BASED ON CATEGORY"}
                  data={rejectedServiceRequests}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RejectedServiceRequests;
