import express from "express";
import Vehicle from "../models/Vehicle.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Add a vehicle
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      registrationNumber,
      make,
      model,
      year,
      fuelType
    } = req.body;

    if (!registrationNumber || !make || !model) {
      return res.status(400).json({
        message: "Registration number, make and model are required"
      });
    }

    const vehicle = await Vehicle.create({
      user: req.user._id,
      registrationNumber,
      make,
      model,
      year,
      fuelType
    });

    res.status(201).json({
      message: "Vehicle added successfully",
      vehicle
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add vehicle",
      error: error.message
    });
  }
});

// Get logged-in user's vehicles
router.get("/", authMiddleware, async (req, res) => {
  try {
    const vehicles = await Vehicle.find({
      user: req.user._id
    }).sort({ createdAt: -1 });

    res.json({
      vehicles
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch vehicles",
      error: error.message
    });
  }
});

// Update a vehicle
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const vehicle = await Vehicle.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id
      },
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!vehicle) {
      return res.status(404).json({
        message: "Vehicle not found"
      });
    }

    res.json({
      message: "Vehicle updated successfully",
      vehicle
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update vehicle",
      error: error.message
    });
  }
});

// Delete a vehicle
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const vehicle = await Vehicle.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!vehicle) {
      return res.status(404).json({
        message: "Vehicle not found"
      });
    }

    res.json({
      message: "Vehicle deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete vehicle",
      error: error.message
    });
  }
});

export default router;