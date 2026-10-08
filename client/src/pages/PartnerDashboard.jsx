import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import socket from "../socket";

function PartnerDashboard() {
  const navigate = useNavigate();

  const [partner, setPartner] = useState(null);
  const [pendingRequests, setPendingRequests] =
    useState([]);
  const [assignedRequests, setAssignedRequests] =
    useState([]);

  const [loading, setLoading] = useState(true);
  const [
    updatingAvailability,
    setUpdatingAvailability
  ] = useState(false);

  const [tracking, setTracking] = useState(false);

  const [costInputs, setCostInputs] =
    useState({});

  const [savingCost, setSavingCost] =
    useState({});

  const watchIdRef = useRef(null);

  const token =
    localStorage.getItem("token");

  const api = axios.create({
    baseURL: "http://localhost:5000/api",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    loadDashboard();

    return () => {
      stopLiveTracking();
    };
  }, [token, navigate]);

  // Listen for real-time service request
  // updates from customers and the backend.
  useEffect(() => {
    if (!token) {
      return;
    }

    const handleServiceRequestUpdated =
      (updatedRequest) => {
        if (!updatedRequest?._id) {
          return;
        }

        setAssignedRequests(
          (previousRequests) => {
            const requestExists =
              previousRequests.some(
                (request) =>
                  request._id ===
                  updatedRequest._id
              );

            if (!requestExists) {
              return previousRequests;
            }

            return previousRequests.map(
              (request) =>
                request._id ===
                updatedRequest._id
                  ? updatedRequest
                  : request
            );
          }
        );

        // Keep the cost input synchronized
        // with the latest server value.
        setCostInputs(
          (previousInputs) => ({
            ...previousInputs,

            [updatedRequest._id]:
              updatedRequest
                .estimatedCost ?? 0
          })
        );
      };

    socket.on(
      "serviceRequestUpdated",
      handleServiceRequestUpdated
    );

    return () => {
      socket.off(
        "serviceRequestUpdated",
        handleServiceRequestUpdated
      );
    };
  }, [token]);

  // Join Socket.IO rooms for all assigned
  // service requests.
  useEffect(() => {
    if (
      !assignedRequests ||
      assignedRequests.length === 0
    ) {
      return;
    }

    assignedRequests.forEach(
      (request) => {
        if (request?._id) {
          socket.emit(
            "joinServiceRequest",
            request._id
          );
        }
      }
    );
  }, [assignedRequests]);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const profileResponse =
        await api.get(
          "/partners/me"
        );

      const partnerData =
        profileResponse.data.partner;

      setPartner(partnerData);

      const [
        pendingResponse,
        assignedResponse
      ] = await Promise.all([
        api.get(
          "/partners/requests"
        ),
        api.get(
          "/partners/my-requests"
        )
      ]);

      const pending =
        pendingResponse.data.requests ||
        [];

      const assigned =
        assignedResponse.data.requests ||
        [];

      setPendingRequests(
        pending
      );

      setAssignedRequests(
        assigned
      );

      // Initialize cost inputs from
      // current estimated costs.
      const initialCosts = {};

      assigned.forEach(
        (request) => {
          initialCosts[
            request._id
          ] =
            request.estimatedCost ??
            0;
        }
      );

      setCostInputs(
        initialCosts
      );
    } catch (error) {
      if (
        error.response?.status ===
        404
      ) {
        navigate("/partner-profile");
        return;
      }

      if (
        error.response?.status ===
          401 ||
        error.response?.status ===
          403
      ) {
        alert(
          error.response?.data?.message ||
            "You do not have access to the partner dashboard."
        );

        navigate("/dashboard");
        return;
      }

      console.error(
        "Failed to load partner dashboard:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to load partner dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  // Toggle partner availability
  const toggleAvailability =
    async () => {
      if (!partner) {
        return;
      }

      if (!partner.verified) {
        alert(
          "Your partner account must be verified by an admin before changing availability."
        );

        return;
      }

      const newAvailability =
        !partner.available;

      try {
        setUpdatingAvailability(
          true
        );

        const response =
          await api.put(
            "/partners/availability",
            {
              available:
                newAvailability
            }
          );

        setPartner(
          (previous) => ({
            ...previous,

            available:
              response.data.available
          })
        );

        alert(
          response.data.message
        );
      } catch (error) {
        alert(
          error.response?.data
            ?.message ||
            "Failed to update availability."
        );
      } finally {
        setUpdatingAvailability(
          false
        );
      }
    };

  // Start continuous location tracking
  const startLiveTracking =
    () => {
      if (!navigator.geolocation) {
        alert(
          "Geolocation is not supported by your browser."
        );

        return;
      }

      if (!partner?.verified) {
        alert(
          "Your partner account must be verified before sharing live location."
        );

        return;
      }

      if (!partner?.available) {
        alert(
          "You are currently unavailable. Turn availability ON before starting live tracking."
        );

        return;
      }

      if (
        watchIdRef.current !== null
      ) {
        return;
      }

      setTracking(true);

      watchIdRef.current =
        navigator.geolocation.watchPosition(
          async (position) => {
            const latitude =
              position.coords
                .latitude;

            const longitude =
              position.coords
                .longitude;

            try {
              await api.put(
                "/partners/location",
                {
                  latitude,
                  longitude
                }
              );

              setPartner(
                (previous) => ({
                  ...previous,

                  location: {
                    latitude,
                    longitude
                  }
                })
              );
            } catch (error) {
              console.error(
                "Failed to send location:",
                error
              );
            }
          },
          (error) => {
            console.error(
              "Geolocation error:",
              error
            );

            setTracking(false);

            watchIdRef.current =
              null;

            alert(
              "Unable to access your live location. Please allow location permission."
            );
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 5000
          }
        );
    };

  // Stop continuous location tracking
  const stopLiveTracking =
    () => {
      if (
        watchIdRef.current !== null
      ) {
        navigator.geolocation.clearWatch(
          watchIdRef.current
        );

        watchIdRef.current =
          null;
      }

      setTracking(false);
    };

  const acceptRequest =
    async (requestId) => {
      try {
        const response =
          await api.put(
            `/partners/requests/${requestId}/accept`
          );

        alert(
          response.data.message
        );

        await loadDashboard();
      } catch (error) {
        alert(
          error.response?.data
            ?.message ||
            "Failed to accept service request."
        );
      }
    };

  const updateStatus =
    async (
      requestId,
      status
    ) => {
      try {
        const response =
          await api.put(
            `/partners/requests/${requestId}/status`,
            {
              status
            }
          );

        alert(
          response.data.message
        );

        await loadDashboard();
      } catch (error) {
        alert(
          error.response?.data
            ?.message ||
            "Failed to update service status."
        );
      }
    };

  // Update estimated service cost
  const updateCost =
    async (requestId) => {
      const value =
        costInputs[requestId];

      const numericCost =
        Number(value);

      if (
        value === "" ||
        !Number.isFinite(
          numericCost
        ) ||
        numericCost < 0
      ) {
        alert(
          "Please enter a valid service cost."
        );

        return;
      }

      try {
        setSavingCost(
          (previous) => ({
            ...previous,

            [requestId]: true
          })
        );

        const response =
          await api.put(
            `/partners/requests/${requestId}/cost`,
            {
              estimatedCost:
                numericCost
            }
          );

        const updatedRequest =
          response.data.request;

        setAssignedRequests(
          (previousRequests) =>
            previousRequests.map(
              (request) =>
                request._id ===
                requestId
                  ? updatedRequest
                  : request
            )
        );

        setCostInputs(
          (previousInputs) => ({
            ...previousInputs,

            [requestId]:
              updatedRequest.estimatedCost
          })
        );

        alert(
          response.data.message ||
            "Estimated service cost updated successfully."
        );
      } catch (error) {
        alert(
          error.response?.data
            ?.message ||
            "Failed to update estimated service cost."
        );
      } finally {
        setSavingCost(
          (previous) => ({
            ...previous,

            [requestId]: false
          })
        );
      }
    };

  const logout = () => {
    stopLiveTracking();

    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "user"
    );

    navigate("/");
  };

  const getStatusLabel =
    (status) => {
      const labels = {
        requested:
          "Requested",

        accepted:
          "Accepted",

        on_the_way:
          "On the Way",

        arrived:
          "Arrived",

        in_progress:
          "In Progress",

        completed:
          "Completed",

        cancelled:
          "Cancelled"
      };

      return (
        labels[status] ||
        status
      );
    };

  const getNextStatus =
    (status) => {
      const nextStatuses = {
        accepted: {
          value:
            "on_the_way",

          label:
            "Start Journey"
        },

        on_the_way: {
          value:
            "arrived",

          label:
            "Mark Arrived"
        },

        arrived: {
          value:
            "in_progress",

          label:
            "Start Service"
        },

        in_progress: {
          value:
            "completed",

          label:
            "Complete Service"
        }
      };

      return nextStatuses[
        status
      ];
    };

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loadingCard}>
          <div style={styles.loadingIcon}>
            🔧
          </div>

          <h2>
            Loading Partner Dashboard...
          </h2>

          <p>
            Please wait while we
            load your service
            partner information.
          </p>
        </div>
      </div>
    );
  }

  if (!partner) {
    return null;
  }

  const activeRequests =
    assignedRequests.filter(
      (request) =>
        [
          "accepted",
          "on_the_way",
          "arrived",
          "in_progress"
        ].includes(
          request.status
        )
    );

  const completedRequests =
    assignedRequests.filter(
      (request) =>
        request.status ===
        "completed"
    );

  return (
    <div style={styles.page}>
      {/* Header */}

      <header style={styles.header}>
        <div>
          <div style={styles.brand}>
            🚗 Roadside Assist
          </div>

          <div
            style={
              styles.headerSubtitle
            }
          >
            Service Partner Portal
          </div>
        </div>

        <div style={styles.headerRight}>
          <div
            style={
              styles.partnerMiniInfo
            }
          >
            <strong>
              {partner.businessName}
            </strong>

            <span>
              {partner.verified
                ? "✓ Verified Partner"
                : "⏳ Verification Pending"}
            </span>
          </div>

          <button
            onClick={logout}
            style={styles.logoutButton}
          >
            Logout
          </button>
        </div>
      </header>

      <main style={styles.container}>
        {/* Verification warning */}

        {!partner.verified && (
          <div
            style={
              styles.warningBanner
            }
          >
            <div
              style={
                styles.warningIcon
              }
            >
              ⏳
            </div>

            <div>
              <strong>
                Verification Pending
              </strong>

              <p>
                Your partner account is
                waiting for admin
                verification. You cannot
                accept service requests
                or share live location
                until your account is
                verified.
              </p>
            </div>
          </div>
        )}

        {/* Top section */}

        <section style={styles.heroSection}>
          <div>
            <p style={styles.eyebrow}>
              PARTNER DASHBOARD
            </p>

            <h1 style={styles.title}>
              Welcome,{" "}
              {partner.businessName}
            </h1>

            <p style={styles.subtitle}>
              Manage roadside assistance
              requests, update service
              status, set estimated costs
              and share your live location
              with customers.
            </p>
          </div>

          {/* Availability Card */}

          <div
            style={{
              ...styles.availabilityCard,

              borderColor:
                partner.available
                  ? "#86efac"
                  : "#fecaca",

              background:
                partner.available
                  ? "#f0fdf4"
                  : "#fef2f2"
            }}
          >
            <div
              style={
                styles.availabilityTop
              }
            >
              <div>
                <div
                  style={
                    styles.availabilityLabel
                  }
                >
                  SERVICE AVAILABILITY
                </div>

                <div
                  style={{
                    ...styles.availabilityStatus,

                    color:
                      partner.available
                        ? "#15803d"
                        : "#dc2626"
                  }}
                >
                  <span
                    style={{
                      ...styles.statusDot,

                      background:
                        partner.available
                          ? "#22c55e"
                          : "#ef4444"
                    }}
                  />

                  {partner.available
                    ? "Available"
                    : "Unavailable"}
                </div>
              </div>

              <button
                onClick={
                  toggleAvailability
                }
                disabled={
                  updatingAvailability ||
                  !partner.verified
                }
                style={{
                  ...styles.toggleButton,

                  background:
                    partner.available
                      ? "#dc2626"
                      : "#16a34a",

                  opacity:
                    updatingAvailability ||
                    !partner.verified
                      ? 0.6
                      : 1,

                  cursor:
                    updatingAvailability ||
                    !partner.verified
                      ? "not-allowed"
                      : "pointer"
                }}
              >
                {updatingAvailability
                  ? "Updating..."
                  : partner.available
                  ? "Go Unavailable"
                  : "Go Available"}
              </button>
            </div>

            <p
              style={
                styles.availabilityText
              }
            >
              {partner.available
                ? "You can receive and accept new service requests."
                : "You will not be able to accept new service requests."}
            </p>
          </div>
        </section>

        {/* Statistics */}

        <section style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>
              📥
            </div>

            <div>
              <div
                style={
                  styles.statNumber
                }
              >
                {pendingRequests.length}
              </div>

              <div
                style={
                  styles.statLabel
                }
              >
                Incoming Requests
              </div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>
              🚗
            </div>

            <div>
              <div
                style={
                  styles.statNumber
                }
              >
                {activeRequests.length}
              </div>

              <div
                style={
                  styles.statLabel
                }
              >
                Active Services
              </div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>
              ✅
            </div>

            <div>
              <div
                style={
                  styles.statNumber
                }
              >
                {completedRequests.length}
              </div>

              <div
                style={
                  styles.statLabel
                }
              >
                Completed Services
              </div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>
              ⭐
            </div>

            <div>
              <div
                style={
                  styles.statNumber
                }
              >
                {Number(
                  partner.rating || 5
                ).toFixed(1)}
              </div>

              <div
                style={
                  styles.statLabel
                }
              >
                Partner Rating
              </div>
            </div>
          </div>
        </section>

        {/* Live Tracking */}

        <section style={styles.trackingCard}>
          <div>
            <p
              style={
                styles.sectionEyebrow
              }
            >
              LIVE LOCATION
            </p>

            <h2
              style={
                styles.sectionTitle
              }
            >
              Share Your Location
            </h2>

            <p
              style={
                styles.sectionDescription
              }
            >
              Your live location allows
              customers to track your
              approach after you accept
              their service request.
            </p>
          </div>

          <div
            style={
              styles.trackingRight
            }
          >
            <div
              style={{
                ...styles.trackingStatus,

                color: tracking
                  ? "#15803d"
                  : "#64748b"
              }}
            >
              <span
                style={{
                  ...styles.statusDot,

                  background: tracking
                    ? "#22c55e"
                    : "#94a3b8"
                }}
              />

              {tracking
                ? "Live tracking active"
                : "Live tracking inactive"}
            </div>

            {!tracking ? (
              <button
                onClick={
                  startLiveTracking
                }
                disabled={
                  !partner.verified ||
                  !partner.available
                }
                style={{
                  ...styles.primaryButton,

                  opacity:
                    !partner.verified ||
                    !partner.available
                      ? 0.6
                      : 1,

                  cursor:
                    !partner.verified ||
                    !partner.available
                      ? "not-allowed"
                      : "pointer"
                }}
              >
                📍 Start Live Tracking
              </button>
            ) : (
              <button
                onClick={
                  stopLiveTracking
                }
                style={
                  styles.dangerButton
                }
              >
                ⛔ Stop Live Tracking
              </button>
            )}
          </div>
        </section>

        {/* Incoming Requests */}

        <section style={styles.section}>
          <div
            style={
              styles.sectionHeader
            }
          >
            <div>
              <p
                style={
                  styles.sectionEyebrow
                }
              >
                NEW REQUESTS
              </p>

              <h2
                style={
                  styles.sectionTitle
                }
              >
                Incoming Service Requests
              </h2>
            </div>

            <button
              onClick={
                loadDashboard
              }
              style={
                styles.refreshButton
              }
            >
              ↻ Refresh
            </button>
          </div>

          {pendingRequests.length ===
          0 ? (
            <div
              style={
                styles.emptyCard
              }
            >
              <div
                style={
                  styles.emptyIcon
                }
              >
                📭
              </div>

              <h3>
                No pending requests
              </h3>

              <p>
                New roadside assistance
                requests will appear
                here.
              </p>
            </div>
          ) : (
            <div
              style={
                styles.requestGrid
              }
            >
              {pendingRequests.map(
                (request) => (
                  <div
                    key={
                      request._id
                    }
                    style={
                      styles.requestCard
                    }
                  >
                    <div
                      style={
                        styles.requestTop
                      }
                    >
                      <div>
                        <span
                          style={
                            styles.serviceBadge
                          }
                        >
                          {
                            request.serviceType
                          }
                        </span>

                        <h3
                          style={
                            styles.requestTitle
                          }
                        >
                          {request.vehicle
                            ?.make}{" "}
                          {request.vehicle
                            ?.model}
                        </h3>
                      </div>

                      <span
                        style={
                          styles.pendingBadge
                        }
                      >
                        New
                      </span>
                    </div>

                    <div
                      style={
                        styles.requestDetails
                      }
                    >
                      <p>
                        <strong>
                          Customer:
                        </strong>{" "}
                        {request.user
                          ?.name ||
                          "Customer"}
                      </p>

                      <p>
                        <strong>
                          Phone:
                        </strong>{" "}
                        {request.user
                          ?.phone ||
                          "Not available"}
                      </p>

                      <p>
                        <strong>
                          Vehicle:
                        </strong>{" "}
                        {request.vehicle
                          ?.registrationNumber ||
                          "Not available"}
                      </p>

                      <p>
                        <strong>
                          Location:
                        </strong>{" "}
                        {request.location
                          ?.address ||
                          "Location provided"}
                      </p>

                      {request.description && (
                        <p>
                          <strong>
                            Problem:
                          </strong>{" "}
                          {
                            request.description
                          }
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() =>
                        acceptRequest(
                          request._id
                        )
                      }
                      disabled={
                        !partner.verified ||
                        !partner.available
                      }
                      style={{
                        ...styles.acceptButton,

                        opacity:
                          !partner.verified ||
                          !partner.available
                            ? 0.5
                            : 1,

                        cursor:
                          !partner.verified ||
                          !partner.available
                            ? "not-allowed"
                            : "pointer"
                      }}
                    >
                      {!partner.verified
                        ? "Waiting for Verification"
                        : !partner.available
                        ? "Currently Unavailable"
                        : "✓ Accept Request"}
                    </button>
                  </div>
                )
              )}
            </div>
          )}
        </section>

        {/* Assigned Services */}

        <section style={styles.section}>
          <div
            style={
              styles.sectionHeader
            }
          >
            <div>
              <p
                style={
                  styles.sectionEyebrow
                }
              >
                MY SERVICES
              </p>

              <h2
                style={
                  styles.sectionTitle
                }
              >
                Assigned Service Requests
              </h2>
            </div>
          </div>

          {assignedRequests.length ===
          0 ? (
            <div
              style={
                styles.emptyCard
              }
            >
              <div
                style={
                  styles.emptyIcon
                }
              >
                🔧
              </div>

              <h3>
                No assigned services
              </h3>

              <p>
                Accepted service requests
                will appear here.
              </p>
            </div>
          ) : (
            <div
              style={
                styles.assignedList
              }
            >
              {assignedRequests.map(
                (request) => {
                  const nextStatus =
                    getNextStatus(
                      request.status
                    );

                  const canEditCost =
                    [
                      "accepted",
                      "on_the_way",
                      "arrived",
                      "in_progress"
                    ].includes(
                      request.status
                    );

                  return (
                    <div
                      key={
                        request._id
                      }
                      style={
                        styles.assignedCard
                      }
                    >
                      <div
                        style={
                          styles.assignedMain
                        }
                      >
                        <div
                          style={
                            styles.assignedIcon
                          }
                        >
                          🚗
                        </div>

                        <div
                          style={
                            styles.assignedInfo
                          }
                        >
                          <h3>
                            {request.vehicle
                              ?.make}{" "}
                            {request.vehicle
                              ?.model}
                          </h3>

                          <p>
                            {
                              request.serviceType
                            }
                          </p>

                          <p>
                            Customer:{" "}
                            {request.user
                              ?.name ||
                              "Customer"}
                          </p>

                          <p>
                            Phone:{" "}
                            {request.user
                              ?.phone ||
                              "Not available"}
                          </p>
                        </div>
                      </div>

                      <div
                        style={
                          styles.assignedActions
                        }
                      >
                        <span
                          style={{
                            ...styles.statusBadge,

                            background:
                              request.status ===
                              "completed"
                                ? "#dcfce7"
                                : request.status ===
                                  "cancelled"
                                ? "#fee2e2"
                                : "#dbeafe",

                            color:
                              request.status ===
                              "completed"
                                ? "#166534"
                                : request.status ===
                                  "cancelled"
                                ? "#b91c1c"
                                : "#1d4ed8"
                          }}
                        >
                          {getStatusLabel(
                            request.status
                          )}
                        </span>

                        {/* Estimated Cost */}

                        <div
                          style={
                            styles.costBox
                          }
                        >
                          <div
                            style={
                              styles.costLabel
                            }
                          >
                            ESTIMATED SERVICE COST
                          </div>

                          <div
                            style={
                              styles.costRow
                            }
                          >
                            <span
                              style={
                                styles.rupeeSymbol
                              }
                            >
                              ₹
                            </span>

                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={
                                costInputs[
                                  request._id
                                ] ??
                                request.estimatedCost ??
                                0
                              }
                              onChange={(e) =>
                                setCostInputs(
                                  (
                                    previous
                                  ) => ({
                                    ...previous,

                                    [request._id]:
                                      e.target.value
                                  })
                                )
                              }
                              disabled={
                                !canEditCost ||
                                !partner.verified
                              }
                              style={{
                                ...styles.costInput,

                                opacity:
                                  !canEditCost ||
                                  !partner.verified
                                    ? 0.6
                                    : 1
                              }}
                            />

                            <button
                              onClick={() =>
                                updateCost(
                                  request._id
                                )
                              }
                              disabled={
                                !canEditCost ||
                                !partner.verified ||
                                savingCost[
                                  request._id
                                ]
                              }
                              style={{
                                ...styles.costButton,

                                opacity:
                                  !canEditCost ||
                                  !partner.verified ||
                                  savingCost[
                                    request._id
                                  ]
                                    ? 0.6
                                    : 1,

                                cursor:
                                  !canEditCost ||
                                  !partner.verified ||
                                  savingCost[
                                    request._id
                                  ]
                                    ? "not-allowed"
                                    : "pointer"
                              }}
                            >
                              {savingCost[
                                request._id
                              ]
                                ? "Saving..."
                                : "Save Cost"}
                            </button>
                          </div>

                          <div
                            style={
                              styles.costHint
                            }
                          >
                            {canEditCost
                              ? "Customer will see the updated amount automatically."
                              : "Cost editing is unavailable for this service."}
                          </div>
                        </div>

                        {nextStatus && (
                          <button
                            onClick={() =>
                              updateStatus(
                                request._id,
                                nextStatus.value
                              )
                            }
                            style={
                              styles.statusButton
                            }
                          >
                            {
                              nextStatus.label
                            }
                          </button>
                        )}

                        {request.status ===
                          "completed" && (
                          <button
                            onClick={() =>
                              navigate(
                                "/service-history"
                              )
                            }
                            style={
                              styles.secondaryButton
                            }
                          >
                            View History
                          </button>
                        )}

                        {request.status ===
                          "cancelled" && (
                          <span
                            style={
                              styles.cancelledText
                            }
                          >
                            Customer cancelled
                            this request
                          </span>
                        )}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </section>

        {/* Partner Profile */}

        <section style={styles.profileCard}>
          <div>
            <p
              style={
                styles.sectionEyebrow
              }
            >
              PARTNER PROFILE
            </p>

            <h2
              style={
                styles.sectionTitle
              }
            >
              {partner.businessName}
            </h2>

            <p
              style={
                styles.profileText
              }
            >
              📞{" "}
              {partner.phone ||
                "Phone not provided"}
            </p>

            <p
              style={
                styles.profileText
              }
            >
              📍{" "}
              {partner.address ||
                "Address not provided"}
            </p>
          </div>

          <div>
            <h3
              style={
                styles.servicesHeading
              }
            >
              Services Offered
            </h3>

            <div
              style={
                styles.servicesList
              }
            >
              {partner.services?.map(
                (service) => (
                  <span
                    key={service}
                    style={
                      styles.serviceTag
                    }
                  >
                    {service}
                  </span>
                )
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)",
    color: "#0f172a",
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  },

  header: {
    minHeight: "76px",
    padding: "16px 5%",
    background:
      "rgba(255, 255, 255, 0.96)",
    borderBottom:
      "1px solid #e2e8f0",
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    gap: "20px",
    position: "sticky",
    top: 0,
    zIndex: 20,
    boxShadow:
      "0 4px 18px rgba(15, 23, 42, 0.06)"
  },

  brand: {
    fontSize: "22px",
    fontWeight: "800",
    color: "#0f172a"
  },

  headerSubtitle: {
    fontSize: "13px",
    color: "#64748b",
    marginTop: "3px"
  },

  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "18px"
  },

  partnerMiniInfo: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "3px"
  },

  logoutButton: {
    border: "none",
    background: "#0f172a",
    color: "#fff",
    padding:
      "10px 16px",
    borderRadius: "10px",
    fontWeight: "700",
    cursor: "pointer"
  },

  container: {
    width: "90%",
    maxWidth: "1250px",
    margin: "0 auto",
    padding: "34px 0 60px"
  },

  warningBanner: {
    display: "flex",
    alignItems: "flex-start",
    gap: "14px",
    padding: "18px 20px",
    background: "#fffbeb",
    border:
      "1px solid #fde68a",
    borderRadius: "16px",
    marginBottom: "24px",
    color: "#92400e"
  },

  warningIcon: {
    fontSize: "24px"
  },

  heroSection: {
    display: "grid",
    gridTemplateColumns:
      "1fr 420px",
    gap: "25px",
    alignItems: "stretch",
    marginBottom: "26px"
  },

  eyebrow: {
    margin: "0 0 8px",
    color: "#4f46e5",
    fontSize: "12px",
    fontWeight: "800",
    letterSpacing: "1.5px"
  },

  title: {
    margin: 0,
    fontSize:
      "clamp(30px, 4vw, 48px)",
    lineHeight: 1.1,
    fontWeight: "850"
  },

  subtitle: {
    maxWidth: "700px",
    margin: "14px 0 0",
    color: "#64748b",
    fontSize: "16px",
    lineHeight: 1.7
  },

  availabilityCard: {
    border: "1px solid",
    borderRadius: "20px",
    padding: "22px",
    boxShadow:
      "0 12px 30px rgba(15, 23, 42, 0.07)"
  },

  availabilityTop: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    gap: "15px"
  },

  availabilityLabel: {
    color: "#64748b",
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "1px",
    marginBottom: "8px"
  },

  availabilityStatus: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "21px",
    fontWeight: "800"
  },

  statusDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    display: "inline-block"
  },

  toggleButton: {
    border: "none",
    color: "#fff",
    padding:
      "11px 15px",
    borderRadius: "10px",
    fontWeight: "800",
    cursor: "pointer",
    whiteSpace: "nowrap"
  },

  availabilityText: {
    margin:
      "16px 0 0",
    color: "#64748b",
    fontSize: "13px",
    lineHeight: 1.5
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, 1fr)",
    gap: "18px",
    marginBottom: "26px"
  },

  statCard: {
    background: "#fff",
    border:
      "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    boxShadow:
      "0 8px 25px rgba(15, 23, 42, 0.05)"
  },

  statIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    background: "#eef2ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px"
  },

  statNumber: {
    fontSize: "25px",
    fontWeight: "850"
  },

  statLabel: {
    color: "#64748b",
    fontSize: "13px",
    marginTop: "3px"
  },

  trackingCard: {
    background: "#0f172a",
    color: "#fff",
    borderRadius: "20px",
    padding: "26px",
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    gap: "25px",
    marginBottom: "32px",
    boxShadow:
      "0 18px 35px rgba(15, 23, 42, 0.16)"
  },

  trackingRight: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
    flexWrap: "wrap",
    justifyContent:
      "flex-end"
  },

  trackingStatus: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontWeight: "700",
    whiteSpace: "nowrap"
  },

  primaryButton: {
    border: "none",
    background: "#4f46e5",
    color: "#fff",
    padding:
      "12px 18px",
    borderRadius: "10px",
    fontWeight: "800",
    cursor: "pointer"
  },

  dangerButton: {
    border: "none",
    background: "#dc2626",
    color: "#fff",
    padding:
      "12px 18px",
    borderRadius: "10px",
    fontWeight: "800",
    cursor: "pointer"
  },

  section: {
    marginBottom: "34px"
  },

  sectionHeader: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "flex-end",
    gap: "15px",
    marginBottom: "18px"
  },

  sectionEyebrow: {
    margin: "0 0 6px",
    color: "#4f46e5",
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "1.4px"
  },

  sectionTitle: {
    margin: 0,
    fontSize: "25px",
    fontWeight: "850"
  },

  sectionDescription: {
    maxWidth: "650px",
    color: "#cbd5e1",
    lineHeight: 1.6,
    margin:
      "8px 0 0"
  },

  refreshButton: {
    border:
      "1px solid #cbd5e1",
    background: "#fff",
    color: "#334155",
    padding:
      "9px 14px",
    borderRadius: "9px",
    fontWeight: "700",
    cursor: "pointer"
  },

  requestGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, 1fr)",
    gap: "18px"
  },

  requestCard: {
    background: "#fff",
    border:
      "1px solid #e2e8f0",
    borderRadius: "18px",
    padding: "21px",
    boxShadow:
      "0 8px 25px rgba(15, 23, 42, 0.05)"
  },

  requestTop: {
    display: "flex",
    justifyContent:
      "space-between",
    gap: "15px"
  },

  serviceBadge: {
    display: "inline-block",
    background: "#eef2ff",
    color: "#4338ca",
    borderRadius: "999px",
    padding:
      "5px 10px",
    fontSize: "11px",
    fontWeight: "800"
  },

  pendingBadge: {
    background: "#dcfce7",
    color: "#166534",
    borderRadius: "999px",
    padding:
      "5px 10px",
    fontSize: "11px",
    fontWeight: "800",
    height: "fit-content"
  },

  requestTitle: {
    margin:
      "13px 0 0",
    fontSize: "20px"
  },

  requestDetails: {
    margin:
      "16px 0",
    color: "#475569",
    fontSize: "13px",
    lineHeight: 1.65
  },

  acceptButton: {
    width: "100%",
    border: "none",
    background: "#16a34a",
    color: "#fff",
    padding:
      "12px 15px",
    borderRadius: "10px",
    fontWeight: "800"
  },

  emptyCard: {
    background: "#fff",
    border:
      "1px solid #e2e8f0",
    borderRadius: "18px",
    padding: "42px 20px",
    textAlign: "center",
    color: "#64748b"
  },

  emptyIcon: {
    fontSize: "38px",
    marginBottom: "8px"
  },

  assignedList: {
    display: "flex",
    flexDirection: "column",
    gap: "14px"
  },

  assignedCard: {
    background: "#fff",
    border:
      "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "18px",
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "flex-start",
    gap: "20px",
    boxShadow:
      "0 7px 22px rgba(15, 23, 42, 0.04)"
  },

  assignedMain: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    minWidth: "220px"
  },

  assignedIcon: {
    width: "50px",
    height: "50px",
    borderRadius: "14px",
    background: "#eef2ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    flexShrink: 0
  },

  assignedInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "3px"
  },

  assignedActions: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
    justifyContent:
      "flex-end",
    flex: 1
  },

  statusBadge: {
    borderRadius: "999px",
    padding:
      "7px 11px",
    fontSize: "11px",
    fontWeight: "800",
    whiteSpace: "nowrap"
  },

  statusButton: {
    border: "none",
    background: "#4f46e5",
    color: "#fff",
    padding:
      "10px 13px",
    borderRadius: "9px",
    fontWeight: "800",
    cursor: "pointer"
  },

  secondaryButton: {
    border:
      "1px solid #cbd5e1",
    background: "#fff",
    color: "#334155",
    padding:
      "10px 13px",
    borderRadius: "9px",
    fontWeight: "800",
    cursor: "pointer"
  },

  costBox: {
    background: "#f8fafc",
    border:
      "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "12px",
    minWidth: "280px"
  },

  costLabel: {
    color: "#64748b",
    fontSize: "10px",
    fontWeight: "800",
    letterSpacing: "0.8px",
    marginBottom: "7px"
  },

  costRow: {
    display: "flex",
    alignItems: "center",
    gap: "7px"
  },

  rupeeSymbol: {
    fontSize: "17px",
    fontWeight: "800",
    color: "#334155"
  },

  costInput: {
    width: "95px",
    border:
      "1px solid #cbd5e1",
    borderRadius: "8px",
    padding:
      "8px 9px",
    fontSize: "14px",
    fontWeight: "700",
    outline: "none"
  },

  costButton: {
    border: "none",
    background: "#0f172a",
    color: "#fff",
    padding:
      "9px 11px",
    borderRadius: "8px",
    fontSize: "11px",
    fontWeight: "800",
    cursor: "pointer"
  },

  costHint: {
    marginTop: "7px",
    color: "#94a3b8",
    fontSize: "10px",
    lineHeight: 1.4
  },

  cancelledText: {
    color: "#b91c1c",
    fontSize: "12px",
    fontWeight: "700"
  },

  profileCard: {
    background: "#fff",
    border:
      "1px solid #e2e8f0",
    borderRadius: "20px",
    padding: "25px",
    display: "grid",
    gridTemplateColumns:
      "1fr 1fr",
    gap: "30px",
    boxShadow:
      "0 8px 25px rgba(15, 23, 42, 0.05)"
  },

  profileText: {
    color: "#64748b",
    fontSize: "14px",
    margin:
      "10px 0 0"
  },

  servicesHeading: {
    margin:
      "0 0 12px",
    fontSize: "16px"
  },

  servicesList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px"
  },

  serviceTag: {
    background: "#f1f5f9",
    color: "#334155",
    borderRadius: "999px",
    padding:
      "7px 11px",
    fontSize: "12px",
    fontWeight: "700"
  },

  loadingPage: {
    minHeight: "100vh",
    background:
      "#f8fafc",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px"
  },

  loadingCard: {
    background: "#fff",
    border:
      "1px solid #e2e8f0",
    borderRadius: "20px",
    padding: "45px",
    textAlign: "center",
    maxWidth: "430px",
    boxShadow:
      "0 12px 30px rgba(15, 23, 42, 0.08)"
  },

  loadingIcon: {
    fontSize: "45px",
    marginBottom: "12px"
  }
};

export default PartnerDashboard;