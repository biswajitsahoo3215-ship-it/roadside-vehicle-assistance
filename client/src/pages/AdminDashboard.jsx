import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap
} from "react-leaflet";
import L from "leaflet";
import { useNavigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import socket from "../socket";
import { API_URL } from "../config";

// Fix Leaflet marker icons when using Vite.
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",

  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",

  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png"
});

// Customer marker
const customerIcon = L.divIcon({
  className: "custom-map-marker",

  html: `
    <div style="
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: #4f46e5;
      border: 4px solid white;
      box-shadow: 0 4px 15px rgba(15, 23, 42, 0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 19px;
    ">
      🚗
    </div>
  `,

  iconSize: [38, 38],
  iconAnchor: [19, 19],
  popupAnchor: [0, -20]
});

// Partner marker
const partnerIcon = L.divIcon({
  className: "custom-map-marker",

  html: `
    <div style="
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: #16a34a;
      border: 4px solid white;
      box-shadow: 0 4px 15px rgba(15, 23, 42, 0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 21px;
    ">
      🔧
    </div>
  `,

  iconSize: [42, 42],
  iconAnchor: [21, 21],
  popupAnchor: [0, -22]
});

// Automatically center the map when
// customer or partner coordinates change.
function MapUpdater({
  customerLocation,
  partnerLocation
}) {
  const map = useMap();

  useEffect(() => {
    const points = [];

    if (
      customerLocation &&
      Number.isFinite(
        customerLocation.latitude
      ) &&
      Number.isFinite(
        customerLocation.longitude
      )
    ) {
      points.push([
        customerLocation.latitude,
        customerLocation.longitude
      ]);
    }

    if (
      partnerLocation &&
      Number.isFinite(
        partnerLocation.latitude
      ) &&
      Number.isFinite(
        partnerLocation.longitude
      )
    ) {
      points.push([
        partnerLocation.latitude,
        partnerLocation.longitude
      ]);
    }

    if (points.length === 1) {
      map.setView(
        points[0],
        14,
        {
          animate: true
        }
      );
    }

    if (points.length === 2) {
      const bounds =
        L.latLngBounds(points);

      map.fitBounds(
        bounds,
        {
          padding: [60, 60],
          maxZoom: 15,
          animate: true
        }
      );
    }
  }, [
    customerLocation,
    partnerLocation,
    map
  ]);

  return null;
}

