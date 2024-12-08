import React, { useState, useEffect, useContext, useMemo } from "react";
import axios from "axios";
import { Avatar, IconButton } from "@mui/material";
import Icons from "../../icons";
import { AuthContext } from "../../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import faculties from "../../data/faculties.json"; // Fakülteler JSON'dan import ediliyor
import "./UpdateProfile.css";

export const UpdateProfile = () => {
  const { user, dispatch } = useContext(AuthContext);
  const userId = user._id;
  const username = useParams().username;
  const navigate = useNavigate();
  const fileInputRef = React.createRef();

  const [firstName, setFirstName] = useState(user.firstName || "");
  const [lastName, setLastName] = useState(user.lastName || "");
  const [bio, setBio] = useState(user.bio || "");
  const [photo, setPhoto] = useState(null); // Form data için fotoğraf
  const [photoPreview, setPhotoPreview] = useState(
    user.photo || "path/to/default-avatar.png"
  );

  const [selectedFaculty, setSelectedFaculty] = useState(user.faculty || "");
  const [departments, setDepartments] = useState(user.department ? [user.department] : []);
  const [selectedDepartment, setSelectedDepartment] = useState(user.department || "");
  const [isFacultyOpen, setIsFacultyOpen] = useState(false);
  const [isDepartmentOpen, setIsDepartmentOpen] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await axios.get(`/api/users/${userId}`);
        const userData = res.data;
        setFirstName(userData.firstName || "");
        setLastName(userData.lastName || "");
        setBio(userData.bio || "");
        if (userData.photo) setPhotoPreview(userData.photo);
        if (userData.faculty) setSelectedFaculty(userData.faculty);
        if (userData.department) setSelectedDepartment(userData.department);
      } catch (error) {
        console.error("Kullanıcı verisi alınırken hata oluştu:", error);
      }
    };
    getUser();
  }, [userId]);

  const handleFacultyChange = (faculty) => {
    setSelectedFaculty(faculty);
    const selectedFacultyObj = faculties.find((fac) => fac.name === faculty);
    setDepartments(selectedFacultyObj ? selectedFacultyObj.departments : []);
    setSelectedDepartment(""); // Bölüm sıfırlanır
    setIsFacultyOpen(false);
  };

  const handleDepartmentChange = (department) => {
    setSelectedDepartment(department);
    setIsDepartmentOpen(false); // Bölüm açma durumunu kapat
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file instanceof Blob) {
      setPhoto(file); // Fotoğrafı set et
      const previewUrl = URL.createObjectURL(file);
      setPhotoPreview(previewUrl); // Önizleme URL'sini set et
    } else {
      console.error("Geçersiz dosya tipi veya dosya seçilmedi");
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current.click(); // Dosya seçici penceresini aç
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("bio", bio);
    formData.append("faculty", selectedFaculty);
    formData.append("department", selectedDepartment);
    if (photo) formData.append("photo", photo); // Fotoğrafı ekle

    try {
      const response = await axios.put("/api/users/update", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      dispatch({ type: "UPDATE_USER", payload: response.data });
      setTimeout(() => navigate(`/profile/${username}`), 2000);
    } catch (error) {
      console.error("Güncelleme hatası:", error);
    }
  };

  // Fakülteler için memoize edilmiş veri
  const facultyOptions = useMemo(() => faculties, []);

  return (
    <div className="update-profile-container">
      <div className="close-back-icon">
        <Icons.Back
          onClick={() => navigate(`/profile/${username}`)}
        />
        <span
          onClick={handleUpdate}
          style={{
            cursor: "pointer",
            color: "white",
            fontWeight: "bold",
            marginLeft: "10px",
            fontSize: "16px",
          }}
        >
          Güncelle
        </span>
      </div>

      <form className="update-profile-form">
        <div className="avatar-section" style={{ position: "relative" }}>
          <Avatar
            src={photoPreview}
            sx={{
              width: 80,
              height: 80,
              cursor: "pointer",
              position: "relative",
              zIndex: 0,
            }}
            onClick={handleAvatarClick}
          />
          <IconButton
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              color: "white",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              borderRadius: "50%",
              zIndex: 1,
              "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.7)" },
            }}
            onClick={handleAvatarClick}
          >
            <Icons.AddPhotoAlternateIcon />
          </IconButton>

          <input
            type="file"
            style={{ display: "none" }}
            ref={fileInputRef}
            onChange={handleFileChange}
          />
        </div>

        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Ad"
        />

        <input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Soyad"
        />

        <input
          type="text"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Kendinizi tanıtın"
        />

        <div className="select-container">
          <label className="select-label">Fakülte Seçin</label>
          <div
            className={`select-box ${isFacultyOpen ? "open" : ""}`}
            onClick={() => setIsFacultyOpen(!isFacultyOpen)}
          >
            {selectedFaculty || "Fakülte Seçin"}
          </div>

          <div className={`select-options ${isFacultyOpen ? "open" : ""}`}>
            {facultyOptions.map((faculty) => (
              <div
                key={faculty.name}
                className={`select-item ${
                  faculty.name === selectedFaculty ? "selected" : ""
                }`}
                onClick={() => handleFacultyChange(faculty.name)}
              >
                {faculty.name}
              </div>
            ))}
          </div>
        </div>

        {selectedFaculty && (
          <div className="select-container">
            <label className="select-label">Bölüm Seçin</label>
            <div
              className={`select-box ${isDepartmentOpen ? "open" : ""}`}
              onClick={() => setIsDepartmentOpen(!isDepartmentOpen)}
            >
              {selectedDepartment || "Bölüm Seçin"}
            </div>

            <div className={`select-options ${isDepartmentOpen ? "open" : ""}`}>
              {departments.map((department) => (
                <div
                  key={department}
                  className={`select-item ${
                    department === selectedDepartment ? "selected" : ""
                  }`}
                  onClick={() => handleDepartmentChange(department)}
                >
                  {department}
                </div>
              ))}
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
