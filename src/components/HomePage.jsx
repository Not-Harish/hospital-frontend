import React, { useEffect, useState } from 'react';
import axios from 'axios';
const HomePage = () => {
  const [hospital, setHospital] = useState({});
  const [departments, setDepartments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);

  useEffect(() => {
    loadHospital();
    loadDepartments();
    axios.get("/hospital")
    .then(res => console.log("Hospital data:", res.data))
    .catch(err => console.error("❌ Axios error:", err));
  }, []);

  const loadHospital = async () => {
    try {
      const res = await axios.get('/hospital');
      setHospital(res.data);
    } catch {
      setHospital({ name: "Error loading hospital data." });
    }
  };

  const loadDepartments = async () => {
    try {
      const res = await axios.get('/departments');
      setDepartments(res.data);
    } catch {
      setDepartments([]);
    }
  };

  const performSearch = async () => {
    if (!searchQuery.trim()) return alert("Please enter a keyword to search.");
    try {
      const res = await axios.get(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
      setSearchResults(res.data);
    } catch (error) {
      setSearchResults([{ match: "Search failed: " + error.message }]);
    }
  };

  const handleAddDepartment = async () => {
    const name = prompt("Enter department name:");
    const description = prompt("Enter department description:");
    if (!name || !description) return alert("Both fields required.");
    try {
      await axios.post('/add_department', { name, description });
      alert("Department added!");
      loadDepartments();
    } catch {
      alert("Failed to add department.");
    }
  };

  const handleEdit = async (dept) => {
    const newName = prompt("New name:", dept.name);
    const newDesc = prompt("New description:", dept.description);
    if (newName && newDesc) {
      try {
        await axios.put(`/update_department/${dept.id}`, {
          name: newName,
          description: newDesc
        });
        alert("Department updated!");
        loadDepartments();
      } catch {
        alert("Failed to update department.");
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure to delete this department?")) {
      try {
        await axios.delete(`/delete_department/${id}`);
        alert("Deleted successfully!");
        loadDepartments();
      } catch {
        alert("Failed to delete department.");
      }
    }
  };

  return (
    <div>
      <header>
        <h1>{hospital.name || "Loading..."}</h1>
        <p>{hospital.location && `Location: ${hospital.location}`}</p>
      </header>

      <div style={{ position: "absolute", top: 20, right: 30 }}>
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && performSearch()}
        />
        <button onClick={performSearch}>🔍</button>
      </div>

      {searchResults && (
        <div style={{ marginTop: "20px", padding: "10px", textAlign: "left" }}>
          <h3>Search Results</h3>
          {searchResults.length > 0 ? (
            searchResults.map((result, idx) => (
              <div key={idx}>
                <strong>{result.source}</strong>:{" "}
                {result.link ? (
                  <a href={result.link} target="_blank" rel="noopener noreferrer">
                    {result.match}
                  </a>
                ) : (
                  result.match
                )}
                <hr />
              </div>
            ))
          ) : (
            <p>No matches found.</p>
          )}
        </div>
      )}

      <div className="department-container">
        {departments.map((dept) => (
          <div className="department-box" key={dept.id}>
            <h3>{dept.name}</h3>
            <p>{dept.description}</p>
            <button onClick={() => window.location.href = `/department?id=${dept.id}`}>View</button>
            <button onClick={() => handleEdit(dept)}>Edit</button>
            <button onClick={() => handleDelete(dept.id)}>Delete</button>
          </div>
        ))}
      </div>

      <div className="add-department-box">
        <h3>Add New Department</h3>
        <button onClick={handleAddDepartment}>+ Add Department</button>
      </div>
    </div>
  );
};

export default HomePage;
