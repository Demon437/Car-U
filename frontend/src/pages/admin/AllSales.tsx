import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/api";
import { Button } from "@/components/ui/button";

const AllSales = () => {

  const navigate = useNavigate();

  const [sales, setSales] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ================= SEARCH =================
  const [searchTerm, setSearchTerm] =
    useState("");

  // ================= FETCH SALES =================
  useEffect(() => {

    const fetchSales = async () => {

      try {

        setLoading(true);

        const res =
          await api.get("/admin/sales");

        console.log(
          "🔥 SALES API RESPONSE 👉",
          res.data
        );

        setSales(res.data || []);

      } catch (err) {

        setError(
          err.response?.data?.message ||
          "Failed to load sales"
        );

      } finally {

        setLoading(false);
      }
    };

    fetchSales();

  }, []);

  // ================= FILTER SALES =================
  const filteredSales = useMemo(() => {

    return sales.filter((s) => {

      // ✅ HANDLE ALL POSSIBLE STRUCTURES
      const registrationNumber =
        s.registrationNumber ||
        s.car?.registrationNumber ||
        s.car?.car?.registrationNumber ||
        "";

      return registrationNumber
        .toLowerCase()
        .replace(/\s/g, "")
        .includes(
          searchTerm
            .toLowerCase()
            .replace(/\s/g, "")
        );
    });

  }, [sales, searchTerm]);

  // ================= LOADING =================
  if (loading) {

    return (
      <div className="p-6 text-center">
        Loading sales...
      </div>
    );
  }

  // ================= ERROR =================
  if (error) {

    return (
      <div className="p-6 text-red-600 text-center">
        {error}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">

      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <h1 className="text-xl sm:text-2xl font-bold">
          All Sales
        </h1>

        {/* ================= SEARCH ================= */}
        <input
          type="text"
          placeholder="Search by Number Plate..."
          value={searchTerm}
          onChange={(e) =>
            setSearchTerm(e.target.value)
          }
          className="
            w-full md:w-80
            px-4 py-2
            border border-gray-300
            rounded-lg
            focus:outline-none
            focus:ring-2
            focus:ring-blue-500
          "
        />
      </div>

      {filteredSales.length === 0 ? (

        <p className="text-gray-500">
          No sales found
        </p>

      ) : (
        <>
          {/* ================= DESKTOP TABLE ================= */}
          <div className="hidden md:block bg-white border rounded-lg overflow-hidden">

            <table className="w-full text-sm">

              <thead className="bg-gray-50">

                <tr>
                  <th className="p-3 text-left">
                    Car
                  </th>

                  <th className="p-3 text-left">
                    Number Plate
                  </th>

                  <th className="p-3 text-left">
                    Buyer
                  </th>

                  <th className="p-3 text-right">
                    Total
                  </th>

                  <th className="p-3 text-right">
                    Paid
                  </th>

                  <th className="p-3 text-right">
                    Remaining
                  </th>

                  <th className="p-3 text-center">
                    Status
                  </th>

                  <th className="p-3 text-center">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>

                {filteredSales.map((s) => {

                  // ✅ HANDLE ALL POSSIBLE STRUCTURES
                  const registrationNumber =
                    s.registrationNumber ||
                    s.car?.registrationNumber ||
                    s.car?.car?.registrationNumber ||
                    "—";

                  const brand =
                    s.brand ||
                    s.car?.brand ||
                    s.car?.car?.brand ||
                    "";

                  const variant =
                    s.variant ||
                    s.car?.variant ||
                    s.car?.car?.variant ||
                    "";

                  return (
                    <tr
                      key={s.saleId}
                      className="border-t"
                    >

                      <td className="p-3">
                        {brand} {variant}
                      </td>

                      <td className="p-3 font-medium">
                        {registrationNumber}
                      </td>

                      <td className="p-3">
                        {s.buyer?.name || "—"}
                      </td>

                      <td className="p-3 text-right">
                        ₹
                        {Number(
                          s.totalAmount || 0
                        ).toLocaleString()}
                      </td>

                      <td className="p-3 text-right text-green-600">
                        ₹
                        {Number(
                          s.paidAmount || 0
                        ).toLocaleString()}
                      </td>

                      <td className="p-3 text-right text-red-600">
                        ₹
                        {Number(
                          s.remainingAmount || 0
                        ).toLocaleString()}
                      </td>

                      <td className="p-3 text-center">
                        <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700">
                          {s.status}
                        </span>
                      </td>

                      <td className="p-3 text-center">
                        <Button
                          size="sm"
                          onClick={() =>
                            navigate(
                              `/admin/sales/${s.saleId}`
                            )
                          }
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ================= MOBILE CARDS ================= */}
          <div className="md:hidden space-y-4">

            {filteredSales.map((s) => {

              // ✅ HANDLE ALL POSSIBLE STRUCTURES
              const registrationNumber =
                s.registrationNumber ||
                s.car?.registrationNumber ||
                s.car?.car?.registrationNumber ||
                "—";

              const brand =
                s.brand ||
                s.car?.brand ||
                s.car?.car?.brand ||
                "";

              const variant =
                s.variant ||
                s.car?.variant ||
                s.car?.car?.variant ||
                "";

              return (
                <div
                  key={s.saleId}
                  className="
                    bg-white border rounded-xl
                    p-4 space-y-3 shadow-sm
                  "
                >

                  <div className="flex justify-between items-start">

                    <div>

                      <p className="font-semibold">
                        {brand} {variant}
                      </p>

                      <p className="text-sm text-gray-500">
                        Number:
                        {" "}
                        {registrationNumber}
                      </p>

                      <p className="text-sm text-gray-500">
                        Buyer:
                        {" "}
                        {s.buyer?.name || "—"}
                      </p>
                    </div>

                    <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700">
                      {s.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">

                    <p className="text-gray-500">
                      Total
                    </p>

                    <p className="text-right font-medium">
                      ₹
                      {Number(
                        s.totalAmount || 0
                      ).toLocaleString()}
                    </p>

                    <p className="text-gray-500">
                      Paid
                    </p>

                    <p className="text-right text-green-600">
                      ₹
                      {Number(
                        s.paidAmount || 0
                      ).toLocaleString()}
                    </p>

                    <p className="text-gray-500">
                      Remaining
                    </p>

                    <p className="text-right text-red-600">
                      ₹
                      {Number(
                        s.remainingAmount || 0
                      ).toLocaleString()}
                    </p>
                  </div>

                  <Button
                    className="w-full"
                    size="sm"
                    onClick={() =>
                      navigate(
                        `/admin/sales/${s.saleId}`
                      )
                    }
                  >
                    View Details
                  </Button>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default AllSales;