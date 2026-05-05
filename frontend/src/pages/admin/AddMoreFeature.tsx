import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

interface Features {
  entertainment: string[],
  safety: string[],
  comfort: string[],
  interiorExterior: string[],
  custom: string[]
}

const AddMoreFeature = ({ features, setFeatures }: any) => {
  const [customInput, setCustomInput] = useState("");

  const handleFeatureChange = (
    category: keyof Features,
    feature: string,
    checked: boolean
  ) => {
    setFeatures((prev: Features) => {
      const currentFeatures = prev[category] as string[];
      let newFeatures: string[];
      
      if (checked) {
        // Add feature if not already present
        newFeatures = currentFeatures.includes(feature) 
          ? currentFeatures 
          : [...currentFeatures, feature];
      } else {
        // Remove feature
        newFeatures = currentFeatures.filter(f => f !== feature);
      }
      
      return {
        ...prev,
        [category]: newFeatures,
      };
    });
  };

  return (
    <div className="space-y-6">
      {/* <h1 className="text-2xl font-bold">Car Features</h1> */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Entertainment */}
        <Card>
          <CardHeader>
            <CardTitle>Entertainment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {["bluetooth", "radio", "speakersFront"].map((item) => (
              <div key={item} className="flex items-center space-x-2">
                <Checkbox
                  checked={features.entertainment.includes(item)}
                  onCheckedChange={(checked) =>
                    handleFeatureChange("entertainment", item, checked as boolean)
                  }
                />
                <Label>{item}</Label>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Safety */}
        <Card>
          <CardHeader>
            <CardTitle>Safety</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              "abs",
              "driverAirbag",
              "centralLocking",
              "antiTheftDevice",
              "keylessEntry",
              "childSafetyLocks",
            ].map((item) => (
              <div key={item} className="flex items-center space-x-2">
                <Checkbox
                  checked={features.safety.includes(item)}
                  onCheckedChange={(checked) =>
                    handleFeatureChange("safety", item, checked as boolean)
                  }
                />
                <Label>{item}</Label>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Comfort */}
        <Card>
          <CardHeader>
            <CardTitle>Comfort</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              "airConditioner",
              "powerSteering",
              "powerWindowsFront",
              "powerWindowsRear",
              "lowFuelWarning",
            ].map((item) => (
              <div key={item} className="flex items-center space-x-2">
                <Checkbox
                  checked={features.comfort.includes(item)}
                  onCheckedChange={(checked) =>
                    handleFeatureChange("comfort", item, checked as boolean)
                  }
                />
                <Label>{item}</Label>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Interior */}
        <Card>
          <CardHeader>
            <CardTitle>Interior & Exterior</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              "heater",
              "steeringAdjustment",
              "frontFogLights",
              "rearDefogger",
              "alloyWheels",
            ].map((item) => (
              <div key={item} className="flex items-center space-x-2">
                <Checkbox
                  checked={features.interiorExterior.includes(item)}
                  onCheckedChange={(checked) =>
                    handleFeatureChange("interiorExterior", item, checked as boolean)
                  }
                />
                <Label>{item}</Label>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Custom Features */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Enter custom feature"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
            />
            <Button
              type="button"
              onClick={() => {
                if (!customInput) return;
                setFeatures((prev: Features) => ({
                  ...prev,
                  custom: [...(prev.custom || []), customInput],
                }));
                setCustomInput("");
              }}
            >
              Add
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {(features.custom || []).map((item: string, index: number) => (
              <div
                key={index}
                className="px-3 py-1 bg-gray-200 rounded-full flex gap-2"
              >
                {item}
                <button
                  onClick={() =>
                    setFeatures((prev: Features) => ({
                      ...prev,
                      custom: (prev.custom || []).filter((_, i) => i !== index),
                    }))
                  }
                >
                  ❌
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddMoreFeature;