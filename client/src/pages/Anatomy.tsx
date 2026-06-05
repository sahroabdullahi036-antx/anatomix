import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";

const ANATOMY_HIERARCHY = {
  "Cardiovascular": { label: "Cardiovascular System", term: "Cardio/Vascular", parts: { "Heart": { term: "Cardi/o", subparts: { "Ventricles": { term: "Ventricul/o", subparts: { "Left": { term: "LV" }, "Right": { term: "RV" } } }, "Atria": { term: "Atri/o", subparts: { "Left": { term: "LA" }, "Right": { term: "RA" } } }, "Valves": { term: "Valvul/o", subparts: { "Mitral": { term: "Mitral" }, "Aortic": { term: "Aortic" }, "Tricuspid": { term: "Tricuspid" }, "Pulmonary": { term: "Pulmonary" } } } } }, "Arteries": { term: "Arteri/o", subparts: { "Aorta": { term: "Aort/o" }, "Coronary": { term: "Coronary" }, "Carotid": { term: "Carotid" } } }, "Veins": { term: "Ven/o", subparts: { "Vena Cava": { term: "Cava" }, "Pulmonary": { term: "Pulmonary Vein" }, "Jugular": { term: "Jugular" } } } } },
  "Respiratory": { label: "Respiratory System", term: "Pulmon/o", parts: { "Lungs": { term: "Pulmon/o", subparts: { "Right": { term: "Right Lung" }, "Left": { term: "Left Lung" }, "Lobes": { term: "Lob/o", subparts: { "Upper": { term: "Upper" }, "Middle": { term: "Middle" }, "Lower": { term: "Lower" } } } } }, "Airways": { term: "Bronch/o", subparts: { "Trachea": { term: "Trachea/o" }, "Bronchi": { term: "Bronch/o" }, "Bronchioles": { term: "Bronchiol/o" } } }, "Diaphragm": { term: "Diaphragm/o", subparts: {} } } },
  "Digestive": { label: "Digestive System", term: "Gastr/o", parts: { "Pharynx": { term: "Pharyn/o", subparts: { "Nasopharynx": { term: "Nasopharynx" }, "Oropharynx": { term: "Oropharynx" }, "Laryngopharynx": { term: "Laryngopharynx" } } }, "Esophagus": { term: "Esophag/o", subparts: {} }, "Mouth": { term: "Or/o", subparts: { "Teeth": { term: "Dent/o" }, "Tongue": { term: "Gloss/o" }, "Palate": { term: "Palat/o" } } }, "Stomach": { term: "Gastr/o", subparts: { "Fundus": { term: "Fundus" }, "Body": { term: "Body" }, "Pylorus": { term: "Pylor/o" } } }, "Small Intestine": { term: "Enter/o", subparts: { "Duodenum": { term: "Duoden/o" }, "Jejunum": { term: "Jejun/o" }, "Ileum": { term: "Ile/o" } } }, "Large Intestine": { term: "Col/o", subparts: { "Cecum": { term: "Cec/o" }, "Colon": { term: "Colon/o" }, "Rectum": { term: "Rect/o" }, "Anus": { term: "An/o" } } }, "Liver": { term: "Hepat/o", subparts: {} }, "Pancreas": { term: "Pancreat/o", subparts: {} }, "Gallbladder": { term: "Cholecyst/o", subparts: {} } } },
  "Urinary": { label: "Urinary System", term: "Ur/o", parts: { "Kidneys": { term: "Nephr/o", subparts: { "Cortex": { term: "Cortex" }, "Medulla": { term: "Medulla" }, "Pelvis": { term: "Pyel/o" } } }, "Ureters": { term: "Uret/o", subparts: {} }, "Bladder": { term: "Cyst/o", subparts: {} }, "Urethra": { term: "Urethr/o", subparts: {} } } },
  "Nervous": { label: "Nervous System", term: "Neur/o", parts: { "Brain": { term: "Encephal/o", subparts: { "Cerebrum": { term: "Cerebr/o" }, "Cerebellum": { term: "Cerebell/o" }, "Brainstem": { term: "Brainstem" } } }, "Spinal Cord": { term: "Myel/o", subparts: {} }, "Nerves": { term: "Neur/o", subparts: {} } } },
  "Musculoskeletal": { label: "Musculoskeletal System", term: "Oste/o & My/o", parts: { "Bones": { term: "Oste/o", subparts: { "Skull": { term: "Crani/o" }, "Spine": { term: "Spondyl/o" }, "Ribs": { term: "Cost/o" }, "Pelvis": { term: "Pelv/o" }, "Limbs": { term: "Limb" } } }, "Joints": { term: "Arthr/o", subparts: { "Shoulder": { term: "Shoulder" }, "Elbow": { term: "Elbow" }, "Wrist": { term: "Carp/o" }, "Hip": { term: "Hip" }, "Knee": { term: "Genu/o" }, "Ankle": { term: "Tars/o" } } }, "Muscles": { term: "My/o", subparts: {} }, "Tendons": { term: "Tendin/o", subparts: {} }, "Ligaments": { term: "Ligament/o", subparts: {} } } },
  "Endocrine": { label: "Endocrine System", term: "Endocrin/o", parts: { "Pituitary": { term: "Pituitar/o", subparts: { "Anterior": { term: "Anterior" }, "Posterior": { term: "Posterior" } } }, "Thyroid": { term: "Thyr/o", subparts: {} }, "Parathyroid": { term: "Parathyr/o", subparts: {} }, "Adrenal": { term: "Adren/o", subparts: { "Cortex": { term: "Cortex" }, "Medulla": { term: "Medulla" } } }, "Pancreas": { term: "Pancreat/o", subparts: { "Islets": { term: "Islet/o" } } }, "Gonads": { term: "Gonad/o", subparts: {} } } },
  "Integumentary": { label: "Integumentary System", term: "Derm/o", parts: { "Epidermis": { term: "Epiderm/o", subparts: {} }, "Dermis": { term: "Derm/o", subparts: {} }, "Hypodermis": { term: "Hypoderm/o", subparts: {} }, "Hair": { term: "Pil/o", subparts: {} }, "Nails": { term: "Onyx/o", subparts: {} }, "Glands": { term: "Gland/o", subparts: { "Sebaceous": { term: "Sebac/o" }, "Sweat": { term: "Sudor/o" } } } } },
  "Sensory": { label: "Sensory System", term: "Sens/o", parts: { "Eyes": { term: "Ophthalm/o", subparts: { "Cornea": { term: "Kerat/o" }, "Iris": { term: "Iris/o" }, "Lens": { term: "Lens" }, "Retina": { term: "Retin/o" } } }, "Ears": { term: "Ot/o", subparts: { "Outer Ear": { term: "Aur/o" }, "Eardrum": { term: "Tympan/o" }, "Cochlea": { term: "Cochle/o" } } }, "Nose": { term: "Nas/o", subparts: {} }, "Tongue": { term: "Gloss/o", subparts: {} }, "Skin": { term: "Derm/o", subparts: {} } } },
  "Immune": { label: "Immune/Lymphatic System", term: "Lymph/o", parts: { "Lymph Nodes": { term: "Lymphaden/o", subparts: {} }, "Spleen": { term: "Splen/o", subparts: {} }, "Thymus": { term: "Thym/o", subparts: {} }, "Tonsils": { term: "Tonsill/o", subparts: {} }, "Lymph Vessels": { term: "Lymph/o", subparts: {} } } }
};

