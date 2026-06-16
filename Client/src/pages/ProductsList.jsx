import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function ProductsList() {
  const { API_BASE, user } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter States
  const [sort, setSort] = useState(searchParams.get("sort") || "Popular");
  const [selectedCategories, setSelectedCategories] = useState(
    searchParams.get("category") ? searchParams.get("category").split(",") : []
  );
  const [selectedGenders, setSelectedGenders] = useState(
    searchParams.get("gender") ? searchParams.get("gender").split(",") : []
  );
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sync state with URL params
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    const genderParam = searchParams.get("gender");
    const sortParam = searchParams.get("sort");
    const searchParam = searchParams.get("search");

    if (categoryParam) setSelectedCategories(categoryParam.split(","));
    else setSelectedCategories([]);

    if (genderParam) setSelectedGenders(genderParam.split(","));
    else setSelectedGenders([]);

    if (sortParam) setSort(sortParam);
    if (searchParam !== null) setSearchQuery(searchParam);
  }, [searchParams]);

  // Fetch products from API
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (sort) params.append("sort", sort);
    if (selectedCategories.length > 0) params.append("category", selectedCategories.join(","));
    if (selectedGenders.length > 0) params.append("gender", selectedGenders.join(","));
    if (searchQuery) params.append("search", searchQuery);

    fetch(`${API_BASE}/products?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setLoading(false);
      });
  }, [sort, selectedCategories, selectedGenders, searchQuery, API_BASE]);

  const handleCategoryChange = (cat) => {
    let updated = [...selectedCategories];
    if (updated.includes(cat)) {
      updated = updated.filter((c) => c !== cat);
    } else {
      updated.push(cat);
    }
    setSelectedCategories(updated);
    updateURLParams("category", updated.join(","));
  };

  const handleGenderChange = (gen) => {
    let updated = [...selectedGenders];
    if (updated.includes(gen)) {
      updated = updated.filter((g) => g !== gen);
    } else {
      updated.push(gen);
    }
    setSelectedGenders(updated);
    updateURLParams("gender", updated.join(","));
  };

  const handleSortChange = (newSort) => {
    setSort(newSort);
    updateURLParams("sort", newSort);
  };

  const updateURLParams = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSort("Popular");
    setSelectedCategories([]);
    setSelectedGenders([]);
    setSearchQuery("");
    setSearchParams({});
  };

  return (
    <div style={containerStyle} className="animate-fade-in">
      {/* Sidebar Filter Panel */}
      <aside style={sidebarStyle}>
        <div style={filterHeaderStyle}>
          <h2 style={filterTitleStyle}>Filters</h2>
          <button onClick={clearFilters} style={clearButtonStyle}>Clear All</button>
        </div>

        {/* Sort Options */}
        <div style={filterGroupStyle}>
          <h3 style={groupTitleStyle}>Sort By</h3>
          {["Popular", "Price (low to high)", "Price (high to low)", "Discount"].map((opt) => (
            <label key={opt} style={radioLabelStyle}>
              <input
                type="radio"
                name="sort"
                checked={sort === opt}
                onChange={() => handleSortChange(opt)}
                style={radioInputStyle}
              />
              <span style={radioTextStyle}>{opt}</span>
            </label>
          ))}
        </div>

        {/* Categories */}
        <div style={filterGroupStyle}>
          <h3 style={groupTitleStyle}>Categories</h3>
          {["mobiles", "electronics", "sports-equipment", "fashion", "groceries"].map((cat) => (
            <label key={cat} style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat)}
                onChange={() => handleCategoryChange(cat)}
                style={checkboxInputStyle}
              />
              <span style={checkboxTextStyle}>{cat}</span>
            </label>
          ))}
        </div>

        {/* Gender */}
        <div style={filterGroupStyle}>
          <h3 style={groupTitleStyle}>Gender</h3>
          {["Men", "Women", "Unisex"].map((gen) => (
            <label key={gen} style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={selectedGenders.includes(gen)}
                onChange={() => handleGenderChange(gen)}
                style={checkboxInputStyle}
              />
              <span style={checkboxTextStyle}>{gen}</span>
            </label>
          ))}
        </div>
      </aside>

      {/* Product Grid Panel */}
      <main style={gridPanelStyle}>
        <div style={gridHeaderStyle}>
          <h1 style={gridTitleStyle}>
            {searchQuery ? `Search Results for "${searchQuery}"` : "All Products"}
          </h1>
          <span style={countTextStyle}>{products.length} products found</span>
        </div>

        {loading ? (
          <div style={loadingContainerStyle}>
            <div style={spinnerStyle}></div>
          </div>
        ) : products.length === 0 ? (
          <div style={noProductsStyle}>
            <h3>No products found matching your filters</h3>
            <p>Try resetting the categories, sort, or search terms.</p>
            <button onClick={clearFilters} className="btn btn-primary" style={{ marginTop: "16px" }}>
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid-cols-auto">
            {products.map((prod) => {
              const finalPrice = Math.round(prod.price * (1 - prod.discount / 100));
              return (
                <div key={prod._id} className="card animate-fade-in" style={productCardStyle}>
                  <div style={imgContainerStyle}>
                    <img src={prod.mainImg} alt={prod.title} style={productImgStyle} />
                    {prod.discount > 0 && (
                      <span className="badge badge-discount" style={discountBadgeStyle}>
                        {prod.discount}% OFF
                      </span>
                    )}
                  </div>
                  <div style={infoContainerStyle}>
                    <div style={metaContainerStyle}>
                      <span style={categoryBadgeStyle}>{prod.category}</span>
                      <span style={genderBadgeStyle}>{prod.gender}</span>
                    </div>
                    <h3 style={prodTitleStyle}>{prod.title}</h3>
                    <p style={prodDescStyle}>{prod.description}</p>
                    <div style={priceContainerStyle}>
                      <span style={finalPriceStyle}>₹{finalPrice}</span>
                      {prod.discount > 0 && <span style={originalPriceStyle}>₹{prod.price}</span>}
                    </div>
                    <Link to={`/product/${prod._id}`} className="btn btn-primary" style={prodButtonStyle}>
                      Shop Now
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

// Styling Objects
const containerStyle = {
  display: "grid",
  gridTemplateColumns: "260px 1fr",
  gap: "32px",
  padding: "40px 0",
  alignItems: "start"
};

const sidebarStyle = {
  background: "#fff",
  border: "1px solid var(--light-border)",
  borderRadius: "var(--radius-lg)",
  padding: "24px",
  position: "sticky",
  top: "90px"
};

const filterHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "24px",
  paddingBottom: "12px",
  borderBottom: "1px solid var(--light-border)"
};

const filterTitleStyle = {
  fontSize: "1.25rem",
  fontWeight: "800"
};

const clearButtonStyle = {
  background: "none",
  border: "none",
  color: "var(--primary)",
  fontWeight: "600",
  fontSize: "0.85rem",
  cursor: "pointer"
};

const filterGroupStyle = {
  marginBottom: "24px",
  display: "flex",
  flexDirection: "column",
  gap: "10px"
};

const groupTitleStyle = {
  fontSize: "0.95rem",
  fontWeight: "700",
  color: "var(--dark)",
  marginBottom: "4px"
};

const checkboxLabelStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  cursor: "pointer"
};

const checkboxInputStyle = {
  width: "18px",
  height: "18px",
  borderRadius: "4px",
  border: "1px solid var(--light-border)",
  cursor: "pointer",
  accentColor: "var(--primary)"
};

const checkboxTextStyle = {
  fontSize: "0.95rem",
  color: "var(--text-main)",
  textTransform: "capitalize"
};

const radioLabelStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  cursor: "pointer"
};

const radioInputStyle = {
  width: "18px",
  height: "18px",
  cursor: "pointer",
  accentColor: "var(--primary)"
};

const radioTextStyle = {
  fontSize: "0.95rem",
  color: "var(--text-main)"
};

const gridPanelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "24px"
};

const gridHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "baseline",
  flexWrap: "wrap",
  gap: "12px"
};

const gridTitleStyle = {
  fontSize: "1.8rem",
  fontWeight: "800"
};

const countTextStyle = {
  fontSize: "0.95rem",
  color: "var(--text-muted)",
  fontWeight: "500"
};

const loadingContainerStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "400px"
};

const spinnerStyle = {
  width: "40px",
  height: "40px",
  border: "4px solid var(--light-border)",
  borderTopColor: "var(--primary)",
  borderRadius: "50%",
  animation: "spin 1s linear infinite"
};

// spin animation keyframe defined inline in style block or main css
const noProductsStyle = {
  textAlign: "center",
  padding: "80px 24px",
  background: "#fff",
  borderRadius: "var(--radius-lg)",
  border: "1px solid var(--light-border)"
};

const productCardStyle = {
  display: "flex",
  flexDirection: "column",
  height: "100%",
  background: "#fff"
};

const imgContainerStyle = {
  position: "relative",
  height: "250px",
  background: "#fdfdfd",
  overflow: "hidden"
};

const productImgStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover"
};

const discountBadgeStyle = {
  position: "absolute",
  top: "12px",
  left: "12px"
};

const infoContainerStyle = {
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  flex: "1",
  gap: "10px"
};

const metaContainerStyle = {
  display: "flex",
  gap: "8px",
  fontSize: "0.75rem",
  fontWeight: "600",
  textTransform: "uppercase",
  color: "var(--text-muted)"
};

const categoryBadgeStyle = {
  background: "var(--light)",
  padding: "3px 8px",
  borderRadius: "var(--radius-sm)"
};

const genderBadgeStyle = {
  background: "var(--light)",
  padding: "3px 8px",
  borderRadius: "var(--radius-sm)"
};

const prodTitleStyle = {
  fontSize: "1.2rem",
  fontWeight: "750"
};

const prodDescStyle = {
  fontSize: "0.88rem",
  color: "var(--text-muted)",
  display: "-webkit-box",
  WebkitLineClamp: "2",
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
  lineHeight: "1.4"
};

const priceContainerStyle = {
  display: "flex",
  alignItems: "baseline",
  gap: "8px",
  marginTop: "auto",
  paddingTop: "10px"
};

const finalPriceStyle = {
  fontSize: "1.4rem",
  fontWeight: "800",
  color: "var(--primary)"
};

const originalPriceStyle = {
  fontSize: "0.95rem",
  color: "var(--text-muted)",
  textDecoration: "line-through"
};

const prodButtonStyle = {
  width: "100%",
  marginTop: "8px"
};
