import React, { useState, useEffect } from "react";
import TICKETSTATSSTYLE from "styles/components/admin/user-admin/tickets/ticketstatistics.module.css";
import { instance } from "api/axios";
import FilterPriority from "components/features/FilterPriority";
import FilterCategory from "components/features/FilterCategory";
import FilterDate from "components/features/FilterDate";
import Search from "components/features/Search";
import TableTicketData from "components/common/TableTicketData";
import Pagination from "components/features/Pagination";
import PieChart from "components/charts/PieChart";
import DoughnutChart2 from "components/charts/DoughnutChart2";
import moment from "moment";

const Rejectedtickets = () => {
  const [tickets, setTickets] = useState([]);
  const [rejectedtickets, setRejectedtickets] = useState([]);
  const [loggedUser, setLoggedUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );
  const [ticketDataLoading, setTicketDataLoading] = useState(false);
  //PAGINATION
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [total, setTotal] = useState("");
  //SEARCH TICKET NO.
  const [search, setSearch] = useState("");
  //FILTERING
  const [priority, setPriority] = useState({ priority: " " });
  const [category, setCategory] = useState({ category: " " });
  const [dateFrom, setDateFrom] = useState({
    dateFrom: moment(0).format("YYYY-MM-DD"),
  });
  const [dateTo, setDateTo] = useState({
    dateTo: moment().format("YYYY-MM-DD"),
  });

  useEffect(() => {
    const getOpentickets = async () => {
      setTicketDataLoading(true);
      const formattedDateFrom = moment(dateFrom.dateFrom).format("YYYY-MM-DD");
      const formattedDateTo = moment(dateTo.dateTo).format("YYYY-MM-DD");
      await instance
        .get(
          `/tickets/rejectedtickets?priority=${priority.priority}&page=${page}&limit=${limit}&search=${search}&ticketCategory=${category.category}&dateFrom=${formattedDateFrom}&dateTo=${formattedDateTo}`
        )
        .then((res) => {
          setTickets(res.data.rejectedTickets);
          setLimit(res.data.limit);
          setTotal(res.data.total);
          setRejectedtickets(res.data.filteredTickets);
        })
        .catch((error) => {
          if (error.response.status === 401) {
            window.location.href = "/login";
          }
        });
      setTicketDataLoading(false);
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
      if (priority.priority) {
        query.push(`priority=${priority.priority}`);
      }
      if (category.category) {
        query.push(`ticketCategory=${category.category}`);
      }
      if (dateFrom.dateFrom) {
        query.push(`dateFrom=${dateFrom.dateFrom}`);
      }
      if (dateTo.dateTo) {
        query.push(`dateTo=${dateTo.dateTo}`);
      }

      window.history.pushState({}, "", `?${query.join("&")}`);
    };

    getOpentickets();
    pushQueryToUrl();
  }, [page, limit, search, priority, category, dateFrom, dateTo]);

  return (
    <>
      <div className={TICKETSTATSSTYLE["dashboard-container"]}>
        <div className={TICKETSTATSSTYLE["dashboard-container__wrapper"]}>
          <div className={TICKETSTATSSTYLE["content-ticketreport"]}>
            <div className={TICKETSTATSSTYLE["ticketcontainer-filtertickets"]}>
              <div className={TICKETSTATSSTYLE["filtertickets-row"]}>
                <div className={TICKETSTATSSTYLE["filtertickets-firstcolumn"]}>
                  <FilterPriority
                    priority={priority}
                    setPriority={(priority) => setPriority(priority)}
                  />
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

                <div className={TICKETSTATSSTYLE["filtertickets-secondcolumn"]}>
                  <Search
                    searchTicket={true}
                    setSearch={(search) => setSearch(search)}
                  />
                </div>
              </div>
            </div>

            <div className={TICKETSTATSSTYLE["content-ticketreport__wrapper"]}>
              <div
                className={TICKETSTATSSTYLE["content-ticketreport__container"]}
              >
                <TableTicketData
                  header={"REJECTED TICKET REPORT"}
                  dataTickets={rejectedtickets}
                  ticketLoading={ticketDataLoading}
                  setDataTickets={setRejectedtickets}
                  role={loggedUser[0].role}
                  showStatus={false}
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

            <div className={TICKETSTATSSTYLE["ticketreport-graphs"]}>
              <h4 className={TICKETSTATSSTYLE["ticketreport-header"]}>
                GRAPHS
              </h4>

              <div
                className={TICKETSTATSSTYLE["report-chart__priorityandstatus"]}
              >
                <DoughnutChart2
                  header={"REJECTED TICKETS BASED ON UNITS"}
                  data={tickets}
                />
                <PieChart
                  header={"REJECTED TICKETS BASED ON CATEGORY"}
                  data={tickets}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Rejectedtickets;
