import express from "express";
import ServicePartner from "../models/ServicePartner.js";
import ServiceRequest from "../models/ServiceRequest.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const createPartnerRoutes = (io) => {
  const router = express.Router();

  const partnerOnly = [
    authMiddleware,
    roleMiddleware("partner")
  ];

  // Create service partner profile
  router.post(
    "/",
    ...partnerOnly,
    async (req, res) => {
      try {
        const {
          businessName,
          services,
          phone,
          address,
          location
        } = req.body;

        if (!businessName) {
          return res.status(400).json({
            message:
              "Business name is required"
          });
        }

        const existingPartner =
          await ServicePartner.findOne({
            user: req.user._id
          });

        if (existingPartner) {
          return res.status(400).json({
            message:
              "Service partner profile already exists"
          });
        }

        const partner =
          await ServicePartner.create({
            user: req.user._id,
            businessName,
            services,
            phone,
            address,
            location,
            verified: false,
            available: true
          });

        res.status(201).json({
          message:
            "Service partner profile created successfully. Please wait for admin verification.",
          partner
        });
      } catch (error) {
        res.status(500).json({
          message:
            "Failed to create partner profile",
          error: error.message
        });
      }
    }
  );

  // Get logged-in partner profile
  router.get(
    "/me",
    ...partnerOnly,
    async (req, res) => {
      try {
        const partner =
          await ServicePartner.findOne({
            user: req.user._id
          });

        if (!partner) {
          return res.status(404).json({
            message:
              "Partner profile not found"
          });
        }

        res.json({
          partner
        });
      } catch (error) {
        res.status(500).json({
          message:
            "Failed to fetch partner profile",
          error: error.message
        });
      }
    }
  );

  // Update logged-in partner profile
  router.put(
    "/me",
    ...partnerOnly,
    async (req, res) => {
      try {
        const {
          businessName,
          services,
          phone,
          address,
          location
        } = req.body;

        if (
          !businessName ||
          !businessName.trim()
        ) {
          return res.status(400).json({
            message:
              "Business name is required"
          });
        }

        if (
          !Array.isArray(services) ||
          services.length === 0
        ) {
          return res.status(400).json({
            message:
              "Please select at least one service"
          });
        }

        const partner =
          await ServicePartner.findOne({
            user: req.user._id
          });

        if (!partner) {
          return res.status(404).json({
            message:
              "Partner profile not found"
          });
        }

        partner.businessName =
          businessName.trim();

        partner.services =
          services;

        partner.phone =
          phone?.trim() || "";

        partner.address =
          address?.trim() || "";

        if (
          location &&
          location.latitude !== undefined &&
          location.longitude !== undefined
        ) {
          partner.location = {
            latitude:
              Number(
                location.latitude
              ),

            longitude:
              Number(
                location.longitude
              )
          };
        }

        await partner.save();

        res.json({
          message:
            "Partner profile updated successfully",

          partner
        });
      } catch (error) {
        res.status(500).json({
          message:
            "Failed to update partner profile",
          error: error.message
        });
      }
    }
  );

  // Update partner availability
  router.put(
    "/availability",
    ...partnerOnly,
    async (req, res) => {
      try {
        const { available } =
          req.body;

        if (
          typeof available !==
          "boolean"
        ) {
          return res.status(400).json({
            message:
              "Availability must be true or false"
          });
        }

        const partner =
          await ServicePartner.findOne({
            user: req.user._id
          });

        if (!partner) {
          return res.status(404).json({
            message:
              "Partner profile not found"
          });
        }

        if (!partner.verified) {
          return res.status(403).json({
            message:
              "Your partner account must be verified by an admin before changing availability."
          });
        }

        partner.available =
          available;

        await partner.save();

        res.json({
          message: available
            ? "You are now available for service requests."
            : "You are now unavailable for service requests.",

          available:
            partner.available
        });
      } catch (error) {
        res.status(500).json({
          message:
            "Failed to update availability",
          error: error.message
        });
      }
    }
  );

  // Update partner live location
  router.put(
    "/location",
    ...partnerOnly,
    async (req, res) => {
      try {
        const {
          latitude,
          longitude
        } = req.body;

        if (
          latitude === undefined ||
          longitude === undefined
        ) {
          return res.status(400).json({
            message:
              "Latitude and longitude are required"
          });
        }

        const partner =
          await ServicePartner.findOne({
            user: req.user._id
          });

        if (!partner) {
          return res.status(404).json({
            message:
              "Partner profile not found"
          });
        }

        if (!partner.verified) {
          return res.status(403).json({
            message:
              "Your partner account must be verified by an admin before sharing live location."
          });
        }

        partner.location = {
          latitude:
            Number(latitude),

          longitude:
            Number(longitude)
        };

        await partner.save();

        const activeRequests =
          await ServiceRequest.find({
            partner:
              partner._id,

            status: {
              $in: [
                "accepted",
                "on_the_way",
                "arrived",
                "in_progress"
              ]
            }
          });

        activeRequests.forEach(
          (request) => {
            io.to(
              `service-request-${request._id}`
            ).emit(
              "partnerLocationUpdated",
              {
                requestId:
                  request._id,

                latitude:
                  Number(latitude),

                longitude:
                  Number(longitude)
              }
            );
          }
        );

        res.json({
          message:
            "Location updated successfully",

          location:
            partner.location
        });
      } catch (error) {
        res.status(500).json({
          message:
            "Failed to update partner location",
          error: error.message
        });
      }
    }
  );

  // Get pending service requests
  router.get(
    "/requests",
    ...partnerOnly,
    async (req, res) => {
      try {
        const requests =
          await ServiceRequest.find({
            status: "requested"
          })
            .populate(
              "user",
              "name phone"
            )
            .populate("vehicle")
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

  // Get service requests assigned
  // to logged-in partner
  router.get(
    "/my-requests",
    ...partnerOnly,
    async (req, res) => {
      try {
        const partner =
          await ServicePartner.findOne({
            user: req.user._id
          });

        if (!partner) {
          return res.status(404).json({
            message:
              "Partner profile not found"
          });
        }

        const requests =
          await ServiceRequest.find({
            partner:
              partner._id
          })
            .populate(
              "user",
              "name phone"
            )
            .populate("vehicle")
            .populate("partner")
            .sort({
              updatedAt: -1
            });

        res.json({
          requests
        });
      } catch (error) {
        res.status(500).json({
          message:
            "Failed to fetch assigned service requests",
          error: error.message
        });
      }
    }
  );

  // Accept a service request
  router.put(
    "/requests/:id/accept",
    ...partnerOnly,
    async (req, res) => {
      try {
        const partner =
          await ServicePartner.findOne({
            user: req.user._id
          });

        if (!partner) {
          return res.status(404).json({
            message:
              "Partner profile not found"
          });
        }

        if (!partner.verified) {
          return res.status(403).json({
            message:
              "Your partner account must be verified by an admin before accepting service requests."
          });
        }

        if (!partner.available) {
          return res.status(403).json({
            message:
              "You are currently unavailable for new service requests."
          });
        }

        const request =
          await ServiceRequest.findOneAndUpdate(
            {
              _id:
                req.params.id,

              status:
                "requested"
            },
            {
              partner:
                partner._id,

              status:
                "accepted"
            },
            {
              new: true
            }
          )
            .populate(
              "user",
              "name phone"
            )
            .populate("vehicle")
            .populate("partner");

        if (!request) {
          return res.status(404).json({
            message:
              "Service request not available"
          });
        }

        io.to(
          `service-request-${request._id}`
        ).emit(
          "serviceRequestUpdated",
          request
        );

        res.json({
          message:
            "Service request accepted successfully",

          request
        });
      } catch (error) {
        res.status(500).json({
          message:
            "Failed to accept service request",
          error: error.message
        });
      }
    }
  );

  // Update estimated service cost
  router.put(
    "/requests/:id/cost",
    ...partnerOnly,
    async (req, res) => {
      try {
        const { estimatedCost } =
          req.body;

        const numericCost =
          Number(estimatedCost);

        if (
          !Number.isFinite(
            numericCost
          ) ||
          numericCost < 0
        ) {
          return res.status(400).json({
            message:
              "Estimated cost must be a valid amount greater than or equal to ₹0"
          });
        }

        const partner =
          await ServicePartner.findOne({
            user: req.user._id
          });

        if (!partner) {
          return res.status(404).json({
            message:
              "Partner profile not found"
          });
        }

        if (!partner.verified) {
          return res.status(403).json({
            message:
              "Your partner account must be verified by an admin before updating service cost."
          });
        }

        const request =
          await ServiceRequest.findOne({
            _id:
              req.params.id,

            partner:
              partner._id
          });

        if (!request) {
          return res.status(404).json({
            message:
              "Service request not found"
          });
        }

        const editableStatuses = [
          "accepted",
          "on_the_way",
          "arrived",
          "in_progress"
        ];

        if (
          !editableStatuses.includes(
            request.status
          )
        ) {
          return res.status(400).json({
            message:
              "Estimated cost can only be updated while the service is active."
          });
        }

        request.estimatedCost =
          numericCost;

        await request.save();

        await request.populate([
          {
            path: "user",
            select:
              "name phone"
          },
          {
            path: "vehicle"
          },
          {
            path: "partner"
          }
        ]);

        // Send the updated cost to
        // the customer in real time.
        io.to(
          `service-request-${request._id}`
        ).emit(
          "serviceRequestUpdated",
          request
        );

        res.json({
          message:
            "Estimated service cost updated successfully",

          request
        });
      } catch (error) {
        res.status(500).json({
          message:
            "Failed to update estimated service cost",
          error: error.message
        });
      }
    }
  );

  // Update service request status
  router.put(
    "/requests/:id/status",
    ...partnerOnly,
    async (req, res) => {
      try {
        const { status } =
          req.body;

        const allowedStatuses = [
          "on_the_way",
          "arrived",
          "in_progress",
          "completed"
        ];

        if (
          !allowedStatuses.includes(
            status
          )
        ) {
          return res.status(400).json({
            message:
              "Invalid status"
          });
        }

        const partner =
          await ServicePartner.findOne({
            user: req.user._id
          });

        if (!partner) {
          return res.status(404).json({
            message:
              "Partner profile not found"
          });
        }

        if (!partner.verified) {
          return res.status(403).json({
            message:
              "Your partner account must be verified by an admin before updating service status."
          });
        }

        const request =
          await ServiceRequest.findOne({
            _id: req.params.id,
            partner: partner._id
          });

        if (!request) {
          return res.status(404).json({
            message:
              "Service request not found"
          });
        }

        const nextStatusMap = {
          accepted:
            "on_the_way",

          on_the_way:
            "arrived",

          arrived:
            "in_progress",

          in_progress:
            "completed"
        };

        const expectedNextStatus =
          nextStatusMap[
            request.status
          ];

        if (
          expectedNextStatus !==
          status
        ) {
          return res.status(400).json({
            message:
              `Invalid status transition. The next status after "${request.status}" must be "${expectedNextStatus || "none"}".`
          });
        }

        request.status =
          status;

        await request.save();

        await request.populate([
          {
            path: "user",
            select:
              "name phone"
          },
          {
            path: "vehicle"
          },
          {
            path: "partner"
          }
        ]);

        io.to(
          `service-request-${request._id}`
        ).emit(
          "serviceRequestUpdated",
          request
        );

        res.json({
          message:
            "Service request status updated successfully",

          request
        });
      } catch (error) {
        res.status(500).json({
          message:
            "Failed to update service request status",
          error: error.message
        });
      }
    }
  );

  return router;
};

export default createPartnerRoutes;