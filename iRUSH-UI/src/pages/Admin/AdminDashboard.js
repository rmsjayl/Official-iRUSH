import React, { useState, useEffect } from "react";
import ADMINDASHBOARDSTYLE from "styles/pages/admin/user-admin/admindashboard.module.css";
import UsersReport from "components/admin/user-admin/UsersReport";
import { instance } from "api/axios";
import TableTicketData from "components/common/TableTicketData";
import Pagination from "components/features/Pagination";
import TicketStatus from "components/admin/user-admin/TicketStatus";
import FilterPriority from "components/features/FilterPriority";
import FilterCategory from "components/features/FilterCategory";
import FilterDate from "components/features/FilterDate";
import Search from "components/features/Search";
import BarChart from "components/charts/BarChart";
import LineChart from "components/charts/LineChart";
import DoughnutChart from "components/charts/DoughnutChart";
import PieChart from "components/charts/PieChart";
import DoughnutChart2 from "components/charts/DoughnutChart2";
import moment from "moment";

function AdminDashboard() {
  const [loggedUser, setLoggedUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );
  const [usersReport, setUsersReport] = useState([]);
  const [usersReportLoading, setUsersReportLoading] = useState(true);
  const [ticketDataLoading, setTicketDataLoading] = useState(false);

  //get the tickets
  const [dataTickets, setDataTickets] = useState([]);
  const [tickets, setTickets] = useState([]);
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
    setLoggedUser(JSON.parse(localStorage.getItem("user")) || null);

    const fetchiRUSHUsers = async () => {
      setUsersReportLoading(true);
      await instance
        .get(`/settings/fetchusers`)
        .then(
          (response) => setUsersReport(response.data),
          setUsersReportLoading(false)
        )
        .catch((err) => {
          if (err.response.status === 401) {
            window.location.href = "/login";
          }
        });
    };

    // FETCH ALL THE TICKETS WITHOUT FILTER
    const getTickets = async () => {
      await instance.get(`/tickets/tickets`).then((response) => {
        setTickets(response.data.ticket);
      });
    };

    const fetchTickets = async () => {
      setTicketDataLoading(true);

      const formattedDateFrom = moment(dateFrom.dateFrom).format("YYYY-MM-DD");
      const formattedDateTo = moment(dateTo.dateTo).format("YYYY-MM-DD");

      await instance
        .get(
          `/tickets/tickets?priority=${priority.priority}&page=${page}&limit=${limit}&search=${search}&ticketCategory=${category.category}&dateFrom=${formattedDateFrom}&dateTo=${formattedDateTo}`
        )
        .then((response) => {
          setLimit(response.data.limit);
          setTotal(response.data.total);
          setDataTickets(response.data.filteredTickets);
        })
        .catch((err) => {
          if (err.response.status === 401) {
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

      // clear the query if the user clicks a link
    };

    getTickets();
    pushQueryToUrl();
    fetchiRUSHUsers();
    fetchTickets();
  }, [page, limit, search, priority, category, dateFrom, dateTo]);

  return (
    <>
      <div className={ADMINDASHBOARDSTYLE["dashboard-container"]}>
        <div className={ADMINDASHBOARDSTYLE["dashboard-container__wrapper"]}>
          <div className={ADMINDASHBOARDSTYLE["content-servicereport"]}>
            <h4 className={ADMINDASHBOARDSTYLE["servicereport-header"]}>
              Service Performance Report
            </h4>
            <UsersReport loading={usersReportLoading} users={usersReport} />
          </div>
          <div className={ADMINDASHBOARDSTYLE["content-ticketreport"]}>
            <h4 className={ADMINDASHBOARDSTYLE["ticketreport-header"]}>
              OVERALL TICKET PERFORMANCE REPORT
            </h4>

            <div
              className={ADMINDASHBOARDSTYLE["ticketcontainer-ticketstatus"]}
            >
              <TicketStatus checkRole={loggedUser[0].role} />
            </div>

            <div
              className={ADMINDASHBOARDSTYLE["ticketcontainer-filtertickets"]}
            >
              <div className={ADMINDASHBOARDSTYLE["filtertickets-row"]}>
                <div
                  className={ADMINDASHBOARDSTYLE["filtertickets-firstcolumn"]}
                >
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

                <div
                  className={ADMINDASHBOARDSTYLE["filtertickets-secondcolumn"]}
                >
                  <Search
                    searchTicket={true}
                    setSearch={(search) => setSearch(search)}
                  />
                </div>
              </div>
            </div>

            <div
              className={ADMINDASHBOARDSTYLE["content-ticketreport__wrapper"]}
            >
              <div
                className={
                  ADMINDASHBOARDSTYLE["content-ticketreport__container"]
                }
              >
                <TableTicketData
                  header={"OVERALL TICKET REPORT"}
                  dataTickets={dataTickets}
                  ticketLoading={ticketDataLoading}
                  setDataTickets={setDataTickets}
                  role={loggedUser[0].role}
                  showStatus={true}
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

            <div className={ADMINDASHBOARDSTYLE["ticketreport-graphs"]}>
              <h4 className={ADMINDASHBOARDSTYLE["ticketreport-header"]}>
                GRAPHS
              </h4>
              <div
                className={ADMINDASHBOARDSTYLE["report-chart__ticketcreated"]}
              >
                <LineChart header={"TICKETS CREATED PER DAY"} data={tickets} />
              </div>
              <div className={ADMINDASHBOARDSTYLE["report-chart__SLA"]}>
                <BarChart
                  header={"RESOLVED TICKETS PER USER"}
                  data={usersReport}
                />
              </div>
              <div
                className={
                  ADMINDASHBOARDSTYLE["report-chart__priorityandstatus"]
                }
              >
                <DoughnutChart
                  header={"TICKETS CREATED ACCORDING TO STATUS"}
                  data={tickets}
                />
                <PieChart
                  header={"TICKETS CREATED ACCORDING TO CATEGORY"}
                  data={tickets}
                />
                <DoughnutChart2
                  header={"TICKETS CREATED ACCORDING TO UNITS"}
                  data={tickets}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminDashboard;
