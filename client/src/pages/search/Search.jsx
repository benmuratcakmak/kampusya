  import { useState, useRef, useCallback, useEffect } from "react";
  import { Avatar, CircularProgress, Typography } from "@mui/material";
  import { Link } from "react-router-dom";
  import axios from "axios";
  import ClickAwayListener from "@mui/material/ClickAwayListener";
  import "./search.css";

  export const Search = () => {
    const [search, setSearch] = useState("");
    const [userFilter, setUserFilter] = useState([]);
    const [loading, setLoading] = useState(false);
    const timeoutRef = useRef(null); // Timeout ID'yi saklamak için ref kullanıyoruz

    // Debounce fonksiyonu (useRef ile timeout ID'si korunuyor)
    const debounceSearch = useCallback((value) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
      timeoutRef.current = setTimeout(async () => {
        if (value.length >= 3) {
          setLoading(true);
          try {
            const res = await axios.get(`/users/search/list?search=${value}`);
            
            // response'dan gelen verinin dizilere uygun olup olmadığını kontrol et
            if (Array.isArray(res.data)) {
              setUserFilter(res.data);
            } else {
              console.error("Beklenmedik veri formatı:", res.data);
              setUserFilter([]); // Veri uygun değilse boş dizi ata
            }
          } catch (error) {
            console.error("Arama başarısız oldu:", error);
            setUserFilter([]);
          } finally {
            setLoading(false);
          }
        } else {
          setUserFilter([]);
        }
      }, 500);
    }, []);

    // Search input değiştikçe debounceSearch fonksiyonunu tetikle
    const handleSearch = (e) => {
      const value = e.target.value;
      setSearch(value);
      debounceSearch(value); // Arama yazıldıkça debounce fonksiyonunu çağırıyoruz
    };

    useEffect(() => {
      if (search.length === 0) {
        setUserFilter([]); // Eğer arama kutusu boşsa sonuçları temizle
      }
    }, [search]);

    return (
      <div className="search-container">
        <div className="search-top">
          <ClickAwayListener onClickAway={() => setSearch("")}>
            <input
              type="text"
              placeholder="Kullanıcı Ara..."
              onChange={handleSearch}
              className="search-input"
              value={search}
            />
          </ClickAwayListener>
        </div>
        <div className="search-bottom">
          {loading ? (
            <div className="loading">
              <CircularProgress size={24} />
              <Typography variant="body2">Arama yapılıyor...</Typography>
            </div>
          ) : userFilter.length > 0 ? (
            userFilter.slice(0, 5).map((user) => (
              <Link
                to={`/profile/${user.username}`}
                className="search-result-link"
                key={user._id}
              >
                <div className="search-result-info">
                  <div className="left">
                    <Avatar src={user.photo} sx={{ width: 40, height: 40 }} />
                  </div>
                  <div className="right">
                    <div className="top">
                      <span>{user.username}</span>
                    </div>
                    <div className="bottom">
                      <span>{user.firstName} </span>
                      <span>{user.lastName}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="search-result-text">
              {search.length > 0 ? "Aradığın kullanıcı bulunamadı." : ""}
            </div>
          )}
        </div>
      </div>
    );
  };
