const express = require("express");
const router = express.Router();

const {
	//SUPERADMIN AND ADMIN ROUTES
	getrequestservices,
	getrejectedservices,
	getclientrequest,
	createticket,
	rejectclientrequest,
	getrejectedservicerequest,
	gettickets,
	getrequestedticket,
	getopentickets,
	getoverduetickets,
	getvoidedtickets,
	getresolvedticket,
	getrejectedtickets,
	getreopentickets,
	getreopenedticketsrequests,
	getreopenedticketrequestbyid,
	assignreopenedticketrequest,
	reassignticket,

	//REPORTS ROUTES
	generateReportAllTickets,
	generateReportOpenTickets,
	generateReportResolvedTickets,
	generateReportOverdueTickets,
	generateReportRejectedTickets,
	generateReportVoidedTickets,
	generateReportReopenedTickets,

	//LIKERT ROUTES
	likertScale,
	postLikertScale,
	fetchLikertData,

	//HELPDESKSUPPORT ROUTES
	hdsAssignedTicket,
	hdsAssignedOpenTicket,
	hdsAssignedOverdueTicket,
	hdsAssignedResolvedTicket,
	hdsAssignedRejectedTicket,
	hdsAssignedReopenedTicket,
	hdsrejectticket,
	hdsgetDelegateTicket,
	hdsResolveTicket,
	hdsAssigntoITsupport,

	//REPORTS ROUTES FOR HELPDESK SUPPORT
	generateReportAllTicketsHelpdesk,
	generateReportOpenTicketsHelpdesk,
	generateReportResolvedTicketsHelpdesk,
	generateReportOverdueTicketsHelpdesk,
	generateReportRejectedTicketsHelpdesk,
	generateReportRoepenedTicketsHelpdesk,

	//IT SUPPORT ROUTES
	itsAssignedTicket,
	itsAssignedOpenTicket,
	itsAssignedOverdueTicket,
	itsAssignedResolvedTicket,
	itsAssignedReopenedTicket,
	itsAssignedVoidedTicket,
	itsgetDelegateTicket,
	itsVoidTicket,
	itsResolveTicket,

	//REPORTS ROUTES FOR IT SUPPORT
	generateReportAllTicketsItsupp,
	generateReportOpenTicketsItsupp,
	generateReportResolvedTicketsItsupp,
	generateReportOverdueTicketsItsupp,
	generateReportVoidedTicketsItsupp,
	generateReportReopenedTicketsItsupp,

	//ATTACHMENTS
	getUploadedFile,
} = require("../controllers/tickets");

const {
	protect,
	adminAuth,
	clerkHelpdeskSupport,
	clerkITSupport,
	servicerequestAuth,
} = require("../middleware/auth");

// @desc:	SUPERADMIN AND ADMIN FUNCTIONALITIES
//			SUPERADMIN AND ADMIN ROUTES
router
	//routes
	.route("/servicerequests")
	//methods
	.get(protect, servicerequestAuth, getrequestservices);

router
	//routes
	.route("/requestedreopenedtickets/")
	//methods
	.get(protect, servicerequestAuth, getreopenedticketsrequests);

router
	//routes
	.route("/requestedreopenedtickets/:id")
	//methods
	.get(protect, servicerequestAuth, getreopenedticketrequestbyid)
	.post(protect, servicerequestAuth, assignreopenedticketrequest);

router
	//routes
	.route("/servicerequests/:id")
	//methods
	.get(protect, servicerequestAuth, getclientrequest)
	.post(protect, servicerequestAuth, createticket);

router
	//routes
	.route("/servicerequests/rejectrequest/:id")
	//method
	.post(protect, servicerequestAuth, rejectclientrequest);

router
	//routes
	.route("/tickets")
	//method
	.get(protect, adminAuth, gettickets);

router
	//routes
	.route("/rejectedservicerequests")
	//method
	.get(protect, servicerequestAuth, getrejectedservices);

router
	//routes
	.route("/rejectedservicerequests/:id")
	//method
	.get(protect, servicerequestAuth, getrejectedservicerequest);

