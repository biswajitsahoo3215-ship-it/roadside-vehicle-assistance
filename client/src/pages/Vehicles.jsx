import { useEffect, useState } from "react";

import axios from "axios";

import { API_URL } from "../config";

import { useNavigate } from "react-router-dom";



function Vehicles() {

  const navigate = useNavigate();



  const [vehicles, setVehicles] =

    useState([]);



  const [formData, setFormData] =

    useState({

      registrationNumber: "",

      make: "",

      model: "",

      year: "",

      fuelType: ""

    });



  const [loading, setLoading] =

    useState(false);



  const token =

    localStorage.getItem("token");



  const fetchVehicles = async () => {

    try {

      const response =

        await axios.get(

          `${API_URL}/vehicles`,

          {

            headers: {

              Authorization:

                `Bearer ${token}`

            }

          }

        );



      setVehicles(

        response.data.vehicles || []

      );

    } catch (error) {

      console.error(

        "Failed to fetch vehicles:",

        error

      );



      if (

        error.response?.status === 401

      ) {

        navigate("/");

      } else {

        alert(

          error.response?.data?.message ||

          "Failed to load vehicles"

        );

      }

    }

  };



  useEffect(() => {

    fetchVehicles();

  }, []);



  const handleChange = (e) => {

    setFormData({

      ...formData,

      [e.target.name]:

        e.target.value

    });

  };



  const handleSubmit = async (e) => {

    e.preventDefault();



    setLoading(true);



    try {

      await axios.post(

        `${API_URL}/vehicles`,

        {

          registrationNumber:

            formData.registrationNumber.trim(),

          make:

            formData.make.trim(),

          model:

            formData.model.trim(),

          year:

            formData.year

              ? Number(formData.year)

              : undefined,

          fuelType:

            formData.fuelType

        },

        {

          headers: {

            Authorization:

              `Bearer ${token}`

          }

        }

      );



      alert(

        "Vehicle added successfully"

      );



      setFormData({

        registrationNumber: "",

        make: "",

        model: "",

        year: "",

        fuelType: ""

      });



      fetchVehicles();

    } catch (error) {

      console.error(

        "Failed to add vehicle:",

        error

      );



      alert(

        error.response?.data?.message ||

        "Failed to add vehicle"

      );

    } finally {

      setLoading(false);

    }

  };



  const handleDelete = async (

    vehicleId

  ) => {

    const confirmed = window.confirm(

      "Are you sure you want to delete this vehicle?"

    );



    if (!confirmed) {

      return;

    }



    try {

      await axios.delete(

        `${API_URL}/vehicles/${vehicleId}`,

        {

          headers: {

            Authorization:

              `Bearer ${token}`

          }

        }

      );



      alert(

        "Vehicle deleted successfully"

      );



      fetchVehicles();

    } catch (error) {

      console.error(

        "Failed to delete vehicle:",

        error

      );



      alert(

        error.response?.data?.message ||

        "Failed to delete vehicle"

      );

    }

  };



  return (

    <div

      style={{

        minHeight: "100vh",

        background: "#f8fafc",

        fontFamily:

          "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

      }}

    >

      <header

        style={{

          background: "#ffffff",

          borderBottom:

            "1px solid #e2e8f0",

          padding:

            "18px 32px",

          display: "flex",

          alignItems: "center",

          justifyContent:

            "space-between",

          position: "sticky",

          top: 0,

          zIndex: 10

        }}

      >

        <div>

          <div

            style={{

              color: "#2563eb",

              fontWeight: 800,

              fontSize: "20px"

            }}

          >

            🚗 Roadside Assistance

          </div>

          <div

            style={{

              fontSize: "12px",

              color: "#64748b",

              marginTop: "3px"

            }}

          >

            Vehicle Management

          </div>

        </div>



        <button

          onClick={() =>

            navigate("/dashboard")

          }

          style={{

            border: "1px solid #e2e8f0",

            background: "#ffffff",

            color: "#334155",

            padding:

              "10px 16px",

            borderRadius: "10px",

            fontWeight: 700,

            cursor: "pointer"

          }}

        >

          ← Dashboard

        </button>

      </header>



      <main

        style={{

          maxWidth: "1100px",

          margin: "0 auto",

          padding: "36px 24px"

        }}

      >

        <div

          style={{

            marginBottom: "28px"

          }}

        >

          <h1

            style={{

              margin: 0,

              color: "#0f172a",

              fontSize: "32px",

              fontWeight: 800

            }}

          >

            My Vehicles

          </h1>



          <p

            style={{

              color: "#64748b",

              marginTop: "8px"

            }}

          >

            Add and manage the vehicles

            associated with your account.

          </p>

        </div>



        <div

          style={{

            display: "grid",

            gridTemplateColumns:

              "minmax(300px, 0.8fr) minmax(400px, 1.2fr)",

            gap: "24px",

            alignItems: "start"

          }}

        >

          <section

            style={{

              background: "#ffffff",

              border:

                "1px solid #e2e8f0",

              borderRadius: "18px",

              padding: "24px",

              boxShadow:

                "0 8px 24px rgba(15,23,42,0.05)"

            }}

          >

            <h2

              style={{

                margin:

                  "0 0 20px",

                fontSize: "20px",

                color: "#0f172a"

              }}

            >

              Add Vehicle

            </h2>



            <form

              onSubmit={handleSubmit}

            >

              <div

                style={{

                  marginBottom: "15px"

                }}

              >

                <label

                  style={{

                    display: "block",

                    fontSize: "13px",

                    fontWeight: 700,

                    color: "#334155",

                    marginBottom: "7px"

                  }}

                >

                  Registration Number

                </label>



                <input

                  type="text"

                  name="registrationNumber"

                  value={

                    formData.registrationNumber

                  }

                  onChange={handleChange}

                  placeholder="e.g. OD02AB1234"

                  required

                  style={{

                    width: "100%",

                    boxSizing:

                      "border-box",

                    padding:

                      "12px 13px",

                    border:

                      "1px solid #e2e8f0",

                    borderRadius: "10px",

                    outline: "none",

                    background:

                      "#f8fafc",

                    fontSize: "14px"

                  }}

                />

              </div>



              <div

                style={{

                  display: "grid",

                  gridTemplateColumns:

                    "1fr 1fr",

                  gap: "12px",

                  marginBottom: "15px"

                }}

              >

                <div>

                  <label

                    style={{

                      display:

                        "block",

                      fontSize:

                        "13px",

                      fontWeight: 700,

                      color:

                        "#334155",

                      marginBottom:

                        "7px"

                    }}

                  >

                    Make

                  </label>



                  <input

                    type="text"

                    name="make"

                    value={

                      formData.make

                    }

                    onChange={

                      handleChange

                    }

                    placeholder="Honda"

                    required

                    style={{

                      width:

                        "100%",

                      boxSizing:

                        "border-box",

                      padding:

                        "12px 13px",

                      border:

                        "1px solid #e2e8f0",

                      borderRadius:

                        "10px",

                      outline:

                        "none",

                      background:

                        "#f8fafc",

                      fontSize:

                        "14px"

                    }}

                  />

                </div>



                <div>

                  <label

                    style={{

                      display:

                        "block",

                      fontSize:

                        "13px",

                      fontWeight: 700,

                      color:

                        "#334155",

                      marginBottom:

                        "7px"

                    }}

                  >

                    Model

                  </label>



                  <input

                    type="text"

                    name="model"

                    value={

                      formData.model

                    }

                    onChange={

                      handleChange

                    }

                    placeholder="Activa 6G"

                    required

                    style={{

                      width:

                        "100%",

                      boxSizing:

                        "border-box",

                      padding:

                        "12px 13px",

                      border:

                        "1px solid #e2e8f0",

                      borderRadius:

                        "10px",

                      outline:

                        "none",

                      background:

                        "#f8fafc",

                      fontSize:

                        "14px"

                    }}

                  />

                </div>

              </div>



              <div

                style={{

                  display: "grid",

                  gridTemplateColumns:

                    "1fr 1fr",

                  gap: "12px",

                  marginBottom: "20px"

                }}

              >

                <div>

                  <label

                    style={{

                      display:

                        "block",

                      fontSize:

                        "13px",

                      fontWeight: 700,

                      color:

                        "#334155",

                      marginBottom:

                        "7px"

                    }}

                  >

                    Year

                  </label>



                  <input

                    type="number"

                    name="year"

                    value={

                      formData.year

                    }

                    onChange={

                      handleChange

                    }

                    placeholder="2024"

                    min="1900"

                    max={

                      new Date().getFullYear() +

                      1

                    }

                    style={{

                      width:

                        "100%",

                      boxSizing:

                        "border-box",

                      padding:

                        "12px 13px",

                      border:

                        "1px solid #e2e8f0",

                      borderRadius:

                        "10px",

                      outline:

                        "none",

                      background:

                        "#f8fafc",

                      fontSize:

                        "14px"

                    }}

                  />

                </div>



                <div>

                  <label

                    style={{

                      display:

                        "block",

                      fontSize:

                        "13px",

                      fontWeight: 700,

                      color:

                        "#334155",

                      marginBottom:

                        "7px"

                    }}

                  >

                    Fuel Type

                  </label>



                  <select

                    name="fuelType"

                    value={

                      formData.fuelType

                    }

                    onChange={

                      handleChange

                    }

                    style={{

                      width:

                        "100%",

                      boxSizing:

                        "border-box",

                      padding:

                        "12px 13px",

                      border:

                        "1px solid #e2e8f0",

                      borderRadius:

                        "10px",

                      outline:

                        "none",

                      background:

                        "#f8fafc",

                      fontSize:

                        "14px"

                    }}

                  >

                    <option value="">

                      Select

                    </option>

                    <option value="Petrol">

                      Petrol

                    </option>

                    <option value="Diesel">

                      Diesel

                    </option>

                    <option value="Electric">

                      Electric

                    </option>

                    <option value="CNG">

                      CNG

                    </option>

                    <option value="Hybrid">

                      Hybrid

                    </option>

                  </select>

                </div>

              </div>



              <button

                type="submit"

                disabled={loading}

                style={{

                  width: "100%",

                  padding:

                    "13px",

                  border: "none",

                  borderRadius:

                    "10px",

                  background:

                    loading

                      ? "#94a3b8"

                      : "#2563eb",

                  color:

                    "#ffffff",

                  fontWeight: 700,

                  cursor:

                    loading

                      ? "not-allowed"

                      : "pointer",

                  fontSize:

                    "14px"

                }}

              >

                {loading

                  ? "Adding..."

                  : "Add Vehicle"}

              </button>

            </form>

          </section>



          <section>

            <div

              style={{

                background:

                  "#ffffff",

                border:

                  "1px solid #e2e8f0",

                borderRadius:

                  "18px",

                padding: "24px",

                boxShadow:

                  "0 8px 24px rgba(15,23,42,0.05)"

              }}

            >

              <div

                style={{

                  display:

                    "flex",

                  alignItems:

                    "center",

                  justifyContent:

                    "space-between",

                  marginBottom:

                    "20px"

                }}

              >

                <h2

                  style={{

                    margin: 0,

                    fontSize:

                      "20px",

                    color:

                      "#0f172a"

                  }}

                >

                  Saved Vehicles

                </h2>



                <span

                  style={{

                    background:

                      "#eff6ff",

                    color:

                      "#2563eb",

                    padding:

                      "6px 10px",

                    borderRadius:

                      "999px",

                    fontSize:

                      "12px",

                    fontWeight:

                      700

                  }}

                >

                  {vehicles.length}{" "}

                  {vehicles.length ===

                  1

                    ? "Vehicle"

                    : "Vehicles"}

                </span>

              </div>



              {vehicles.length ===

              0 ? (

                <div

                  style={{

                    padding:

                      "45px 20px",

                    textAlign:

                      "center",

                    color:

                      "#64748b",

                    border:

                      "1px dashed #cbd5e1",

                    borderRadius:

                      "14px"

                  }}

                >

                  <div

                    style={{

                      fontSize:

                        "40px",

                      marginBottom:

                        "12px"

                    }}

                  >

                    🚘

                  </div>



                  <div

                    style={{

                      fontWeight:

                        700,

                      color:

                        "#334155",

                      marginBottom:

                        "6px"

                    }}

                  >

                    No vehicles added

                  </div>



                  <div

                    style={{

                      fontSize:

                        "13px"

                    }}

                  >

                    Add your first vehicle

                    using the form.

                  </div>

                </div>

              ) : (

                <div

                  style={{

                    display:

                      "flex",

                    flexDirection:

                      "column",

                    gap: "12px"

                  }}

                >

                  {vehicles.map(

                    (vehicle) => (

                      <div

                        key={

                          vehicle._id

                        }

                        style={{

                          border:

                            "1px solid #e2e8f0",

                          borderRadius:

                            "14px",

                          padding:

                            "17px",

                          display:

                            "flex",

                          alignItems:

                            "center",

                          justifyContent:

                            "space-between",

                          gap: "15px"

                        }}

                      >

                        <div

                          style={{

                            display:

                              "flex",

                            alignItems:

                              "center",

                            gap: "14px",

                            minWidth:

                              0

                          }}

                        >

                          <div

                            style={{

                              width:

                                "48px",

                              height:

                                "48px",

                              borderRadius:

                                "12px",

                              background:

                                "#eff6ff",

                              display:

                                "flex",

                              alignItems:

                                "center",

                              justifyContent:

                                "center",

                              fontSize:

                                "23px",

                              flexShrink:

                                0

                            }}

                          >

                            🚗

                          </div>



                          <div

                            style={{

                              minWidth:

                                0

                            }}

                          >

                            <div

                              style={{

                                fontWeight:

                                  800,

                                color:

                                  "#0f172a",

                                fontSize:

                                  "15px"

                              }}

                            >

                              {vehicle.make}{" "}

                              {vehicle.model}

                            </div>



                            <div

                              style={{

                                color:

                                  "#64748b",

                                fontSize:

                                  "13px",

                                marginTop:

                                  "4px"

                              }}

                            >

                              {vehicle.registrationNumber}

                            </div>



                            <div

                              style={{

                                display:

                                  "flex",

                                gap: "8px",

                                flexWrap:

                                  "wrap",

                                marginTop:

                                  "7px"

                              }}

                            >

                              {vehicle.year && (

                                <span

                                  style={{

                                    background:

                                      "#f1f5f9",

                                    color:

                                      "#475569",

                                    padding:

                                      "4px 8px",

                                    borderRadius:

                                      "6px",

                                    fontSize:

                                      "11px",

                                    fontWeight:

                                      600

                                  }}

                                >

                                  {vehicle.year}

                                </span>

                              )}



                              {vehicle.fuelType && (

                                <span

                                  style={{

                                    background:

                                      "#f1f5f9",

                                    color:

                                      "#475569",

                                    padding:

                                      "4px 8px",

                                    borderRadius:

                                      "6px",

                                    fontSize:

                                      "11px",

                                    fontWeight:

                                      600

                                  }}

                                >

                                  {vehicle.fuelType}

                                </span>

                              )}

                            </div>

                          </div>

                        </div>



                        <button

                          onClick={() =>

                            handleDelete(

                              vehicle._id

                            )

                          }

                          style={{

                            border:

                              "1px solid #fecaca",

                            background:

                              "#fff7f7",

                            color:

                              "#dc2626",

                            padding:

                              "9px 12px",

                            borderRadius:

                              "9px",

                            fontSize:

                              "12px",

                            fontWeight:

                              700,

                            cursor:

                              "pointer",

                            flexShrink:

                              0

                          }}

                        >

                          Delete

                        </button>

                      </div>

                    )

                  )}

                </div>

              )}

            </div>

          </section>

        </div>

      </main>



      <style>{`

        @media (max-width: 850px) {

          main > div[style*="grid-template-columns: minmax(300px, 0.8fr)"] {

            grid-template-columns: 1fr !important;

          }

        }

      `}</style>

    </div>

  );

}



export default Vehicles;