import React, { useState, useEffect } from "react";
import ADMINDASHBOARDSTYLE from "styles/pages/admin/user-admin/admindashboard.module.css";
import { instance } from "api/axios";
import FilterCategory from "components/features/FilterCategory";
import FilterDate from "components/features/FilterDate";
import FilterPriority from "components/features/FilterPriority";
import Search from "components/features/Search";
import moment from "moment";
import TableTicketData from "components/common/TableTicketData";
import Pagination from "components/features/Pagination";
import TicketStatus from "components/admin/user-admin/TicketStatus";
import AssignedTickets from "components/common/AssignedTickets";
import LineChart from "components/charts/LineChart";
import DoughnutChart from "components/charts/DoughnutChart";
import PieChart from "components/charts/PieChart";
import DoughnutChart2 from "components/charts/DoughnutChart2";

function dashboard() {
  const [loggedUser, setLoggedUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );
  const [assignedTicketData, setAssignedTicketData] = useState([]);
  const [filteredTicketsData, setFilteredTicketData] = useState([]);
  const [openTickets, setOpenTickets] = useState([]);
  const [resolvedTickets, setResolvedTickets] = useState([]);
  const [rejectedTickets, setRejectedTickets] = useState([]);
  const [reopenedTickets, setReopenTickets] = useState([]);
  const [overdueTickets, setOverdueTickets] = useState([]);
  const [voidedTickets, setVoidedTickets] = useState([]);
  const [loading, setLoading] = useState(false);

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
    const itsuppAssignedTicketData = async () => {
      setLoading(true);
      const formattedDateFrom = moment(dateFrom.dateFrom).format("YYYY-MM-DD");
      const formattedDateTo = moment(dateTo.dateTo).format("YYYY-MM-DD");
      await instance
        .get(
          `/tickets/itsupport/assignedtickets?priority=${priority.priority}&page=${page}&limit=${limit}&search=${search}&ticketCategory=${category.category}&dateFrom=${formattedDateFrom}&dateTo=${formattedDateTo}`
        )
        .then((response) => {
          setFilteredTicketData(response.data.filteredTickets);
          setAssignedTicketData(response.data.assignedTicket);
          setResolvedTickets(response.data.assignedResolvedTicket);
          setOpenTickets(response.data.assignedOpenTicket);
          setReopenTickets(response.data.assignedReopenedTicket);
          setOverdueTickets(response.data.assignedOverdueTicket);
          setRejectedTickets(response.data.assignedRejectedTicket);
          setTotal(response.data.total);
          setLimit(response.data.limit);
        })
        .catch((error) => {
          if (error.response.status === 401) {
            window.location.href = "/login";
          }
        });

      setLoading(false);
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

    itsuppAssignedTicketData();
    pushQueryToUrl();
  }, [priority, page, limit, search, category, dateFrom, dateTo]);

  return (
    <>
      <div className={ADMINDASHBOARDSTYLE["dashboard-container"]}>
        <div className={ADMINDASHBOARDSTYLE["dashboard-container__wrapper"]}>
          <div className={ADMINDASHBOARDSTYLE["content-servicereport"]}>
            <h4 className={ADMINDASHBOARDSTYLE["servicereport-header"]}>
              INCOMING TICKET REQUESTS
            </h4>
            <AssignedTickets assignedTicketData={assignedTicketData} />
          </div>
          <div className={ADMINDASHBOARDSTYLE["content-ticketreport"]}>
            <h4 className={ADMINDASHBOARDSTYLE["ticketreport-header"]}>
              OVERALL ASSIGNED TICKET PERFORMANCE REPORT
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
                  header={"ASSIGNED TICKET REPORT"}
                  dataTickets={filteredTicketsData}
                  ticketLoading={loading}
                  setDataTickets={setFilteredTicketData}
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
                <LineChart
                  header={"TICKETS ASSIGNED PER DAY"}
                  data={assignedTicketData}
                />
              </div>

              <div
                className={
                  ADMINDASHBOARDSTYLE["report-chart__priorityandstatus"]
                }
              >
                <DoughnutChart
                  header={"TICKETS ASSIGNED ACCORDING TO STATUS"}
                  data={assignedTicketData}
                />
                <PieChart
                  header={"TICKETS ASSIGNED ACCORDING TO CATEGORY"}
                  data={assignedTicketData}
                />
                <DoughnutChart2
                  header={"TICKETS ASSIGNED ACCORDING TO UNITS"}
                  data={assignedTicketData}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default dashboard;
