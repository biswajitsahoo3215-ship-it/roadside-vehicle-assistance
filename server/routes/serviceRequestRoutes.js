import express from "express";
import ServiceRequest from "../models/ServiceRequest.js";
import Vehicle from "../models/Vehicle.js";
import ServicePartner from "../models/ServicePartner.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Create a roadside assistance request
router.post(
  "/",
  authMiddleware,
  async (req, res) => {
    try {
      const {
        vehicleId,
        serviceType,
        description,
        location
      } = req.body;

      if (!vehicleId || !serviceType) {
        return res.status(400).json({
          message:
            "Vehicle and service type are required"
        });
      }

      const vehicle =
        await Vehicle.findOne({
          _id: vehicleId,
          user: req.user._id
        });

      if (!vehicle) {
        return res.status(404).json({
          message: "Vehicle not found"
        });
      }

      const serviceRequest =
        await ServiceRequest.create({
          user: req.user._id,
          vehicle: vehicleId,
          serviceType,
          description,
          location
        });

      res.status(201).json({
        message:
          "Service request created successfully",
        serviceRequest
      });
    } catch (error) {
      res.status(500).json({
        message:
          "Failed to create service request",
        error: error.message
      });
    }
  }
);

// Get user's service requests
router.get(
  "/",
  authMiddleware,
  async (req, res) => {
    try {
      const requests =
        await ServiceRequest.find({
          user: req.user._id
        })
          .populate("vehicle")
          .populate("partner")
          .sort({
            createdAt: -1
          });

      res.json({
        requests
      });
    } catch (error) {
      res.status(500).json({
        message:
          "Failed to fetch service requests",
        error: error.message
      });
    }
  }
);

// Cancel a service request
router.put(
  "/:id/cancel",
  authMiddleware,
  async (req, res) => {
    try {
      const request =
        await ServiceRequest.findOne({
          _id: req.params.id,
          user: req.user._id
        });

      if (!request) {
        return res.status(404).json({
          message:
            "Service request not found"
        });
      }

      // Customer can cancel only before
      // the service has started.
      const cancellableStatuses = [
        "requested",
        "accepted"
      ];

      if (
        !cancellableStatuses.includes(
          request.status
        )
      ) {
        return res.status(400).json({
          message:
            "This service request can no longer be cancelled"
        });
      }

      request.status = "cancelled";

      await request.save();

      // Notify the assigned partner
      // when the request is cancelled.
      if (request.partner) {
        const io =
          req.app.get("io");

        if (io) {
          io.to(
            `service-request-${request._id}`
          ).emit(
            "serviceRequestUpdated",
            request
          );
        }
      }

      res.json({
        message:
          "Service request cancelled successfully",

        request
      });
    } catch (error) {
      res.status(500).json({
        message:
          "Failed to cancel service request",
        error: error.message
      });
    }
  }
);

// Submit rating and feedback
router.put(
  "/:id/rating",
  authMiddleware,
  async (req, res) => {
    try {
      const {
        rating,
        feedback
      } = req.body;

      const numericRating =
        Number(rating);

      // Validate rating
      if (
        !Number.isInteger(
          numericRating
        ) ||
        numericRating < 1 ||
        numericRating > 5
      ) {
        return res.status(400).json({
          message:
            "Rating must be a whole number between 1 and 5"
        });
      }

      // Find customer's service request
      const request =
        await ServiceRequest.findOne({
          _id: req.params.id,
          user: req.user._id
        });

      if (!request) {
        return res.status(404).json({
          message:
            "Service request not found"
        });
      }

      // Only completed services can be rated
      if (
        request.status !==
        "completed"
      ) {
        return res.status(400).json({
          message:
            "You can rate a service only after it is completed"
        });
      }

      // Prevent duplicate ratings
      if (request.rating) {
        return res.status(400).json({
          message:
            "You have already rated this service"
        });
      }

      // Make sure a partner was assigned
      if (!request.partner) {
        return res.status(400).json({
          message:
            "This service does not have an assigned partner"
        });
      }

      // Save rating on service request
      request.rating =
        numericRating;

      request.feedback =
        feedback?.trim() || "";

      await request.save();

      // Find the partner
      const partner =
        await ServicePartner.findById(
          request.partner
        );

      if (partner) {
        // Find all completed requests
        // that have ratings for this partner
        const ratedRequests =
          await ServiceRequest.find({
            partner: partner._id,
            status: "completed",
            rating: {
              $exists: true,
              $ne: null
            }
          }).select("rating");

        // Calculate average rating
        const totalRating =
          ratedRequests.reduce(
            (sum, item) =>
              sum + Number(item.rating),
            0
          );

        const averageRating =
          ratedRequests.length > 0
            ? totalRating /
              ratedRequests.length
            : 5;

        // Store average rounded to
        // one decimal place
        partner.rating =
          Math.round(
            averageRating * 10
          ) / 10;

        await partner.save();
      }

      res.json({
        message:
          "Rating and feedback submitted successfully",

        request,

        partnerRating:
          partner?.rating || null
      });
    } catch (error) {
      res.status(500).json({
        message:
          "Failed to submit rating and feedback",
        error: error.message
      });
    }
  }
);

export default router;