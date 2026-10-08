import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    registrationNumber: {
      type: String,
      required: true,
      trim: true
    },

    make: {
      type: String,
      required: true
    },

    model: {
      type: String,
      required: true
    },

    year: {
      type: Number
    },

    fuelType: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

const Vehicle = mongoose.model("Vehicle", vehicleSchema);

export default Vehicle;