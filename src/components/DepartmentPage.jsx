import React, { useEffect, useState, useCallback } from 'react'; // Import useCallback
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
axios.defaults.baseURL = process.env.REACT_APP_API_BASE_URL || '';
const DepartmentPage = () => {
  const [params] = useSearchParams();
  const deptId = params.get("id");
  const navigate = useNavigate();

  const [department, setDepartment] = useState({});
  const [doctors, setDoctors] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [category, setCategory] = useState("doctor");

  // Wrap loadDepartmentDetails with useCallback
  const loadDepartmentDetails = useCallback(async () => {
    try {
      const res = await axios.get(`/department/${deptId}`);
      setDepartment(res.data.department);
      setDoctors(res.data.doctors);
      setNurses(res.data.nurses);
    } catch (error) { // It's good practice to catch the actual error
      console.error("Failed to load department:", error); // Log for debugging
      alert("Failed to load department");
    }
  }, [deptId]); // <--- IMPORTANT: `deptId` is a dependency of `loadDepartmentDetails`

  useEffect(() => {
    loadDepartmentDetails();
  }, [deptId, loadDepartmentDetails]); // Now loadDepartmentDetails is stable

  const handleDelete = async (type, name) => {
    const route = type === "doctor" ? "delete_doctor" : "delete_nurse";
    try {
      await axios.delete(`/${route}/${deptId}/${encodeURIComponent(name)}`);
      loadDepartmentDetails(); // Call the memoized function
    } catch (error) {
      console.error(`Failed to delete ${type}:`, error);
      alert(`Failed to delete ${type}`);
    }
  };

  const handleEdit = async (type, staff) => {
    const updates = {};
    if (type === "doctor") {
      updates.specialization = prompt("Specialization:", staff.specialization);
    }
    updates.qualification = prompt("Qualification:", staff.qualification);
    updates.experience = prompt("Experience:", staff.experience);

    const route = type === "doctor" ? "/update_doctor" : "/update_nurse";
    try { // Add try-catch for update as well
        await axios.put(route, {
            name: staff.name,
            department_id: deptId,
            ...updates
        });
        loadDepartmentDetails(); // Call the memoized function
    } catch (error) {
        console.error(`Failed to update ${type}:`, error);
        alert(`Failed to update ${type}`);
    }
  };

  const handleAdd = async (type) => {
    const name = prompt("Name:");
    if (!name) return; // Prevent adding if name is empty
    const qualification = prompt("Qualification:");
    const experience = prompt("Experience:");
    let specialization = "";

    if (type === "doctor") {
      specialization = prompt("Specialization:");
    }

    const route = type === "doctor" ? "/add_doctor" : "/add_nurse";
    try { // Add try-catch for add as well
        await axios.post(route, {
            name, qualification, experience, specialization,
            department_id: deptId
        });
        loadDepartmentDetails(); // Call the memoized function
    } catch (error) {
        console.error(`Failed to add ${type}:`, error);
        alert(`Failed to add ${type}`);
    }
  };

  const staffList = category === "doctor" ? doctors : nurses;

  return (
    <div>
      <header style={{ backgroundColor: "#007BFF", padding: "10px", color: "white" }}>
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    {/* Left: Navigation Buttons */}
    <div> <button style={{ fontSize: "12px", marginBottom: "6px" }} onClick={() => navigate("/")}>🏠 Home</button></div>
    <div><button style={{ fontSize: "12px", marginBottom: "6px" }} onClick={() => window.history.back()}>🔙 Back</button></div>

    {/* Center: Department Info */}
    <div style={{ flex: 27, textAlign: "center" }}>
      <h2 style={{ margin: 0 }}>{department.name}</h2>
      <p style={{ margin: 0 }}>{department.description}</p>
    </div>

    {/* Right: Empty space to balance layout */}
    <div style={{ flex: 1 }}></div>
  </div>
</header>


      <div style={{ display: "flex", padding: "10px" }}>
        <div style={{ width: "20%" }}>
          <h3>Options</h3>
          <button onClick={() => setCategory("doctor")}>Doctors</button>
          <button onClick={() => setCategory("nurse")}>Nurses</button>
          <button onClick={() => handleAdd(category)}>+ Add {category}</button>
        </div>

        <div style={{ width: "75%" }}>
          <h3>{category.charAt(0).toUpperCase() + category.slice(1)} List</h3>
          {staffList.length === 0 ? (
            <p>No {category}s available.</p>
          ) : (
            <table style={{ width: "90%", borderCollapse: "collapse", fontSize: "19px",height: "50%" }}>
            <thead style={{ backgroundColor: "#f0f0f0" }}>
              <tr>
                <th style={{ border: "1px solid #ccc", padding: "6px" }}>Name</th>
                {category === "doctor" && (
                  <th style={{ border: "1px solid #ccc", padding: "6px" }}>Specialization</th>
                )}
                <th style={{ border: "1px solid #ccc", padding: "6px" }}>Qualification</th>
                <th style={{ border: "1px solid #ccc", padding: "6px" }}>Experience</th>
                <th style={{ border: "1px solid #ccc", padding: "6px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
          {staffList.map((person, i) => (
            <tr key={i}>
            <td style={{ border: "1px solid #ccc", padding: "6px" }}>{person.name}</td>
            {category === "doctor" && (
            <td style={{ border: "1px solid #ccc", padding: "6px" }}>{person.specialization}</td>
            )}
            <td style={{ border: "1px solid #ccc", padding: "6px" }}>{person.qualification}</td>
            <td style={{ border: "1px solid #ccc", padding: "6px" }}>{person.experience} yrs</td>
            <td style={{ border: "1px solid #ccc", padding: "6px" }}>
            <button
              onClick={() => handleEdit(category, person)}
              style={{ fontSize: "10px", marginRight: "4px" }}
            >
            ✏️
            </button>
            <button
              onClick={() => handleDelete(category, person.name)}
              style={{ fontSize: "10px" }}
            >
            🗑️
            </button>
        </td>
      </tr>
    ))}
  </tbody>
</table>

          )}
        </div>
      </div>
    </div>
  );
};

export default DepartmentPage;