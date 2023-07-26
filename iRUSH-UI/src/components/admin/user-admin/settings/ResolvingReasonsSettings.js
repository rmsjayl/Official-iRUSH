import React, { useState, useEffect } from "react";
import SETTINGSSTYLE from "styles/components/admin/user-admin/settings/settings.module.css";
import { instance } from "api/axios";
import TableSettingsData from "components/common/TableSettingsData";
import Pagination from "components/features/Pagination";
import Search from "components/features/Search";
import { Buttons } from "components/common/Buttons";
import AddSolutionModal from "components/modals/AddSolutionModal";

const ResolvingReasonsSettings = () => {
  const [resolvingSolutionData, setResolvingSolutionData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [total, setTotal] = useState("");
  const [search, setSearch] = useState("");

  const [openAddSolutionModal, setOpenAddSolutionModal] = useState(false);

  useEffect(() => {
    if (!openAddSolutionModal) {
      const fetchResolvingSolutions = async () => {
        setLoading(true);
        await instance
          .get(
            `/settings/fetchsolution?search=${search}&page=${page}&limit=${limit}`
          )
          .then((res) => {
            setResolvingSolutionData(res.data.filterSolutionData);
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

      fetchResolvingSolutions();
    }
  }, [openAddSolutionModal, page, limit, search]);

  return (
    <>
      {openAddSolutionModal && (
        <AddSolutionModal
          modalOpen={setOpenAddSolutionModal}
          loading={loading}
        />
      )}

      <div className={SETTINGSSTYLE["dashboard-container"]}>
        <div className={SETTINGSSTYLE["dashboard-container__wrapper"]}>
          <div className={SETTINGSSTYLE["content-settingsreport"]}>
            <div className={SETTINGSSTYLE["settingscontainer-filtersettings"]}>
              <div className={SETTINGSSTYLE["filtersettingss-row"]}>
                <div className={SETTINGSSTYLE["filtersettingss-secondcolumn"]}>
                  <Search
                    searchResolveReason
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
                  header={"MANAGE RESOLVING SOLUTION SETTING"}
                  loading={loading}
                  manageResolvingSolution
                  resolvingReasonData={resolvingSolutionData}
                  setResolvingReasonData={setResolvingSolutionData}
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
                    onClick={() => setOpenAddSolutionModal(true)}
                  >
                    ADD RESOLVING SOLUTION
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

export default ResolvingReasonsSettings;
