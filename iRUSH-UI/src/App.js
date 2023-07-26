import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "styles/global/index.css";
//COMPONENTS
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
//PAGES
import Homepage from "pages/Homepage";
import Faq from "pages/Faq";
import Login from "pages/Login";
import Forgotpassword from "pages/Forgotpassword";
import Register from "pages/Register";
//CLIENTS
import ClientServiceRequest from "pages/ClientServiceRequest";
import ServiceFormSubmitted from "pages/ServiceFormSubmitted";
import ClientReopenTicket from "pages/ClientReopenTicket";
import ReopenTicketData from "pages/ReopenTicketData";
//PROFILE PAGES
import ProfileDashboard from "components/common/Profile";
import ProfileHelpdesk from "components/common/Profile";
import ProfileItSupport from "components/common/Profile";
//FOR ADMINS
import AdminRoutes from "routes/AdminRoutes";
import AdminDashboard from "pages/Admin/AdminDashboard";
import Tickets from "pages/Admin/Tickets";
import ServiceRequests from "pages/Admin/ServiceRequests";
import Settings from "pages/Admin/Settings";
//FOR HELPDESK SUPPORT
import ClerkHelpdeskRoutes from "routes/ClerkHelpdeskRoutes";
import HelpdeskDashboard from "pages/Clerk/helpdesksupport/Dashboard";
import HelpdeskTickets from "pages/Clerk/helpdesksupport/Tickets";
import HelpdeskServiceRequests from "pages/Clerk/helpdesksupport/ServiceRequests";
import HelpdeskTicketData from "pages/Clerk/helpdesksupport/TicketData";
//FOR IT SUPPORT
import ClerkItSupportRoutes from "routes/ClerkItSupportRoutes";
import ItsupportDashboard from "pages/Clerk/itsupport/dashboard";
import ItsupportTickets from "pages/Clerk/itsupport/Tickets";
import ItsupportTicketData from "pages/Clerk/itsupport/TicketData";
//TICKETS ADMIN ROUTE
import Opentickets from "components/admin/user-admin/tickets/Opentickets";
import Resolvedtickets from "components/admin/user-admin/tickets/Resolvedtickets";
import Voidedtickets from "components/admin/user-admin/tickets/Voidedtickets";
import Overduetickets from "components/admin/user-admin/tickets/Overduetickets";
import Reopenedtickets from "components/admin/user-admin/tickets/Reopenedtickets";
import Pagebroken from "components/common/Pagebroken";
import Rejectedtickets from "components/admin/user-admin/tickets/Rejectedtickets";
//TICKETS HELPDESK SUPPORT ROUTE
import HelpdeskOpentickets from "components/admin/clerks/helpdesksupport/tickets/HelpdeskOpentickets";
import HelpdeskResolvedtickets from "components/admin/clerks/helpdesksupport/tickets/HelpdeskResolvedtickets";
import HelpdeskRejectedtickets from "components/admin/clerks/helpdesksupport/tickets/HelpdeskRejectedtickets";
import HelpdeskOverduetickets from "components/admin/clerks/helpdesksupport/tickets/HelpdeskOverduetickets";
import HelpdeskReopenedtickets from "components/admin/clerks/helpdesksupport/tickets/HelpdeskReopenedtickets";
//TICKETS IT SUPPORT ROUTE
import ItsupportOpentickets from "components/admin/clerks/itsupport/tickets/ItsupportOpentickets";
import ItsupportResolvedtickets from "components/admin/clerks/itsupport/tickets/ItsupportResolvedtickets";
import ItsupportVoidedtickets from "components/admin/clerks/itsupport/tickets/ItsupportVoidedtickets";
import ItsupportReopenedtickets from "components/admin/clerks/itsupport/tickets/ItsupportReopenedtickets";
import ItsupportOverduetickets from "components/admin/clerks/itsupport/tickets/ItsupportOverduetickets";
//SERVICE REQUESTS ADMIN ROUTE
import ServiceRequestsData from "pages/Admin/ServiceRequestsData";
import NewServiceRequests from "components/admin/user-admin/servicerequests/NewServiceRequests";
import ReopenTicketRequests from "components/admin/user-admin/servicerequests/ReopenTicketRequests";
import RejectedServiceRequests from "components/admin/user-admin/servicerequests/RejectedServiceRequests";
//SETTINGS ADMIN ROUTE
import UserSettings from "components/admin/user-admin/settings/UserSettings";
import ResolvingReasonsSettings from "components/admin/user-admin/settings/ResolvingReasonsSettings";
import VoidReasonsSettings from "components/admin/user-admin/settings/VoidReasonsSettings";
import RejectingReasonsSettings from "components/admin/user-admin/settings/RejectingReasonsSettings";
import CategorySettings from "components/admin/user-admin/settings/CategorySettings";
import TicketData from "pages/Admin/TicketData";
import SettingsData from "pages/Admin/SettingsData";
import ResetPassword from "pages/ResetPassword";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          {/* INITIAL PAGES AND LANDING PAGES FOR USERS AND CLIENTS */}
          <Route path="/" element={<Homepage />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgotpassword" element={<Forgotpassword />} />
          <Route
            path="/resetpassword/:id/verify/:token"
            element={<ResetPassword />}
          />
          <Route
            path="/clientrequest/:id/request/:token"
            element={<ClientServiceRequest />}
          />
          <Route path="/clientrequest/:id" element={<ServiceFormSubmitted />} />
          <Route
            path="/client/:id/:token/requestedtickets"
            element={<ClientReopenTicket />}
          />
          <Route
            path="/client/:id/:token/requestedtickets/:ticketId"
            element={<ReopenTicketData />}
          />

          {/* ADMIN ROUTES */}
          <Route element={<AdminRoutes />}>
            <Route path="/admin/profile/:id" element={<ProfileDashboard />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            {/* TICKET ROUTES */}
            <Route path="/admin/tickets/" element={<Tickets />}>
              <Route
                path="/admin/tickets/opentickets"
                element={<Opentickets />}
              />
              <Route
                path="/admin/tickets/resolvedtickets"
                element={<Resolvedtickets />}
              />
              <Route
                path="/admin/tickets/voidedtickets"
                element={<Voidedtickets />}
              />
              <Route
                path="/admin/tickets/overduetickets"
                element={<Overduetickets />}
              />
              <Route
                path="/admin/tickets/reopenedtickets"
                element={<Reopenedtickets />}
              />
              <Route
                path="/admin/tickets/rejectedtickets"
                element={<Rejectedtickets />}
              />
            </Route>
            <Route path="/admin/tickets/:id" element={<TicketData />} />
            <Route path="/admin/servicerequests" element={<ServiceRequests />}>
              <Route
                path="/admin/servicerequests/newservicerequests"
                element={<NewServiceRequests />}
              />
              <Route
                path="/admin/servicerequests/reopenticketrequests"
                element={<ReopenTicketRequests />}
              />
              <Route
                path="/admin/servicerequests/rejectedservicerequests"
                element={<RejectedServiceRequests />}
              />
            </Route>
            <Route
              path="/admin/servicerequests/newservicerequest/:id"
              element={<ServiceRequestsData newServiceRequest={true} />}
            />
            <Route
              path="/admin/servicerequests/rejectedservicerequest/:id"
              element={<ServiceRequestsData rejectedServiceRequest={true} />}
            />
            <Route
              path="/admin/servicerequests/reopenticketrequest/:id"
              element={<ServiceRequestsData reopenTicketRequest={true} />}
            />
            <Route path="/admin/settings" element={<Settings />}>
              <Route
                path="/admin/settings/manage/users"
                element={<UserSettings />}
              />
              <Route
                path="/admin/settings/manage/categories"
                element={<CategorySettings />}
              />
              <Route
                path="/admin/settings/manage/rejectingreasons"
                element={<RejectingReasonsSettings />}
              />
              <Route
                path="/admin/settings/manage/voidingreasons"
                element={<VoidReasonsSettings />}
              />
              <Route
                path="/admin/settings/manage/resolvingsolutions"
                element={<ResolvingReasonsSettings />}
              />
            </Route>
            <Route
              path="/admin/settings/manage/user/:id"
              element={<SettingsData users={true} />}
            />
            <Route
              path="/admin/settings/manage/category/:id"
              element={<SettingsData categories={true} />}
            />
            <Route
              path="/admin/settings/manage/rejectingreason/:id"
              element={<SettingsData rejectReasons={true} />}
            />
            <Route
              path="/admin/settings/manage/voidreason/:id"
              element={<SettingsData voidReasons={true} />}
            />
            <Route
              path="/admin/settings/manage/resolvingsolution/:id"
              element={<SettingsData resolution={true} />}
            />
          </Route>

          {/* HELPDESK SUPPORT ROUTES */}

          <Route element={<ClerkHelpdeskRoutes />}>
            <Route
              path="/helpdesksupport/profile/:id"
              element={<ProfileHelpdesk />}
            />
            <Route
              path="/helpdesksupport/dashboard"
              element={<HelpdeskDashboard />}
            />
            <Route
              path="/helpdesksupport/tickets"
              element={<HelpdeskTickets />}
            >
              <Route
                path="/helpdesksupport/tickets/opentickets"
                element={<HelpdeskOpentickets />}
              />
              <Route
                path="/helpdesksupport/tickets/resolvedtickets"
                element={<HelpdeskResolvedtickets />}
              />
              <Route
                path="/helpdesksupport/tickets/rejectedtickets"
                element={<HelpdeskRejectedtickets />}
              />
              <Route
                path="/helpdesksupport/tickets/overduetickets"
                element={<HelpdeskOverduetickets />}
              />
              <Route
                path="/helpdesksupport/tickets/reopenedtickets"
                element={<HelpdeskReopenedtickets />}
              />
            </Route>

            <Route
              path="/helpdesksupport/tickets/:id"
              element={<HelpdeskTicketData />}
            />

            <Route
              path="/helpdesksupport/servicerequests"
              element={<HelpdeskServiceRequests />}
            >
              <Route
                path="/helpdesksupport/servicerequests/newservicerequests"
                element={<NewServiceRequests />}
              />
              <Route
                path="/helpdesksupport/servicerequests/reopenticketrequests"
                element={<ReopenTicketRequests />}
              />
              <Route
                path="/helpdesksupport/servicerequests/rejectedservicerequests"
                element={<RejectedServiceRequests />}
              />
            </Route>

            <Route
              path="/helpdesksupport/servicerequests/:id"
              element={<ServiceRequestsData />}
            />

            <Route
              path="/helpdesksupport/servicerequests/newservicerequest/:id"
              element={<ServiceRequestsData newServiceRequest={true} />}
            />
            <Route
              path="/helpdesksupport/servicerequests/rejectedservicerequest/:id"
              element={<ServiceRequestsData rejectedServiceRequest={true} />}
            />
            <Route
              path="/helpdesksupport/servicerequests/reopenticketrequest/:id"
              element={<ServiceRequestsData reopenTicketRequest={true} />}
            />
          </Route>

          {/* IT SUPPORT ROUTES */}
          <Route element={<ClerkItSupportRoutes />}>
            <Route
              path="/itsupport/profile/:id"
              element={<ProfileItSupport />}
            />
            <Route
              path="/itsupport/dashboard"
              element={<ItsupportDashboard />}
            />
            <Route path="/itsupport/tickets" element={<ItsupportTickets />}>
              <Route
                path="/itsupport/tickets/opentickets"
                element={<ItsupportOpentickets />}
              />
              <Route
                path="/itsupport/tickets/resolvedtickets"
                element={<ItsupportResolvedtickets />}
              />
              <Route
                path="/itsupport/tickets/voidedtickets"
                element={<ItsupportVoidedtickets />}
              />
              <Route
                path="/itsupport/tickets/overduetickets"
                element={<ItsupportOverduetickets />}
              />
              <Route
                path="/itsupport/tickets/reopenedtickets"
                element={<ItsupportReopenedtickets />}
              />
            </Route>
            <Route
              path="/itsupport/tickets/:id"
              element={<ItsupportTicketData />}
            />
          </Route>

          <Route path="*" element={<Pagebroken />} />
        </Routes>
      </Router>

      <ToastContainer
        theme="colored"
        hideProgressBar={true}
        closeOnClick
        autoClose={3500}
      />
    </div>
  );
}

export default App;