router
	//routes
	.route("/opentickets")
	//method
	.get(protect, adminAuth, getopentickets);

router
	//routes
	.route("/resolvedtickets")
	//method
	.get(protect, adminAuth, getresolvedticket);

router
	//routes
	.route("/overduetickets")
	//method
	.get(protect, adminAuth, getoverduetickets);

router
	//routes
	.route("/voidedtickets")
	//method
	.get(protect, adminAuth, getvoidedtickets);

router
	//routes
	.route("/rejectedtickets")
	//method
	.get(protect, adminAuth, getrejectedtickets);

router
	//routes
	.route("/reopenedtickets")
	//method
	.get(protect, adminAuth, getreopentickets);

router
	//routes
	.route("/tickets/:id")
	//method
	.get(protect, adminAuth, getrequestedticket)
	.post(protect, adminAuth, reassignticket);

//@desc:	HELPDESK SUPPORT FUNCTIONALITIES
//			HELPDESK SUPPORT ROUTES
router
	//routes
	.route("/helpdesk/assignedtickets")
	//method
	.get(protect, clerkHelpdeskSupport, hdsAssignedTicket);

router
	//routes
	.route("/helpdesk/assignedtickets/opentickets")
	//method
	.get(protect, clerkHelpdeskSupport, hdsAssignedOpenTicket);

router
	//routes
	.route("/helpdesk/assignedtickets/overduetickets")
	//method
	.get(protect, clerkHelpdeskSupport, hdsAssignedOverdueTicket);

router
	//routes
	.route("/helpdesk/assignedtickets/resolvedtickets")
	//method
	.get(protect, clerkHelpdeskSupport, hdsAssignedResolvedTicket);

router
	//routes
	.route("/helpdesk/assignedtickets/rejectedtickets")
	//methods
	.get(protect, clerkHelpdeskSupport, hdsAssignedRejectedTicket);

router
	//routes
	.route("/helpdesk/assignedtickets/reopenedtickets")
	//method
	.get(protect, clerkHelpdeskSupport, hdsAssignedReopenedTicket);

router
	//routes
	.route("/helpdesk/assignedtickets/:id")
	//method
	.get(protect, servicerequestAuth, hdsgetDelegateTicket)
	.post(protect, servicerequestAuth, hdsAssigntoITsupport);

router
	//routes
	.route("/helpdesk/assignedtickets/resolveticket/:id")
	//method
	.post(protect, clerkHelpdeskSupport, hdsResolveTicket);

router
	//routes
	.route("/helpdesk/assignedtickets/rejectticket/:id")
	//method
	.post(protect, clerkHelpdeskSupport, hdsrejectticket);

//@desc:	IT SUPPORT FUNCTIONALITIES
//			IT SUPPORT ROUTES
router
	//routes
	.route("/itsupport/assignedtickets")
	.get(protect, clerkITSupport, itsAssignedTicket);

router
	//routes
	.route("/itsupport/assignedtickets/opentickets")
	//method
	.get(protect, clerkITSupport, itsAssignedOpenTicket);

router
	//routes
	.route("/itsupport/assignedtickets/overduetickets")
	//method
	.get(protect, clerkITSupport, itsAssignedOverdueTicket);

router
	//routes
	.route("/itsupport/assignedtickets/resolvedtickets")
	//method
	.get(protect, clerkITSupport, itsAssignedResolvedTicket);

router
	//routes
	.route("/itsupport/assignedtickets/voidedtickets")
	//method
	.get(protect, clerkITSupport, itsAssignedVoidedTicket);

router
	//routes
	.route("/itsupport/assignedtickets/reopenedtickets")
	//method
	.get(protect, clerkITSupport, itsAssignedReopenedTicket);

router
	//routes
	.route("/itsupport/assignedtickets/:id")
	//method
	.get(protect, clerkITSupport, itsgetDelegateTicket);

router
	//routes
	.route("/itsupport/assignedtickets/voidticket/:id")
	//method
	.post(protect, clerkITSupport, itsVoidTicket);

router
	//routes
	.route("/itsupport/assignedtickets/resolveticket/:id")
	//method
	.post(protect, clerkITSupport, itsResolveTicket);

//@desc:	LIKERT SCALE FUNCTIONALITIES
//@access:	ADMIN AND SUPERADMIN ONLY

router
	//routes
	.route("/likertscale/:id/:token")
	//method
	.get(likertScale)
	.post(postLikertScale);

router
	//routes
	.route("/fetchlikertscale")
	//method
	.get(protect, adminAuth, fetchLikertData);

//@desc:	GET UPLOADED FILE
//@access:	ADMIN AND SUPERADMIN AND HELPDESKSUPPORT ONLY
router
	//routes
	.route("/getfile/:id")
	//method
	.get(protect, servicerequestAuth, getUploadedFile);

//@desc:	FOR REPORTS
//@access:	ADMIN AND SUPERADMIN ONLY
router
	//routes
	.route("/report")
	//method
	.get(protect, adminAuth, generateReportAllTickets);

router
	//routes
	.route("/report/opentickets")
	//method
	.get(protect, adminAuth, generateReportOpenTickets);

router
	//routes
	.route("/report/resolvedtickets")
	//method
	.get(protect, adminAuth, generateReportResolvedTickets);

router
	//routes
	.route("/report/overduetickets")
	//method
	.get(protect, adminAuth, generateReportOverdueTickets);

router
	//routes
	.route("/report/rejectedtickets")
	//method
	.get(protect, adminAuth, generateReportRejectedTickets);

router
	//routes
	.route("/report/voidedtickets")
	//method
	.get(protect, adminAuth, generateReportVoidedTickets);

router
	//routes
	.route("/report/reopenedtickets")
	//method
	.get(protect, adminAuth, generateReportReopenedTickets);

//@desc:	REPORTS FOR HELPDESK SUPPORT
//@access:	CLERK HELPDESKSUPPORT
router
	//routes
	.route("/helpdesksupport/report")
	//method
	.get(protect, clerkHelpdeskSupport, generateReportAllTicketsHelpdesk);

router
	//routes
	.route("/helpdesksupport/report/opentickets")
	//method
	.get(protect, clerkHelpdeskSupport, generateReportOpenTicketsHelpdesk);

router
	//routes
	.route("/helpdesksupport/report/resolvedtickets")
	//method
	.get(protect, clerkHelpdeskSupport, generateReportResolvedTicketsHelpdesk);

router
	//routes
	.route("/helpdesksupport/report/overduetickets")
	//method
	.get(protect, clerkHelpdeskSupport, generateReportOverdueTicketsHelpdesk);

router
	//routes
	.route("/helpdesksupport/report/rejectedtickets")
	//method
	.get(protect, clerkHelpdeskSupport, generateReportRejectedTicketsHelpdesk);

router
	//routes
	.route("/helpdesksupport/report/reopenedtickets")
	//method
	.get(protect, clerkHelpdeskSupport, generateReportRoepenedTicketsHelpdesk);

//@desc:	REPORTS FOR IT SUPPORT
//@access:	CLERK ITSUPPORT
router
	//routes
	.route("/itsupport/report")
	//method
	.get(protect, clerkITSupport, generateReportAllTicketsItsupp);

router
	//routes
	.route("/itsupport/report/opentickets")
	//method
	.get(protect, clerkITSupport, generateReportOpenTicketsItsupp);

router
	//routes
	.route("/itsupport/report/resolvedtickets")
	//method
	.get(protect, clerkITSupport, generateReportResolvedTicketsItsupp);

router
	//routes
	.route("/itsupport/report/overduetickets")
	//method
	.get(protect, clerkITSupport, generateReportOverdueTicketsItsupp);

router
	//routes
	.route("/itsupport/report/voidedtickets")
	//method
	.get(protect, clerkITSupport, generateReportVoidedTicketsItsupp);

router
	//routes
	.route("/itsupport/report/reopenedtickets")
	//method
	.get(protect, clerkITSupport, generateReportReopenedTicketsItsupp);

module.exports = router;
