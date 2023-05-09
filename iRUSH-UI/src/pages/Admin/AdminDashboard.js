import React, { useState, useEffect } from "react";
import ADMINDASHBOARDSTYLE from "../../styles/pages/admin/user-admin/admindashboard.module.css";
import UsersReport from "../../components/admin/user-admin/UsersReport";
import { instance } from "../../api/axios";
import TicketLists from "../../components/admin/user-admin/TicketLists";
import Pagination from "../../components/features/Pagination";
import TicketStatus from "../../components/admin/user-admin/TicketStatus";
import FilterPriority from "../../components/features/FilterPriority";
import FilterCategory from "../../components/features/FilterCategory";
import FilterDate from "../../components/features/FilterDate";
import Search from "../../components/features/Search";

function AdminDashboard() {
  const [loggedUser, setLoggedUser] = useState(
    JSON.parse(sessionStorage.getItem("user")) || null
  );
  const [usersReport, setUsersReport] = useState([]);
  const [usersReportLoading, setUsersReportLoading] = useState(true);
  const [ticketDataLoading, setTicketDataLoading] = useState(false);

  //get the tickets
  const [dataTickets, setDataTickets] = useState([]);

  //PAGINATION
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [total, setTotal] = useState("");
  //SEARCH TICKET NO.
  const [search, setSearch] = useState("");
  //FILTERING
  const [priority, setPriority] = useState({ priority: " " });
  const [category, setCategory] = useState({ category: " " });
  const [dateFrom, setDateFrom] = useState({ dateFrom: 0 });
  const [dateTo, setDateTo] = useState({ dateTo: new Date() });

  useEffect(() => {
    //GET THE USER
    setLoggedUser(JSON.parse(sessionStorage.getItem("user")) || null);

    const fetchiRUSHUsers = async () => {
      setUsersReportLoading(true);
      await instance
        .get(`/settings/fetchusers`)
        .then(
          (response) => setUsersReport(response.data),
          setUsersReportLoading(false)
        )
        .catch((err) => {
          console.log(err);
          if (err.response.status === 401) {
            window.location.href = "/login";
          }
        });
    };

    const fetchTickets = async () => {
      setTicketDataLoading(true);
      await instance
        .get(
          `/tickets/tickets?priority=${priority.priority}&page=${page}&limit=${limit}&search=${search}&ticketCategory=${category.category}&dateFrom=${dateFrom.dateFrom}&dateTo=${dateTo.dateTo}`
        )
        .then((response) => {
          setLimit(response.data.limit);
          setTotal(response.data.total);
          setDataTickets(response.data.filteredTickets);
        })
        .catch((err) => {
          console.log(err);
          if (err.response.status === 401) {
            window.location.href = "/login";
          }
        });
      setTicketDataLoading(false);
    };

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
              <TicketStatus />
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
              <TicketLists
                header={"OVERALL TICKET REPORT"}
                dataTickets={dataTickets}
                ticketLoading={ticketDataLoading}
                setDataTickets={setDataTickets}
              />

              <Pagination
                page={page}
                limit={limit}
                total={total}
                setPage={(page) => setPage(page)}
                setLimit={(limit) => setLimit(limit)}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminDashboard;
