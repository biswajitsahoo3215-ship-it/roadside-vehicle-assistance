import mongoose from "mongoose";

const serviceRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true
    },

    serviceType: {
      type: String,
      enum: [
        "Breakdown Repair",
        "Towing",
        "Battery Jump-start",
        "Flat Tire Repair",
        "Fuel Delivery"
      ],
      required: true
    },

    description: {
      type: String
    },

    location: {
      address: String,
      latitude: Number,
      longitude: Number
    },

    partner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServicePartner",
      default: null
    },

    status: {
      type: String,
      enum: [
        "requested",
        "accepted",
        "on_the_way",
        "arrived",
        "in_progress",
        "completed",
        "cancelled"
      ],
      default: "requested"
    },

    estimatedCost: {
      type: Number,
      default: 0
    },

    rating: {
      type: Number,
      min: 1,
      max: 5
    },

    feedback: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

const ServiceRequest = mongoose.model(
  "ServiceRequest",
  serviceRequestSchema
);

export default ServiceRequest;