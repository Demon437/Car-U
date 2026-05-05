// Car Data Store for Dependent Dropdowns
export interface CarOption {
  brand: string;
  models: ModelOption[];
}

export interface ModelOption {
  model: string;
  variants: VariantOption[];
}

export interface VariantOption {
  variant: string;
  years: number[];
}

export const carData: CarOption[] = [
  {
    brand: "Maruti Suzuki",
    models: [
      {
        model: "Swift",
        variants: [
          {
            variant: "LXI",
            years: [2020, 2021, 2022, 2023, 2024]
          },
          {
            variant: "VXI",
            years: [2020, 2021, 2022, 2023, 2024]
          },
          {
            variant: "ZXI",
            years: [2020, 2021, 2022, 2023, 2024]
          }
        ]
      },
      {
        model: "Baleno",
        variants: [
          {
            variant: "Sigma",
            years: [2021, 2022, 2023, 2024]
          },
          {
            variant: "Delta",
            years: [2021, 2022, 2023, 2024]
          }
        ]
      },
      {
        model: "WagonR",
        variants: [
          {
            variant: "LXI",
            years: [2019, 2020, 2021, 2022, 2023]
          }
        ]
      }
    ]
  },
  {
    brand: "Hyundai",
    models: [
      {
        model: "Creta",
        variants: [
          {
            variant: "E",
            years: [2020, 2021, 2022, 2023, 2024]
          },
          {
            variant: "S",
            years: [2020, 2021, 2022, 2023, 2024]
          },
          {
            variant: "SX",
            years: [2020, 2021, 2022, 2023, 2024]
          }
        ]
      },
      {
        model: "i20",
        variants: [
          {
            variant: "Magna",
            years: [2020, 2021, 2022, 2023, 2024]
          },
          {
            variant: "Sportz",
            years: [2020, 2021, 2022, 2023, 2024]
          }
        ]
      }
    ]
  },
  {
    brand: "Tata",
    models: [
      {
        model: "Nexon",
        variants: [
          {
            variant: "XE",
            years: [2020, 2021, 2022, 2023, 2024]
          },
          {
            variant: "XM",
            years: [2020, 2021, 2022, 2023, 2024]
          }
        ]
      },
      {
        model: "Punch",
        variants: [
          {
            variant: "Pure",
            years: [2021, 2022, 2023, 2024]
          },
          {
            variant: "Adventure",
            years: [2021, 2022, 2023, 2024]
          }
        ]
      }
    ]
  },
  {
    brand: "Mahindra",
    models: [
      {
        model: "Thar",
        variants: [
          {
            variant: "AX",
            years: [2020, 2021, 2022, 2023, 2024]
          },
          {
            variant: "LX",
            years: [2020, 2021, 2022, 2023, 2024]
          }
        ]
      },
      {
        model: "XUV700",
        variants: [
          {
            variant: "W4",
            years: [2021, 2022, 2023, 2024]
          },
          {
            variant: "W8",
            years: [2021, 2022, 2023, 2024]
          }
        ]
      }
    ]
  },
  {
    brand: "Honda",
    models: [
      {
        model: "City",
        variants: [
          {
            variant: "V",
            years: [2020, 2021, 2022, 2023, 2024]
          },
          {
            variant: "VX",
            years: [2020, 2021, 2022, 2023, 2024]
          }
        ]
      },
      {
        model: "Amaze",
        variants: [
          {
            variant: "S",
            years: [2020, 2021, 2022, 2023, 2024]
          },
          {
            variant: "VX",
            years: [2020, 2021, 2022, 2023, 2024]
          }
        ]
      }
    ]
  }
];

// Helper functions to get data
export const getBrands = (): string[] => {
  return carData.map(item => item.brand);
};

export const getModelsByBrand = (brand: string): string[] => {
  const brandData = carData.find(item => item.brand === brand);
  return brandData ? brandData.models.map(model => model.model) : [];
};

export const getVariantsByBrandModel = (brand: string, model: string): string[] => {
  const brandData = carData.find(item => item.brand === brand);
  if (!brandData) return [];
  
  const modelData = brandData.models.find(m => m.model === model);
  return modelData ? modelData.variants.map(variant => variant.variant) : [];
};

export const getYearsByBrandModelVariant = (brand: string, model: string, variant: string): number[] => {
  const brandData = carData.find(item => item.brand === brand);
  if (!brandData) return [];
  
  const modelData = brandData.models.find(m => m.model === model);
  if (!modelData) return [];
  
  const variantData = modelData.variants.find(v => v.variant === variant);
  return variantData ? variantData.years : [];
};
