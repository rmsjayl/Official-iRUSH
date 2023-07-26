import React, { useState, useEffect } from "react";
import SETTINGSSTYLE from "styles/components/admin/user-admin/settings/settings.module.css";
import { instance } from "api/axios";
import TableSettingsData from "components/common/TableSettingsData";
import Pagination from "components/features/Pagination";
import Search from "components/features/Search";
import { Buttons } from "components/common/Buttons";
import AddVoidReasonModal from "components/modals/AddVoidReasonModal";

const VoidReasonsSettings = () => {
  const [voidingReasonData, setVoidingReasonData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [total, setTotal] = useState("");
  const [search, setSearch] = useState("");

  const [openAddVoidReasonModal, setOpenAddVoidReasonModal] = useState(false);

  useEffect(() => {
    if (!openAddVoidReasonModal) {
      const fetchVoidReason = async () => {
        setLoading(true);
        await instance
          .get(
            `/settings/fetchvoidreason?search=${search}&page=${page}&limit=${limit}`
          )
          .then((res) => {
            setVoidingReasonData(res.data.filterVoidReasonData);
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

      fetchVoidReason();
    }
  }, [openAddVoidReasonModal, page, limit, search]);

  return (
    <>
      {openAddVoidReasonModal && (
        <AddVoidReasonModal
          modalOpen={setOpenAddVoidReasonModal}
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
                    searchVoidReason
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
                  header={"MANAGE VOIDING REASON SETTING"}
                  loading={loading}
                  manageVoidingReason
                  voidingReasonData={voidingReasonData}
                  setVoidingReasonData={setVoidingReasonData}
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
                    onClick={() => setOpenAddVoidReasonModal(true)}
                  >
                    ADD VOIDING REASON
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

export default VoidReasonsSettings;
