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
} from "lucide-react";

type FeatureBlockProps = {
  title: string;
  items: string[];
};

// 🔥 Labels
const FEATURE_LABELS: Record<string, string> = {
  abs: "ABS",
  bluetooth: "Bluetooth",
  radio: "Radio",
  speakersFront: "Speakers Front",
  centralLocking: "Central Locking",
  driverAirbag: "Driver Air Bag",
  antiTheftDevice: "Anti Theft Device",
  keylessEntry: "Keyless Entry",
  childSafetyLocks: "Child Safety Locks",
  airConditioner: "Air Conditioner",
  powerWindowsFront: "Power Windows Front",
  powerSteering: "Power Steering",
  powerWindowsRear: "Power Windows Rear",
  lowFuelWarning: "Low Fuel Warning",
  heater: "Heater",
  steeringAdjustment: "Steering Adjustment",
  frontFogLights: "Front Fog Lights",
  rearDefogger: "Rear Defogger",
  alloyWheels: "Alloy Wheels",
};

// 🔥 Icons Mapping
const FEATURE_ICONS: Record<string, JSX.Element> = {
  bluetooth: <Music className="w-4 h-4" />,
  radio: <Radio className="w-4 h-4" />,
  speakersFront: <Speaker className="w-4 h-4" />,

  abs: <ShieldCheck className="w-4 h-4" />,
  centralLocking: <Key className="w-4 h-4" />,
  driverAirbag: <ShieldCheck className="w-4 h-4" />,
  antiTheftDevice: <ShieldCheck className="w-4 h-4" />,
  keylessEntry: <Key className="w-4 h-4" />,
  childSafetyLocks: <ShieldCheck className="w-4 h-4" />,

  airConditioner: <Snowflake className="w-4 h-4" />,
  powerSteering: <Settings className="w-4 h-4" />,
  powerWindowsFront: <Wind className="w-4 h-4" />,
  powerWindowsRear: <Wind className="w-4 h-4" />,
  lowFuelWarning: <Droplet className="w-4 h-4" />,

  heater: <Thermometer className="w-4 h-4" />,
  steeringAdjustment: <Settings className="w-4 h-4" />,
  frontFogLights: <Circle className="w-4 h-4" />,
  rearDefogger: <Wind className="w-4 h-4" />,
  alloyWheels: <Star className="w-4 h-4" />,
};

// 🔥 Label Converter
const toReadableFeature = (feature: string) => {
  if (!feature) return "";

  if (FEATURE_LABELS[feature]) return FEATURE_LABELS[feature];

  return feature
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const FeatureBlock = ({ title, items }: FeatureBlockProps) => {
  console.log(`[FeatureBlock] Rendering section: ${title}`, items);

  if (!items || items.length === 0) return null;

  return (
    <div className="mb-6">
      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-800 mb-3">
        {title}
      </h3>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 transition px-3 py-2 rounded-lg text-sm shadow-sm"
          >
            {FEATURE_ICONS[item] || <Car className="w-4 h-4" />}
            <span>{toReadableFeature(item)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeatureBlock;