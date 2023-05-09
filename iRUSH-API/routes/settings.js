const express = require("express");
const router = express.Router();

const {
	//for users
	getUsers,
	fetchAllUsers,
	createUser,
	getUserData,
	patchUser,
	deleteUser,
	getLoggedUser,
	updatePassword,
	updateLoggedUser,

	//for categories
	getCategory,
	fetchCategoryData,
	getCategoryData,
	createCategory,
	patchCategory,
	deleteCategory,

	//for solutions
	getSolution,
	getSolutionData,
	createSolution,
	patchSolution,
	deleteSolution,

	//for reject reasons
	getRejectReason,
	getRejectReasonData,
	createRejectReason,
	patchRejectReason,
	deleteRejectReason,

	//for void reasons
	getVoidReason,
	getVoidReasonData,
	createVoidReason,
	patchVoidReason,
	deleteVoidReason,
} = require("../controllers/settings");

const {
	protect,
	adminAuth,
	servicerequestAuth,
} = require("../middleware/auth");

//for creating users routes
router
	.route("/loggeduser/:id")
	.get(protect, getLoggedUser)
	.put(protect, updateLoggedUser);
router.route("/fetchusers").get(protect, servicerequestAuth, getUsers);
router.route("/irushusers").get(protect, adminAuth, fetchAllUsers);
router.route("/createuser").post(protect, adminAuth, createUser);
router.route("/getuser/:id").get(protect, adminAuth, getUserData);
router.route("/updatepassword/:id").post(protect, updatePassword);
router
	.route("/user/:id")
	.put(protect, adminAuth, patchUser)
	.delete(protect, adminAuth, deleteUser);

//for solutions routes
router.route("/fetchsolution").get(protect, getSolution);
router.route("/createsolution").post(protect, createSolution);
router.route("/fetchsolutiondata/:id").get(protect, getSolutionData);
router
	.route("/solution/:id")
	.put(protect, adminAuth, patchSolution)
	.delete(protect, adminAuth, deleteSolution);

//for categories routes
router.route("/fetchcategory").get(getCategory);
router.route("/categorydata").get(protect, fetchCategoryData);
router.route("/fetchcategorydata/:id").get(protect, getCategoryData);
router.route("/createcategory").post(protect, createCategory);
router
	.route("/category/:id")
	.put(protect, adminAuth, patchCategory)
	.delete(protect, adminAuth, deleteCategory);

//for reject reasons routes
router.route("/fetchrejectreason").get(protect, getRejectReason);
router.route("/fetchrejectreasondata/:id").get(protect, getRejectReasonData);
router
	.route("/createrejectreason")
	.post(protect, adminAuth, createRejectReason);
router
	.route("/rejectreason/:id")
	.put(protect, adminAuth, patchRejectReason)
	.delete(protect, adminAuth, deleteRejectReason);

//for void reasons routes
router.route("/fetchvoidreason").get(protect, getVoidReason);
router.route("/fetchvoidreasondata/:id").get(protect, getVoidReasonData);
router.route("/createvoidreason").post(protect, adminAuth, createVoidReason);
router
	.route("/voidreason/:id")
	.put(protect, adminAuth, patchVoidReason)
	.delete(protect, adminAuth, deleteVoidReason);

module.exports = router;
