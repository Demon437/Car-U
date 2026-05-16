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

      const res = await axios.get(
        "http://localhost:5020/api/cars/filter",
        {
          params: {
            search: searchValue,
          },
        }
      );

      console.log("📦 API Response:", res.data);

      // ✅ Handle both response formats
      const cars = res.data?.data || res.data || [];

      onFilter(cars);
    } catch (err: any) {
      console.error(
        "❌ Filter Error:",
        err.response?.data || err.message
      );

      onFilter([]);
    } finally {
      setLoading(false);
    }
  };

  // ================= AUTO SEARCH =================
  useEffect(() => {
    const delay = setTimeout(() => {
      applyFilter(search);
    }, 500);

    return () => clearTimeout(delay);
  }, [search]);

  // ================= CLEAR FILTER =================
  const clearFilter = async () => {
    setSearch("");
    applyFilter("");
  };

  // ================= UI =================
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        mb: 3,
      }}
    >
      <TextField
        label="Search cars"
        placeholder="Try: BMW, Audi, Thar, 2025, automatic..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        fullWidth
        variant="outlined"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            applyFilter();
          }
        }}
        sx={{
          input: {
            color: "white",
          },

          label: {
            color: "#d1d5db",
          },

          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: "#6b7280",
            },

            "&:hover fieldset": {
              borderColor: "#9ca3af",
            },

            "&.Mui-focused fieldset": {
              borderColor: "#ef4444",
            },
          },
        }}
      />

      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Button
          variant="contained"
          disabled={loading}
          onClick={() => applyFilter()}
          sx={{
            background:
              "linear-gradient(to right, #ef4444, #b91c1c)",

            "&:hover": {
              background:
                "linear-gradient(to right, #dc2626, #991b1b)",
            },
          }}
        >
          {loading ? "Searching..." : "Search Cars"}
        </Button>

        <Button
          variant="outlined"
          onClick={clearFilter}
          sx={{
            color: "white",
            borderColor: "#6b7280",

            "&:hover": {
              borderColor: "#ef4444",
            },
          }}
        >
          Clear
        </Button>
      </Box>
    </Box>
  );
};

export default FilterSection;