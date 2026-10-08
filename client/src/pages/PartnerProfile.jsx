import { useEffect, useState } from "react";

import axios from "axios";

import { API_URL } from "../config";

import { useNavigate } from "react-router-dom";



function PartnerProfile() {

  const navigate = useNavigate();



  const [formData, setFormData] = useState({

    businessName: "",

    services: [],

    phone: "",

    address: "",

    latitude: "",

    longitude: ""

  });



  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [locationLoading, setLocationLoading] =

    useState(false);



  const [profileExists, setProfileExists] =

    useState(false);



  const token =

    localStorage.getItem("token");



  const api = axios.create({

    baseURL: API_URL,

    headers: {

      Authorization: `Bearer ${token}`

    }

  });



  const availableServices = [

    {

      name: "Breakdown Repair",

      icon: "🔧",

      description:

        "Engine and vehicle breakdown assistance"

    },



    {

      name: "Towing",

      icon: "🚛",

      description:

        "Vehicle towing and transportation"

    },



    {

      name: "Battery Jump-start",

      icon: "🔋",

      description:

        "Dead battery jump-start assistance"

    },



    {

      name: "Flat Tire Repair",

      icon: "🛞",

      description:

        "Flat tire repair and replacement"

    },



    {

      name: "Fuel Delivery",

      icon: "⛽",

      description:

        "Emergency fuel delivery service"

    }

  ];



  useEffect(() => {

    if (!token) {

      navigate("/");

      return;

    }



    loadProfile();

  }, [token, navigate]);



  const loadProfile = async () => {

    try {

      setLoading(true);



      const response =

        await api.get(

          "/partners/me"

        );



      const partner =

        response.data.partner;



      setProfileExists(true);



      setFormData({

        businessName:

          partner.businessName ||

          "",



        services:

          partner.services || [],



        phone:

          partner.phone || "",



        address:

          partner.address || "",



        latitude:

          partner.location

            ?.latitude ?? "",



        longitude:

          partner.location

            ?.longitude ?? ""

      });

    } catch (error) {

      if (

        error.response?.status ===

        404

      ) {

        setProfileExists(false);

      } else if (

        error.response?.status ===

          401 ||

        error.response?.status ===

          403

      ) {

        alert(

          error.response?.data?.message ||

            "You do not have access to the partner profile."

        );



        navigate("/dashboard");

      } else {

        console.error(

          "Failed to load partner profile:",

          error

        );



        alert(

          error.response?.data?.message ||

            "Failed to load partner profile."

        );

      }

    } finally {

      setLoading(false);

    }

  };



  const handleChange = (e) => {

    setFormData(

      (previous) => ({

        ...previous,

        [e.target.name]:

          e.target.value

      })

    );

  };



  const handleServiceChange =

    (service) => {

      setFormData(

        (previous) => {

          const alreadySelected =

            previous.services.includes(

              service

            );



          if (alreadySelected) {

            return {

              ...previous,



              services:

                previous.services.filter(

                  (item) =>

                    item !== service

                )

            };

          }



          return {

            ...previous,



            services: [

              ...previous.services,

              service

            ]

          };

        }

      );

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

        setFormData(

          (previous) => ({

            ...previous,



            latitude:

              position.coords

                .latitude,



            longitude:

              position.coords

                .longitude

          })

        );



        setLocationLoading(false);



        alert(

          "Your service location has been detected successfully."

        );

      },



      (error) => {

        console.error(

          "Geolocation error:",

          error

        );



        setLocationLoading(false);



        alert(

          "Unable to get your location. Please allow location access or enter your address manually."

        );

      },



      {

        enableHighAccuracy: true,

        timeout: 10000,

        maximumAge: 0

      }

    );

  };



  const handleSubmit =

    async (e) => {

      e.preventDefault();



      if (

        !formData.businessName.trim()

      ) {

        alert(

          "Business name is required."

        );



        return;

      }



      if (

        formData.services.length ===

        0

      ) {

        alert(

          "Please select at least one service."

        );



        return;

      }



      try {

        setSaving(true);



        const payload = {

          businessName:

            formData.businessName.trim(),



          services:

            formData.services,



          phone:

            formData.phone.trim(),



          address:

            formData.address.trim(),



          location: {

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

        };



        let response;



        if (profileExists) {

          response =

            await api.put(

              "/partners/me",

              payload

            );

        } else {

          response =

            await api.post(

              "/partners",

              payload

            );

        }



        alert(

          response.data.message ||

            "Partner profile saved successfully."

        );



        setProfileExists(true);



        navigate(

          "/partner-dashboard"

        );

      } catch (error) {

        console.error(

          "Failed to save partner profile:",

          error

        );



        alert(

          error.response?.data?.message ||

            "Failed to save partner profile."

        );

      } finally {

        setSaving(false);

      }

    };



  if (loading) {

    return (

      <div

        style={

          styles.loadingPage

        }

      >

        <div

          style={

            styles.loadingCard

          }

        >

          <div

            style={

              styles.loadingIcon

            }

          >

            🔧

          </div>



          <h2>

            Loading Partner Profile...

          </h2>



          <p>

            Please wait while we load

            your profile information.

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

            Service Partner Profile

          </div>

        </div>



        <div

          style={

            styles.headerActions

          }

        >

          {profileExists && (

            <button

              onClick={() =>

                navigate(

                  "/partner-dashboard"

                )

              }

              style={

                styles.secondaryButton

              }

            >

              ← Dashboard

            </button>

          )}



          <button

            onClick={() => {

              localStorage.removeItem(

                "token"

              );



              localStorage.removeItem(

                "user"

              );



              navigate("/");

            }}

            style={

              styles.logoutButton

            }

          >

            Logout

          </button>

        </div>

      </header>



      <main style={styles.container}>

        {/* Hero */}



        <section style={styles.hero}>

          <div>

            <p style={styles.eyebrow}>

              {profileExists

                ? "EDIT PROFILE"

                : "PARTNER ONBOARDING"}

            </p>



            <h1 style={styles.title}>

              {profileExists

                ? "Manage Your Partner Profile"

                : "Create Your Partner Profile"}

            </h1>



            <p

              style={

                styles.subtitle

              }

            >

              {profileExists

                ? "Keep your business information, services and service location up to date."

                : "Tell customers about your roadside assistance business and the services you provide."}

            </p>

          </div>



          {profileExists && (

            <div

              style={

                styles.editBadge

              }

            >

              ✎ Editing Profile

            </div>

          )}

        </section>



        {profileExists && (

          <section

            style={

              styles.infoBanner

            }

          >

            <div

              style={

                styles.infoIcon

              }

            >

              ℹ️

            </div>



            <div>

              <strong>

                Profile information

              </strong>



              <p>

                You can update your business

                details and services at any

                time. Your admin verification,

                availability and rating are

                managed separately and will

                not be changed here.

              </p>

            </div>

          </section>

        )}



        <form

          onSubmit={handleSubmit}

          style={styles.form}

        >

          <section

            style={

              styles.sectionCard

            }

          >

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

                  BUSINESS INFORMATION

                </p>



                <h2

                  style={

                    styles.sectionTitle

                  }

                >

                  Tell us about your business

                </h2>

              </div>

            </div>



            <div

              style={

                styles.formGrid

              }

            >

              <div

                style={

                  styles.formGroup

                }

              >

                <label

                  style={

                    styles.label

                  }

                >

                  Business Name *

                </label>



                <input

                  type="text"

                  name="businessName"

                  value={

                    formData.businessName

                  }

                  onChange={

                    handleChange

                  }

                  placeholder="e.g. Bhubaneswar Auto Care"

                  style={

                    styles.input

                  }

                />

              </div>



              <div

                style={

                  styles.formGroup

                }

              >

                <label

                  style={

                    styles.label

                  }

                >

                  Phone Number

                </label>



                <input

                  type="tel"

                  name="phone"

                  value={

                    formData.phone

                  }

                  onChange={

                    handleChange

                  }

                  placeholder="e.g. 9876543210"

                  style={

                    styles.input

                  }

                />

              </div>

            </div>



            <div

              style={

                styles.formGroup

              }

            >

              <label

                style={

                  styles.label

                }

              >

                Business Address

              </label>



              <textarea

                name="address"

                value={

                  formData.address

                }

                onChange={

                  handleChange

                }

                placeholder="Enter your workshop or service area address"

                rows="4"

                style={

                  styles.textarea

                }

              />

            </div>

          </section>



          <section

            style={

              styles.sectionCard

            }

          >

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

                  SERVICES

                </p>



                <h2

                  style={

                    styles.sectionTitle

                  }

                >

                  What services do you provide?

                </h2>



                <p

                  style={

                    styles.sectionDescription

                  }

                >

                  Select all roadside assistance

                  services that your business

                  can provide.

                </p>

              </div>

            </div>



            <div

              style={

                styles.serviceGrid

              }

            >

              {availableServices.map(

                (service) => {

                  const selected =

                    formData.services.includes(

                      service.name

                    );



                  return (

                    <button

                      key={

                        service.name

                      }

                      type="button"

                      onClick={() =>

                        handleServiceChange(

                          service.name

                        )

                      }

                      style={{

                        ...styles.serviceCard,



                        borderColor:

                          selected

                            ? "#4f46e5"

                            : "#e2e8f0",



                        background:

                          selected

                            ? "#eef2ff"

                            : "#fff"

                      }}

                    >

                      <div

                        style={

                          styles.serviceIcon

                        }

                      >

                        {

                          service.icon

                        }

                      </div>



                      <div

                        style={

                          styles.serviceContent

                        }

                      >

                        <strong

                          style={

                            styles.serviceName

                          }

                        >

                          {

                            service.name

                          }

                        </strong>



                        <span

                          style={

                            styles.serviceDescription

                          }

                        >

                          {

                            service.description

                          }

                        </span>

                      </div>



                      <div

                        style={{

                          ...styles.checkbox,



                          background:

                            selected

                              ? "#4f46e5"

                              : "#fff",



                          borderColor:

                            selected

                              ? "#4f46e5"

                              : "#cbd5e1"

                        }}

                      >

                        {selected

                          ? "✓"

                          : ""}

                      </div>

                    </button>

                  );

                }

              )}

            </div>

          </section>



          <section

            style={

              styles.sectionCard

            }

          >

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

                  SERVICE LOCATION

                </p>



                <h2

                  style={

                    styles.sectionTitle

                  }

                >

                  Where do you provide service?

                </h2>



                <p

                  style={

                    styles.sectionDescription

                  }

                >

                  Your location helps the platform

                  connect you with nearby customers.

                </p>

              </div>



              <button

                type="button"

                onClick={

                  getLocation

                }

                disabled={

                  locationLoading

                }

                style={{

                  ...styles.locationButton,



                  opacity:

                    locationLoading

                      ? 0.6

                      : 1

                }}

              >

                {locationLoading

                  ? "Detecting..."

                  : "📍 Detect My Location"}

              </button>

            </div>



            <div

              style={

                styles.formGrid

              }

            >

              <div

                style={

                  styles.formGroup

                }

              >

                <label

                  style={

                    styles.label

                  }

                >

                  Latitude

                </label>



                <input

                  type="number"

                  step="any"

                  name="latitude"

                  value={

                    formData.latitude

                  }

                  onChange={

                    handleChange

                  }

                  placeholder="e.g. 20.2961"

                  style={

                    styles.input

                  }

                />

              </div>



              <div

                style={

                  styles.formGroup

                }

              >

                <label

                  style={

                    styles.label

                  }

                >

                  Longitude

                </label>



                <input

                  type="number"

                  step="any"

                  name="longitude"

                  value={

                    formData.longitude

                  }

                  onChange={

                    handleChange

                  }

                  placeholder="e.g. 85.8245"

                  style={

                    styles.input

                  }

                />

              </div>

            </div>



            <div

              style={

                styles.locationNote

              }

            >

              <span>

                💡

              </span>



              <p>

                You can use your browser's

                location detection or enter

                coordinates manually.

              </p>

            </div>

          </section>



          {formData.services.length >

            0 && (

            <section

              style={

                styles.summaryCard

              }

            >

              <div>

                <p

                  style={

                    styles.summaryLabel

                  }

                >

                  SELECTED SERVICES

                </p>



                <div

                  style={

                    styles.selectedServices

                  }

                >

                  {formData.services.map(

                    (service) => (

                      <span

                        key={

                          service

                        }

                        style={

                          styles.selectedTag

                        }

                      >

                        ✓ {service}

                      </span>

                    )

                  )}

                </div>

              </div>



              <div

                style={

                  styles.serviceCount

                }

              >

                {formData.services.length}

                {" "}

                service

                {formData.services.length !==

                1

                  ? "s"

                  : ""}

                {" "}

                selected

              </div>

            </section>

          )}



          <div

            style={

              styles.formActions

            }

          >

            <button

              type="button"

              onClick={() =>

                navigate(

                  profileExists

                    ? "/partner-dashboard"

                    : "/dashboard"

                )

              }

              style={

                styles.cancelButton

              }

            >

              Cancel

            </button>



            <button

              type="submit"

              disabled={saving}

              style={{

                ...styles.saveButton,



                opacity:

                  saving

                    ? 0.7

                    : 1,



                cursor:

                  saving

                    ? "not-allowed"

                    : "pointer"

              }}

            >

              {saving

                ? "Saving..."

                : profileExists

                ? "✓ Save Profile Changes"

                : "✓ Create Partner Profile"}

            </button>

          </div>

        </form>

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



  headerActions: {

    display: "flex",

    alignItems: "center",

    gap: "10px"

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

    cursor: "pointer"

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

    maxWidth: "1100px",

    margin: "0 auto",

    padding:

      "36px 0 60px"

  },



  hero: {

    display: "flex",

    justifyContent:

      "space-between",

    alignItems: "flex-end",

    gap: "25px",

    marginBottom: "25px"

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

      "clamp(30px, 4vw, 44px)",

    lineHeight: 1.1,

    fontWeight: "850"

  },



  subtitle: {

    maxWidth: "700px",

    margin:

      "14px 0 0",

    color: "#64748b",

    fontSize: "15px",

    lineHeight: 1.7

  },



  editBadge: {

    background: "#eef2ff",

    color: "#4338ca",

    padding:

      "10px 14px",

    borderRadius: "999px",

    fontSize: "12px",

    fontWeight: "800",

    whiteSpace: "nowrap"

  },



  infoBanner: {

    display: "flex",

    alignItems: "flex-start",

    gap: "13px",

    background: "#eff6ff",

    border:

      "1px solid #bfdbfe",

    color: "#1e40af",

    borderRadius: "15px",

    padding: "16px 18px",

    marginBottom: "22px"

  },



  infoIcon: {

    fontSize: "20px"

  },



  infoBannerText: {

    fontSize: "13px"

  },



  form: {

    display: "flex",

    flexDirection: "column",

    gap: "20px"

  },



  sectionCard: {

    background: "#fff",

    border:

      "1px solid #e2e8f0",

    borderRadius: "20px",

    padding: "25px",

    boxShadow:

      "0 8px 25px rgba(15, 23, 42, 0.05)"

  },



  sectionHeader: {

    display: "flex",

    justifyContent:

      "space-between",

    alignItems: "flex-start",

    gap: "20px",

    marginBottom: "22px"

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

    fontSize: "23px",

    fontWeight: "850"

  },



  sectionDescription: {

    margin:

      "8px 0 0",

    color: "#64748b",

    fontSize: "13px",

    lineHeight: 1.6

  },



  formGrid: {

    display: "grid",

    gridTemplateColumns:

      "1fr 1fr",

    gap: "18px"

  },



  formGroup: {

    display: "flex",

    flexDirection: "column",

    gap: "7px",

    marginBottom: "18px"

  },



  label: {

    fontSize: "12px",

    fontWeight: "800",

    color: "#334155"

  },



  input: {

    width: "100%",

    boxSizing: "border-box",

    border:

      "1px solid #cbd5e1",

    borderRadius: "10px",

    padding:

      "12px 13px",

    fontSize: "14px",

    color: "#0f172a",

    outline: "none",

    background: "#fff"

  },



  textarea: {

    width: "100%",

    boxSizing: "border-box",

    border:

      "1px solid #cbd5e1",

    borderRadius: "10px",

    padding:

      "12px 13px",

    fontSize: "14px",

    color: "#0f172a",

    outline: "none",

    resize: "vertical",

    fontFamily:

      "inherit"

  },



  serviceGrid: {

    display: "grid",

    gridTemplateColumns:

      "repeat(2, 1fr)",

    gap: "15px"

  },



  serviceCard: {

    position: "relative",

    border:

      "1px solid",

    borderRadius: "15px",

    padding: "18px",

    display: "flex",

    alignItems: "flex-start",

    gap: "13px",

    textAlign: "left",

    cursor: "pointer",

    transition:

      "all 0.2s ease"

  },



  serviceIcon: {

    width: "44px",

    height: "44px",

    borderRadius: "12px",

    background: "#f1f5f9",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    fontSize: "22px",

    flexShrink: 0

  },



  serviceContent: {

    display: "flex",

    flexDirection: "column",

    gap: "5px",

    paddingRight: "25px"

  },



  serviceName: {

    fontSize: "14px",

    color: "#0f172a"

  },



  serviceDescription: {

    color: "#64748b",

    fontSize: "11px",

    lineHeight: 1.5

  },



  checkbox: {

    position: "absolute",

    top: "16px",

    right: "16px",

    width: "20px",

    height: "20px",

    border:

      "2px solid",

    borderRadius: "6px",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    color: "#fff",

    fontSize: "12px",

    fontWeight: "900"

  },



  locationButton: {

    border: "none",

    background: "#4f46e5",

    color: "#fff",

    padding:

      "11px 15px",

    borderRadius: "10px",

    fontWeight: "800",

    cursor: "pointer",

    whiteSpace: "nowrap"

  },



  locationNote: {

    display: "flex",

    alignItems: "flex-start",

    gap: "8px",

    background: "#f8fafc",

    borderRadius: "10px",

    padding: "12px",

    color: "#64748b",

    fontSize: "12px"

  },



  locationNoteText: {

    margin: 0

  },



  summaryCard: {

    background: "#f0fdf4",

    border:

      "1px solid #bbf7d0",

    borderRadius: "16px",

    padding: "18px 20px",

    display: "flex",

    justifyContent:

      "space-between",

    alignItems: "center",

    gap: "20px"

  },



  summaryLabel: {

    margin:

      "0 0 9px",

    color: "#166534",

    fontSize: "10px",

    fontWeight: "800",

    letterSpacing: "1px"

  },



  selectedServices: {

    display: "flex",

    flexWrap: "wrap",

    gap: "8px"

  },



  selectedTag: {

    background: "#dcfce7",

    color: "#166534",

    borderRadius: "999px",

    padding:

      "7px 10px",

    fontSize: "11px",

    fontWeight: "700"

  },



  serviceCount: {

    color: "#166534",

    fontSize: "12px",

    fontWeight: "800",

    whiteSpace: "nowrap"

  },



  formActions: {

    display: "flex",

    justifyContent:

      "flex-end",

    gap: "10px",

    paddingTop: "5px"

  },



  cancelButton: {

    border:

      "1px solid #cbd5e1",

    background: "#fff",

    color: "#334155",

    padding:

      "12px 18px",

    borderRadius: "10px",

    fontWeight: "800",

    cursor: "pointer"

  },



  saveButton: {

    border: "none",

    background: "#4f46e5",

    color: "#fff",

    padding:

      "12px 20px",

    borderRadius: "10px",

    fontWeight: "800",

    cursor: "pointer"

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



export default PartnerProfile;