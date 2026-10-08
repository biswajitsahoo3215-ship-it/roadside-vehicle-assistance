import mongoose from "mongoose";

const servicePartnerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    businessName: {
      type: String,
      required: true
    },

    services: [
      {
        type: String
      }
    ],

    phone: {
      type: String
    },

    address: {
      type: String
    },

    verified: {
      type: Boolean,
      default: false
    },

    available: {
      type: Boolean,
      default: true
    },

    rating: {
      type: Number,
      default: 5
    },

    location: {
      latitude: Number,
      longitude: Number
    }
  },
  {
    timestamps: true
  }
);

const ServicePartner = mongoose.model(
  "ServicePartner",
  servicePartnerSchema
);

export default ServicePartner;