export default function Anatomy() {
  const [currentPath, setCurrentPath] = useState<string[]>([]);

  const getCurrentLevel = () => {
    let level: any = ANATOMY_HIERARCHY;
    for (const key of currentPath) {
      level = level[key];
      if (!level) return null;
      level = level.parts || level.subparts;
    }
    return level;
  };

  const getCurrentInfo = () => {
    let info: any = ANATOMY_HIERARCHY;
    for (const key of currentPath) {
      info = info[key];
      if (!info) return null;
    }
    return info;
  };

  const handleClick = (key: string) => {
    setCurrentPath([...currentPath, key]);
  };

  const handleBack = () => {
    setCurrentPath(currentPath.slice(0, -1));
  };

  const currentLevel = getCurrentLevel();
  const currentInfo = getCurrentInfo();

  if (currentPath.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/main-menu">
            <Button variant="outline" className="mb-8 flex items-center gap-2">
              <ChevronLeft className="w-4 h-4" /> Main Menu
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Anatomy Explorer</h1>
          <p className="text-gray-600 mb-8">Select a body system to explore</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.keys(ANATOMY_HIERARCHY).map(system => (
              <Button
                key={system}
                onClick={() => handleClick(system)}
                className="bg-green-600 hover:bg-green-700 text-white py-6 text-lg h-auto"
              >
                {system}
              </Button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!currentLevel || Object.keys(currentLevel).length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Button onClick={handleBack} variant="outline" className="mb-8 flex items-center gap-2">
            <ChevronLeft className="w-4 h-4" /> Back
          </Button>
          
          <Card className="p-8 bg-white shadow-lg border-2 border-green-100">
            <div className="text-center">
              <p className="text-gray-500 text-sm mb-2">Current: {currentPath.join(" > ")}</p>
              <p className="text-gray-900 text-2xl font-bold mb-4">{currentPath[currentPath.length - 1]}</p>
              <p className="text-green-600 text-xl mb-6 font-semibold">Term: {currentInfo?.term}</p>
              <p className="text-gray-600">This is the deepest level of detail for this part.</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Button onClick={handleBack} variant="outline" className="mb-8 flex items-center gap-2">
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>
        
        <div className="mb-8">
          <p className="text-gray-500 text-sm mb-2">Path: {currentPath.join(" > ")}</p>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{currentPath[currentPath.length - 1]}</h1>
          <p className="text-green-600 text-xl font-semibold">Term: {currentInfo?.term}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.keys(currentLevel).map(key => (
            <Button
              key={key}
              onClick={() => handleClick(key)}
              className="bg-green-600 hover:bg-green-700 text-white py-6 text-lg h-auto flex flex-col"
            >
              <span>{key}</span>
              <span className="text-xs opacity-80 mt-1">{currentLevel[key].term}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
