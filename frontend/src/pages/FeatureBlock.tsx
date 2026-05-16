import {
  Music,
  Radio,
  Speaker,
  ShieldCheck,
  Key,
  Wind,
  Settings,
  Droplet,
  Thermometer,
  Snowflake,
  Circle,
  Star,
  Car,
  CheckCircle2,
} from "lucide-react";

type FeatureBlockProps = {
  title: string;
  items: string[];
};

// =======================================
// LABELS
// =======================================
const FEATURE_LABELS: Record<
  string,
  string
> = {
  abs: "ABS",
  bluetooth: "Bluetooth",
  radio: "Radio",
  speakersFront:
    "Front Speakers",
  centralLocking:
    "Central Locking",
  driverAirbag:
    "Driver Airbag",
  antiTheftDevice:
    "Anti Theft",
  keylessEntry:
    "Keyless Entry",
  childSafetyLocks:
    "Child Locks",
  airConditioner:
    "Air Conditioner",
  powerWindowsFront:
    "Power Windows",
  powerSteering:
    "Power Steering",
  powerWindowsRear:
    "Rear Windows",
  lowFuelWarning:
    "Low Fuel Warning",
  heater: "Heater",
  steeringAdjustment:
    "Steering Adjustment",
  frontFogLights:
    "Fog Lights",
  rearDefogger:
    "Rear Defogger",
  alloyWheels:
    "Alloy Wheels",
};

// =======================================
// ICONS
// =======================================
const FEATURE_ICONS: Record<
  string,
  JSX.Element
> = {
  bluetooth:
    <Music className="w-4 h-4" />,

  radio:
    <Radio className="w-4 h-4" />,

  speakersFront:
    <Speaker className="w-4 h-4" />,

  abs:
    <ShieldCheck className="w-4 h-4" />,

  centralLocking:
    <Key className="w-4 h-4" />,

  driverAirbag:
    <ShieldCheck className="w-4 h-4" />,

  antiTheftDevice:
    <ShieldCheck className="w-4 h-4" />,

  keylessEntry:
    <Key className="w-4 h-4" />,

  childSafetyLocks:
    <ShieldCheck className="w-4 h-4" />,

  airConditioner:
    <Snowflake className="w-4 h-4" />,

  powerSteering:
    <Settings className="w-4 h-4" />,

  powerWindowsFront:
    <Wind className="w-4 h-4" />,

  powerWindowsRear:
    <Wind className="w-4 h-4" />,

  lowFuelWarning:
    <Droplet className="w-4 h-4" />,

  heater:
    <Thermometer className="w-4 h-4" />,

  steeringAdjustment:
    <Settings className="w-4 h-4" />,

  frontFogLights:
    <Circle className="w-4 h-4" />,

  rearDefogger:
    <Wind className="w-4 h-4" />,

  alloyWheels:
    <Star className="w-4 h-4" />,
};

// =======================================
// LABEL FORMATTER
// =======================================
const toReadableFeature = (
  feature: string
) => {

  if (!feature) return "";

  if (
    FEATURE_LABELS[feature]
  ) {

    return FEATURE_LABELS[
      feature
    ];
  }

  return feature
    .replace(
      /([a-z])([A-Z])/g,
      "$1 $2"
    )
    .replace(
      /[_-]+/g,
      " "
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim()
    .replace(
      /\b\w/g,
      (char) =>
        char.toUpperCase()
    );
};

// =======================================
// COMPONENT
// =======================================
const FeatureBlock = ({
  title,
  items,
}: FeatureBlockProps) => {

  if (
    !items ||
    items.length === 0
  ) return null;

  return (
    <div className="mb-8">

      {/* HEADER */}
      <div
        className="
          flex
          items-center
          justify-between
          mb-4
        "
      >

        <div>
          <h3
            className="
              text-xl
              font-bold
              text-gray-900
            "
          >
            {title}
          </h3>

          <p
            className="
              text-sm
              text-gray-500
              mt-1
            "
          >
            {
              items.length
            } Features Available
          </p>
        </div>

        <div
          className="
            hidden sm:flex
            items-center
            gap-2
            text-green-600
            text-sm
            font-medium
          "
        >
          <CheckCircle2
            className="w-4 h-4"
          />
          Verified
        </div>
      </div>

      {/* FEATURES */}
      <div
        className="
          grid
          grid-cols-2
          sm:grid-cols-3
          lg:grid-cols-4
          gap-3
        "
      >

        {items.map(
          (item, i) => (

            <div
              key={i}
              className="
                flex
                items-center
                gap-3
                rounded-2xl
                border
                bg-white
                px-4
                py-3
                hover:border-blue-200
                hover:shadow-sm
                transition-all
                duration-200
              "
            >

              {/* ICON */}
              <div
                className="
                  w-9 h-9
                  rounded-xl
                  bg-blue-50
                  text-blue-600
                  flex
                  items-center
                  justify-center
                  shrink-0
                "
              >
                {FEATURE_ICONS[
                  item
                ] || (
                  <Car
                    className="
                      w-4 h-4
                    "
                  />
                )}
              </div>

              {/* TEXT */}
              <div
                className="
                  text-sm
                  font-medium
                  text-gray-800
                  leading-5
                "
              >
                {
                  toReadableFeature(
                    item
                  )
                }
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default FeatureBlock;