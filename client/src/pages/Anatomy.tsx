import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";

const ANATOMY_HIERARCHY = {
  "Cardiovascular": { label: "Cardiovascular System", term: "Cardio/Vascular", parts: { "Heart": { term: "Cardi/o", display: "Heart", subparts: { "Ventricles": { term: "Ventricul/o", display: "Ventricles" }, "Atria": { term: "Atri/o", display: "Atria" }, "Valves": { term: "Valvul/o", display: "Valves" } } }, "Arteries": { term: "Arteri/o", display: "Arteries", subparts: { "Aorta": { term: "Aort/o", display: "Aorta" }, "Coronary": { term: "Coronary", display: "Coronary Arteries" }, "Carotid": { term: "Carotid", display: "Carotid Arteries" } } }, "Veins": { term: "Ven/o", display: "Veins", subparts: { "Vena Cava": { term: "Cava", display: "Vena Cava" }, "Pulmonary": { term: "Pulmonary Vein", display: "Pulmonary Veins" }, "Jugular": { term: "Jugular", display: "Jugular Veins" } } } } },
  "Respiratory": { label: "Respiratory System", term: "Pulmon/o", parts: { "Pharynx": { term: "Pharyn/o", display: "Throat", subparts: { "Nasopharynx": { term: "Nasopharynx", display: "Nasopharynx" }, "Oropharynx": { term: "Oropharynx", display: "Oropharynx" }, "Laryngopharynx": { term: "Laryngopharynx", display: "Laryngopharynx" } } }, "Larynx": { term: "Laryn/o", display: "Voice Box" }, "Trachea": { term: "Trachea/o", display: "Windpipe" }, "Lungs": { term: "Pulmon/o", display: "Lungs", subparts: { "Right": { term: "Right Lung", display: "Right Lung" }, "Left": { term: "Left Lung", display: "Left Lung" }, "Lobes": { term: "Lob/o", display: "Lobes" } } }, "Diaphragm": { term: "Diaphragm/o", display: "Diaphragm" } } },
  "Digestive": { label: "Digestive System", term: "Gastr/o", parts: { "Pharynx": { term: "Pharyn/o", display: "Throat", subparts: { "Nasopharynx": { term: "Nasopharynx", display: "Nasopharynx" }, "Oropharynx": { term: "Oropharynx", display: "Oropharynx" }, "Laryngopharynx": { term: "Laryngopharynx", display: "Laryngopharynx" } } }, "Esophagus": { term: "Esophag/o", display: "Food Tube" }, "Mouth": { term: "Or/o", display: "Mouth", subparts: { "Teeth": { term: "Dent/o", display: "Teeth" }, "Tongue": { term: "Gloss/o", display: "Tongue" }, "Palate": { term: "Palat/o", display: "Palate" } } }, "Stomach": { term: "Gastr/o", display: "Stomach", subparts: { "Fundus": { term: "Fundus", display: "Fundus" }, "Body": { term: "Body", display: "Body" }, "Pylorus": { term: "Pylor/o", display: "Pylorus" } } }, "Small Intestine": { term: "Enter/o", display: "Small Intestine", subparts: { "Duodenum": { term: "Duoden/o", display: "Duodenum" }, "Jejunum": { term: "Jejun/o", display: "Jejunum" }, "Ileum": { term: "Ile/o", display: "Ileum" } } }, "Large Intestine": { term: "Col/o", display: "Large Intestine", subparts: { "Cecum": { term: "Cec/o", display: "Cecum" }, "Colon": { term: "Colon/o", display: "Colon" }, "Rectum": { term: "Rect/o", display: "Rectum" }, "Anus": { term: "An/o", display: "Anus" } } }, "Liver": { term: "Hepat/o", display: "Liver" }, "Pancreas": { term: "Pancreat/o", display: "Pancreas" }, "Gallbladder": { term: "Cholecyst/o", display: "Gallbladder" } } },
  "Urinary": { label: "Urinary System", term: "Ur/o", parts: { "Kidneys": { term: "Nephr/o", display: "Kidneys", subparts: { "Cortex": { term: "Cortex", display: "Cortex" }, "Medulla": { term: "Medulla", display: "Medulla" }, "Pelvis": { term: "Pyel/o", display: "Renal Pelvis" } } }, "Ureters": { term: "Uret/o", display: "Ureters" }, "Bladder": { term: "Cyst/o", display: "Bladder" }, "Urethra": { term: "Urethr/o", display: "Urethra" } } },
  "Nervous": { label: "Nervous System", term: "Neur/o", parts: { "Brain": { term: "Encephal/o", display: "Brain", subparts: { "Cerebrum": { term: "Cerebr/o", display: "Cerebrum" }, "Cerebellum": { term: "Cerebell/o", display: "Cerebellum" }, "Brainstem": { term: "Brainstem", display: "Brainstem" } } }, "Spinal Cord": { term: "Myel/o", display: "Spinal Cord" }, "Nerves": { term: "Neur/o", display: "Nerves" } } },
  "Musculoskeletal": { label: "Musculoskeletal System", term: "Oste/o & My/o", parts: { "Bones": { term: "Oste/o", display: "Bones", subparts: { "Skull": { term: "Crani/o", display: "Skull" }, "Spine": { term: "Spondyl/o", display: "Spine" }, "Ribs": { term: "Cost/o", display: "Ribs" }, "Pelvis": { term: "Pelv/o", display: "Pelvis" } } }, "Joints": { term: "Arthr/o", display: "Joints" }, "Muscles": { term: "My/o", display: "Muscles" }, "Tendons": { term: "Tendin/o", display: "Tendons" }, "Ligaments": { term: "Ligament/o", display: "Ligaments" } } },
  "Endocrine": { label: "Endocrine System", term: "Endocrin/o", parts: { "Pituitary": { term: "Pituitar/o", display: "Pituitary Gland" }, "Thyroid": { term: "Thyr/o", display: "Thyroid" }, "Parathyroid": { term: "Parathyr/o", display: "Parathyroid" }, "Adrenal": { term: "Adren/o", display: "Adrenal Glands" }, "Pancreas": { term: "Pancreat/o", display: "Pancreas" }, "Gonads": { term: "Gonad/o", display: "Gonads" } } },
  "Integumentary": { label: "Integumentary System", term: "Derm/o", parts: { "Epidermis": { term: "Epiderm/o", display: "Epidermis" }, "Dermis": { term: "Derm/o", display: "Dermis" }, "Hypodermis": { term: "Hypoderm/o", display: "Hypodermis" }, "Hair": { term: "Pil/o", display: "Hair" }, "Nails": { term: "Onyx/o", display: "Nails" }, "Glands": { term: "Gland/o", display: "Glands" } } },
  "Sensory": { label: "Sensory System", term: "Sens/o", parts: { "Eyes": { term: "Ophthalm/o", display: "Eyes", subparts: { "Cornea": { term: "Kerat/o", display: "Cornea" }, "Iris": { term: "Iris/o", display: "Iris" }, "Lens": { term: "Lens", display: "Lens" }, "Retina": { term: "Retin/o", display: "Retina" } } }, "Ears": { term: "Ot/o", display: "Ears", subparts: { "Outer Ear": { term: "Aur/o", display: "Outer Ear" }, "Eardrum": { term: "Tympan/o", display: "Eardrum" }, "Cochlea": { term: "Cochle/o", display: "Cochlea" } } }, "Nose": { term: "Nas/o", display: "Nose" }, "Tongue": { term: "Gloss/o", display: "Tongue" }, "Skin": { term: "Derm/o", display: "Skin" } } },
  "Immune": { label: "Immune/Lymphatic System", term: "Lymph/o", parts: { "Lymph Nodes": { term: "Lymphaden/o", display: "Lymph Nodes" }, "Spleen": { term: "Splen/o", display: "Spleen" }, "Thymus": { term: "Thym/o", display: "Thymus" }, "Tonsils": { term: "Tonsill/o", display: "Tonsils" }, "Lymph Vessels": { term: "Lymph/o", display: "Lymph Vessels" } } },
  "Reproductive": { label: "Reproductive System", term: "Gonad/o", parts: { "Male": { term: "Andr/o", display: "Male Reproductive", subparts: { "Testes": { term: "Orch/o", display: "Testes" }, "Prostate": { term: "Prostat/o", display: "Prostate" }, "Penis": { term: "Pen/o", display: "Penis" } } }, "Female": { term: "Gyn/o", display: "Female Reproductive", subparts: { "Ovaries": { term: "Ovar/o", display: "Ovaries" }, "Uterus": { term: "Uter/o", display: "Uterus" }, "Vagina": { term: "Vagin/o", display: "Vagina" }, "Breasts": { term: "Mamm/o", display: "Breasts" } } } } }
};

const colorMap: Record<string, string> = {
  "Cardiovascular": "#9d3d35",
  "Respiratory": "#c85a54",
  "Digestive": "#d4a574",
  "Urinary": "#8b9dc3",
  "Nervous": "#6b5b95",
  "Musculoskeletal": "#a89968",
  "Endocrine": "#c9a876",
  "Integumentary": "#b8956a",
  "Sensory": "#9b8b7e",
  "Immune": "#a68fa0",
  "Reproductive": "#8b7b9b"
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
  const currentSystem = currentPath[0];
  const bgColor = currentSystem ? colorMap[currentSystem] : "#f5e6d3";
  const buttonColor = currentSystem ? colorMap[currentSystem] : "#9d3d35";

  if (currentPath.length === 0) {
    return (
      <div className="min-h-screen py-12" style={{ backgroundColor: "#f5e6d3" }}>
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/main-menu">
            <Button variant="outline" className="mb-8">← Main Menu</Button>
          </Link>
          <h1 className="text-5xl font-bold mb-2" style={{ color: "#3d2817" }}>Anatomy Explorer</h1>
          <p className="text-lg mb-8" style={{ color: "#5d4037" }}>Select a body system to explore</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.keys(ANATOMY_HIERARCHY).map(system => (
              <Button
                key={system}
                onClick={() => handleClick(system)}
                className="py-8 text-lg font-semibold text-white transition-all hover:shadow-lg"
                style={{ backgroundColor: colorMap[system] }}
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
      <div className="min-h-screen py-12" style={{ backgroundColor: `${bgColor}22` }}>
        <div className="max-w-4xl mx-auto px-4">
          <Button onClick={handleBack} variant="outline" className="mb-8">← Back</Button>
          <Card className="p-8 shadow-lg" style={{ backgroundColor: `${bgColor}11`, borderColor: buttonColor, borderWidth: "2px" }}>
            <p className="text-sm mb-2" style={{ color: "#666" }}>Current: {currentPath.join(" > ")}</p>
            <p className="text-3xl font-bold mb-4" style={{ color: "#2c2c2c" }}>{currentPath[currentPath.length - 1]}</p>
            <p className="text-xl font-semibold mb-2" style={{ color: buttonColor }}>Term: {currentInfo?.term}</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12" style={{ backgroundColor: `${bgColor}22` }}>
      <div className="max-w-4xl mx-auto px-4">
        <Button onClick={handleBack} variant="outline" className="mb-8">← Back</Button>
        
        <div className="mb-8">
          <p className="text-sm mb-2" style={{ color: "#666" }}>Path: {currentPath.join(" > ")}</p>
          <h1 className="text-4xl font-bold mb-2" style={{ color: "#2c2c2c" }}>{currentPath[currentPath.length - 1]}</h1>
          <p className="text-lg font-semibold" style={{ color: buttonColor }}>Term: {currentInfo?.term}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.keys(currentLevel).map(key => {
            const display = currentLevel[key].display || key;
            return (
              <Button
                key={key}
                onClick={() => handleClick(key)}
                className="py-6 text-base font-semibold text-white transition-all hover:shadow-lg flex flex-col"
                style={{ backgroundColor: buttonColor }}
              >
                <span>{display}</span>
                <span className="text-xs opacity-90 mt-1">{currentLevel[key].term}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
