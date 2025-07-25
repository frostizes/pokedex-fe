import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import { useAuth } from "../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";
import logo from "../assets/logo.png"; // Ajoute ton logo ici
import map from "../assets/Map.png"; // Ajoute ton logo ici
import explore from "../assets/explore.png"; // Ajoute ton logo ici
import picture from "../assets/picture.png"; // Ajoute ton logo ici
import profile from "../assets/profile.png"; // Ajoute ton logo ici

import mapGrey from "../assets/MapGrey.png"; // Ajoute ton logo ici
import exploreGrey from "../assets/exploreGrey.png"; // Ajoute ton logo ici
import pictureGrey from "../assets/pictureGrey.png"; // Ajoute ton logo ici
import profileGrey from "../assets/profileGrey.png"; // Ajoute ton logo ici
import profilePic from "../assets/profilePic.png"; // Ajoute ton logo ici


import { color } from "d3";

function Header() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [isHovered, setIsHovered] = useState(false);

  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [searchResultsAnimals, setSearchResultsAnimals] = useState([]);
  const [searchResultsUsers, setSearchResultsUsers] = useState([]);
  const [active, setActive] = useState("explore"); // ou 'explore' par défaut
  const icons = [
    { name: "explore", defaultImg: exploreGrey, activeImg: explore },
    { name: "map", defaultImg: mapGrey, activeImg: map },
    { name: "picture", defaultImg: pictureGrey, activeImg: picture },
    { name: "profile", defaultImg: profileGrey, activeImg: profile },
  ];
  const API_BASE_URL = import.meta.env.VITE_REACT_APP_WILD_LENS_BACKEND_BASE_URL;

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && searchQuery.trim().length > 1) {
      e.preventDefault();
      navigate(`/search/${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const token = localStorage.getItem("authToken");

      const response = await fetch(`${API_BASE_URL}/Profile/GetUserProfilePicture`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setProfilePicture(data.result);
    } catch (err) {
      console.error('Failed to fetch images', err);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    if (debouncedQuery.trim() === "") return;
    if (debouncedQuery.trim().length < 2) {
      setSearchResultsAnimals([]);
      setSearchResultsUsers([]);
      return;
    }
    const fetchResults = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(
          `${API_BASE_URL}/api/Search/${searchQuery}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setSearchResultsAnimals(response.data.animals);
        setSearchResultsUsers(response.data.users);
      } catch (err) {
        console.error("Error during search:", err);
      }
    };
    fetchResults();
  }, [debouncedQuery]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      <header className="text-white d-flex align-items-center justify-content-between p-2 custom-border" style={{ height: "65px" }}>
        {isAuthenticated ? (
          <div className="container-fluid d-flex align-items-center justify-content-between">
            {/* Left: Logo + Search */}
            <div className="d-flex align-items-center">
              <Link to="/catalog" className="text-white text-decoration-none me-3">
                <img src={logo} alt="WildLens Logo" height="60" />
              </Link>
              <form onSubmit={(e) => e.preventDefault()} className="d-flex" style={{ width: "300px" }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search for profiles or mammals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </form>
            </div>

            {/* Center: Navigation Buttons */}
            <div className="d-flex">
              {icons.map(({ name, defaultImg, activeImg }) => (
                <Link
                  key={name}
                  to="/catalog" // adapte la route si besoin
                  className="text-white text-decoration-none me-3 header-img-custom pe-3 ps-3"
                  onClick={() => setActive(name)}

                >
                  <img
                    src={active === name ? activeImg : defaultImg}
                    alt={`${name} icon`}
                    height="50"
                    style={{ cursor: "pointer" }}
                  />
                </Link>
              ))}
            </div>

            {/* Right: Account Button */}
            <div className="d-flex align-items-center">
              <div
                className="dropdown"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{ position: "relative", display: "inline-block" }}>
                <img
                  src={profilePicture || profilePic}
                  className="card-img-top rounded-circle border border-secondary"
                  alt="Animal"
                  width="50"
                  height="50"
                />
                {isHovered && (
              <ul
                className="dropdown-menu show"
                style={{
                  display: "block",
                  position: "absolute",
                  top: "50px",
                  right: "0",
                  zIndex: 1000,
                }}
              >
                <li>
                  <Link className="dropdown-item" to="/settings">Paramètres</Link>
                </li>
                <li>
                  <button className="dropdown-item" onClick={handleLogout}>Déconnexion</button>
                </li>
              </ul>
            )}
              </div>
            </div>
          </div>
        ) : (
          <div className="container-fluid d-flex align-items-center justify-content-between">
            <Link to="/" className="text-white text-decoration-none">
              <h1 className="m-0">WildLens</h1>
            </Link>
            <div className="d-flex">
              <Link to="/login">
                <button className="btn btn-light me-2">Login</button>
              </Link>
              <Link to="/register">
                <button className="btn btn-outline-light">Register</button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {(searchResultsAnimals.length > 0 || searchResultsUsers.length > 0) && searchQuery.trim().length >= 2 && (
        <div
          className="position-absolute p-3 bg-light rounded shadow overflow-auto"
          style={{ maxHeight: "200px", width: "500px", top: "70px", zIndex: 1000 }}
        >
          <ul className="list-group">
            {searchResultsAnimals.length > 0 && (
              <>
                <li className="list-group-item p-1 bg-light text-muted border-0">
                  <small>🐾 Animals</small>
                </li>
                {searchResultsAnimals.map((animal, index) => (
                  <Link
                    to={`/animalwiki/${encodeURIComponent(animal.scientificName)}`}
                    key={`animal-${index}`}
                    className="list-group-item text-dark text-decoration-none"
                    class="custom_link_class"
                    onClick={() => {
                      setSearchQuery("");
                      setSearchResultsAnimals([]);
                      setSearchResultsUsers([]);
                    }}
                  >
                    🐾 {animal.languageSpecificName ?? "Unnamed animal"}
                  </Link>
                ))}
              </>
            )}

            {searchResultsUsers.length > 0 && (
              <>
                <li className="list-group-item p-1 bg-light text-center text-muted border-0">
                  <small>👤 Users</small>
                </li>
                {searchResultsUsers.map((user, index) => (
                  <li key={`user-${index}`} className="list-group-item">
                    👤 {user ?? "Unnamed user"}
                  </li>
                ))}
              </>
            )}
          </ul>
        </div>
      )}
    </>
  );
}

export default Header;
