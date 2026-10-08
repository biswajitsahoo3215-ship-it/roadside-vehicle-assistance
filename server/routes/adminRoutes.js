import express from "express";
import User from "../models/User.js";
import ServicePartner from "../models/ServicePartner.js";
import ServiceRequest from "../models/ServiceRequest.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin authorization middleware
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Admin access required"
    });
  }

  next();
};

// Get admin dashboard statistics
router.get(
  "/stats",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const [
        totalUsers,
        totalPartners,
        totalRequests,
        completedRequests,
        pendingRequests
      ] = await Promise.all([
        User.countDocuments({
          role: "user"
        }),

        ServicePartner.countDocuments(),

        ServiceRequest.countDocuments(),

        ServiceRequest.countDocuments({
          status: "completed"
        }),

        ServiceRequest.countDocuments({
          status: "requested"
        })
      ]);

      res.json({
        stats: {
          totalUsers,
          totalPartners,
          totalRequests,
          completedRequests,
          pendingRequests
        }
      });
    } catch (error) {
      res.status(500).json({
        message:
          "Failed to fetch admin statistics",
        error: error.message
      });
    }
  }
);

// Get all users
router.get(
  "/users",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const users = await User.find()
        .select("-password")
        .sort({
          createdAt: -1
        });

      res.json({
        users
      });
    } catch (error) {
      res.status(500).json({
        message:
          "Failed to fetch users",
        error: error.message
      });
    }
  }
);

// Promote a normal user to service partner
router.put(
  "/users/:id/promote-partner",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const user =
        await User.findById(
          req.params.id
        );

      if (!user) {
        return res.status(404).json({
          message: "User not found"
        });
      }

      // Do not allow an admin to
      // promote another admin.
      if (user.role === "admin") {
        return res.status(400).json({
          message:
            "An admin account cannot be promoted to partner"
        });
      }

      if (user.role === "partner") {
        return res.status(400).json({
          message:
            "User is already a service partner"
        });
      }

      user.role = "partner";

      await user.save();

      res.json({
        message:
          "User promoted to service partner successfully",

        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role
        }
      });
    } catch (error) {
      res.status(500).json({
        message:
          "Failed to promote user to partner",
        error: error.message
      });
    }
  }
);

// Remove partner role and return account
// to normal user
router.put(
  "/users/:id/remove-partner",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const user =
        await User.findById(
          req.params.id
        );

      if (!user) {
        return res.status(404).json({
          message: "User not found"
        });
      }

      if (user.role !== "partner") {
        return res.status(400).json({
          message:
            "User is not currently a service partner"
        });
      }

      user.role = "user";

      await user.save();

      // Keep the partner profile in the
      // database so it can be restored later.
      // It will simply no longer be usable
      // through partner-only routes.
      res.json({
        message:
          "Partner role removed successfully",

        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role
        }
      });
    } catch (error) {
      res.status(500).json({
        message:
          "Failed to remove partner role",
        error: error.message
      });
    }
  }
);

// Get all service partners
router.get(
  "/partners",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const partners =
        await ServicePartner.find()
          .populate(
            "user",
            "name email phone role"
          )
          .sort({
            createdAt: -1
          });

      res.json({
        partners
      });
    } catch (error) {
      res.status(500).json({
        message:
          "Failed to fetch partners",
        error: error.message
      });
    }
  }
);

// Verify a service partner
router.put(
  "/partners/:id/verify",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const partner =
        await ServicePartner.findById(
          req.params.id
        );

      if (!partner) {
        return res.status(404).json({
          message:
            "Service partner not found"
        });
      }

      partner.verified = true;

      await partner.save();

      res.json({
        message:
          "Service partner verified successfully",
        partner
      });
    } catch (error) {
      res.status(500).json({
        message:
          "Failed to verify service partner",
        error: error.message
      });
    }
  }
);

// Remove verification from a service partner
router.put(
  "/partners/:id/unverify",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const partner =
        await ServicePartner.findById(
          req.params.id
        );

      if (!partner) {
        return res.status(404).json({
          message:
            "Service partner not found"
        });
      }

      partner.verified = false;

      await partner.save();

      res.json({
        message:
          "Service partner verification removed",
        partner
      });
    } catch (error) {
      res.status(500).json({
        message:
          "Failed to remove partner verification",
        error: error.message
      });
    }
  }
);

// Get all service requests
router.get(
  "/requests",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const requests =
        await ServiceRequest.find()
          .populate(
            "user",
            "name email phone"
          )
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

export default router;