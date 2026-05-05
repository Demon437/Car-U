import { useState, useEffect } from "react";
import axios from "axios";
import { TextField, Box, Button } from "@mui/material";

type Props = {
  onFilter: (data: any[]) => void;
};

const FilterSection = ({ onFilter }: Props) => {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // ================= APPLY FILTER =================
  const applyFilter = async (value?: string) => {
    try {
      const searchValue = value ?? search;

      setLoading(true);
      console.log("🔍 Searching:", searchValue);

      const res = await axios.get("http://localhost:5000/api/cars/filter", {
        params: {
          search: searchValue, // ✅ dynamic
        },
      });

      console.log("📦 API Response:", res.data);
      onFilter(res.data.data);
    } catch (err) {
      console.error("❌ Filter Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ================= DEBOUNCE (AUTO SEARCH) =================
  useEffect(() => {
    const delay = setTimeout(() => {
      if (search.trim() !== "") {
        applyFilter(search);
      }
    }, 500);

    return () => clearTimeout(delay);
  }, [search]);

  // ================= UI =================
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
      <TextField
        label="Search cars (e.g. BMW 2022 diesel automatic)"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        fullWidth
        variant="outlined"
        sx={{
          input: { color: "white" },
          label: { color: "#d1d5db" },
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: "#6b7280",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#ef4444",
            },
          },
        }}
        placeholder="Try: BMW, Audi, Thar, 2025, automatic..."
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            applyFilter();
          }
        }}
      />

      <Box
        sx={{
          display: "flex",
          gap: 2,
        }}
      >
        <Button
          variant="contained"
          sx={{
            background: "linear-gradient(to right, #ef4444, #b91c1c)",
            "&:hover": {
              background: "linear-gradient(to right, #dc2626, #991b1b)",
            },
          }}
          onClick={() => applyFilter()}
          disabled={loading}
        >
          {loading ? "Searching..." : "Search Cars"}
        </Button>

        <Button
          variant="outlined"
          sx={{
            color: "white",
            borderColor: "#6b7280",
            "&:hover": {
              borderColor: "#ef4444",
            },
          }}
          onClick={() => {
            setSearch("");
            applyFilter(""); // reset
          }}
        >
          Clear
        </Button>
      </Box>
    </Box>
  );
};

export default FilterSection;
