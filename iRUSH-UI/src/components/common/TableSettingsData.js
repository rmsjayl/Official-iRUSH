import React, { useState } from "react";
import LOADINGSTYLE from "styles/global/loading.module.css";
import TABLESTYLE from "styles/global/table.module.css";
import SORTICON from "assets/images/svg/sort.svg";
import moment from "moment";

const TableSettingsData = ({
  header,
  loading,
  manageClerks,
  clerkData,
  setClerkData,
  manageCategories,
  categoryData,
  setCategoryData,
  manageRejectingReason,
  rejectingReasonData,
  setRejectingReasonData,
  manageVoidingReason,
  voidingReasonData,
  setVoidingReasonData,
  manageResolvingSolution,
  resolvingReasonData,
  setResolvingReasonData,
}) => {
  const [order, setOrder] = useState("ASC");

  const sorting = (col) => {
    if (order === "ASC") {
      const sorted = [
        ...(clerkData ||
          categoryData ||
          rejectingReasonData ||
          voidingReasonData ||
          resolvingReasonData),
      ].sort((a, b) =>
        col === "firstName" && col === "lastName"
          ? parseInt(a[col]) - parseInt(b[col])
          : a[col] > b[col]
          ? 1
          : -1
      );
      if (manageClerks) {
        setClerkData(sorted);
      }
      if (manageCategories) {
        setCategoryData(sorted);
      }
      if (manageRejectingReason) {
        setRejectingReasonData(sorted);
      }
      if (manageVoidingReason) {
        setVoidingReasonData(sorted);
      }
      if (manageResolvingSolution) {
        setResolvingReasonData(sorted);
      }
      setOrder("DSC");
    }
    if (order === "DSC") {
      const sorted = [
        ...(clerkData ||
          categoryData ||
          rejectingReasonData ||
          voidingReasonData ||
          resolvingReasonData),
      ].sort((a, b) => (a[col].toLowerCase() < b[col].toLowerCase() ? 1 : -1));
      if (manageClerks) {
        setClerkData(sorted);
      }
      if (manageCategories) {
        setCategoryData(sorted);
      }
      if (manageRejectingReason) {
        setRejectingReasonData(sorted);
      }
      if (manageVoidingReason) {
        setVoidingReasonData(sorted);
      }
      if (manageResolvingSolution) {
        setResolvingReasonData(sorted);
      }
      setOrder("ASC");
    }
  };

  return (
    <>
      <div
        className={
          TABLESTYLE["settingsreportcontainer-settingsreports__header"]
        }
      >
        <h4>{`${header}`}</h4>
      </div>
      <div
        className={
          TABLESTYLE[
            "settingsreportcontainer-settingsreports__settingsreportlists"
          ]
        }
      >
        <>
          {loading ? (
            <div className={LOADINGSTYLE["loading-container"]}>
              <h5> Manage Settings are loading. Please wait .... </h5>
            </div>
          ) : (
            <>
              {manageClerks && (
                <>
                  {clerkData.length === 0 ? (
                    <div className={LOADINGSTYLE["noavailability__container"]}>
                      <h3> No Users available </h3>
                    </div>
                  ) : (
                    <table className={TABLESTYLE["table-container__tickets"]}>
                      <thead className={TABLESTYLE["tableticket-header"]}>
                        <tr>
                          <th className={TABLESTYLE["tableheader-title"]}>
                            Clerk Name
                            <span>
                              <img
                                id={TABLESTYLE["sortIcon"]}
                                src={SORTICON}
                                alt=""
                                onClick={() =>
                                  sorting("firstName" && "lastName")
                                }
                                style={{
                                  cursor: "pointer",
                                }}
                              />
                            </span>
                          </th>

                          <th className={TABLESTYLE["tableheader-title"]}>
                            Email
                            <span>
                              <img
                                id={TABLESTYLE["sortIcon"]}
                                src={SORTICON}
                                alt=""
                                onClick={() => sorting("email")}
                                style={{
                                  cursor: "pointer",
                                }}
                              />
                            </span>
                          </th>

                          <th className={TABLESTYLE["tableheader-title"]}>
                            Role
                            <span>
                              <img
                                id={TABLESTYLE["sortIcon"]}
                                src={SORTICON}
                                alt=""
                                onClick={() => sorting("role")}
                                style={{
                                  cursor: "pointer",
                                }}
                              />
                            </span>
                          </th>

                          <th className={TABLESTYLE["tableheader-title"]}>
                            Created At
                            <span>
                              <img
                                id={TABLESTYLE["sortIcon"]}
                                src={SORTICON}
                                alt=""
                                onClick={() => sorting("createdAt")}
                                style={{
                                  cursor: "pointer",
                                }}
                              />
                            </span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className={TABLESTYLE["tickettable-tablebody"]}>
                        {clerkData.map((clerk, index) => {
                          const { _id: id } = clerk;
                          return (
                            <tr
                              key={index}
                              className={TABLESTYLE["tickettable-row"]}
                            >
                              <td
                                className={TABLESTYLE["tickettable-cell"]}
                                onClick={() =>
                                  (window.location.href = `/admin/settings/manage/user/${id}`)
                                }
                                style={{
                                  cursor: "pointer",
                                  color: "#000",
                                }}
                              >
                                <span>
                                  {clerk.firstName} {clerk.lastName}
                                </span>
                              </td>
                              <td className={TABLESTYLE["tickettable-cell"]}>
                                {clerk.email}
                              </td>
                              <td className={TABLESTYLE["tickettable-cell"]}>
                                {clerk.role}
                              </td>
                              <td className={TABLESTYLE["tickettable-cell"]}>
                                {moment(clerk.createdAt).format("L, h:mm:ss a")}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </>
              )}
              {manageCategories && (
                <>
                  {categoryData.length === 0 ? (
                    <div className={LOADINGSTYLE["noavailability__container"]}>
                      <h3> No Category available </h3>
                    </div>
                  ) : (
                    <table className={TABLESTYLE["table-container__tickets"]}>
                      <thead className={TABLESTYLE["tableticket-header"]}>
                        <tr>
                          <th className={TABLESTYLE["tableheader-title"]}>
                            Category Name
                            <span>
                              <img
                                id={TABLESTYLE["sortIcon"]}
                                src={SORTICON}
                                alt=""
                                onClick={() => sorting("categoryName")}
                                style={{
                                  cursor: "pointer",
                                }}
                              />
                            </span>
                          </th>

                          <th className={TABLESTYLE["tableheader-title"]}>
                            Description
                            <span>
                              <img
                                id={TABLESTYLE["sortIcon"]}
                                src={SORTICON}
                                alt=""
                                onClick={() => sorting("description")}
                                style={{
                                  cursor: "pointer",
                                }}
                              />
                            </span>
                          </th>

                          <th className={TABLESTYLE["tableheader-title"]}>
                            Created At
                            <span>
                              <img
                                id={TABLESTYLE["sortIcon"]}
                                src={SORTICON}
                                alt=""
                                onClick={() => sorting("createdAt")}
                                style={{
                                  cursor: "pointer",
                                }}
                              />
                            </span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className={TABLESTYLE["tickettable-tablebody"]}>
                        {categoryData.map((category, index) => {
                          const { _id: id } = category;
                          return (
                            <tr
                              key={index}
                              className={TABLESTYLE["tickettable-row"]}
                            >
                              <td
                                className={TABLESTYLE["tickettable-cell"]}
                                onClick={() =>
                                  (window.location.href = `/admin/settings/manage/category/${id}`)
                                }
                                style={{
                                  cursor: "pointer",
                                  color: "#000",
                                }}
                              >
                                <span>{category.categoryName}</span>
                              </td>
                              <td className={TABLESTYLE["tickettable-cell"]}>
                                {category.description}
                              </td>
                              <td className={TABLESTYLE["tickettable-cell"]}>
                                {moment(category.createdAt).format(
                                  "L, h:mm:ss a"
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </>
              )}
              {manageRejectingReason && (
                <>
                  {rejectingReasonData.length === 0 ? (
                    <div className={LOADINGSTYLE["noavailability__container"]}>
                      <h3> No Reason available </h3>
                    </div>
                  ) : (
                    <>
                      <table className={TABLESTYLE["table-container__tickets"]}>
                        <thead className={TABLESTYLE["tableticket-header"]}>
                          <tr>
                            <th className={TABLESTYLE["tableheader-title"]}>
                              Rejecting Reason Name
                              <span>
                                <img
                                  id={TABLESTYLE["sortIcon"]}
                                  src={SORTICON}
                                  alt=""
                                  onClick={() => sorting("rejectReasonName")}
                                  style={{
                                    cursor: "pointer",
                                  }}
                                />
                              </span>
                            </th>

                            <th className={TABLESTYLE["tableheader-title"]}>
                              Description
                              <span>
                                <img
                                  id={TABLESTYLE["sortIcon"]}
                                  src={SORTICON}
                                  alt=""
                                  onClick={() => sorting("description")}
                                  style={{
                                    cursor: "pointer",
                                  }}
                                />
                              </span>
                            </th>

                            <th className={TABLESTYLE["tableheader-title"]}>
                              Created At
                              <span>
                                <img
                                  id={TABLESTYLE["sortIcon"]}
                                  src={SORTICON}
                                  alt=""
                                  onClick={() => sorting("createdAt")}
                                  style={{
                                    cursor: "pointer",
                                  }}
                                />
                              </span>
                            </th>
                          </tr>
                        </thead>
                        <tbody className={TABLESTYLE["tickettable-tablebody"]}>
                          {rejectingReasonData.map((rejectReason, index) => {
                            const { _id: id } = rejectReason;
                            return (
                              <tr
                                key={index}
                                className={TABLESTYLE["tickettable-row"]}
                              >
                                <td
                                  className={TABLESTYLE["tickettable-cell"]}
                                  onClick={() =>
                                    (window.location.href = `/admin/settings/manage/rejectingreason/${id}`)
                                  }
                                  style={{
                                    cursor: "pointer",
                                    color: "#000",
                                  }}
                                >
                                  <span>{rejectReason.rejectReasonName}</span>
                                </td>
                                <td className={TABLESTYLE["tickettable-cell"]}>
                                  {rejectReason.description}
                                </td>
                                <td className={TABLESTYLE["tickettable-cell"]}>
                                  {moment(rejectReason.createdAt).format(
                                    "L, h:mm:ss a"
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </>
                  )}
                </>
              )}
              {manageVoidingReason && (
                <>
                  {voidingReasonData.length === 0 ? (
                    <div className={LOADINGSTYLE["noavailability__container"]}>
                      <h3> No Reason available </h3>
                    </div>
                  ) : (
                    <table className={TABLESTYLE["table-container__tickets"]}>
                      <thead className={TABLESTYLE["tableticket-header"]}>
                        <tr>
                          <th className={TABLESTYLE["tableheader-title"]}>
                            Void Reason Name
                            <span>
                              <img
                                id={TABLESTYLE["sortIcon"]}
                                src={SORTICON}
                                alt=""
                                onClick={() => sorting("voidReasonName")}
                                style={{
                                  cursor: "pointer",
                                }}
                              />
                            </span>
                          </th>

                          <th className={TABLESTYLE["tableheader-title"]}>
                            Description
                            <span>
                              <img
                                id={TABLESTYLE["sortIcon"]}
                                src={SORTICON}
                                alt=""
                                onClick={() => sorting("description")}
                                style={{
                                  cursor: "pointer",
                                }}
                              />
                            </span>
                          </th>

                          <th className={TABLESTYLE["tableheader-title"]}>
                            Created At
                            <span>
                              <img
                                id={TABLESTYLE["sortIcon"]}
                                src={SORTICON}
                                alt=""
                                onClick={() => sorting("createdAt")}
                                style={{
                                  cursor: "pointer",
                                }}
                              />
                            </span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className={TABLESTYLE["tickettable-tablebody"]}>
                        {voidingReasonData.map((voidReason, index) => {
                          const { _id: id } = voidReason;
                          return (
                            <tr
                              key={index}
                              className={TABLESTYLE["tickettable-row"]}
                            >
                              <td
                                className={TABLESTYLE["tickettable-cell"]}
                                onClick={() =>
                                  (window.location.href = `/admin/settings/manage/voidreason/${id}`)
                                }
                                style={{
                                  cursor: "pointer",
                                  color: "#000",
                                }}
                              >
                                <span>{voidReason.voidReasonName}</span>
                              </td>
                              <td className={TABLESTYLE["tickettable-cell"]}>
                                {voidReason.description}
                              </td>
                              <td className={TABLESTYLE["tickettable-cell"]}>
                                {moment(voidReason.createdAt).format(
                                  "L, h:mm:ss a"
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </>
              )}
              {manageResolvingSolution && (
                <>
                  {resolvingReasonData.length === 0 ? (
                    <div className={LOADINGSTYLE["noavailability__container"]}>
                      <h3> No Solution available </h3>
                    </div>
                  ) : (
                    <table className={TABLESTYLE["table-container__tickets"]}>
                      <thead className={TABLESTYLE["tableticket-header"]}>
                        <tr>
                          <th className={TABLESTYLE["tableheader-title"]}>
                            Resolving Solution Name
                            <span>
                              <img
                                id={TABLESTYLE["sortIcon"]}
                                src={SORTICON}
                                alt=""
                                onClick={() => sorting("solutionName")}
                                style={{
                                  cursor: "pointer",
                                }}
                              />
                            </span>
                          </th>

                          <th className={TABLESTYLE["tableheader-title"]}>
                            Description
                            <span>
                              <img
                                id={TABLESTYLE["sortIcon"]}
                                src={SORTICON}
                                alt=""
                                onClick={() => sorting("description")}
                                style={{
                                  cursor: "pointer",
                                }}
                              />
                            </span>
                          </th>

                          <th className={TABLESTYLE["tableheader-title"]}>
                            Created At
                            <span>
                              <img
                                id={TABLESTYLE["sortIcon"]}
                                src={SORTICON}
                                alt=""
                                onClick={() => sorting("createdAt")}
                                style={{
                                  cursor: "pointer",
                                }}
                              />
                            </span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className={TABLESTYLE["tickettable-tablebody"]}>
                        {resolvingReasonData.map((resolvingSolution, index) => {
                          const { _id: id } = resolvingSolution;
                          return (
                            <tr
                              key={index}
                              className={TABLESTYLE["tickettable-row"]}
                            >
                              <td
                                className={TABLESTYLE["tickettable-cell"]}
                                onClick={() =>
                                  (window.location.href = `/admin/settings/manage/resolvingsolution/${id}`)
                                }
                                style={{
                                  cursor: "pointer",
                                  color: "#000",
                                }}
                              >
                                <span>{resolvingSolution.solutionName}</span>
                              </td>
                              <td className={TABLESTYLE["tickettable-cell"]}>
                                {resolvingSolution.description}
                              </td>
                              <td className={TABLESTYLE["tickettable-cell"]}>
                                {moment(resolvingSolution.createdAt).format(
                                  "L, h:mm:ss a"
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </>
              )}
            </>
          )}
        </>
      </div>
    </>
  );
};

export default TableSettingsData;