function LiveTracking() {
  const navigate = useNavigate();

  const [requests, setRequests] =
    useState([]);

  const [
    selectedRequestId,
    setSelectedRequestId
  ] = useState("");

  const [
    selectedRequest,
    setSelectedRequest
  ] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [
    partnerLocation,
    setPartnerLocation
  ] = useState(null);

  const [
    customerLocation,
    setCustomerLocation
  ] = useState(null);

  const [
    socketConnected,
    setSocketConnected
  ] = useState(socket.connected);

  const token =
    localStorage.getItem("token");

  const activeRequests = useMemo(() => {
    return requests.filter(
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
  }, [requests]);

  // Fetch active service requests.
  const fetchRequests = async () => {
    try {
      setLoading(true);

      const response =
        await axios.get(
          `${API_URL}/service-requests`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );

      const allRequests =
        response.data.requests ||
        [];

      const active =
        allRequests.filter(
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

      setRequests(active);

      setSelectedRequestId(
        (previousId) => {
          const stillExists =
            active.some(
              (request) =>
                request._id ===
                previousId
            );

          if (stillExists) {
            return previousId;
          }

          return active[0]?._id || "";
        }
      );
    } catch (error) {
      console.error(
        "Failed to fetch active service requests:",
        error
      );

      if (
        error.response?.status ===
        401
      ) {
        localStorage.removeItem(
          "token"
        );

        localStorage.removeItem(
          "user"
        );

        navigate("/");

        return;
      }

      alert(
        error.response?.data?.message ||
          "Failed to load live tracking."
      );
    } finally {
      setLoading(false);
    }
  };

  // Initial authentication and loading.
  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    fetchRequests();
  }, [token, navigate]);

  // Set the selected request object.
  useEffect(() => {
    const request =
      activeRequests.find(
        (item) =>
          item._id ===
          selectedRequestId
      );

    setSelectedRequest(
      request || null
    );
  }, [
    activeRequests,
    selectedRequestId
  ]);

  // Get customer coordinates.
  useEffect(() => {
    if (!selectedRequest) {
      setCustomerLocation(null);
      return;
    }

    const latitude =
      Number(
        selectedRequest.location
          ?.latitude
      );

    const longitude =
      Number(
        selectedRequest.location
          ?.longitude
      );

    if (
      Number.isFinite(latitude) &&
      Number.isFinite(longitude)
    ) {
      setCustomerLocation({
        latitude,
        longitude
      });
    } else {
      setCustomerLocation(null);
    }
  }, [selectedRequest]);

  // Get partner's saved coordinates.
  useEffect(() => {
    if (!selectedRequest) {
      setPartnerLocation(null);
      return;
    }

    const latitude =
      Number(
        selectedRequest.partner
          ?.location?.latitude
      );

    const longitude =
      Number(
        selectedRequest.partner
          ?.location?.longitude
      );

    if (
      Number.isFinite(latitude) &&
      Number.isFinite(longitude)
    ) {
      setPartnerLocation({
        latitude,
        longitude
      });
    } else {
      setPartnerLocation(null);
    }
  }, [selectedRequest]);

  // Socket connection status.
  useEffect(() => {
    const handleConnect = () => {
      setSocketConnected(true);
    };

    const handleDisconnect = () => {
      setSocketConnected(false);
    };

    socket.on(
      "connect",
      handleConnect
    );

    socket.on(
      "disconnect",
      handleDisconnect
    );

    setSocketConnected(
      socket.connected
    );

    return () => {
      socket.off(
        "connect",
        handleConnect
      );

      socket.off(
        "disconnect",
        handleDisconnect
      );
    };
  }, []);

  // Join selected service request room.
  useEffect(() => {
    if (!selectedRequestId) {
      return;
    }

    socket.emit(
      "joinServiceRequest",
      selectedRequestId
    );
  }, [selectedRequestId]);

  // Listen for live location and
  // service request updates.
  useEffect(() => {
    const handlePartnerLocationUpdated =
      (locationData) => {
        if (
          !locationData?.requestId
        ) {
          return;
        }

        if (
          String(
            locationData.requestId
          ) !==
          String(
            selectedRequestId
          )
        ) {
          return;
        }

        const latitude =
          Number(
            locationData.latitude
          );

        const longitude =
          Number(
            locationData.longitude
          );

        if (
          !Number.isFinite(
            latitude
          ) ||
          !Number.isFinite(
            longitude
          )
        ) {
          return;
        }

        setPartnerLocation({
          latitude,
          longitude
        });
      };

    const handleServiceRequestUpdated =
      (updatedRequest) => {
        if (
          !updatedRequest?._id
        ) {
          return;
        }

        // Remove completed/cancelled
        // requests from active tracking.
        if (
          [
            "completed",
            "cancelled"
          ].includes(
            updatedRequest.status
          )
        ) {
          setRequests(
            (previousRequests) =>
              previousRequests.filter(
                (request) =>
                  request._id !==
                  updatedRequest._id
              )
          );

          if (
            String(
              updatedRequest._id
            ) ===
            String(
              selectedRequestId
            )
          ) {
            setSelectedRequestId(
              ""
            );

            setSelectedRequest(
              null
            );

            setPartnerLocation(
              null
            );
          }

          return;
        }

        // Update existing request.
        setRequests(
          (previousRequests) =>
            previousRequests.map(
              (request) =>
                request._id ===
                updatedRequest._id
                  ? {
                      ...request,
                      ...updatedRequest
                    }
                  : request
            )
        );
      };

    socket.on(
      "partnerLocationUpdated",
      handlePartnerLocationUpdated
    );

    socket.on(
      "serviceRequestUpdated",
      handleServiceRequestUpdated
    );

    return () => {
      socket.off(
        "partnerLocationUpdated",
        handlePartnerLocationUpdated
      );

      socket.off(
        "serviceRequestUpdated",
        handleServiceRequestUpdated
      );
    };
  }, [selectedRequestId]);

  const handleRequestChange = (
    event
  ) => {
    setSelectedRequestId(
      event.target.value
    );

    setPartnerLocation(null);
  };

  const getStatusInfo = (
    status
  ) => {
    const statusMap = {
      accepted: {
        label: "Mechanic Accepted",
        background: "#dbeafe",
        color: "#1d4ed8"
      },

      on_the_way: {
        label: "Mechanic On the Way",
        background: "#e0e7ff",
        color: "#4338ca"
      },

      arrived: {
        label: "Mechanic Arrived",
        background: "#ede9fe",
        color: "#6d28d9"
      },

      in_progress: {
        label: "Service In Progress",
        background: "#cffafe",
        color: "#0e7490"
      },

      completed: {
        label: "Completed",
        background: "#dcfce7",
        color: "#166534"
      },

      cancelled: {
        label: "Cancelled",
        background: "#fee2e2",
        color: "#b91c1c"
      }
    };

    return (
      statusMap[status] || {
        label: status,
        background: "#f1f5f9",
        color: "#475569"
      }
    );
  };

  const formatDate = (
    date
  ) => {
    if (!date) {
      return "N/A";
    }

    return new Date(
      date
    ).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short"
    });
  };

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loadingCard}>
          <div style={styles.loadingIcon}>
            🚗
          </div>

          <h2>
            Loading Live Tracking
          </h2>

          <p>
            Please wait while we
            connect you to your
            roadside assistance
            service.
          </p>
        </div>
      </div>
    );
  }

  if (
    !loading &&
    activeRequests.length === 0
  ) {
    return (
      <div style={styles.page}>
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
              Live Mechanic Tracking
            </div>
          </div>

          <div
            style={styles.headerActions}
          >
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
              ← Service History
            </button>

            <button
              onClick={() =>
                navigate(
                  "/dashboard"
                )
              }
              style={
                styles.primaryButton
              }
            >
              Dashboard
            </button>
          </div>
        </header>

        <main style={styles.container}>
          <section
            style={styles.emptyCard}
          >
            <div
              style={styles.emptyIcon}
            >
              📍
            </div>

            <h1>
              No Active Service
            </h1>

            <p>
              You don't have an active
              roadside assistance
              request to track right now.
            </p>

            <div
              style={styles.emptyActions}
            >
              <button
                onClick={() =>
                  navigate(
                    "/request-assistance"
                  )
                }
                style={
                  styles.primaryButton
                }
              >
                Request Assistance
              </button>

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
                Service History
              </button>
            </div>
          </section>
        </main>
      </div>
    );
  }

  const statusInfo =
    getStatusInfo(
      selectedRequest?.status
    );

  const mapCenter =
    customerLocation
      ? [
          customerLocation.latitude,
          customerLocation.longitude
        ]
      : partnerLocation
        ? [
            partnerLocation.latitude,
            partnerLocation.longitude
          ]
        : [
            20.2961,
            85.8245
          ];

  return (
    <div style={styles.page}>
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
            Live Mechanic Tracking
          </div>
        </div>

        <div
          style={styles.headerActions}
        >
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
            ← Service History
          </button>

          <button
            onClick={() =>
              navigate(
                "/dashboard"
              )
            }
            style={
              styles.primaryButton
            }
          >
            Dashboard
          </button>
        </div>
      </header>

      <main style={styles.container}>
        {/* Heading */}

        <section style={styles.hero}>
          <div>
            <p style={styles.eyebrow}>
              LIVE LOCATION
            </p>

            <h1 style={styles.title}>
              Track Your Mechanic
            </h1>

            <p
              style={
                styles.subtitle
              }
            >
              Follow your assigned
              roadside assistance
              partner in real time.
            </p>
          </div>

          <div
            style={
              socketConnected
                ? styles.connectedBadge
                : styles.disconnectedBadge
            }
          >
            <span
              style={
                styles.connectionDot
              }
            />

            {socketConnected
              ? "Live Connection"
              : "Connection Lost"}
          </div>
        </section>

        {/* Request selector */}

        {activeRequests.length > 0 && (
          <section
            style={
              styles.selectorCard
            }
          >
            <div>
              <p
                style={
                  styles.selectorLabel
                }
              >
                ACTIVE SERVICE REQUESTS
              </p>

              <h2
                style={
                  styles.selectorTitle
                }
              >
                Select a service to track
              </h2>
            </div>

            <select
              value={
                selectedRequestId
              }
              onChange={
                handleRequestChange
              }
              style={
                styles.requestSelect
              }
            >
              {activeRequests.map(
                (request) => (
                  <option
                    key={request._id}
                    value={
                      request._id
                    }
                  >
                    {request.serviceType}
                    {" - "}
                    {request.vehicle
                      ?.registrationNumber ||
                      "Vehicle"}
                  </option>
                )
              )}
            </select>
          </section>
        )}

        {selectedRequest && (
          <>
            {/* Request summary */}

            <section
              style={
                styles.summaryCard
              }
            >
              <div
                style={
                  styles.summaryTop
                }
              >
                <div>
                  <p
                    style={
                      styles.eyebrow
                    }
                  >
                    SERVICE REQUEST
                  </p>

                  <h2
                    style={
                      styles.serviceTitle
                    }
                  >
                    {
                      selectedRequest.serviceType
                    }
                  </h2>
                </div>

                <div
                  style={{
                    ...styles.statusBadge,
                    background:
                      statusInfo.background,
                    color:
                      statusInfo.color
                  }}
                >
                  {statusInfo.label}
                </div>
              </div>

              <div
                style={
                  styles.summaryGrid
                }
              >
                <div
                  style={
                    styles.summaryItem
                  }
                >
                  <span
                    style={
                      styles.summaryLabel
                    }
                  >
                    Vehicle
                  </span>

                  <strong>
                    {
                      selectedRequest
                        .vehicle
                        ?.make
                    }{" "}
                    {
                      selectedRequest
                        .vehicle
                        ?.model
                    }
                  </strong>

                  <span
                    style={
                      styles.summaryValue
                    }
                  >
                    {
                      selectedRequest
                        .vehicle
                        ?.registrationNumber
                    }
                  </span>
                </div>

                <div
                  style={
                    styles.summaryItem
                  }
                >
                  <span
                    style={
                      styles.summaryLabel
                    }
                  >
                    Requested
                  </span>

                  <strong>
                    {formatDate(
                      selectedRequest.createdAt
                    )}
                  </strong>
                </div>

                <div
                  style={
                    styles.summaryItem
                  }
                >
                  <span
                    style={
                      styles.summaryLabel
                    }
                  >
                    Estimated Cost
                  </span>

                  <strong>
                    ₹
                    {Number(
                      selectedRequest.estimatedCost ||
                        0
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </strong>
                </div>
              </div>
            </section>

            {/* Map */}

            <section
              style={styles.mapCard}
            >
              <div
                style={
                  styles.mapHeader
                }
              >
                <div>
                  <p
                    style={
                      styles.eyebrow
                    }
                  >
                    LIVE MAP
                  </p>

                  <h2
                    style={
                      styles.mapTitle
                    }
                  >
                    Mechanic Location
                  </h2>
                </div>

                <div
                  style={
                    styles.mapLegend
                  }
                >
                  <span
                    style={
                      styles.legendItem
                    }
                  >
                    <span
                      style={{
                        ...styles.legendDot,
                        background:
                          "#4f46e5"
                      }}
                    />
                    Your Location
                  </span>

                  <span
                    style={
                      styles.legendItem
                    }
                  >
                    <span
                      style={{
                        ...styles.legendDot,
                        background:
                          "#16a34a"
                      }}
                    />
                    Mechanic
                  </span>
                </div>
              </div>

              <div
                style={
                  styles.mapWrapper
                }
              >
                <MapContainer
                  center={mapCenter}
                  zoom={14}
                  scrollWheelZoom={true}
                  style={
                    styles.map
                  }
                >
                  <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <MapUpdater
                    customerLocation={
                      customerLocation
                    }
                    partnerLocation={
                      partnerLocation
                    }
                  />

                  {customerLocation && (
                    <Marker
                      position={[
                        customerLocation.latitude,
                        customerLocation.longitude
                      ]}
                      icon={
                        customerIcon
                      }
                    >
                      <Popup>
                        <strong>
                          Your Location
                        </strong>

                        <br />

                        {selectedRequest
                          .location
                          ?.address ||
                          "Service location"}
                      </Popup>
                    </Marker>
                  )}

                  {partnerLocation && (
                    <Marker
                      position={[
                        partnerLocation.latitude,
                        partnerLocation.longitude
                      ]}
                      icon={
                        partnerIcon
                      }
                    >
                      <Popup>
                        <strong>
                          Mechanic Location
                        </strong>

                        <br />

                        {
                          selectedRequest
                            .partner
                            ?.businessName
                        }
                      </Popup>
                    </Marker>
                  )}
                </MapContainer>
              </div>

              {!partnerLocation && (
                <div
                  style={
                    styles.locationNotice
                  }
                >
                  <span>
                    📍
                  </span>

                  Waiting for your mechanic's
                  live location...
                </div>
              )}

              {partnerLocation && (
                <div
                  style={
                    styles.liveNotice
                  }
                >
                  <span>
                    🟢
                  </span>

                  Mechanic location is
                  updating in real time.
                </div>
              )}
            </section>

            {/* Partner information */}

            {selectedRequest.partner && (
              <section
                style={
                  styles.partnerCard
                }
              >
                <div
                  style={
                    styles.partnerHeader
                  }
                >
                  <div
                    style={
                      styles.partnerAvatar
                    }
                  >
                    🔧
                  </div>

                  <div
                    style={
                      styles.partnerDetails
                    }
                  >
                    <p
                      style={
                        styles.detailLabel
                      }
                    >
                      ASSIGNED SERVICE PARTNER
                    </p>

                    <h2
                      style={
                        styles.partnerName
                      }
                    >
                      {
                        selectedRequest
                          .partner
                          .businessName
                      }
                    </h2>

                    <div
                      style={
                        styles.partnerMeta
                      }
                    >
                      <span>
                        ⭐{" "}
                        {
                          selectedRequest
                            .partner
                            .rating
                        }{" "}
                        / 5
                      </span>

                      <span>
                        📞{" "}
                        {
                          selectedRequest
                            .partner
                            .phone
                        }
                      </span>

                      <span>
                        {
                          selectedRequest
                            .partner
                            .verified
                            ? "✓ Verified Partner"
                            : "Partner"
                        }
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  style={
                    styles.infoGrid
                  }
                >
                  <div
                    style={
                      styles.infoCard
                    }
                  >
                    <div
                      style={
                        styles.infoIcon
                      }
                    >
                      📍
                    </div>

                    <div>
                      <strong
                        style={
                          styles.infoTitle
                        }
                      >
                        Service Location
                      </strong>

                      <p
                        style={
                          styles.infoText
                        }
                      >
                        {
                          selectedRequest
                            .location
                            ?.address ||
                          "Location shared"
                        }
                      </p>
                    </div>
                  </div>

                  <div
                    style={
                      styles.infoCard
                    }
                  >
                    <div
                      style={
                        styles.infoIcon
                      }
                    >
                      🛠️
                    </div>

                    <div>
                      <strong
                        style={
                          styles.infoTitle
                        }
                      >
                        Services
                      </strong>

                      <p
                        style={
                          styles.infoText
                        }
                      >
                        {
                          selectedRequest
                            .partner
                            .services
                            ?.join(
                              ", "
                            ) ||
                          selectedRequest
                            .serviceType
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Tracking information */}

            <section
              style={
                styles.trackingCard
              }
            >
              <div>
                <p
                  style={
                    styles.eyebrow
                  }
                >
                  TRACKING STATUS
                </p>

                <h2
                  style={
                    styles.trackingTitle
                  }
                >
                  {statusInfo.label}
                </h2>

                <p
                  style={
                    styles.trackingText
                  }
                >
                  {selectedRequest.status ===
                    "accepted" &&
                    "Your mechanic has accepted the request and will begin travelling to your location."}

                  {selectedRequest.status ===
                    "on_the_way" &&
                    "Your mechanic is currently travelling to your location."}

                  {selectedRequest.status ===
                    "arrived" &&
                    "Your mechanic has arrived at your service location."}

                  {selectedRequest.status ===
                    "in_progress" &&
                    "Your mechanic is currently working on your vehicle."}
                </p>
              </div>

              <div
                style={
                  styles.trackingSteps
                }
              >
                <TrackingStep
                  label="Accepted"
                  active={[
                    "accepted",
                    "on_the_way",
                    "arrived",
                    "in_progress"
                  ].includes(
                    selectedRequest.status
                  )}
                  completed={[
                    "on_the_way",
                    "arrived",
                    "in_progress"
                  ].includes(
                    selectedRequest.status
                  )}
                />

                <TrackingStep
                  label="On The Way"
                  active={[
                    "on_the_way",
                    "arrived",
                    "in_progress"
                  ].includes(
                    selectedRequest.status
                  )}
                  completed={[
                    "arrived",
                    "in_progress"
                  ].includes(
                    selectedRequest.status
                  )}
                />

                <TrackingStep
                  label="Arrived"
                  active={[
                    "arrived",
                    "in_progress"
                  ].includes(
                    selectedRequest.status
                  )}
                  completed={[
                    "in_progress"
                  ].includes(
                    selectedRequest.status
                  )}
                />

                <TrackingStep
                  label="Service"
                  active={
                    selectedRequest.status ===
                    "in_progress"
                  }
                  completed={false}
                />
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function TrackingStep({
  label,
  active,
  completed
}) {
  return (
    <div
      style={
        styles.trackingStep
      }
    >
      <div
        style={{
          ...styles.stepCircle,
          background:
            completed || active
              ? "#4f46e5"
              : "#e2e8f0",
          color:
            completed || active
              ? "#fff"
              : "#64748b"
        }}
      >
        {completed
          ? "✓"
          : active
            ? "●"
            : "○"}
      </div>

      <span
        style={{
          ...styles.stepLabel,
          color:
            completed || active
              ? "#1e293b"
              : "#94a3b8"
        }}
      >
        {label}
      </span>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    color: "#0f172a"
  },

  header: {
    background: "#fff",
    borderBottom:
      "1px solid #e2e8f0",
    padding:
      "16px 28px",
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    gap: "15px",
    flexWrap: "wrap",
    position: "sticky",
    top: 0,
    zIndex: 1000
  },

  brand: {
    fontSize: "20px",
    fontWeight: "900",
    color: "#4f46e5"
  },

  headerSubtitle: {
    fontSize: "11px",
    color: "#64748b",
    marginTop: "2px",
    fontWeight: "700"
  },

  headerActions: {
    display: "flex",
    gap: "9px",
    flexWrap: "wrap"
  },

  container: {
    maxWidth: "1180px",
    margin: "0 auto",
    padding:
      "30px 20px 60px"
  },

  hero: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "flex-end",
    gap: "20px",
    flexWrap: "wrap",
    marginBottom: "20px"
  },

  eyebrow: {
    margin: 0,
    color: "#6366f1",
    fontSize: "10px",
    fontWeight: "900",
    letterSpacing: "1.5px"
  },

  title: {
    margin:
      "5px 0 7px",
    fontSize: "34px",
    lineHeight: 1.1
  },

  subtitle: {
    margin: 0,
    color: "#64748b",
    fontSize: "14px",
    maxWidth: "650px"
  },

  connectedBadge: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    background: "#dcfce7",
    color: "#166534",
    padding:
      "9px 13px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "800"
  },

  disconnectedBadge: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    background: "#fee2e2",
    color: "#b91c1c",
    padding:
      "9px 13px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "800"
  },

  connectionDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background:
      "currentColor"
  },

  selectorCard: {
    background: "#fff",
    border:
      "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "18px",
    marginBottom: "18px",
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    gap: "15px",
    flexWrap: "wrap",
    boxShadow:
      "0 5px 18px rgba(15, 23, 42, 0.04)"
  },

  selectorLabel: {
    margin: 0,
    color: "#94a3b8",
    fontSize: "10px",
    fontWeight: "900",
    letterSpacing: "1px"
  },

  selectorTitle: {
    margin:
      "5px 0 0",
    fontSize: "18px"
  },

  requestSelect: {
    minWidth: "280px",
    padding:
      "11px 13px",
    border:
      "1px solid #cbd5e1",
    borderRadius: "10px",
    background: "#fff",
    color: "#334155",
    fontWeight: "700",
    outline: "none"
  },

  summaryCard: {
    background: "#fff",
    border:
      "1px solid #e2e8f0",
    borderRadius: "18px",
    padding: "22px",
    marginBottom: "18px",
    boxShadow:
      "0 7px 22px rgba(15, 23, 42, 0.04)"
  },

  summaryTop: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "flex-start",
    gap: "15px",
    flexWrap: "wrap",
    marginBottom: "18px"
  },

  serviceTitle: {
    margin:
      "5px 0 0",
    fontSize: "24px"
  },

  statusBadge: {
    padding:
      "8px 13px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "900"
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(190px, 1fr))",
    gap: "12px"
  },

  summaryItem: {
    background: "#f8fafc",
    borderRadius: "12px",
    padding: "14px",
    display: "flex",
    flexDirection: "column",
    gap: "5px"
  },

  summaryLabel: {
    color: "#94a3b8",
    fontSize: "10px",
    fontWeight: "900",
    letterSpacing: "0.7px"
  },

  summaryValue: {
    color: "#64748b",
    fontSize: "12px"
  },

  mapCard: {
    background: "#fff",
    border:
      "1px solid #e2e8f0",
    borderRadius: "18px",
    padding: "20px",
    marginBottom: "18px",
    boxShadow:
      "0 7px 22px rgba(15, 23, 42, 0.04)"
  },

  mapHeader: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    gap: "15px",
    flexWrap: "wrap",
    marginBottom: "14px"
  },

  mapTitle: {
    margin:
      "5px 0 0",
    fontSize: "20px"
  },

  mapLegend: {
    display: "flex",
    gap: "14px",
    flexWrap: "wrap"
  },

  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "11px",
    color: "#64748b",
    fontWeight: "700"
  },

  legendDot: {
    width: "9px",
    height: "9px",
    borderRadius: "50%"
  },

  mapWrapper: {
    height: "480px",
    borderRadius: "14px",
    overflow: "hidden",
    border:
      "1px solid #e2e8f0"
  },

  map: {
    height: "100%",
    width: "100%"
  },

  locationNotice: {
    marginTop: "12px",
    padding: "12px",
    borderRadius: "10px",
    background: "#fff7ed",
    color: "#9a3412",
    fontSize: "12px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    gap: "7px"
  },

  liveNotice: {
    marginTop: "12px",
    padding: "12px",
    borderRadius: "10px",
    background: "#f0fdf4",
    color: "#166534",
    fontSize: "12px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    gap: "7px"
  },

  partnerCard: {
    background: "#fff",
    border:
      "1px solid #e2e8f0",
    borderRadius: "18px",
    padding: "20px",
    marginBottom: "18px",
    boxShadow:
      "0 7px 22px rgba(15, 23, 42, 0.04)"
  },

  partnerHeader: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    marginBottom: "18px"
  },

  partnerAvatar: {
    width: "56px",
    height: "56px",
    borderRadius: "15px",
    background: "#dcfce7",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "27px"
  },

  partnerDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "4px"
  },

  detailLabel: {
    margin: 0,
    color: "#94a3b8",
    fontSize: "10px",
    fontWeight: "800",
    letterSpacing: "1px"
  },

  partnerName: {
    margin: 0,
    fontSize: "19px"
  },

  partnerMeta: {
    display: "flex",
    gap: "18px",
    flexWrap: "wrap",
    color: "#64748b",
    fontSize: "12px"
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns:
      "1fr 1fr",
    gap: "18px"
  },

  infoCard: {
    background: "#fff",
    border:
      "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "18px",
    display: "flex",
    alignItems: "flex-start",
    gap: "13px"
  },

  infoIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    background: "#eef2ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    flexShrink: 0
  },

  infoTitle: {
    fontSize: "14px"
  },

  infoText: {
    margin:
      "5px 0 0",
    color: "#64748b",
    fontSize: "12px",
    lineHeight: 1.5
  },

  trackingCard: {
    background: "#fff",
    border:
      "1px solid #e2e8f0",
    borderRadius: "18px",
    padding: "22px",
    marginBottom: "18px",
    boxShadow:
      "0 7px 22px rgba(15, 23, 42, 0.04)"
  },

  trackingTitle: {
    margin:
      "5px 0 7px",
    fontSize: "21px"
  },

  trackingText: {
    margin: 0,
    color: "#64748b",
    fontSize: "13px",
    lineHeight: 1.6
  },

  trackingSteps: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, 1fr)",
    gap: "10px",
    marginTop: "22px"
  },

  trackingStep: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "7px",
    textAlign: "center"
  },

  stepCircle: {
    width: "35px",
    height: "35px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "900",
    fontSize: "13px"
  },

  stepLabel: {
    fontSize: "11px",
    fontWeight: "800"
  },

  primaryButton: {
    border: "none",
    background: "#4f46e5",
    color: "#fff",
    padding:
      "11px 16px",
    borderRadius: "10px",
    fontWeight: "800",
    cursor: "pointer",
    whiteSpace: "nowrap"
  },

  secondaryButton: {
    border:
      "1px solid #cbd5e1",
    background: "#fff",
    color: "#334155",
    padding:
      "10px 15px",
    borderRadius: "10px",
    fontWeight: "800",
    cursor: "pointer",
    whiteSpace: "nowrap"
  },

  emptyCard: {
    background: "#fff",
    border:
      "1px solid #e2e8f0",
    borderRadius: "20px",
    padding: "60px 25px",
    textAlign: "center",
    boxShadow:
      "0 8px 25px rgba(15, 23, 42, 0.05)"
  },

  emptyIcon: {
    fontSize: "50px",
    marginBottom: "10px"
  },

  emptyActions: {
    display: "flex",
    justifyContent:
      "center",
    gap: "10px",
    marginTop: "20px",
    flexWrap: "wrap"
  },

  loadingPage: {
    minHeight: "100vh",
    background: "#f8fafc",
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

export default LiveTracking;