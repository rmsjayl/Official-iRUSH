import React, { useState, useEffect } from "react";
import SETTINGSSTYLE from "styles/components/admin/user-admin/settings/settings.module.css";
import { instance } from "api/axios";
import TableSettingsData from "components/common/TableSettingsData";
import Pagination from "components/features/Pagination";
import Search from "components/features/Search";
import { Buttons } from "components/common/Buttons";
import AddUserModal from "components/modals/AddUserModal";
import FilterRole from "components/features/FilterRole";

const UserSettings = () => {
  const [usersData, setUsersData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openAddUserModal, setOpenAddUserModal] = useState(false);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [total, setTotal] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState({ role: " " });

  useEffect(() => {
    if (!openAddUserModal) {
      const fetchUsersData = async () => {
        setLoading(true);
        await instance
          .get(
            `/settings/irushusers?search=${search}&page=${page}&limit=${limit}&role=${role.role}`
          )
          .then((res) => {
            setUsersData(res.data.filterIrushUsers);
            setLimit(res.data.limit);
            setTotal(res.data.total);
          })
          .catch((err) => {
            if (err.response.status === 401) {
              window.location.href = "/login";
            }
          });

        setLoading(false);
      };

      fetchUsersData();
    }
  }, [openAddUserModal, page, limit, search, role]);

  return (
    <>
      {openAddUserModal && (
        <AddUserModal modalOpen={setOpenAddUserModal} loading={loading} />
      )}

      <div className={SETTINGSSTYLE["dashboard-container"]}>
        <div className={SETTINGSSTYLE["dashboard-container__wrapper"]}>
          <div className={SETTINGSSTYLE["content-settingsreport"]}>
            <div className={SETTINGSSTYLE["settingscontainer-filtersettings"]}>
              <div className={SETTINGSSTYLE["filtersettingss-row"]}>
                <div className={SETTINGSSTYLE["filtersettings-firstcolumn"]}>
                  <FilterRole setRole={(role) => setRole(role)} />
                </div>

                <div className={SETTINGSSTYLE["filtertickets-secondcolumn"]}>
                  <Search
                    searchClerkName={true}
                    setSearch={(search) => setSearch(search)}
                  />
                </div>
              </div>
            </div>

            <div className={SETTINGSSTYLE["content-settingsreport__wrapper"]}>
              <div
                className={SETTINGSSTYLE["content-settingsreport__container"]}
              >
                <TableSettingsData
                  header={"MANAGE USERS SETTING"}
                  loading={loading}
                  manageClerks
                  clerkData={usersData}
                  setClerkData={setUsersData}
                />
              </div>

              <div
                className={
                  loading
                    ? `${SETTINGSSTYLE["table-usersettings__btn-nonload"]}`
                    : `${SETTINGSSTYLE["table-usersettings__btn-loaded"]}`
                }
              >
                <div>
                  <Buttons
                    buttonSize="btn--medium"
                    buttonStyle="btn--primary__solid"
                    onClick={() => setOpenAddUserModal(true)}
                  >
                    ADD USER
                  </Buttons>
                </div>
              </div>

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
};

export default UserSettings;
