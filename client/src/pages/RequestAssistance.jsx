import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function RequestAssistance() {
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState([]);

  const [formData, setFormData] = useState({
    vehicleId: "",
    serviceType: "",
    description: "",
    address: "",
    latitude: "",
    longitude: ""
  });

  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] =
    useState(false);
  const [fetchingVehicles, setFetchingVehicles] =
    useState(true);

  const token = localStorage.getItem("token");

  const serviceTypes = [
    {
      name: "Breakdown Repair",
      icon: "🔧",
      description:
        "Vehicle stopped or engine is not working.",
      color: "#2563eb"
    },
    {
      name: "Towing",
      icon: "🚛",
      description:
        "Your vehicle needs to be transported.",
      color: "#7c3aed"
    },
    {
      name: "Battery Jump-start",
      icon: "🔋",
      description:
        "Your vehicle battery is dead.",
      color: "#ca8a04"
    },
    {
      name: "Flat Tire Repair",
      icon: "🛞",
      description:
        "You have a flat or damaged tire.",
      color: "#ea580c"
    },
    {
      name: "Fuel Delivery",
      icon: "⛽",
      description:
        "Your vehicle has run out of fuel.",
      color: "#16a34a"
    }
  ];

  const fetchVehicles = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/vehicles",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setVehicles(
        response.data.vehicles || []
      );
    } catch (error) {
      console.error(
        error.response?.data?.message ||
          "Failed to fetch vehicles"
      );
    } finally {
      setFetchingVehicles(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    fetchVehicles();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const selectService = (serviceType) => {
    setFormData({
      ...formData,
      serviceType
    });
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      alert(
        "Geolocation is not supported by your browser."
      );
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude =
          position.coords.latitude;

        const longitude =
          position.coords.longitude;

        setFormData((previous) => ({
          ...previous,
          latitude,
          longitude
        }));

        setLocationLoading(false);

        alert(
          "Your current location has been detected successfully."
        );
      },
      (error) => {
        console.error(error);

        setLocationLoading(false);

        alert(
          "Unable to access your location. Please allow location permission or enter your address manually."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.vehicleId) {
      alert(
        "Please select the vehicle that needs assistance."
      );
      return;
    }

    if (!formData.serviceType) {
      alert(
        "Please select the type of assistance you need."
      );
      return;
    }

    if (
      !formData.address.trim() &&
      (!formData.latitude ||
        !formData.longitude)
    ) {
      alert(
        "Please provide your address or share your current location."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/service-requests",
        {
          vehicleId:
            formData.vehicleId,

          serviceType:
            formData.serviceType,

          description:
            formData.description.trim(),

          location: {
            address:
              formData.address.trim(),

            latitude:
              formData.latitude !== ""
                ? Number(
                    formData.latitude
                  )
                : undefined,

            longitude:
              formData.longitude !== ""
                ? Number(
                    formData.longitude
                  )
                : undefined
          }
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert(
        response.data.message ||
          "Emergency assistance request created successfully."
      );

      navigate("/service-history");
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to create service request."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "30px 20px",
        background:
          "linear-gradient(135deg, #f8fafc, #eff6ff)"
      }}
    >
      <div
        style={{
          maxWidth: "1050px",
          margin: "0 auto"
        }}
      >
        {/* Header */}

        <div
          style={{
            background:
              "linear-gradient(135deg, #991b1b, #dc2626, #ef4444)",
            padding: "32px",
            borderRadius: "20px",
            marginBottom: "22px",
            boxShadow:
              "0 12px 30px rgba(220, 38, 38, 0.2)"
          }}
        >
          <div
            style={{
              fontSize: "45px"
            }}
          >
            🚨
          </div>

          <p
            style={{
              margin: 0,
              color: "#fecaca",
              fontSize: "13px",
              fontWeight: "700",
              letterSpacing: "1px"
            }}
          >
            EMERGENCY ROADSIDE ASSISTANCE
          </p>

          <h1
            style={{
              color: "white",
              margin:
                "7px 0 8px"
            }}
          >
            Request Help
          </h1>

          <p
            style={{
              color: "#fee2e2",
              margin: 0
            }}
          >
            Tell us what happened and we'll
            connect you with a service partner.
          </p>
        </div>

        {/* Safety Notice */}

        <div
          style={{
            background: "#fff7ed",
            border:
              "1px solid #fed7aa",
            padding: "18px",
            borderRadius: "13px",
            marginBottom: "22px"
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems:
                "flex-start"
            }}
          >
            <div
              style={{
                fontSize: "25px"
              }}
            >
              ⚠️
            </div>

            <div>
              <h3
                style={{
                  margin:
                    "0 0 5px",
                  color: "#c2410c"
                }}
              >
                Stay Safe
              </h3>

              <p
                style={{
                  margin: 0,
                  color: "#7c2d12",
                  fontSize: "14px"
                }}
              >
                If you are in an unsafe location,
                move to a safe place if possible.
                For life-threatening emergencies,
                contact local emergency services.
              </p>
            </div>
          </div>
        </div>

        {/* No Vehicles */}

        {fetchingVehicles ? (
          <div
            style={{
              background: "white",
              padding: "40px",
              borderRadius: "17px",
              textAlign: "center",
              boxShadow:
                "0 7px 25px rgba(15, 23, 42, 0.07)"
            }}
          >
            <div
              style={{
                fontSize: "45px"
              }}
            >
              🚗
            </div>

            <h2>
              Loading Your Vehicles
            </h2>

            <p>
              Please wait while we load your
              registered vehicles.
            </p>
          </div>
        ) : vehicles.length === 0 ? (
          <div
            style={{
              background: "white",
              padding: "40px 25px",
              borderRadius: "17px",
              textAlign: "center",
              boxShadow:
                "0 7px 25px rgba(15, 23, 42, 0.07)"
            }}
          >
            <div
              style={{
                fontSize: "55px"
              }}
            >
              🚘
            </div>

            <h2>
              No Vehicle Registered
            </h2>

            <p>
              You need to register a vehicle
              before requesting roadside assistance.
            </p>

            <button
              onClick={() =>
                navigate("/vehicles")
              }
            >
              🚗 Add My Vehicle
            </button>

            <br />
            <br />

            <button
              onClick={() =>
                navigate("/dashboard")
              }
              style={{
                background: "#64748b"
              }}
            >
              ← Back to Dashboard
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Step 1 */}

            <div
              style={{
                background: "white",
                padding: "27px",
                borderRadius: "17px",
                marginBottom: "20px",
                boxShadow:
                  "0 7px 25px rgba(15, 23, 42, 0.07)"
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems:
                    "flex-start",
                  gap: "13px",
                  marginBottom:
                    "20px"
                }}
              >
                <div
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius:
                      "50%",
                    display: "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    background:
                      "#eff6ff",
                    color:
                      "#2563eb",
                    fontWeight:
                      "700"
                  }}
                >
                  1
                </div>

                <div>
                  <h2
                    style={{
                      margin: 0
                    }}
                  >
                    Select Your Vehicle
                  </h2>

                  <p
                    style={{
                      margin:
                        "4px 0 0"
                    }}
                  >
                    Which vehicle needs assistance?
                  </p>
                </div>
              </div>

              <select
                name="vehicleId"
                value={formData.vehicleId}
                onChange={handleChange}
                required
                style={{
                  maxWidth: "100%",
                  padding: "13px"
                }}
              >
                <option value="">
                  Select your vehicle
                </option>

                {vehicles.map(
                  (vehicle) => (
                    <option
                      key={vehicle._id}
                      value={vehicle._id}
                    >
                      {vehicle.make}{" "}
                      {vehicle.model} —{" "}
                      {
                        vehicle.registrationNumber
                      }
                    </option>
                  )
                )}
              </select>

              {formData.vehicleId && (
                <div
                  style={{
                    marginTop: "15px",
                    background:
                      "#f0fdf4",
                    border:
                      "1px solid #bbf7d0",
                    padding: "13px",
                    borderRadius:
                      "10px"
                  }}
                >
                  <strong
                    style={{
                      color:
                        "#166534"
                    }}
                  >
                    ✓ Vehicle selected
                  </strong>
                </div>
              )}
            </div>

            {/* Step 2 */}

            <div
              style={{
                background: "white",
                padding: "27px",
                borderRadius: "17px",
                marginBottom: "20px",
                boxShadow:
                  "0 7px 25px rgba(15, 23, 42, 0.07)"
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems:
                    "flex-start",
                  gap: "13px",
                  marginBottom:
                    "20px"
                }}
              >
                <div
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius:
                      "50%",
                    display: "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    background:
                      "#eff6ff",
                    color:
                      "#2563eb",
                    fontWeight:
                      "700"
                  }}
                >
                  2
                </div>

                <div>
                  <h2
                    style={{
                      margin: 0
                    }}
                  >
                    What Happened?
                  </h2>

                  <p
                    style={{
                      margin:
                        "4px 0 0"
                    }}
                  >
                    Select the roadside service you
                    need.
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "14px"
                }}
              >
                {serviceTypes.map(
                  (service) => {
                    const selected =
                      formData.serviceType ===
                      service.name;

                    return (
                      <div
                        key={service.name}
                        onClick={() =>
                          selectService(
                            service.name
                          )
                        }
                        style={{
                          padding: "19px",
                          borderRadius:
                            "14px",
                          border: selected
                            ? `2px solid ${service.color}`
                            : "1px solid #dbe3ef",
                          background:
                            selected
                              ? "#f8fafc"
                              : "white",
                          cursor:
                            "pointer",
                          transition:
                            "all 0.2s ease",
                          boxShadow:
                            selected
                              ? `0 6px 18px ${service.color}22`
                              : "none"
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent:
                              "space-between",
                            alignItems:
                              "flex-start"
                          }}
                        >
                          <div
                            style={{
                              fontSize:
                                "32px"
                            }}
                          >
                            {service.icon}
                          </div>

                          {selected && (
                            <span
                              style={{
                                color:
                                  "#15803d",
                                fontSize:
                                  "18px"
                              }}
                            >
                              ✓
                            </span>
                          )}
                        </div>

                        <h3
                          style={{
                            margin:
                              "12px 0 5px",
                            color:
                              selected
                                ? service.color
                                : "#1f2937"
                          }}
                        >
                          {service.name}
                        </h3>

                        <p
                          style={{
                            margin: 0,
                            fontSize:
                              "13px"
                          }}
                        >
                          {
                            service.description
                          }
                        </p>
                      </div>
                    );
                  }
                )}
              </div>
            </div>

            {/* Step 3 */}

            <div
              style={{
                background: "white",
                padding: "27px",
                borderRadius: "17px",
                marginBottom: "20px",
                boxShadow:
                  "0 7px 25px rgba(15, 23, 42, 0.07)"
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems:
                    "flex-start",
                  gap: "13px",
                  marginBottom:
                    "20px"
                }}
              >
                <div
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius:
                      "50%",
                    display: "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    background:
                      "#eff6ff",
                    color:
                      "#2563eb",
                    fontWeight:
                      "700"
                  }}
                >
                  3
                </div>

                <div>
                  <h2
                    style={{
                      margin: 0
                    }}
                  >
                    Describe the Problem
                  </h2>

                  <p
                    style={{
                      margin:
                        "4px 0 0"
                    }}
                  >
                    Give the service partner some
                    useful details.
                  </p>
                </div>
              </div>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Example: My car stopped suddenly and the engine is not starting..."
                rows="5"
                style={{
                  maxWidth: "100%",
                  padding: "13px"
                }}
              />
            </div>

            {/* Step 4 */}

            <div
              style={{
                background: "white",
                padding: "27px",
                borderRadius: "17px",
                marginBottom: "20px",
                boxShadow:
                  "0 7px 25px rgba(15, 23, 42, 0.07)"
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems:
                    "flex-start",
                  gap: "13px",
                  marginBottom:
                    "20px"
                }}
              >
                <div
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius:
                      "50%",
                    display: "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    background:
                      "#eff6ff",
                    color:
                      "#2563eb",
                    fontWeight:
                      "700"
                  }}
                >
                  4
                </div>

                <div>
                  <h2
                    style={{
                      margin: 0
                    }}
                  >
                    Share Your Location
                  </h2>

                  <p
                    style={{
                      margin:
                        "4px 0 0"
                    }}
                  >
                    Help the service partner find you.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={getLocation}
                disabled={locationLoading}
                style={{
                  background:
                    locationLoading
                      ? "#64748b"
                      : "#2563eb"
                }}
              >
                {locationLoading
                  ? "📍 Detecting Location..."
                  : "📍 Detect My Location"}
              </button>

              {formData.latitude !==
                "" &&
                formData.longitude !==
                  "" && (
                  <div
                    style={{
                      marginTop: "15px",
                      background:
                        "#f0fdf4",
                      border:
                        "1px solid #bbf7d0",
                      padding: "15px",
                      borderRadius:
                        "10px"
                    }}
                  >
                    <strong
                      style={{
                        color:
                          "#166534"
                      }}
                    >
                      ✓ Location detected
                    </strong>

                    <p
                      style={{
                        margin:
                          "6px 0 0",
                        fontSize:
                          "13px"
                      }}
                    >
                      Latitude:{" "}
                      {
                        formData.latitude
                      }
                      <br />
                      Longitude:{" "}
                      {
                        formData.longitude
                      }
                    </p>
                  </div>
                )}

              <div
                style={{
                  marginTop: "20px"
                }}
              >
                <label
                  htmlFor="address"
                  style={{
                    display: "block",
                    marginBottom:
                      "8px"
                  }}
                >
                  Location / Address
                </label>

                <input
                  id="address"
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Example: Patia, Bhubaneswar, Odisha"
                  style={{
                    maxWidth: "100%",
                    padding: "13px"
                  }}
                />
              </div>

              <p
                style={{
                  fontSize: "12px",
                  color: "#64748b",
                  marginBottom: 0
                }}
              >
                You can provide an address, share
                your location, or use both.
              </p>
            </div>

            {/* Submit */}

            <div
              style={{
                background: "white",
                padding: "28px",
                borderRadius: "17px",
                textAlign: "center",
                boxShadow:
                  "0 7px 25px rgba(15, 23, 42, 0.07)"
              }}
            >
              <div
                style={{
                  fontSize: "45px"
                }}
              >
                🚨
              </div>

              <h2>
                Ready to Request Help?
              </h2>

              <p>
                Review your information and submit
                the assistance request.
              </p>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  maxWidth: "480px",
                  padding: "15px",
                  fontSize: "16px",
                  background:
                    "linear-gradient(135deg, #dc2626, #ef4444)"
                }}
              >
                {loading
                  ? "Sending Request..."
                  : "🚨 Request Roadside Assistance"}
              </button>

              <br />
              <br />

              <button
                type="button"
                onClick={() =>
                  navigate("/dashboard")
                }
                style={{
                  background: "#64748b"
                }}
              >
                ← Back to Dashboard
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default RequestAssistance;