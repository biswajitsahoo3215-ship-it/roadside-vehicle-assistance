import { useEffect, useMemo, useState } from "react";

import { API_URL } from "../config";
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

        if (
          String(
            updatedRequest._id
          ) ===
          String(
            selectedRequestId
          )
        ) {
          setSelectedRequest(
            (previous) =>
              previous
                ? {
                    ...previous,
                    ...updatedRequest
                  }
                : updatedRequest
          );

          const latitude =
            Number(
              updatedRequest.partner
                ?.location
                ?.latitude
            );

          const longitude =
            Number(
              updatedRequest.partner
                ?.location
                ?.longitude
            );

          if (
            Number.isFinite(
              latitude
            ) &&
            Number.isFinite(
              longitude
            )
          ) {
            setPartnerLocation({
              latitude,
              longitude
            });
          }
        }
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
  }, [
    selectedRequestId
  ]);

  const handleRequestChange =
    (event) => {
      const requestId =
        event.target.value;

      setSelectedRequestId(
        requestId
      );

      setPartnerLocation(null);
    };

  const getStatusInfo =
    (status) => {
      const statusMap = {
        accepted: {
          label:
            "Mechanic Accepted",
          background:
            "#dbeafe",
          color:
            "#1d4ed8"
        },

        on_the_way: {
          label:
            "Mechanic On the Way",
          background:
            "#e0e7ff",
          color:
            "#4338ca"
        },

        arrived: {
          label:
            "Mechanic Arrived",
          background:
            "#ede9fe",
          color:
            "#6d28d9"
        },

        in_progress: {
          label:
            "Service In Progress",
          background:
            "#cffafe",
          color:
            "#0e7490"
        }
      };

      return (
        statusMap[status] || {
          label: status,
          background:
            "#f1f5f9",
          color:
            "#475569"
        }
      );
    };

  const getInitialMapCenter =
    () => {
      if (partnerLocation) {
        return [
          partnerLocation.latitude,
          partnerLocation.longitude
        ];
      }

      if (customerLocation) {
        return [
          customerLocation.latitude,
          customerLocation.longitude
        ];
      }

      return [
        20.2961,
        85.8245
      ];
    };

  const hasCustomerLocation =
    customerLocation &&
    Number.isFinite(
      customerLocation.latitude
    ) &&
    Number.isFinite(
      customerLocation.longitude
    );

  const hasPartnerLocation =
    partnerLocation &&
    Number.isFinite(
      partnerLocation.latitude
    ) &&
    Number.isFinite(
      partnerLocation.longitude
    );

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loadingCard}>
          <div
            style={
              styles.loadingIcon
            }
          >
            📍
          </div>

          <h2>
            Loading Live Tracking...
          </h2>

          <p>
            Please wait while we find
            your active service requests.
          </p>
        </div>
      </div>
    );
  }

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
            Live Mechanic Tracking
          </div>
        </div>

        <div
          style={
            styles.headerActions
          }
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

            <p style={styles.subtitle}>
              Follow your assigned roadside
              assistance partner in real time.
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
                    key={
                      request._id
                    }
                    value={
                      request._id
                    }
                  >
                    {request.serviceType}
                    {" — "}
                    {request.vehicle
                      ?.make ||
                      "Vehicle"}{" "}
                    {request.vehicle
                      ?.model ||
                      ""}
                  </option>
                )
              )}
            </select>
          </section>
        )}

        {/* No active requests */}

        {activeRequests.length ===
        0 ? (
          <section
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

            <h2>
              No Active Service
            </h2>

            <p>
              You currently don't have
              an active roadside assistance
              request to track.
            </p>

            <div
              style={
                styles.emptyActions
              }
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
                + New Request
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
                View History
              </button>
            </div>
          </section>
        ) : (
          <>
            {/* Selected request information */}

            {selectedRequest && (
              <section
                style={
                  styles.requestInfoCard
                }
              >
                <div
                  style={
                    styles.requestInfoMain
                  }
                >
                  <div
                    style={
                      styles.vehicleIcon
                    }
                  >
                    🚗
                  </div>

                  <div>
                    <span
                      style={
                        styles.serviceType
                      }
                    >
                      {
                        selectedRequest.serviceType
                      }
                    </span>

                    <h2
                      style={
                        styles.vehicleTitle
                      }
                    >
                      {selectedRequest
                        .vehicle
                        ?.make ||
                        "Vehicle"}{" "}
                      {selectedRequest
                        .vehicle
                        ?.model ||
                        ""}
                    </h2>

                    <p
                      style={
                        styles.registration
                      }
                    >
                      Registration:{" "}
                      {selectedRequest
                        .vehicle
                        ?.registrationNumber ||
                        "N/A"}
                    </p>
                  </div>
                </div>

                <div
                  style={
                    styles.requestStatusArea
                  }
                >
                  <span
                    style={{
                      ...styles.statusBadge,

                      background:
                        getStatusInfo(
                          selectedRequest.status
                        ).background,

                      color:
                        getStatusInfo(
                          selectedRequest.status
                        ).color
                    }}
                  >
                    {
                      getStatusInfo(
                        selectedRequest.status
                      ).label
                    }
                  </span>

                  <div
                    style={
                      styles.costDisplay
                    }
                  >
                    <span>
                      Estimated Cost
                    </span>

                    <strong
                      style={
                        styles.costAmount
                      }
                    >
                      ₹
                      {Number(
                        selectedRequest
                          .estimatedCost ||
                          0
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </strong>
                  </div>
                </div>
              </section>
            )}

            {/* Map */}

            <section
              style={
                styles.mapCard
              }
            >
              <div
                style={
                  styles.mapHeader
                }
              >
                <div>
                  <p
                    style={
                      styles.sectionEyebrow
                    }
                  >
                    REAL-TIME MAP
                  </p>

                  <h2
                    style={
                      styles.sectionTitle
                    }
                  >
                    Mechanic Location
                  </h2>
                </div>

                <button
                  onClick={
                    fetchRequests
                  }
                  style={
                    styles.refreshButton
                  }
                >
                  ↻ Refresh
                </button>
              </div>

              <div
                style={
                  styles.mapWrapper
                }
              >
                <MapContainer
                  center={
                    getInitialMapCenter()
                  }
                  zoom={14}
                  scrollWheelZoom={
                    true
                  }
                  style={
                    styles.map
                  }
                >
                  <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
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

                  {hasCustomerLocation && (
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

                        Service location
                      </Popup>
                    </Marker>
                  )}

                  {hasPartnerLocation && (
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
                          {selectedRequest
                            ?.partner
                            ?.businessName ||
                            "Service Partner"}
                        </strong>

                        <br />

                        Mechanic's current
                        location
                      </Popup>
                    </Marker>
                  )}
                </MapContainer>
              </div>

              <div
                style={
                  styles.mapLegend
                }
              >
                <div
                  style={
                    styles.legendItem
                  }
                >
                  <span
                    style={
                      styles.customerLegendDot
                    }
                  />

                  Your Location
                </div>

                <div
                  style={
                    styles.legendItem
                  }
                >
                  <span
                    style={
                      styles.partnerLegendDot
                    }
                  />

                  Mechanic Location
                </div>

                <div
                  style={
                    styles.legendStatus
                  }
                >
                  {hasPartnerLocation
                    ? "● Mechanic location is live"
                    : "○ Waiting for mechanic location"}
                </div>
              </div>
            </section>

            {/* Partner information */}

            {selectedRequest?.partner && (
              <section
                style={
                  styles.partnerCard
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
                      📞{" "}
                      {selectedRequest
                        .partner
                        .phone ||
                        "Phone not available"}
                    </span>

                    <span>
                      ⭐{" "}
                      {Number(
                        selectedRequest
                          .partner
                          .rating ||
                          5
                      ).toFixed(1)}
                    </span>

                    <span>
                      📍{" "}
                      {hasPartnerLocation
                        ? "Location sharing active"
                        : "Location not available yet"}
                    </span>
                  </div>
                </div>
              </section>
            )}

            {/* Tracking information */}

            <section
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
                    Live Location
                  </strong>

                  <p
                    style={
                      styles.infoText
                    }
                  >
                    {hasPartnerLocation
                      ? "Your mechanic's current location is being shared."
                      : "Waiting for the mechanic to start sharing their location."}
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
                  🔄
                </div>

                <div>
                  <strong
                    style={
                      styles.infoTitle
                    }
                  >
                    Automatic Updates
                  </strong>

                  <p
                    style={
                      styles.infoText
                    }
                  >
                    Status and location
                    changes appear automatically
                    without refreshing the page.
                  </p>
                </div>
              </div>
            </section>
          </>
        )}
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
    fontWeight: "800"
  },

  headerSubtitle: {
    fontSize: "13px",
    color: "#64748b",
    marginTop: "3px"
  },

  headerActions: {
    display: "flex",
    gap: "10px",
    alignItems: "center"
  },

  container: {
    width: "90%",
    maxWidth: "1200px",
    margin: "0 auto",
    padding:
      "35px 0 60px"
  },

  hero: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "flex-end",
    gap: "20px",
    marginBottom: "22px"
  },

  eyebrow: {
    margin:
      "0 0 8px",
    color: "#4f46e5",
    fontSize: "12px",
    fontWeight: "800",
    letterSpacing: "1.5px"
  },

  title: {
    margin: 0,
    fontSize:
      "clamp(30px, 4vw, 46px)",
    lineHeight: 1.1,
    fontWeight: "850"
  },

  subtitle: {
    maxWidth: "720px",
    margin:
      "14px 0 0",
    color: "#64748b",
    fontSize: "15px",
    lineHeight: 1.7
  },

  connectedBadge: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#dcfce7",
    color: "#166534",
    padding:
      "9px 13px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "800",
    whiteSpace: "nowrap"
  },

  disconnectedBadge: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#fee2e2",
    color: "#b91c1c",
    padding:
      "9px 13px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "800",
    whiteSpace: "nowrap"
  },

  connectionDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#22c55e",
    display: "inline-block"
  },

  selectorCard: {
    background: "#fff",
    border:
      "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "18px 20px",
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "18px",
    boxShadow:
      "0 7px 22px rgba(15, 23, 42, 0.04)"
  },

  selectorLabel: {
    margin:
      "0 0 5px",
    color: "#94a3b8",
    fontSize: "10px",
    fontWeight: "800",
    letterSpacing: "1px"
  },

  selectorTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "800"
  },

  requestSelect: {
    minWidth: "300px",
    border:
      "1px solid #cbd5e1",
    borderRadius: "10px",
    padding:
      "11px 13px",
    background: "#fff",
    color: "#334155",
    fontSize: "13px",
    fontWeight: "700",
    outline: "none"
  },

  requestInfoCard: {
    background: "#fff",
    border:
      "1px solid #e2e8f0",
    borderRadius: "18px",
    padding: "20px",
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "18px",
    boxShadow:
      "0 7px 22px rgba(15, 23, 42, 0.04)"
  },

  requestInfoMain: {
    display: "flex",
    alignItems: "center",
    gap: "14px"
  },

  vehicleIcon: {
    width: "52px",
    height: "52px",
    borderRadius: "14px",
    background: "#eef2ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "25px"
  },

  serviceType: {
    display: "inline-block",
    background: "#eef2ff",
    color: "#4338ca",
    borderRadius: "999px",
    padding:
      "5px 10px",
    fontSize: "10px",
    fontWeight: "800"
  },

  vehicleTitle: {
    margin:
      "8px 0 3px",
    fontSize: "20px",
    fontWeight: "800"
  },

  registration: {
    margin: 0,
    color: "#64748b",
    fontSize: "12px"
  },

  requestStatusArea: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
    flexWrap: "wrap",
    justifyContent:
      "flex-end"
  },

  statusBadge: {
    borderRadius: "999px",
    padding:
      "8px 12px",
    fontSize: "11px",
    fontWeight: "800",
    whiteSpace: "nowrap"
  },

  costDisplay: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "2px",
    color: "#64748b",
    fontSize: "11px"
  },

  costAmount: {
    color: "#0f172a",
    fontSize: "17px"
  },

  mapCard: {
    background: "#fff",
    border:
      "1px solid #e2e8f0",
    borderRadius: "20px",
    padding: "20px",
    marginBottom: "18px",
    boxShadow:
      "0 8px 25px rgba(15, 23, 42, 0.05)"
  },

  mapHeader: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "flex-end",
    gap: "15px",
    marginBottom: "15px"
  },

  sectionEyebrow: {
    margin:
      "0 0 6px",
    color: "#4f46e5",
    fontSize: "10px",
    fontWeight: "800",
    letterSpacing: "1.3px"
  },

  sectionTitle: {
    margin: 0,
    fontSize: "22px",
    fontWeight: "850"
  },

  refreshButton: {
    border:
      "1px solid #cbd5e1",
    background: "#fff",
    color: "#334155",
    padding:
      "9px 13px",
    borderRadius: "9px",
    fontWeight: "700",
    cursor: "pointer"
  },

  mapWrapper: {
    width: "100%",
    height: "520px",
    borderRadius: "15px",
    overflow: "hidden",
    border:
      "1px solid #e2e8f0"
  },

  map: {
    width: "100%",
    height: "100%"
  },

  mapLegend: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
    paddingTop: "14px"
  },

  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    color: "#475569",
    fontSize: "12px",
    fontWeight: "700"
  },

  customerLegendDot: {
    width: "11px",
    height: "11px",
    borderRadius: "50%",
    background: "#4f46e5",
    display: "inline-block"
  },

  partnerLegendDot: {
    width: "11px",
    height: "11px",
    borderRadius: "50%",
    background: "#16a34a",
    display: "inline-block"
  },

  legendStatus: {
    marginLeft: "auto",
    color: "#64748b",
    fontSize: "12px"
  },

  partnerCard: {
    background: "#fff",
    border:
      "1px solid #e2e8f0",
    borderRadius: "18px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    marginBottom: "18px",
    boxShadow:
      "0 7px 22px rgba(15, 23, 42, 0.04)"
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