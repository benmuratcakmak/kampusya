import { useState, useRef, useCallback, useEffect } from "react";
import { Avatar, CircularProgress, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import axios from "axios";
import UserRanking from "../../components/userRanking/UserRanking";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import "./search.css";

export const Search = () => {
  const [search, setSearch] = useState("");
  const [userFilter, setUserFilter] = useState([]);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef(null);

  const shouldHideRanking = loading || userFilter.length > 0;

  const debounceSearch = useCallback((value, page = 1, limit = 5) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      if (value.length >= 3) {
        setLoading(true);
        try {
          const res = await axios.get(
            `/api/search/list?search=${value}&page=${page}&limit=${limit}`
          );
          const { users } = res.data;

          if (Array.isArray(users)) {
            setUserFilter(users);
          } else {
            console.error("Beklenmedik veri formatı:", res.data);
            setUserFilter([]);
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

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);
    debounceSearch(value);
  };

  useEffect(() => {
    if (search.length === 0) {
      setUserFilter([]);
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
            value={search}
          />
        </ClickAwayListener>
      </div>
      
      <div className="search-content">
        <div className="search-bottom">
          {loading ? (
            <div className="loading">
              <CircularProgress size={24} />
              <Typography variant="body2">Kullanıcılar aranıyor...</Typography>
            </div>
          ) : userFilter.length > 0 ? (
            userFilter.map((user) => (
              <Link
                to={`/profile/${user.username}`}
                className="search-result-link"
                key={user._id}
              >
                <div className="search-result-info">
                  <div className="left">
                    <Avatar
                      src={user.photo}
                      alt={user.username}
                      className="search-user-avatar"
                    />
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
          ) : null}
        </div>

        <div className="popularity" style={{ display: shouldHideRanking ? 'none' : 'block' }}>
          <UserRanking />
        </div>
      </div>
    </div>
  );
};