const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ServiceRequestSchema = mongoose.Schema(
  {
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "client",
      required: true,
    },
    requestNo: {
      type: String,
      required: true,
    },
    requester: {
      type: String,
      required: true,
    },
    requesterEmail: {
      type: String,
      required: true,
    },
    clientUnit: {
      type: String,
      required: true,
      enum: [
        "ALFREDO M. VELAYO - COLLEGE OF ACCOUNTANCY",
        "COLLEGE OF ARCHITECTURE",
        "FACULTY OF ARTS AND LETTERS",
        "FACULTY OF CIVIL LAW",
        "COLLEGE OF COMMERCE AND BUSINESS ADMINISTRATION",
        "COLLEGE OF EDUCATION",
        "FACULTY OF ENGINEERING",
        "COLLEGE OF FINE ARTS AND DESIGN",
        "GRADUATE SCHOOL",
        "GRADUATE SCHOOL OF LAW",
        "COLLEGE OF INFORMATION AND COMPUTING SCIENCES",
        "FACULTY OF MEDICINE AND SURGERY",
        "CONSERVATORY OF MUSIC",
        "COLLEGE OF NURSING",
        "FACULTY OF PHARMACY",
        "INSTITUTE OF PHYSICAL EDUCATION AND ATHLETICS",
        "COLLEGE OF REHABILITATION SCIENCES",
        "COLLEGE OF SCIENCE",
        "COLLEGE OF TOURISM AND HOSPITALITY MANAGEMENT",
        "FACULTY OF CANON LAW",
        "FACULTY OF PHILOSOPHY - ECCLESIASTICAL FACULTY OF PHILOSOPHY",
        "FACULTY OF SACRED THEOLOGY",
        "SENIOR HIGH SCHOOL",
        "JUNIOR HIGH SCHOOL",
        "EDUCATION HIGH SCHOOL",
      ],
    },
    clientContact: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    referenceNo: {
      type: String,
    },
    attachments: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Service = mongoose.model("service", ServiceRequestSchema);

module.exports = Service;
