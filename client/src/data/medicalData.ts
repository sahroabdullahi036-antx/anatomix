export interface BodySystem {
  id: string;
  officialName: string;
  casualName: string;
  color: string;
  emoji: string;
  structures: Structure[];
}

export interface Structure {
  id: string;
  officialName: string;
  casualName: string;
  combiningForm: string;
  definition: string;
  children?: Structure[];
}

export interface MedicalTerm {
  id: string;
  term: string;
  type: 'prefix' | 'suffix' | 'root' | 'condition' | 'procedure' | 'word';
  meaning: string;
  casualMeaning: string;
  system: string;
  example: string;
  wordParts?: { part: string; meaning: string; type: 'prefix' | 'root' | 'suffix' }[];
  definition: string;
  homonymWarning?: string;
  alternativeSystems?: string[];
  validSuffixes?: string[];
}

export const SYSTEMS: BodySystem[] = [
  {
    id: 'digestive', officialName: 'Digestive System', casualName: 'The Food Factory',
    color: '#596e60', emoji: '🍽️',
    structures: [
      { id: 'mouth', officialName: 'Oral Cavity', casualName: 'The Entry Gate', combiningForm: 'or/o, stomat/o', definition: 'The oral cavity; the opening through which food enters the digestive system', children: [
        { id: 'teeth', officialName: 'Teeth (Dentes)', casualName: 'The Grinders', combiningForm: 'dent/o, odont/o', definition: 'Hard calcified structures in the jaw used for mastication (chewing)' },
        { id: 'tongue', officialName: 'Tongue (Lingua)', casualName: 'The Taster', combiningForm: 'gloss/o, lingu/o', definition: 'Muscular organ in the mouth used for taste, chewing, and swallowing' },
        { id: 'salivary', officialName: 'Salivary Glands', casualName: 'The Spit Makers', combiningForm: 'sial/o', definition: 'Glands that produce saliva to begin chemical digestion of starches' },
      ]},
      { id: 'pharynx_d', officialName: 'Pharynx (Throat)', casualName: 'The Swallow Junction', combiningForm: 'pharyng/o', definition: 'Passageway connecting the mouth and esophagus; where food and air share a common channel' },
      { id: 'esophagus', officialName: 'Esophagus', casualName: 'The Food Pipe', combiningForm: 'esophag/o', definition: 'Muscular tube connecting the pharynx to the stomach; food moves through it by peristalsis' },
      { id: 'stomach', officialName: 'Stomach (Gaster)', casualName: 'The Acid Bath', combiningForm: 'gastr/o', definition: 'J-shaped muscular sac that churns food with gastric acid and enzymes to form chyme', children: [
        { id: 'pylorus', officialName: 'Pylorus', casualName: 'The Gatekeeper', combiningForm: 'pylor/o', definition: 'The distal (lower) portion of the stomach; the pyloric sphincter controls passage into the duodenum' },
      ]},
      { id: 'smallintestine', officialName: 'Small Intestine', casualName: 'The Long Worm', combiningForm: 'enter/o', definition: 'Twenty-foot coiled tube where most digestion and nutrient absorption occurs', children: [
        { id: 'duodenum', officialName: 'Duodenum', casualName: 'The First Section', combiningForm: 'duoden/o', definition: 'First and shortest portion of the small intestine; receives chyme from the stomach and bile from the liver' },
        { id: 'jejunum', officialName: 'Jejunum', casualName: 'The Middle Section', combiningForm: 'jejun/o', definition: 'Middle portion of the small intestine; primary site of nutrient absorption' },
        { id: 'ileum', officialName: 'Ileum', casualName: 'The Last Section', combiningForm: 'ile/o', definition: 'Terminal (last) portion of the small intestine; absorbs vitamin B12 and bile salts' },
      ]},
      { id: 'largeintestine', officialName: 'Large Intestine (Colon)', casualName: 'The Exit Ramp', combiningForm: 'col/o, colon/o', definition: 'Five-foot tube that absorbs water and electrolytes; forms and stores feces', children: [
        { id: 'cecum', officialName: 'Cecum', casualName: 'The Starting Pouch', combiningForm: 'cec/o', definition: 'Blind pouch at the beginning of the large intestine; the appendix is attached here' },
        { id: 'appendix', officialName: 'Appendix (Vermiform)', casualName: 'The Trouble Tail', combiningForm: 'append/o, appendic/o', definition: 'Worm-like sac hanging from the cecum; no known function, but can become inflamed (appendicitis)' },
        { id: 'sigmoid', officialName: 'Sigmoid Colon', casualName: 'The S-Curve', combiningForm: 'sigmoid/o', definition: 'S-shaped portion of the large intestine just before the rectum' },
        { id: 'rectum', officialName: 'Rectum', casualName: 'The Holding Bay', combiningForm: 'rect/o', definition: 'Final straight portion of the large intestine; stores feces before defecation' },
      ]},
      { id: 'liver', officialName: 'Liver (Hepar)', casualName: 'The Chemical Plant', combiningForm: 'hepat/o', definition: 'Largest gland in the body; produces bile, metabolizes nutrients, detoxifies blood, and synthesizes proteins' },
      { id: 'gallbladder', officialName: 'Gallbladder (Cholecyst)', casualName: 'The Bile Bag', combiningForm: 'cholecyst/o', definition: 'Small sac beneath the liver that stores and concentrates bile; releases bile into the duodenum during digestion' },
      { id: 'pancreas_d', officialName: 'Pancreas (Exocrine)', casualName: 'The Enzyme Factory', combiningForm: 'pancreat/o', definition: 'Gland that secretes digestive enzymes (amylase, lipase, protease) into the duodenum via the pancreatic duct' },
    ]
  },
  {
    id: 'cardiovascular', officialName: 'Cardiovascular System', casualName: 'The Pump Room',
    color: '#4a5a6a', emoji: '❤️',
    structures: [
      { id: 'heart', officialName: 'Heart (Cor)', casualName: 'The Big Pump', combiningForm: 'cardi/o', definition: 'Muscular, hollow organ that pumps blood through the circulatory system; located in the mediastinum', children: [
        { id: 'atria', officialName: 'Atria (sing. Atrium)', casualName: 'The Receiving Rooms', combiningForm: 'atri/o', definition: 'Upper chambers of the heart; receive blood from veins (right atrium from body, left atrium from lungs)' },
        { id: 'ventricles', officialName: 'Ventricles', casualName: 'The Pumping Rooms', combiningForm: 'ventricul/o', definition: 'Lower chambers of the heart; pump blood out (right ventricle to lungs, left ventricle to body)' },
        { id: 'myocardium', officialName: 'Myocardium', casualName: 'The Heart Muscle', combiningForm: 'myocardi/o', definition: 'Thick muscular wall of the heart; does the actual pumping work' },
        { id: 'pericardium', officialName: 'Pericardium', casualName: 'The Heart Sac', combiningForm: 'pericardi/o', definition: 'Double-layered fibrous sac surrounding the heart; reduces friction during heartbeats' },
      ]},
      { id: 'arteries', officialName: 'Arteries (Arteriae)', casualName: 'The Pressure Highways', combiningForm: 'arteri/o', definition: 'Thick-walled vessels that carry oxygenated blood away from the heart to body tissues (exception: pulmonary arteries carry deoxygenated blood)', children: [
        { id: 'aorta', officialName: 'Aorta', casualName: 'The Main Highway', combiningForm: 'aort/o', definition: 'Largest artery in the body; originates from the left ventricle and distributes oxygenated blood to systemic circulation' },
        { id: 'coronary', officialName: 'Coronary Arteries', casualName: 'The Heart\'s Own Supply Lines', combiningForm: 'coron/o', definition: 'Arteries that branch from the aorta to supply blood to the myocardium (heart muscle) itself' },
      ]},
      { id: 'veins', officialName: 'Veins (Venae)', casualName: 'The Return Roads', combiningForm: 'ven/o, phleb/o', definition: 'Thin-walled vessels with valves that carry deoxygenated blood back to the heart (exception: pulmonary veins carry oxygenated blood)' },
      { id: 'capillaries', officialName: 'Capillaries', casualName: 'The Tiny Tunnels', combiningForm: 'capillar/o', definition: 'Microscopic, one-cell-thick vessels where gas and nutrient exchange occurs between blood and body tissues' },
    ]
  },
  {
    id: 'respiratory', officialName: 'Respiratory System', casualName: 'The Breathing Works',
    color: '#9c6f5e', emoji: '🫁',
    structures: [
      { id: 'nose', officialName: 'Nasal Cavity (Nasus)', casualName: 'The Air Filter', combiningForm: 'nas/o, rhin/o', definition: 'Cavity inside the nose lined with mucous membrane; filters, warms, and humidifies incoming air' },
      { id: 'sinuses', officialName: 'Paranasal Sinuses', casualName: 'The Air Caves', combiningForm: 'sinus/o', definition: 'Air-filled cavities in skull bones surrounding the nasal cavity; lighten skull weight and resonate voice' },
      { id: 'pharynx_r', officialName: 'Pharynx (Nasopharynx + Oropharynx)', casualName: 'The Throat Fork', combiningForm: 'pharyng/o', definition: 'Passageway shared by air and food routes; the epiglottis directs air down the trachea during breathing' },
      { id: 'larynx', officialName: 'Larynx', casualName: 'The Voice Box', combiningForm: 'laryng/o', definition: 'Cartilaginous structure housing the vocal cords; produces voice and prevents food from entering airways' },
      { id: 'trachea', officialName: 'Trachea', casualName: 'The Windpipe', combiningForm: 'trache/o', definition: 'Cartilage-ringed tube below the larynx; conducts air to the bronchi; kept open by C-shaped cartilage rings' },
      { id: 'bronchi', officialName: 'Bronchi (sing. Bronchus)', casualName: 'The Tree Branches', combiningForm: 'bronch/o', definition: 'Two primary tubes branching from the trachea, one to each lung; carry air to the bronchioles', children: [
        { id: 'bronchioles', officialName: 'Bronchioles', casualName: 'The Tiny Branches', combiningForm: 'bronchiol/o', definition: 'Smaller branches of bronchi without cartilage; smooth muscle controls their diameter for airflow regulation' },
      ]},
      { id: 'lungs', officialName: 'Lungs (Pulmones)', casualName: 'The Gas Bags', combiningForm: 'pulmon/o, pneum/o', definition: 'Paired spongy organs of gas exchange; right lung has 3 lobes, left lung has 2 lobes to accommodate the heart', children: [
        { id: 'alveoli', officialName: 'Alveoli (sing. Alveolus)', casualName: 'The Tiny Air Sacs', combiningForm: 'alveol/o', definition: 'Microscopic air sacs at the ends of bronchioles; site of oxygen-carbon dioxide exchange with capillaries' },
        { id: 'pleura', officialName: 'Pleura (Pleural Membranes)', casualName: 'The Lung Wrappers', combiningForm: 'pleur/o', definition: 'Double-layered membrane surrounding each lung; pleural fluid between layers reduces friction during breathing' },
      ]},
      { id: 'diaphragm', officialName: 'Diaphragm', casualName: 'The Breathing Floor', combiningForm: 'diaphragm/o, phren/o', definition: 'Dome-shaped muscle separating thoracic and abdominal cavities; primary muscle of respiration; contracts on inhalation' },
    ]
  },
  {
    id: 'nervous', officialName: 'Nervous System', casualName: 'Big Brain & Wires',
    color: '#5c4a6a', emoji: '🧠',
    structures: [
      { id: 'brain', officialName: 'Brain (Encephalon)', casualName: 'The Command Center', combiningForm: 'encephal/o', definition: 'Mass of nerve tissue in the cranial cavity; controls all body functions, consciousness, thought, and emotion', children: [
        { id: 'cerebrum', officialName: 'Cerebrum', casualName: 'The Big Thinker', combiningForm: 'cerebr/o', definition: 'Largest part of the brain; controls voluntary movement, sensation, speech, thought, and memory; divided into two hemispheres' },
        { id: 'cerebellum', officialName: 'Cerebellum', casualName: 'The Balance Keeper', combiningForm: 'cerebell/o', definition: 'Posterior region of the brain; coordinates muscular movements, maintains balance and posture' },
        { id: 'brainstem', officialName: 'Brain Stem (Medulla + Pons + Midbrain)', casualName: 'The Life-Support Stick', combiningForm: 'myelencephal/o', definition: 'Connects brain to spinal cord; controls breathing, heart rate, blood pressure, and other vital functions' },
      ]},
      { id: 'spinalcord', officialName: 'Spinal Cord (Medulla Spinalis)', casualName: 'The Main Cable', combiningForm: 'myel/o', definition: 'Column of nerve tissue running through the vertebral canal; conducts nerve impulses between brain and body', homonymWarning: 'myel/o also means bone marrow in hematology contexts' },
      { id: 'nerves', officialName: 'Peripheral Nerves', casualName: 'The Wire Network', combiningForm: 'neur/o', definition: 'Bundles of nerve fibers connecting the central nervous system to muscles, organs, and sensory receptors' },
      { id: 'meninges', officialName: 'Meninges (3 membranes)', casualName: 'The Brain Wrapper', combiningForm: 'mening/o, meningi/o', definition: 'Three protective membranes (dura mater, arachnoid, pia mater) surrounding the brain and spinal cord' },
    ]
  },
  {
    id: 'musculoskeletal', officialName: 'Musculoskeletal System', casualName: 'The Frame & Engine',
    color: '#4f4f4f', emoji: '💪',
    structures: [
      { id: 'bones', officialName: 'Bones (Ossa)', casualName: 'The Hard Frame', combiningForm: 'oste/o', definition: 'Hard, dense connective tissue forming the skeleton; provides structure, protects organs, stores calcium, and produces blood cells', children: [
        { id: 'skull', officialName: 'Cranium (Skull)', casualName: 'The Brain Helmet', combiningForm: 'crani/o', definition: 'Bony structure encasing and protecting the brain; composed of 8 cranial and 14 facial bones' },
        { id: 'spine', officialName: 'Vertebral Column (Spine)', casualName: 'The Backbone', combiningForm: 'spondyl/o, vertebr/o', definition: '33 vertebrae stacked to form the spinal column; protects the spinal cord and supports upright posture' },
        { id: 'ribs', officialName: 'Ribs (Costae)', casualName: 'The Chest Cage Bars', combiningForm: 'cost/o', definition: '12 pairs of curved bones forming the thoracic cage; protect the heart and lungs' },
        { id: 'pelvis', officialName: 'Pelvis (Pelvic Girdle)', casualName: 'The Hip Bowl', combiningForm: 'pelv/o, pelvi/o', definition: 'Basin-shaped ring of bones at the base of the spine; supports the spine and transfers weight to the legs' },
      ]},
      { id: 'joints', officialName: 'Joints (Articulations)', casualName: 'The Hinges', combiningForm: 'arthr/o', definition: 'Points where two or more bones meet; allow movement and bear body weight' },
      { id: 'muscles', officialName: 'Skeletal Muscles', casualName: 'The Motors', combiningForm: 'my/o, muscul/o', definition: 'Voluntary striated muscles attached to bones via tendons; produce movement through contraction' },
      { id: 'tendons', officialName: 'Tendons', casualName: 'The Rope Connectors', combiningForm: 'tendin/o, ten/o', definition: 'Fibrous connective tissue bands connecting muscles to bones; transmit the force of muscle contraction' },
      { id: 'cartilage', officialName: 'Cartilage', casualName: 'The Smooth Cushions', combiningForm: 'chondr/o', definition: 'Flexible connective tissue covering joint surfaces; acts as shock absorber and reduces friction' },
    ]
  },
  {
    id: 'urinary', officialName: 'Urinary System', casualName: 'The Filter Plant',
    color: '#3b5e66', emoji: '🫘',
    structures: [
      { id: 'kidneys', officialName: 'Kidneys (Renes)', casualName: 'The Blood Cleaners', combiningForm: 'nephr/o, ren/o', definition: 'Pair of bean-shaped organs that filter blood, regulate fluid balance, and produce urine; located retroperitoneally', children: [
        { id: 'nephron', officialName: 'Nephron (Functional Unit)', casualName: 'The Tiny Filter', combiningForm: 'nephr/o', definition: 'Microscopic functional unit of the kidney; each kidney contains ~1 million nephrons that filter blood to form urine' },
        { id: 'renalpelvis', officialName: 'Renal Pelvis', casualName: 'The Collection Cup', combiningForm: 'pyel/o', definition: 'Funnel-shaped basin in the center of the kidney that collects urine and funnels it into the ureter' },
      ]},
      { id: 'ureters', officialName: 'Ureters', casualName: 'The Drain Tubes', combiningForm: 'ureter/o', definition: 'Two narrow tubes carrying urine from the kidneys to the urinary bladder by peristalsis' },
      { id: 'bladder', officialName: 'Urinary Bladder', casualName: 'The Storage Tank', combiningForm: 'cyst/o, vesic/o', definition: 'Muscular sac that stores urine; holds 300-500 mL; the detrusor muscle contracts to expel urine', homonymWarning: 'cyst/o means bladder in urinary contexts but means sac or cyst in other contexts' },
      { id: 'urethra', officialName: 'Urethra', casualName: 'The Exit Tube', combiningForm: 'urethr/o', definition: 'Tube carrying urine from bladder to outside the body; female urethra is ~4 cm; male urethra is ~20 cm' },
    ]
  },
  {
    id: 'endocrine', officialName: 'Endocrine System', casualName: 'The Signal Tower',
    color: '#3b5e66', emoji: '⚗️',
    structures: [
      { id: 'pituitary', officialName: 'Pituitary Gland (Hypophysis)', casualName: 'The Master Gland', combiningForm: 'pituitar/o, hypophys/o', definition: 'Pea-sized gland at the base of the brain; releases hormones that control most other endocrine glands; called the "master gland"' },
      { id: 'thyroid', officialName: 'Thyroid Gland', casualName: 'The Metabolic Dial', combiningForm: 'thyr/o, thyroid/o', definition: 'Butterfly-shaped gland in the neck; produces T3 and T4 hormones that regulate metabolism, growth, and energy use' },
      { id: 'parathyroid', officialName: 'Parathyroid Glands (4)', casualName: 'The Calcium Cops', combiningForm: 'parathyroid/o', definition: 'Four small glands embedded in the thyroid; produce PTH (parathyroid hormone) to regulate blood calcium levels' },
      { id: 'adrenal', officialName: 'Adrenal Glands (Suprarenal)', casualName: 'The Stress Factories', combiningForm: 'adren/o, adrenal/o', definition: 'Glands atop each kidney; adrenal cortex produces cortisol and aldosterone; adrenal medulla produces epinephrine (adrenaline)' },
      { id: 'pancreas_e', officialName: 'Pancreatic Islets (Islets of Langerhans)', casualName: 'The Sugar Boss', combiningForm: 'pancreat/o', definition: 'Clusters of endocrine cells within the pancreas; beta cells produce insulin; alpha cells produce glucagon to regulate blood sugar' },
    ]
  },
  {
    id: 'integumentary', officialName: 'Integumentary System', casualName: 'The Outer Shell',
    color: '#3b5e66', emoji: '🧬',
    structures: [
      { id: 'epidermis', officialName: 'Epidermis', casualName: 'The Outer Armor', combiningForm: 'epiderm/o', definition: 'Outermost, avascular layer of skin; composed of stratified squamous epithelium; produces keratin for waterproofing' },
      { id: 'dermis', officialName: 'Dermis', casualName: 'The Inner Cushion', combiningForm: 'derm/o, dermat/o', definition: 'Thick layer of connective tissue beneath the epidermis; contains hair follicles, sweat glands, nerves, and blood vessels' },
      { id: 'hypodermis', officialName: 'Hypodermis (Subcutaneous Tissue)', casualName: 'The Fat Padding', combiningForm: 'hypo/o, sub/o, cutane/o', definition: 'Deepest layer of the skin; composed of adipose tissue; insulates, cushions, and stores energy' },
      { id: 'hair', officialName: 'Hair (Pili)', casualName: 'The Tiny Threads', combiningForm: 'pil/o, trich/o', definition: 'Filaments of keratin growing from follicles in the dermis; provide insulation and protection' },
      { id: 'nails', officialName: 'Nails (Ungues)', casualName: 'The Keratin Plates', combiningForm: 'onych/o, ungu/o', definition: 'Hard keratin plates on the dorsal surface of finger and toe tips; protect the digits and aid in fine manipulation' },
      { id: 'sweatglands', officialName: 'Sweat Glands (Sudoriferous)', casualName: 'The AC Units', combiningForm: 'hidr/o, sudor/o', definition: 'Glands embedded in the dermis that produce sweat; regulate body temperature through evaporative cooling' },
    ]
  },
  {
    id: 'lymphatic', officialName: 'Lymphatic System', casualName: 'The Cleanup Crew',
    color: '#4a5a6e', emoji: '🛡️',
    structures: [
      { id: 'lymphnodes', officialName: 'Lymph Nodes', casualName: 'The Filter Stations', combiningForm: 'lymphaden/o', definition: 'Bean-shaped glands along lymph vessels; filter lymph fluid and produce lymphocytes to fight infection' },
      { id: 'spleen', officialName: 'Spleen', casualName: 'The Blood Filter', combiningForm: 'splen/o', definition: 'Largest lymphoid organ; filters old red blood cells from blood and stores platelets; also produces lymphocytes' },
      { id: 'thymus', officialName: 'Thymus', casualName: 'The T-Cell School', combiningForm: 'thym/o', definition: 'Gland in the mediastinum; where T lymphocytes mature; large in childhood, shrinks after puberty' },
      { id: 'tonsils', officialName: 'Tonsils (Palatine)', casualName: 'The Throat Guards', combiningForm: 'tonsill/o', definition: 'Lymphoid tissue masses at the back of the throat; trap and destroy pathogens entering through mouth and nose' },
    ]
  },
  {
    id: 'reproductive', officialName: 'Reproductive System', casualName: 'Life Makers',
    color: '#6a4a5e', emoji: '🌱',
    structures: [
      { id: 'testes', officialName: 'Testes (sing. Testis)', casualName: 'The Sperm Makers', combiningForm: 'orch/o, orchi/o, orchid/o, test/o', definition: 'Paired male gonads in the scrotum; produce sperm (spermatogenesis) and testosterone' },
      { id: 'ovaries', officialName: 'Ovaries', casualName: 'The Egg Vaults', combiningForm: 'oophor/o, ovari/o', definition: 'Paired female gonads; produce eggs (oocytes) and hormones estrogen and progesterone' },
      { id: 'uterus', officialName: 'Uterus (Womb)', casualName: 'The Baby Room', combiningForm: 'uter/o, metr/o, hyster/o', definition: 'Muscular, hollow organ in the female pelvis; site of fetal development during pregnancy; sheds lining during menstruation' },
      { id: 'vagina', officialName: 'Vagina', casualName: 'The Birth Canal', combiningForm: 'vagin/o, colp/o', definition: 'Muscular canal connecting the uterus to the external genitalia; serves as birth canal and receives penis during intercourse' },
      { id: 'prostate', officialName: 'Prostate Gland', casualName: 'The Fluid Maker', combiningForm: 'prostat/o', definition: 'Walnut-sized gland surrounding the male urethra below the bladder; produces seminal fluid that nourishes and transports sperm' },
    ]
  },
  {
    id: 'blood', officialName: 'Blood & Hematic System', casualName: 'The River System',
    color: '#4a5a6a', emoji: '🩸',
    structures: [
      { id: 'erythrocytes', officialName: 'Erythrocytes (Red Blood Cells)', casualName: 'The Oxygen Carriers', combiningForm: 'erythr/o, erythrocyt/o', definition: 'Biconcave disk-shaped cells lacking nuclei; contain hemoglobin to transport oxygen from lungs to tissues' },
      { id: 'leukocytes', officialName: 'Leukocytes (White Blood Cells)', casualName: 'The Infection Fighters', combiningForm: 'leuk/o, leukocyt/o', definition: 'Nucleated blood cells that defend the body against infection; include neutrophils, lymphocytes, monocytes, eosinophils, and basophils' },
      { id: 'platelets', officialName: 'Thrombocytes (Platelets)', casualName: 'The Clot Makers', combiningForm: 'thrombocyt/o', definition: 'Tiny cell fragments produced by megakaryocytes; essential for blood clotting (hemostasis); activated by vessel injury' },
      { id: 'plasma', officialName: 'Plasma', casualName: 'The Liquid Carrier', combiningForm: 'plasm/o', definition: 'Pale yellow liquid portion of blood (55% of volume); contains proteins, nutrients, hormones, and waste products' },
      { id: 'bonemarrow', officialName: 'Bone Marrow (Medulla Ossium)', casualName: 'The Blood Cell Factory', combiningForm: 'myel/o', definition: 'Soft tissue inside bones; red marrow produces all blood cells (hematopoiesis); yellow marrow stores fat', homonymWarning: 'myel/o means bone marrow here, but also means spinal cord in neurology contexts' },
    ]
  },
  {
    id: 'special-senses', officialName: 'Special Senses', casualName: 'The Sensory Portals',
    color: '#4a6e5a', emoji: '👁️',
    structures: [
      { id: 'eye', officialName: 'Eye (Oculus)', casualName: 'The Vision Camera', combiningForm: 'ocul/o, ophthalm/o', definition: 'Organ of sight; converts light into nerve impulses processed by the visual cortex of the brain', children: [
        { id: 'cornea', officialName: 'Cornea', casualName: 'The Clear Window', combiningForm: 'corne/o, kerat/o', definition: 'Transparent, avascular dome at the front of the eye; primary site of light refraction', homonymWarning: 'kerat/o means cornea in ophthalmology but means hard or horny tissue in dermatology (keratosis = hardening of skin)' },
        { id: 'iris_eye', officialName: 'Iris', casualName: 'The Color Ring', combiningForm: 'irid/o, ir/o', definition: 'Pigmented muscular ring behind the cornea; controls pupil size to regulate the amount of light entering the eye' },
        { id: 'lens', officialName: 'Crystalline Lens', casualName: 'The Focusing Disc', combiningForm: 'phac/o, phak/o', definition: 'Transparent, biconvex structure that focuses light onto the retina; becomes less flexible with age (presbyopia)' },
        { id: 'retina', officialName: 'Retina', casualName: 'The Film Screen', combiningForm: 'retin/o', definition: 'Innermost sensory layer of the eye containing rods (dim light) and cones (color) that convert light to electrical signals' },
        { id: 'conjunctiva', officialName: 'Conjunctiva', casualName: 'The Moist Lining', combiningForm: 'conjunctiv/o', definition: 'Thin transparent mucous membrane covering the anterior sclera and inner eyelids; keeps the eye moist' },
        { id: 'eyelid', officialName: 'Eyelid (Palpebra)', casualName: 'The Shutter', combiningForm: 'blephar/o', definition: 'Movable fold of skin covering and protecting the eye; spreads tears over the cornea with blinking' },
      ]},
      { id: 'ear', officialName: 'Ear (Auris)', casualName: 'The Sound Processor', combiningForm: 'aur/o, ot/o', definition: 'Organ of hearing and equilibrium; converts sound waves into nerve impulses and detects head position and rotation', children: [
        { id: 'tympanic', officialName: 'Tympanic Membrane (Eardrum)', casualName: 'The Sound Drum', combiningForm: 'tympan/o, myring/o', definition: 'Thin membrane separating the outer and middle ear; vibrates in response to sound waves to transmit sound energy to the ossicles' },
        { id: 'ossicles', officialName: 'Ossicles (Malleus, Incus, Stapes)', casualName: 'The Three Tiny Bones', combiningForm: 'ossicul/o', definition: 'The three smallest bones in the human body, located in the middle ear; amplify and transmit vibrations from the eardrum to the inner ear' },
        { id: 'cochlea', officialName: 'Cochlea', casualName: 'The Hearing Coil', combiningForm: 'cochle/o', definition: 'Snail-shaped, fluid-filled structure in the inner ear; hair cells on the basilar membrane convert sound vibrations into nerve impulses' },
        { id: 'semicircular', officialName: 'Semicircular Canals', casualName: 'The Balance Rings', combiningForm: 'vestibul/o', definition: 'Three fluid-filled loops in the inner ear oriented in perpendicular planes; detect rotational head movement and are essential for balance' },
      ]},
      { id: 'olfactory', officialName: 'Olfactory Epithelium', casualName: 'The Smell Detector', combiningForm: 'olfact/o, osm/o', definition: 'Specialized sensory epithelium in the roof of the nasal cavity; olfactory receptor neurons detect airborne chemical molecules and transmit signals to the brain' },
    ]
  },
];

export const ALL_TERMS: MedicalTerm[] = [
  // PREFIXES
  { id: 'p1', term: 'a-, an-', type: 'prefix', meaning: 'without, not', casualMeaning: 'none of it / missing completely', system: 'General', example: 'anemia (without enough blood cells), apnea (without breathing)', definition: 'Prefix meaning without or absence of', wordParts: [] },
  { id: 'p2', term: 'ab-', type: 'prefix', meaning: 'away from', casualMeaning: 'moving away from something', system: 'General', example: 'abduction (moving limb away from body midline)', definition: 'Prefix meaning away from' },
  { id: 'p3', term: 'ad-', type: 'prefix', meaning: 'toward, near', casualMeaning: 'moving closer to something', system: 'General', example: 'adduction (moving limb toward body midline)', definition: 'Prefix meaning toward' },
  { id: 'p4', term: 'ante-', type: 'prefix', meaning: 'before, forward', casualMeaning: 'in front of or before', system: 'General', example: 'antepartum (before birth)', definition: 'Prefix meaning before in time or place' },
  { id: 'p5', term: 'anti-', type: 'prefix', meaning: 'against', casualMeaning: 'fighting against', system: 'General', example: 'antibiotic (against bacteria)', definition: 'Prefix meaning against' },
  { id: 'p6', term: 'bi-', type: 'prefix', meaning: 'two', casualMeaning: 'two of them', system: 'General', example: 'bilateral (both sides)', definition: 'Prefix meaning two' },
  { id: 'p7', term: 'brady-', type: 'prefix', meaning: 'slow', casualMeaning: 'going slow', system: 'Cardiovascular', example: 'bradycardia (slow heart rate)', definition: 'Prefix meaning slow' },
  { id: 'p8', term: 'dys-', type: 'prefix', meaning: 'bad, painful, difficult', casualMeaning: 'something wrong or hard', system: 'General', example: 'dyspnea (difficult breathing), dysphagia (difficult swallowing)', definition: 'Prefix meaning bad, painful, or difficult' },
  { id: 'p9', term: 'endo-', type: 'prefix', meaning: 'within', casualMeaning: 'deep inside', system: 'General', example: 'endoscopy (viewing within), endocardium (inner heart lining)', definition: 'Prefix meaning within' },
  { id: 'p10', term: 'epi-', type: 'prefix', meaning: 'upon, above', casualMeaning: 'sitting on top of', system: 'General', example: 'epidermis (upon the skin), epiglottis (upon the glottis)', definition: 'Prefix meaning upon or above' },
  { id: 'p11', term: 'eu-', type: 'prefix', meaning: 'good, normal', casualMeaning: 'normal and healthy', system: 'General', example: 'eupnea (normal breathing)', definition: 'Prefix meaning good or normal' },
  { id: 'p12', term: 'ex-, exo-', type: 'prefix', meaning: 'out, outside', casualMeaning: 'coming out', system: 'General', example: 'exocrine (secreting outward), exostosis (bone growth outward)', definition: 'Prefix meaning out or outside' },
  { id: 'p13', term: 'hemi-', type: 'prefix', meaning: 'half', casualMeaning: 'only half of it', system: 'General', example: 'hemiplegia (paralysis of one side)', definition: 'Prefix meaning half' },
  { id: 'p14', term: 'hyper-', type: 'prefix', meaning: 'above, excessive', casualMeaning: 'too much of it', system: 'General', example: 'hypertension (high blood pressure), hyperglycemia (high blood sugar)', definition: 'Prefix meaning excessive or above normal' },
  { id: 'p15', term: 'hypo-', type: 'prefix', meaning: 'below, deficient', casualMeaning: 'not enough of it', system: 'General', example: 'hypotension (low blood pressure), hypothyroidism (underactive thyroid)', definition: 'Prefix meaning below or deficient' },
  { id: 'p16', term: 'inter-', type: 'prefix', meaning: 'between', casualMeaning: 'in the middle of two things', system: 'General', example: 'intercostal (between the ribs)', definition: 'Prefix meaning between' },
  { id: 'p17', term: 'intra-', type: 'prefix', meaning: 'within', casualMeaning: 'right inside it', system: 'General', example: 'intramuscular (within muscle), intravenous (within a vein)', definition: 'Prefix meaning within' },
  { id: 'p18', term: 'macro-', type: 'prefix', meaning: 'large', casualMeaning: 'bigger than normal', system: 'General', example: 'macrophage (large eating cell)', definition: 'Prefix meaning large' },
  { id: 'p19', term: 'micro-', type: 'prefix', meaning: 'small', casualMeaning: 'tiny, microscopic', system: 'General', example: 'microscope (instrument for viewing small things)', definition: 'Prefix meaning small' },
  { id: 'p20', term: 'neo-', type: 'prefix', meaning: 'new', casualMeaning: 'brand new', system: 'General', example: 'neoplasm (new growth/tumor)', definition: 'Prefix meaning new' },
  { id: 'p21', term: 'oligo-', type: 'prefix', meaning: 'scanty, few', casualMeaning: 'very few of them', system: 'General', example: 'oliguria (scanty urine output)', definition: 'Prefix meaning few or scanty' },
  { id: 'p22', term: 'para-', type: 'prefix', meaning: 'beside, abnormal', casualMeaning: 'next to or gone wrong', system: 'General', example: 'paraplegia (paralysis of lower body), parathyroid (beside the thyroid)', definition: 'Prefix meaning beside or abnormal' },
  { id: 'p23', term: 'peri-', type: 'prefix', meaning: 'around', casualMeaning: 'wrapped all around', system: 'General', example: 'pericardium (around the heart), peritoneum (around abdominal organs)', definition: 'Prefix meaning around or surrounding' },
  { id: 'p24', term: 'poly-', type: 'prefix', meaning: 'many, much', casualMeaning: 'loads and loads of it', system: 'General', example: 'polyuria (excessive urination), polycythemia (many red blood cells)', definition: 'Prefix meaning many or much' },
  { id: 'p25', term: 'post-', type: 'prefix', meaning: 'after, behind', casualMeaning: 'after it happened', system: 'General', example: 'postoperative (after surgery), postnatal (after birth)', definition: 'Prefix meaning after or behind' },
  { id: 'p26', term: 'pre-', type: 'prefix', meaning: 'before', casualMeaning: 'before it happens', system: 'General', example: 'prenatal (before birth)', definition: 'Prefix meaning before' },
  { id: 'p27', term: 'pro-', type: 'prefix', meaning: 'before, forward', casualMeaning: 'moving forward or before', system: 'General', example: 'prognosis (before knowing outcome)', definition: 'Prefix meaning before or forward' },
  { id: 'p28', term: 'retro-', type: 'prefix', meaning: 'behind, backward', casualMeaning: 'going backwards', system: 'General', example: 'retroperitoneal (behind the peritoneum)', definition: 'Prefix meaning behind or backward' },
  { id: 'p29', term: 'sub-', type: 'prefix', meaning: 'under, below', casualMeaning: 'under or beneath', system: 'General', example: 'subcutaneous (under the skin)', definition: 'Prefix meaning under or below' },
  { id: 'p30', term: 'supra-', type: 'prefix', meaning: 'above, upon', casualMeaning: 'above or on top', system: 'General', example: 'suprarenal (above the kidney)', definition: 'Prefix meaning above' },
  { id: 'p31', term: 'syn-, sym-', type: 'prefix', meaning: 'together, joined', casualMeaning: 'joined together', system: 'General', example: 'syndrome (symptoms occurring together)', definition: 'Prefix meaning together or joined' },
  { id: 'p32', term: 'tachy-', type: 'prefix', meaning: 'fast, rapid', casualMeaning: 'racing fast', system: 'Cardiovascular', example: 'tachycardia (fast heart rate)', definition: 'Prefix meaning rapid' },
  { id: 'p33', term: 'trans-', type: 'prefix', meaning: 'across, through', casualMeaning: 'passing completely through', system: 'General', example: 'transdermal (through the skin)', definition: 'Prefix meaning across or through' },
  { id: 'p34', term: 'tri-', type: 'prefix', meaning: 'three', casualMeaning: 'three of them', system: 'General', example: 'tricuspid (three cusps/leaflets)', definition: 'Prefix meaning three' },
  { id: 'p35', term: 'ultra-', type: 'prefix', meaning: 'beyond, excess', casualMeaning: 'way beyond normal', system: 'General', example: 'ultrasound (beyond audible sound frequency)', definition: 'Prefix meaning beyond' },
  { id: 'p36', term: 'uni-', type: 'prefix', meaning: 'one, single', casualMeaning: 'just one', system: 'General', example: 'unilateral (one side only)', definition: 'Prefix meaning one' },

  // SUFFIXES
  { id: 's1', term: '-algia', type: 'suffix', meaning: 'pain', casualMeaning: 'it hurts there', system: 'General', example: 'neuralgia (nerve pain), arthralgia (joint pain)', definition: 'Suffix meaning pain', validSuffixes: [] },
  { id: 's2', term: '-centesis', type: 'suffix', meaning: 'surgical puncture', casualMeaning: 'poking a needle in to drain fluid', system: 'General', example: 'thoracentesis (puncture of chest to drain fluid)', definition: 'Suffix meaning surgical puncture to aspirate fluid' },
  { id: 's3', term: '-cyte', type: 'suffix', meaning: 'cell', casualMeaning: 'a type of cell', system: 'General', example: 'erythrocyte (red blood cell)', definition: 'Suffix meaning cell' },
  { id: 's4', term: '-desis', type: 'suffix', meaning: 'surgical binding, fusion', casualMeaning: 'fusing two bones/parts together', system: 'Musculoskeletal', example: 'arthrodesis (surgical fusion of a joint)', definition: 'Suffix meaning surgical binding or fusion' },
  { id: 's5', term: '-dynia', type: 'suffix', meaning: 'pain', casualMeaning: 'aching pain', system: 'General', example: 'mastodynia (breast pain)', definition: 'Suffix meaning pain' },
  { id: 's6', term: '-ectasis, -ectasia', type: 'suffix', meaning: 'dilation, expansion', casualMeaning: 'stretched and widened beyond normal', system: 'General', example: 'bronchiectasis (dilation of bronchi)', definition: 'Suffix meaning dilation or expansion of a structure' },
  { id: 's7', term: '-ectomy', type: 'suffix', meaning: 'surgical removal', casualMeaning: 'cutting it completely out', system: 'General', example: 'appendectomy (removal of appendix), gastrectomy (removal of stomach)', definition: 'Suffix meaning surgical removal or excision' },
  { id: 's8', term: '-emia', type: 'suffix', meaning: 'blood condition', casualMeaning: 'a condition in the blood', system: 'Blood', example: 'anemia (reduced red blood cell condition), leukemia (white blood cell condition), septicemia (bacteria in the blood)', definition: 'Suffix meaning blood condition; describes the state of the blood or a substance found in it' },
  { id: 's9', term: '-genesis', type: 'suffix', meaning: 'origin, formation', casualMeaning: 'where it all begins', system: 'General', example: 'carcinogenesis (origin of cancer)', definition: 'Suffix meaning origin or production' },
  { id: 's10', term: '-gram', type: 'suffix', meaning: 'record, image', casualMeaning: 'the picture or printout', system: 'General', example: 'electrocardiogram (heart electrical record)', definition: 'Suffix meaning record or image' },
  { id: 's11', term: '-graph, -graphy', type: 'suffix', meaning: 'instrument/process of recording', casualMeaning: 'the machine/method making the picture', system: 'General', example: 'echocardiography (ultrasound recording of heart)', definition: 'Suffix meaning instrument or process of recording' },
  { id: 's12', term: '-ia, -iasis', type: 'suffix', meaning: 'condition', casualMeaning: 'having that condition', system: 'General', example: 'pneumonia (lung condition), cholelithiasis (gallstone condition)', definition: 'Suffix meaning condition or state' },
  { id: 's13', term: '-itis', type: 'suffix', meaning: 'inflammation', casualMeaning: 'inflamed and angry', system: 'General', example: 'appendicitis (inflammation of appendix), arthritis (inflammation of joints)', definition: 'Suffix meaning inflammation' },
  { id: 's14', term: '-logy', type: 'suffix', meaning: 'study of', casualMeaning: 'the science of studying it', system: 'General', example: 'cardiology (study of the heart), neurology (study of the nervous system)', definition: 'Suffix meaning study of' },
  { id: 's15', term: '-lysis', type: 'suffix', meaning: 'separation, destruction', casualMeaning: 'breaking it apart', system: 'General', example: 'hemolysis (destruction of red blood cells)', definition: 'Suffix meaning separation or destruction' },
  { id: 's16', term: '-malacia', type: 'suffix', meaning: 'softening', casualMeaning: 'becoming soft and weak', system: 'General', example: 'osteomalacia (softening of bones)', definition: 'Suffix meaning softening of tissue' },
  { id: 's17', term: '-megaly', type: 'suffix', meaning: 'enlargement', casualMeaning: 'growing way too big', system: 'General', example: 'cardiomegaly (enlarged heart), splenomegaly (enlarged spleen)', definition: 'Suffix meaning enlargement' },
  { id: 's18', term: '-oid', type: 'suffix', meaning: 'resembling', casualMeaning: 'looks like it but isn\'t', system: 'General', example: 'osteoid (resembling bone)', definition: 'Suffix meaning resembling' },
  { id: 's19', term: '-oma', type: 'suffix', meaning: 'tumor', casualMeaning: 'a tumor or abnormal growth', system: 'General', example: 'carcinoma (cancerous tumor), melanoma (tumor of melanocytes)', definition: 'Suffix meaning tumor' },
  { id: 's20', term: '-opia, -opsia', type: 'suffix', meaning: 'vision condition', casualMeaning: 'a vision problem', system: 'General', example: 'myopia (nearsightedness), diplopia (double vision)', definition: 'Suffix meaning vision or vision condition' },
  { id: 's21', term: '-osis', type: 'suffix', meaning: 'abnormal condition', casualMeaning: 'an abnormal process happening', system: 'General', example: 'arteriosclerosis (hardening of arteries), cyanosis (bluish skin)', definition: 'Suffix meaning abnormal condition' },
  { id: 's22', term: '-pathy', type: 'suffix', meaning: 'disease', casualMeaning: 'a disease of that organ', system: 'General', example: 'neuropathy (nerve disease), cardiomyopathy (heart muscle disease)', definition: 'Suffix meaning disease or suffering' },
  { id: 's23', term: '-penia', type: 'suffix', meaning: 'deficiency', casualMeaning: 'dangerously low levels', system: 'Blood', example: 'leukopenia (decrease in white blood cells), thrombocytopenia (low platelets)', definition: 'Suffix meaning deficiency or abnormal decrease' },
  { id: 's24', term: '-phasia', type: 'suffix', meaning: 'speech', casualMeaning: 'speech ability', system: 'Nervous', example: 'aphasia (without speech)', definition: 'Suffix meaning speech' },
  { id: 's25', term: '-phobia', type: 'suffix', meaning: 'fear', casualMeaning: 'being scared of it', system: 'General', example: 'hydrophobia (fear of water)', definition: 'Suffix meaning fear or sensitivity' },
  { id: 's26', term: '-plasty', type: 'suffix', meaning: 'surgical repair', casualMeaning: 'surgically fixing or reshaping', system: 'General', example: 'rhinoplasty (nose job), arthroplasty (joint repair)', definition: 'Suffix meaning surgical repair or reconstruction' },
  { id: 's27', term: '-plegia', type: 'suffix', meaning: 'paralysis', casualMeaning: 'completely paralyzed', system: 'Nervous', example: 'hemiplegia (paralysis of one side), paraplegia (paralysis of lower body)', definition: 'Suffix meaning paralysis' },
  { id: 's28', term: '-pnea', type: 'suffix', meaning: 'breathing', casualMeaning: 'a breathing pattern', system: 'Respiratory', example: 'dyspnea (difficult breathing), apnea (no breathing)', definition: 'Suffix meaning breathing' },
  { id: 's29', term: '-ptosis', type: 'suffix', meaning: 'drooping, prolapse, sagging', casualMeaning: 'drooping or falling down', system: 'General', example: 'blepharoptosis (drooping eyelid)', definition: 'Suffix meaning drooping or prolapse' },
  { id: 's30', term: '-rrhage, -rrhagia', type: 'suffix', meaning: 'bursting forth', casualMeaning: 'bleeding or gushing out suddenly', system: 'General', example: 'hemorrhage (bursting forth of blood), menorrhagia (heavy menstrual flow)', definition: 'Suffix meaning bursting forth of blood; sudden profuse flow from a vessel' },
  { id: 's31', term: '-rrhaphy', type: 'suffix', meaning: 'surgical suturing', casualMeaning: 'stitching it back together', system: 'General', example: 'herniorrhaphy (stitching a hernia)', definition: 'Suffix meaning surgical suturing' },
  { id: 's32', term: '-rrhea', type: 'suffix', meaning: 'excessive flow, discharge', casualMeaning: 'fluid flowing or draining out', system: 'General', example: 'diarrhea (flow through intestines), rhinorrhea (runny nose)', definition: 'Suffix meaning excessive flow or discharge' },
  { id: 's33', term: '-rrhexis', type: 'suffix', meaning: 'rupture', casualMeaning: 'tearing apart or bursting', system: 'General', example: 'cardiorrhexis (rupture of heart)', definition: 'Suffix meaning rupture or tearing' },
  { id: 's34', term: '-scope', type: 'suffix', meaning: 'instrument for visual examination', casualMeaning: 'the tool used to look inside', system: 'General', example: 'endoscope (instrument for looking inside body)', definition: 'Suffix meaning instrument for visual examination' },
  { id: 's35', term: '-scopy', type: 'suffix', meaning: 'process of visual examination', casualMeaning: 'using the scope to look inside', system: 'General', example: 'colonoscopy (examination of the colon)', definition: 'Suffix meaning visual examination process' },
  { id: 's36', term: '-stasis', type: 'suffix', meaning: 'stopping, standing still', casualMeaning: 'halting or controlling', system: 'General', example: 'hemostasis (stopping of blood flow)', definition: 'Suffix meaning stopping or controlling' },
  { id: 's37', term: '-stenosis', type: 'suffix', meaning: 'narrowing', casualMeaning: 'getting dangerously narrow', system: 'Cardiovascular', example: 'mitral stenosis (narrowing of mitral valve)', definition: 'Suffix meaning narrowing of a passage' },
  { id: 's38', term: '-stomy', type: 'suffix', meaning: 'new opening', casualMeaning: 'cutting a permanent opening', system: 'General', example: 'colostomy (surgical opening in colon), tracheostomy (opening in trachea)', definition: 'Suffix meaning surgical creation of an opening' },
  { id: 's39', term: '-therapy', type: 'suffix', meaning: 'treatment', casualMeaning: 'the treatment method', system: 'General', example: 'chemotherapy (drug treatment), radiotherapy (radiation treatment)', definition: 'Suffix meaning treatment' },
  { id: 's40', term: '-tomy', type: 'suffix', meaning: 'surgical incision', casualMeaning: 'cutting into it with a blade', system: 'General', example: 'laparotomy (incision into abdomen), phlebotomy (incision into vein)', definition: 'Suffix meaning surgical incision' },
  { id: 's41', term: '-trophy', type: 'suffix', meaning: 'nourishment, development', casualMeaning: 'how it grows and nourishes', system: 'General', example: 'hypertrophy (overgrowth), atrophy (wasting away)', definition: 'Suffix meaning nourishment or development' },
  { id: 's42', term: '-uria', type: 'suffix', meaning: 'urine condition', casualMeaning: 'something in or about the urine', system: 'Urinary', example: 'polyuria (excessive urination), hematuria (blood in urine)', definition: 'Suffix meaning urine condition' },
  { id: 's43', term: '-sclerosis', type: 'suffix', meaning: 'hardening', casualMeaning: 'getting hard and stiff', system: 'Cardiovascular', example: 'arteriosclerosis (hardening of arteries)', definition: 'Suffix meaning hardening of tissue' },

  // COMBINING FORMS (ROOTS) – Cardiovascular
  { id: 'r1', term: 'cardi/o', type: 'root', meaning: 'heart', casualMeaning: 'the heart', system: 'Cardiovascular', example: 'cardiology, cardiomegaly, carditis', definition: 'Combining form meaning heart', validSuffixes: ['-logy', '-megaly', '-itis', '-ectomy', '-gram', '-pathy', '-myopathy'] },
  { id: 'r2', term: 'arteri/o', type: 'root', meaning: 'artery', casualMeaning: 'an artery (high-pressure vessel)', system: 'Cardiovascular', example: 'arteriosclerosis, arteriotomy', definition: 'Combining form meaning artery' },
  { id: 'r3', term: 'ven/o, phleb/o', type: 'root', meaning: 'vein', casualMeaning: 'a vein (return vessel)', system: 'Cardiovascular', example: 'phlebotomy (cutting into a vein), venous', definition: 'Combining forms meaning vein' },
  { id: 'r4', term: 'angi/o', type: 'root', meaning: 'vessel', casualMeaning: 'a blood vessel', system: 'Cardiovascular', example: 'angiography, angioplasty', definition: 'Combining form meaning vessel' },
  { id: 'r5', term: 'aort/o', type: 'root', meaning: 'aorta', casualMeaning: 'the great artery leaving the heart', system: 'Cardiovascular', example: 'aortic stenosis, aortography', definition: 'Combining form meaning aorta' },
  { id: 'r6', term: 'atri/o', type: 'root', meaning: 'atrium', casualMeaning: 'the top receiving rooms of the heart', system: 'Cardiovascular', example: 'atrial fibrillation, atrioventricular', definition: 'Combining form meaning atrium' },
  { id: 'r7', term: 'ventricul/o', type: 'root', meaning: 'ventricle', casualMeaning: 'the pumping rooms of the heart', system: 'Cardiovascular', example: 'ventricular tachycardia, ventriculography', definition: 'Combining form meaning ventricle', homonymWarning: 'ventricul/o can refer to heart ventricles OR brain ventricles depending on context' },
  { id: 'r8', term: 'thromb/o', type: 'root', meaning: 'blood clot', casualMeaning: 'a clot in the blood', system: 'Cardiovascular', example: 'thrombosis, thrombolysis, thrombectomy', definition: 'Combining form meaning blood clot' },
  { id: 'r9', term: 'hem/o, hemat/o', type: 'root', meaning: 'blood', casualMeaning: 'blood itself', system: 'Blood', example: 'hemoglobin, hematology, hemostasis', definition: 'Combining forms meaning blood' },
  { id: 'r10', term: 'sphygm/o', type: 'root', meaning: 'pulse', casualMeaning: 'the pulse beat', system: 'Cardiovascular', example: 'sphygmomanometer (blood pressure cuff)', definition: 'Combining form meaning pulse' },

  // COMBINING FORMS – Respiratory
  { id: 'r11', term: 'pulmon/o', type: 'root', meaning: 'lung', casualMeaning: 'the lung', system: 'Respiratory', example: 'pulmonary, pulmonologist', definition: 'Combining form meaning lung' },
  { id: 'r12', term: 'pneum/o, pneumon/o', type: 'root', meaning: 'lung, air', casualMeaning: 'air or the lungs', system: 'Respiratory', example: 'pneumonia, pneumothorax, pneumonectomy', definition: 'Combining form meaning lung or air' },
  { id: 'r13', term: 'bronch/o', type: 'root', meaning: 'bronchus', casualMeaning: 'the big breathing branches', system: 'Respiratory', example: 'bronchitis, bronchoscopy, bronchodilator', definition: 'Combining form meaning bronchus' },
  { id: 'r14', term: 'alveol/o', type: 'root', meaning: 'alveolus', casualMeaning: 'the tiny air sacs in the lungs', system: 'Respiratory', example: 'alveolar, alveolitis', definition: 'Combining form meaning alveolus' },
  { id: 'r15', term: 'laryng/o', type: 'root', meaning: 'larynx', casualMeaning: 'the voice box', system: 'Respiratory', example: 'laryngitis, laryngoscopy, laryngectomy', definition: 'Combining form meaning larynx' },
  { id: 'r16', term: 'pharyng/o', type: 'root', meaning: 'pharynx', casualMeaning: 'the back of the throat', system: 'Respiratory', example: 'pharyngitis, nasopharynx', definition: 'Combining form meaning pharynx' },
  { id: 'r17', term: 'trache/o', type: 'root', meaning: 'trachea', casualMeaning: 'the windpipe', system: 'Respiratory', example: 'tracheotomy, tracheostomy, tracheal', definition: 'Combining form meaning trachea' },
  { id: 'r18', term: 'pleur/o', type: 'root', meaning: 'pleura', casualMeaning: 'the lung\'s outer wrapper', system: 'Respiratory', example: 'pleuritis, pleurisy, pleurotomy', definition: 'Combining form meaning pleura' },
  { id: 'r19', term: 'thorac/o', type: 'root', meaning: 'chest', casualMeaning: 'the chest cavity', system: 'Respiratory', example: 'thoracotomy, thoracentesis, thoracic', definition: 'Combining form meaning chest or thorax' },
  { id: 'r20', term: 'spir/o', type: 'root', meaning: 'breathing', casualMeaning: 'the act of breathing', system: 'Respiratory', example: 'spirometry, spirogram', definition: 'Combining form meaning breathing' },
  { id: 'r21', term: 'nas/o, rhin/o', type: 'root', meaning: 'nose', casualMeaning: 'the nose', system: 'Respiratory', example: 'nasal, rhinoplasty, rhinitis', definition: 'Combining forms meaning nose' },
  { id: 'r22', term: 'ox/o', type: 'root', meaning: 'oxygen', casualMeaning: 'oxygen in the blood', system: 'Respiratory', example: 'hypoxia, oximetry', definition: 'Combining form meaning oxygen' },

  // COMBINING FORMS – Digestive
  { id: 'r23', term: 'gastr/o', type: 'root', meaning: 'stomach', casualMeaning: 'the stomach', system: 'Digestive', example: 'gastritis, gastroscopy, gastrectomy', definition: 'Combining form meaning stomach', validSuffixes: ['-itis', '-scopy', '-ectomy', '-tomy', '-algia', '-enteritis', '-plasty'] },
  { id: 'r24', term: 'esophag/o', type: 'root', meaning: 'esophagus', casualMeaning: 'the food pipe', system: 'Digestive', example: 'esophagitis, esophagoscopy', definition: 'Combining form meaning esophagus' },
  { id: 'r25', term: 'enter/o', type: 'root', meaning: 'small intestine', casualMeaning: 'the small intestine', system: 'Digestive', example: 'gastroenteritis, enterocolitis', definition: 'Combining form meaning small intestine' },
  { id: 'r26', term: 'col/o, colon/o', type: 'root', meaning: 'colon', casualMeaning: 'the large intestine', system: 'Digestive', example: 'colitis, colonoscopy, colectomy', definition: 'Combining forms meaning colon' },
  { id: 'r27', term: 'hepat/o', type: 'root', meaning: 'liver', casualMeaning: 'the liver', system: 'Digestive', example: 'hepatitis, hepatomegaly, hepatectomy', definition: 'Combining form meaning liver' },
  { id: 'r28', term: 'cholecyst/o', type: 'root', meaning: 'gallbladder', casualMeaning: 'the gallbladder', system: 'Digestive', example: 'cholecystitis, cholecystectomy', definition: 'Combining form meaning gallbladder' },
  { id: 'r29', term: 'pancreat/o', type: 'root', meaning: 'pancreas', casualMeaning: 'the pancreas', system: 'Digestive', example: 'pancreatitis, pancreatectomy', definition: 'Combining form meaning pancreas' },
  { id: 'r30', term: 'chol/e', type: 'root', meaning: 'bile', casualMeaning: 'bile (digestive fluid from liver)', system: 'Digestive', example: 'cholelithiasis (gallstones), cholangitis (inflammation of bile ducts), cholestasis (stoppage of bile flow)', definition: 'Combining form meaning bile or gall' },
  { id: 'r31', term: 'rect/o', type: 'root', meaning: 'rectum', casualMeaning: 'the rectum', system: 'Digestive', example: 'rectal, rectocele, rectosigmoidoscopy', definition: 'Combining form meaning rectum', homonymWarning: 'Do not confuse rect/o (rectum) with proct/o (rectum and anus); proctoscopy uses proct/o, not rect/o' },
  { id: 'r32', term: 'or/o, stomat/o', type: 'root', meaning: 'mouth', casualMeaning: 'the mouth', system: 'Digestive', example: 'oral, stomatitis, oropharynx', definition: 'Combining forms meaning mouth' },
  { id: 'r33', term: 'gloss/o, lingu/o', type: 'root', meaning: 'tongue', casualMeaning: 'the tongue', system: 'Digestive', example: 'glossitis, lingual, glossectomy', definition: 'Combining forms meaning tongue' },

  // COMBINING FORMS – Nervous
  { id: 'r34', term: 'neur/o', type: 'root', meaning: 'nerve', casualMeaning: 'a nerve fiber', system: 'Nervous', example: 'neurology, neuritis, neuropathy', definition: 'Combining form meaning nerve' },
  { id: 'r35', term: 'encephal/o', type: 'root', meaning: 'brain', casualMeaning: 'the brain', system: 'Nervous', example: 'encephalitis, electroencephalogram (EEG)', definition: 'Combining form meaning brain' },
  { id: 'r36', term: 'cerebr/o', type: 'root', meaning: 'cerebrum', casualMeaning: 'the thinking brain', system: 'Nervous', example: 'cerebral, cerebrospinal fluid, cerebrovascular', definition: 'Combining form meaning cerebrum' },
  { id: 'r37', term: 'myel/o', type: 'root', meaning: 'spinal cord, bone marrow', casualMeaning: 'the spinal cord OR bone marrow', system: 'Nervous', example: 'myelitis (spinal cord inflammation), myelogram', definition: 'Combining form meaning spinal cord or bone marrow', homonymWarning: 'myel/o means spinal cord in neurology (myelitis, myelogram) but means bone marrow in hematology (myelocyte, myelogenous leukemia). Always check the system context!', alternativeSystems: ['Blood'] },
  { id: 'r38', term: 'mening/o', type: 'root', meaning: 'meninges', casualMeaning: 'the membranes wrapping the brain', system: 'Nervous', example: 'meningitis, meningioma', definition: 'Combining form meaning meninges' },
  { id: 'r39', term: 'cerebell/o', type: 'root', meaning: 'cerebellum', casualMeaning: 'the balance part of the brain', system: 'Nervous', example: 'cerebellar, cerebellitis', definition: 'Combining form meaning cerebellum' },

  // COMBINING FORMS – Musculoskeletal
  { id: 'r40', term: 'oste/o', type: 'root', meaning: 'bone', casualMeaning: 'a bone', system: 'Musculoskeletal', example: 'osteoporosis, osteomyelitis, ostectomy', definition: 'Combining form meaning bone' },
  { id: 'r41', term: 'arthr/o', type: 'root', meaning: 'joint', casualMeaning: 'a joint', system: 'Musculoskeletal', example: 'arthritis, arthroscopy, arthroplasty', definition: 'Combining form meaning joint' },
  { id: 'r42', term: 'my/o, muscul/o', type: 'root', meaning: 'muscle', casualMeaning: 'muscle tissue', system: 'Musculoskeletal', example: 'myalgia, myocardium, muscular', definition: 'Combining forms meaning muscle' },
  { id: 'r43', term: 'tendin/o, ten/o', type: 'root', meaning: 'tendon', casualMeaning: 'the tendon connecting muscle to bone', system: 'Musculoskeletal', example: 'tendinitis, tenotomy', definition: 'Combining forms meaning tendon' },
  { id: 'r44', term: 'chondr/o', type: 'root', meaning: 'cartilage', casualMeaning: 'flexible cartilage', system: 'Musculoskeletal', example: 'chondritis, chondroplasty, chondroma', definition: 'Combining form meaning cartilage' },
  { id: 'r45', term: 'crani/o', type: 'root', meaning: 'skull', casualMeaning: 'the skull', system: 'Musculoskeletal', example: 'craniotomy, cranial, intracranial', definition: 'Combining form meaning skull' },
  { id: 'r46', term: 'vertebr/o, spondyl/o', type: 'root', meaning: 'vertebra', casualMeaning: 'a spine bone', system: 'Musculoskeletal', example: 'vertebral, spondylitis, spondylosis', definition: 'Combining forms meaning vertebra', homonymWarning: 'vertebr/o and spondyl/o both mean vertebra but are often used in different clinical contexts: spondyl/o in inflammatory conditions (spondylitis), vertebr/o in structural terms' },
  { id: 'r47', term: 'cost/o', type: 'root', meaning: 'rib', casualMeaning: 'a rib bone', system: 'Musculoskeletal', example: 'intercostal (between ribs), costochondral', definition: 'Combining form meaning rib' },

  // COMBINING FORMS – Urinary
  { id: 'r48', term: 'nephr/o, ren/o', type: 'root', meaning: 'kidney', casualMeaning: 'the kidney', system: 'Urinary', example: 'nephritis, nephrectomy, renal', definition: 'Combining forms meaning kidney' },
  { id: 'r49', term: 'cyst/o', type: 'root', meaning: 'urinary bladder', casualMeaning: 'the bladder OR a cyst-like sac', system: 'Urinary', example: 'cystitis, cystoscopy, cystectomy', definition: 'Combining form meaning urinary bladder', homonymWarning: 'cyst/o means urinary bladder in urologic terms (cystitis, cystoscopy) but means sac or cyst when used in other contexts (cholecyst/o = bile sac/gallbladder)', alternativeSystems: ['Digestive'] },
  { id: 'r50', term: 'pyel/o', type: 'root', meaning: 'renal pelvis', casualMeaning: 'the cup inside the kidney collecting urine', system: 'Urinary', example: 'pyelonephritis, pyelogram', definition: 'Combining form meaning renal pelvis' },
  { id: 'r51', term: 'ureter/o', type: 'root', meaning: 'ureter', casualMeaning: 'the tube from kidney to bladder', system: 'Urinary', example: 'ureteritis, ureterectomy', definition: 'Combining form meaning ureter' },
  { id: 'r52', term: 'urethr/o', type: 'root', meaning: 'urethra', casualMeaning: 'the exit tube for urine', system: 'Urinary', example: 'urethritis, urethroplasty', definition: 'Combining form meaning urethra' },
  { id: 'r53', term: 'ur/o', type: 'root', meaning: 'urine', casualMeaning: 'urine or the urinary system', system: 'Urinary', example: 'urology, urinalysis', definition: 'Combining form meaning urine' },

  // COMBINING FORMS – Endocrine
  { id: 'r54', term: 'thyr/o, thyroid/o', type: 'root', meaning: 'thyroid gland', casualMeaning: 'the thyroid gland', system: 'Endocrine', example: 'thyroiditis, thyroidectomy, hyperthyroidism', definition: 'Combining forms meaning thyroid gland' },
  { id: 'r55', term: 'adren/o', type: 'root', meaning: 'adrenal gland', casualMeaning: 'the stress glands on top of the kidneys', system: 'Endocrine', example: 'adrenalectomy, adrenaline, adrenocortical', definition: 'Combining form meaning adrenal gland' },
  { id: 'r56', term: 'pancreat/o', type: 'root', meaning: 'pancreas', casualMeaning: 'the pancreas (both digestive and endocrine roles)', system: 'Endocrine', example: 'pancreatitis, pancreatectomy', definition: 'Combining form meaning pancreas', homonymWarning: 'pancreat/o refers to both the exocrine pancreas (Digestive: makes enzymes) and endocrine pancreas (Endocrine: makes insulin). Context determines which function is being discussed', alternativeSystems: ['Digestive'] },
  { id: 'r57', term: 'gluc/o, glyc/o', type: 'root', meaning: 'glucose, sugar', casualMeaning: 'blood sugar / glucose', system: 'Endocrine', example: 'hyperglycemia, glycosuria, glucagon', definition: 'Combining forms meaning glucose or sugar' },

  // COMBINING FORMS – Integumentary
  { id: 'r58', term: 'derm/o, dermat/o', type: 'root', meaning: 'skin', casualMeaning: 'the skin', system: 'Integumentary', example: 'dermatitis, dermatology, dermatome', definition: 'Combining forms meaning skin' },
  { id: 'r59', term: 'cutane/o', type: 'root', meaning: 'skin', casualMeaning: 'skin (especially layered)', system: 'Integumentary', example: 'subcutaneous, transcutaneous', definition: 'Combining form meaning skin' },
  { id: 'r60', term: 'onych/o', type: 'root', meaning: 'nail', casualMeaning: 'a fingernail or toenail', system: 'Integumentary', example: 'onychomycosis (fungal nail infection), onychectomy', definition: 'Combining form meaning nail' },
  { id: 'r61', term: 'trich/o', type: 'root', meaning: 'hair', casualMeaning: 'hair strands', system: 'Integumentary', example: 'trichomycosis (hair fungus), trichotillomania', definition: 'Combining form meaning hair' },

  // COMBINING FORMS – Lymphatic
  { id: 'r62', term: 'lymph/o', type: 'root', meaning: 'lymph', casualMeaning: 'the lymph fluid / immune drainage', system: 'Lymphatic', example: 'lymphoma, lymphocyte, lymphedema', definition: 'Combining form meaning lymph' },
  { id: 'r63', term: 'lymphaden/o', type: 'root', meaning: 'lymph node', casualMeaning: 'a lymph node or gland', system: 'Lymphatic', example: 'lymphadenopathy, lymphadenectomy', definition: 'Combining form meaning lymph node' },
  { id: 'r64', term: 'splen/o', type: 'root', meaning: 'spleen', casualMeaning: 'the spleen', system: 'Lymphatic', example: 'splenomegaly, splenectomy, splenitis', definition: 'Combining form meaning spleen' },
  { id: 'r65', term: 'thym/o', type: 'root', meaning: 'thymus gland', casualMeaning: 'the thymus gland', system: 'Lymphatic', example: 'thymoma, thymectomy', definition: 'Combining form meaning thymus gland', homonymWarning: 'thym/o refers to the thymus gland; do not confuse with thyr/o which refers to the thyroid gland' },

  // COMBINING FORMS – Reproductive
  { id: 'r66', term: 'hyster/o, uter/o, metr/o', type: 'root', meaning: 'uterus', casualMeaning: 'the uterus or womb', system: 'Reproductive', example: 'hysterectomy (removal of uterus), uterine, endometrium, metritis (inflammation of uterus)', definition: 'Combining forms meaning uterus', homonymWarning: 'metr/o means uterus in reproductive contexts (metritis, endometrium) but also means measure in other contexts (spirometry, optometry). Always check the context.' },
  { id: 'r67', term: 'oophor/o', type: 'root', meaning: 'ovary', casualMeaning: 'an ovary', system: 'Reproductive', example: 'oophorectomy, oophoritis', definition: 'Combining form meaning ovary' },
  { id: 'r68', term: 'mamm/o, mast/o', type: 'root', meaning: 'breast', casualMeaning: 'breast tissue', system: 'Reproductive', example: 'mammography, mastectomy, mastitis', definition: 'Combining forms meaning breast' },
  { id: 'r69', term: 'orch/o, orchid/o', type: 'root', meaning: 'testis', casualMeaning: 'the testicle', system: 'Reproductive', example: 'orchitis, orchidectomy', definition: 'Combining forms meaning testis' },
  { id: 'r70', term: 'prostat/o', type: 'root', meaning: 'prostate gland', casualMeaning: 'the prostate gland', system: 'Reproductive', example: 'prostatitis, prostatectomy', definition: 'Combining form meaning prostate gland' },
  { id: 'r71', term: 'colp/o, vagin/o', type: 'root', meaning: 'vagina', casualMeaning: 'the vagina', system: 'Reproductive', example: 'colposcopy, vaginitis', definition: 'Combining forms meaning vagina' },

  // COMBINING FORMS – Blood
  { id: 'r72', term: 'erythr/o', type: 'root', meaning: 'red, red blood cell', casualMeaning: 'red blood cells', system: 'Blood', example: 'erythrocyte, erythropoiesis, erythropenia', definition: 'Combining form meaning red or red blood cell' },
  { id: 'r73', term: 'leuk/o', type: 'root', meaning: 'white, white blood cell', casualMeaning: 'white blood cells', system: 'Blood', example: 'leukocyte, leukemia, leukopenia', definition: 'Combining form meaning white or white blood cell' },
  { id: 'r74', term: 'thrombocyt/o', type: 'root', meaning: 'platelet', casualMeaning: 'platelets that help blood clot', system: 'Blood', example: 'thrombocytopenia, thrombocytosis', definition: 'Combining form meaning platelet' },
  { id: 'r75', term: 'hemoglobin/o', type: 'root', meaning: 'hemoglobin', casualMeaning: 'the oxygen-carrying protein in red blood cells', system: 'Blood', example: 'hemoglobinopathy, hemoglobinuria', definition: 'Combining form meaning hemoglobin' },

  // COMBINING FORMS – Special Senses (Eye)
  { id: 'r76', term: 'ocul/o, ophthalm/o', type: 'root', meaning: 'eye', casualMeaning: 'the eye', system: 'Special Senses', example: 'ocular, ophthalmology, ophthalmoscope', definition: 'Combining forms meaning eye' },
  { id: 'r77', term: 'blephar/o', type: 'root', meaning: 'eyelid', casualMeaning: 'the eyelid', system: 'Special Senses', example: 'blepharitis (inflammation of eyelid), blepharoptosis (drooping eyelid)', definition: 'Combining form meaning eyelid' },
  { id: 'r78', term: 'kerat/o', type: 'root', meaning: 'cornea', casualMeaning: 'the cornea of the eye', system: 'Special Senses', example: 'keratitis (cornea inflammation), keratoplasty (cornea repair)', definition: 'Combining form meaning cornea', homonymWarning: 'kerat/o means cornea in ophthalmology (keratitis) but means hard/horny tissue in dermatology (keratosis = skin hardening). Check the context.' },
  { id: 'r79', term: 'irid/o', type: 'root', meaning: 'iris', casualMeaning: 'the iris of the eye', system: 'Special Senses', example: 'iritis (iris inflammation), iridectomy', definition: 'Combining form meaning iris' },
  { id: 'r80', term: 'retin/o', type: 'root', meaning: 'retina', casualMeaning: 'the retina', system: 'Special Senses', example: 'retinopathy (disease of retina), retinal detachment', definition: 'Combining form meaning retina' },
  { id: 'r81', term: 'conjunctiv/o', type: 'root', meaning: 'conjunctiva', casualMeaning: 'the conjunctiva', system: 'Special Senses', example: 'conjunctivitis (pink eye)', definition: 'Combining form meaning conjunctiva' },

  // COMBINING FORMS – Special Senses (Ear)
  { id: 'r82', term: 'aur/o, ot/o', type: 'root', meaning: 'ear', casualMeaning: 'the ear', system: 'Special Senses', example: 'aural, otitis (ear inflammation), otoscope, otolaryngology', definition: 'Combining forms meaning ear' },
  { id: 'r83', term: 'tympan/o, myring/o', type: 'root', meaning: 'eardrum', casualMeaning: 'the eardrum', system: 'Special Senses', example: 'tympanoplasty, myringotomy (surgical incision of eardrum)', definition: 'Combining forms meaning tympanic membrane (eardrum)' },
  { id: 'r84', term: 'cochle/o', type: 'root', meaning: 'cochlea', casualMeaning: 'the cochlea', system: 'Special Senses', example: 'cochlear implant, cochleitis', definition: 'Combining form meaning cochlea' },

  // COMBINING FORMS – Special Senses (Nose/Smell)
  { id: 'r85', term: 'olfact/o', type: 'root', meaning: 'smell', casualMeaning: 'the sense of smell', system: 'Special Senses', example: 'olfactory nerve, olfaction', definition: 'Combining form meaning smell or the sense of smell' },

  // CLINICAL TERMS – Cardiovascular
  { id: 'c1', term: 'Myocardial Infarction', type: 'condition', meaning: 'Death of heart muscle tissue due to blocked blood supply', casualMeaning: 'a heart attack', system: 'Cardiovascular', example: 'Acute MI with ST elevation (STEMI)', definition: 'Death of myocardial cells (heart muscle) resulting from prolonged ischemia (inadequate blood supply), usually caused by occlusion of a coronary artery', wordParts: [{part:'myo', meaning:'muscle', type:'root'},{part:'cardi', meaning:'heart', type:'root'},{part:'-al', meaning:'pertaining to', type:'suffix'},{part:'infarct', meaning:'area of dead tissue', type:'root'},{part:'-ion', meaning:'process', type:'suffix'}] },
  { id: 'c2', term: 'Atherosclerosis', type: 'condition', meaning: 'Hardening/narrowing of arteries due to fatty plaque buildup', casualMeaning: 'clogged arteries from fat and cholesterol buildup', system: 'Cardiovascular', example: 'Coronary artery atherosclerosis leading to angina', definition: 'Accumulation of fatty deposits (plaque, called atheromas) within and under the inner lining of arterial walls, causing stiffness and narrowing', wordParts: [{part:'ather/o', meaning:'fatty paste/porridge', type:'root'},{part:'scler/o', meaning:'hard', type:'root'},{part:'-osis', meaning:'abnormal condition', type:'suffix'}] },
  { id: 'c3', term: 'Arteriosclerosis', type: 'condition', meaning: 'General hardening of arteries with age', casualMeaning: 'stiff arteries (from aging)', system: 'Cardiovascular', example: 'Age-related arteriosclerosis', definition: 'Hardening and thickening of arterial walls; a broader term than atherosclerosis; includes any process that hardens arteries', wordParts: [{part:'arteri/o', meaning:'artery', type:'root'},{part:'scler/o', meaning:'hard', type:'root'},{part:'-osis', meaning:'abnormal condition', type:'suffix'}] },
  { id: 'c4', term: 'Hypertension', type: 'condition', meaning: 'Chronically elevated blood pressure (≥140/90 mmHg)', casualMeaning: 'high blood pressure', system: 'Cardiovascular', example: 'Essential hypertension, hypertensive crisis', definition: 'Persistently elevated arterial blood pressure above 140/90 mmHg; classified as essential (primary, no identified cause, ~95% of cases) or secondary (due to an underlying disease)' },
  { id: 'c5', term: 'Angina Pectoris', type: 'condition', meaning: 'Chest pain/pressure from insufficient myocardial blood flow', casualMeaning: 'chest pain when the heart isn\'t getting enough blood', system: 'Cardiovascular', example: 'Stable angina triggered by exertion', definition: 'Severe constricting pain in the chest, often radiating to the left arm and jaw; caused by insufficient blood supply to the heart muscle (ischemia)', wordParts: [{part:'angina', meaning:'choking, strangling', type:'root'},{part:'pectoris', meaning:'of the chest (Latin genitive of pectus)', type:'root'}] },
  { id: 'c6', term: 'Arrhythmia', type: 'condition', meaning: 'Any abnormal heart rhythm', casualMeaning: 'an irregular heartbeat', system: 'Cardiovascular', example: 'Atrial fibrillation, ventricular tachycardia', definition: 'Any variation from the normal rhythm of the heartbeat', wordParts: [{part:'a-', meaning:'without', type:'prefix'},{part:'rhythm', meaning:'regular beat', type:'root'},{part:'-ia', meaning:'condition', type:'suffix'}] },
  { id: 'c7', term: 'Bradycardia', type: 'condition', meaning: 'Heart rate below 60 beats per minute', casualMeaning: 'a dangerously slow heart rate', system: 'Cardiovascular', example: 'Sinus bradycardia at 45 bpm', definition: 'Slowness of the heartbeat, with a rate under 60 beats per minute', wordParts: [{part:'brady-', meaning:'slow', type:'prefix'},{part:'cardi/o', meaning:'heart', type:'root'},{part:'-ia', meaning:'condition', type:'suffix'}] },
  { id: 'c8', term: 'Tachycardia', type: 'condition', meaning: 'Heart rate above 100 beats per minute', casualMeaning: 'a racing heart rate', system: 'Cardiovascular', example: 'Supraventricular tachycardia (SVT)', definition: 'Rapidity of action of the heart, with a rate over 100 beats per minute', wordParts: [{part:'tachy-', meaning:'fast/rapid', type:'prefix'},{part:'cardi/o', meaning:'heart', type:'root'},{part:'-ia', meaning:'condition', type:'suffix'}] },
  { id: 'c9', term: 'Thrombosis', type: 'condition', meaning: 'Formation of a blood clot inside a vessel', casualMeaning: 'a dangerous blood clot forming inside', system: 'Cardiovascular', example: 'Deep vein thrombosis (DVT)', definition: 'Formation of a thrombus (blood clot) inside a blood vessel', wordParts: [{part:'thromb/o', meaning:'blood clot', type:'root'},{part:'-osis', meaning:'abnormal condition', type:'suffix'}] },
  { id: 'c10', term: 'Embolism', type: 'condition', meaning: 'Blockage by a traveling clot (embolus)', casualMeaning: 'a clot that broke loose and is blocking something', system: 'Cardiovascular', example: 'Pulmonary embolism (PE) – clot in lungs', definition: 'Sudden obstruction of a blood vessel by an embolus (a blood clot or other material carried in the bloodstream)' },
  { id: 'c11', term: 'Congestive Heart Failure (CHF)', type: 'condition', meaning: 'Heart cannot pump enough blood to meet body demands', casualMeaning: 'a weakened heart that can\'t keep up with the body', system: 'Cardiovascular', example: 'Left-sided CHF causing pulmonary edema', definition: 'Inability of the heart to pump sufficient blood to meet the needs of the body; results in backup of fluid in lungs (left-sided) or body (right-sided)' },
  { id: 'c12', term: 'Aneurysm', type: 'condition', meaning: 'Balloon-like bulge in a weakened arterial wall', casualMeaning: 'a dangerous bulge in an artery wall', system: 'Cardiovascular', example: 'Abdominal aortic aneurysm (AAA)', definition: 'Localized dilation (widening) of a blood vessel resulting from weakness in the vessel wall' },

  // CLINICAL TERMS – Respiratory
  { id: 'c13', term: 'Dyspnea', type: 'condition', meaning: 'Subjective sensation of difficult or labored breathing', casualMeaning: 'shortness of breath', system: 'Respiratory', example: 'Exertional dyspnea, nocturnal dyspnea', definition: 'Subjective symptom of shortness of breath or difficulty breathing; may indicate pulmonary or cardiac disease', wordParts: [{part:'dys-', meaning:'bad/difficult', type:'prefix'},{part:'-pnea', meaning:'breathing', type:'suffix'}] },
  { id: 'c14', term: 'Apnea', type: 'condition', meaning: 'Temporary absence of breathing', casualMeaning: 'breathing stops temporarily', system: 'Respiratory', example: 'Obstructive sleep apnea', definition: 'Temporary absence of breathing; may occur during sleep (sleep apnea) or as apneic episodes', wordParts: [{part:'a-', meaning:'without', type:'prefix'},{part:'-pnea', meaning:'breathing', type:'suffix'}] },
  { id: 'c15', term: 'Pneumonia', type: 'condition', meaning: 'Infection causing inflammation and fluid in alveoli', casualMeaning: 'lung infection with fluid in the air sacs', system: 'Respiratory', example: 'Community-acquired pneumonia, bacterial pneumonia', definition: 'Inflammation of the lung parenchyma (including alveoli and surrounding tissue) due to infection by bacteria, viruses, or fungi', wordParts: [{part:'pneumon/o', meaning:'lung', type:'root'},{part:'-ia', meaning:'condition', type:'suffix'}] },
  { id: 'c16', term: 'Pneumothorax', type: 'condition', meaning: 'Air in the pleural space causing lung collapse', casualMeaning: 'air trapped between the lung and chest wall, collapsing the lung', system: 'Respiratory', example: 'Spontaneous pneumothorax, tension pneumothorax', definition: 'Accumulation of air in the pleural space; causes partial or complete collapse of the lung' },
  { id: 'c17', term: 'Atelectasis', type: 'condition', meaning: 'Incomplete expansion or collapse of alveoli', casualMeaning: 'collapsed air sacs in the lung', system: 'Respiratory', example: 'Post-surgical atelectasis, postoperative complications', definition: 'Incomplete expansion of the lungs or alveoli; a common post-operative complication when patients do not breathe deeply' },
  { id: 'c18', term: 'Hemoptysis', type: 'condition', meaning: 'Coughing up blood from the respiratory tract', casualMeaning: 'coughing up blood', system: 'Respiratory', example: 'Hemoptysis from pulmonary TB or cancer', definition: 'Expectoration (coughing up) of blood or blood-streaked sputum originating from the lungs or bronchial tubes' },
  { id: 'c19', term: 'Pleuritis (Pleurisy)', type: 'condition', meaning: 'Inflammation of the pleural membranes', casualMeaning: 'inflamed lung wrappers causing stabbing chest pain', system: 'Respiratory', example: 'Viral pleurisy', definition: 'Inflammation of the pleura, characterized by sharp chest pain that worsens with breathing or coughing' },
  { id: 'c20', term: 'Bronchitis', type: 'condition', meaning: 'Inflammation of the bronchial tubes', casualMeaning: 'inflamed breathing branches', system: 'Respiratory', example: 'Acute bronchitis, chronic bronchitis (COPD)', definition: 'Inflammation of the mucous membranes of the bronchial tubes; acute (usually viral) or chronic (usually from smoking)', wordParts: [{part:'bronch/o', meaning:'bronchus', type:'root'},{part:'-itis', meaning:'inflammation', type:'suffix'}] },

  // CLINICAL TERMS – Digestive
  { id: 'c21', term: 'Dysphagia', type: 'condition', meaning: 'Difficulty or pain when swallowing', casualMeaning: 'trouble swallowing food', system: 'Digestive', example: 'Oropharyngeal dysphagia from stroke', definition: 'Difficulty in swallowing; may be caused by neurological disorders, mechanical obstruction, or esophageal disease', wordParts: [{part:'dys-', meaning:'difficult', type:'prefix'},{part:'-phagia', meaning:'swallowing/eating', type:'suffix'}] },
  { id: 'c22', term: 'Gastroesophageal Reflux Disease (GERD)', type: 'condition', meaning: 'Chronic backflow of acid from stomach to esophagus', casualMeaning: 'acid reflux / chronic heartburn', system: 'Digestive', example: 'GERD causing esophagitis', definition: 'Condition in which gastric contents reflux (flow back) into the esophagus, causing heartburn and potentially esophageal damage' },
  { id: 'c23', term: 'Cirrhosis', type: 'condition', meaning: 'Liver cell death replaced by fibrous scar tissue', casualMeaning: 'severe liver scarring', system: 'Digestive', example: 'Alcoholic cirrhosis, cirrhosis from hepatitis C', definition: 'Chronic liver disease characterized by replacement of normal liver cells with fibrous scar tissue; causes liver failure', wordParts: [{part:'cirrh/o', meaning:'yellow/tawny', type:'root'},{part:'-osis', meaning:'abnormal condition', type:'suffix'}] },
  { id: 'c24', term: 'Hepatitis', type: 'condition', meaning: 'Inflammation of the liver', casualMeaning: 'inflamed liver (from virus or other cause)', system: 'Digestive', example: 'Hepatitis A, B, C (viral); alcoholic hepatitis', definition: 'Inflammation of the liver; may be caused by viral infection, alcohol, drugs, toxins, or autoimmune disease', wordParts: [{part:'hepat/o', meaning:'liver', type:'root'},{part:'-itis', meaning:'inflammation', type:'suffix'}] },
  { id: 'c25', term: 'Appendicitis', type: 'condition', meaning: 'Acute inflammation of the appendix', casualMeaning: 'inflamed appendix (medical emergency)', system: 'Digestive', example: 'Acute appendicitis requiring appendectomy', definition: 'Acute inflammation of the vermiform appendix; presents with right lower quadrant pain, nausea, and fever; treated with appendectomy', wordParts: [{part:'appendic/o', meaning:'appendix', type:'root'},{part:'-itis', meaning:'inflammation', type:'suffix'}] },
  { id: 'c26', term: 'Cholecystitis', type: 'condition', meaning: 'Inflammation of the gallbladder', casualMeaning: 'inflamed gallbladder, often from gallstones', system: 'Digestive', example: 'Acute cholecystitis from cholelithiasis', definition: 'Inflammation of the gallbladder, usually caused by gallstones (cholelithiasis) blocking the cystic duct', wordParts: [{part:'cholecyst/o', meaning:'gallbladder', type:'root'},{part:'-itis', meaning:'inflammation', type:'suffix'}] },
  { id: 'c27', term: 'Cholelithiasis', type: 'condition', meaning: 'Presence of gallstones in the gallbladder', casualMeaning: 'gallstones', system: 'Digestive', example: 'Asymptomatic cholelithiasis discovered on ultrasound', definition: 'Presence or formation of stones (calculi) in the gallbladder', wordParts: [{part:'chol/e', meaning:'bile', type:'root'},{part:'lith/o', meaning:'stone', type:'root'},{part:'-iasis', meaning:'condition', type:'suffix'}] },

  // CLINICAL TERMS – Nervous
  { id: 'c28', term: 'Meningitis', type: 'condition', meaning: 'Inflammation of the meninges (brain membranes)', casualMeaning: 'inflamed membranes wrapping the brain', system: 'Nervous', example: 'Bacterial meningitis (medical emergency)', definition: 'Inflammation of the meninges (the three membranes covering the brain and spinal cord); caused by bacteria, viruses, or fungi', wordParts: [{part:'mening/o', meaning:'meninges', type:'root'},{part:'-itis', meaning:'inflammation', type:'suffix'}] },
  { id: 'c29', term: 'Cerebrovascular Accident (CVA)', type: 'condition', meaning: 'Sudden disruption of blood supply to the brain (stroke)', casualMeaning: 'a stroke', system: 'Nervous', example: 'Ischemic CVA from carotid artery occlusion', definition: 'Sudden loss of brain function due to ischemia (blocked artery) or hemorrhage (ruptured artery) in the brain; also called stroke' },
  { id: 'c30', term: 'Aphasia', type: 'condition', meaning: 'Loss or impairment of language function from brain damage', casualMeaning: 'inability to speak or understand language after brain injury', system: 'Nervous', example: 'Broca\'s aphasia (expressive), Wernicke\'s aphasia (receptive)', definition: 'Defect or loss of the power of expression by speech, writing, or signs, or of comprehending spoken or written language, due to injury or disease of the brain', wordParts: [{part:'a-', meaning:'without', type:'prefix'},{part:'-phasia', meaning:'speech', type:'suffix'}] },
  { id: 'c31', term: 'Hemiplegia', type: 'condition', meaning: 'Paralysis of one side of the body', casualMeaning: 'one whole side of the body paralyzed', system: 'Nervous', example: 'Left hemiplegia after right-sided stroke', definition: 'Paralysis of one side of the body; typically results from damage to the opposite side of the brain', wordParts: [{part:'hemi-', meaning:'half', type:'prefix'},{part:'-plegia', meaning:'paralysis', type:'suffix'}] },
  { id: 'c32', term: 'Paraplegia', type: 'condition', meaning: 'Paralysis of the lower body', casualMeaning: 'both legs paralyzed from spinal injury', system: 'Nervous', example: 'Paraplegia from spinal cord injury at T4', definition: 'Paralysis of the lower extremities and lower trunk, usually caused by spinal cord damage', wordParts: [{part:'para-', meaning:'beside/abnormal', type:'prefix'},{part:'-plegia', meaning:'paralysis', type:'suffix'}] },
  { id: 'c33', term: 'Encephalitis', type: 'condition', meaning: 'Inflammation of the brain', casualMeaning: 'inflamed brain tissue', system: 'Nervous', example: 'Viral encephalitis (e.g., West Nile, herpes)', definition: 'Inflammation of the brain; usually caused by viral infection; symptoms include headache, fever, confusion, and seizures', wordParts: [{part:'encephal/o', meaning:'brain', type:'root'},{part:'-itis', meaning:'inflammation', type:'suffix'}] },

  // CLINICAL TERMS – Musculoskeletal
  { id: 'c34', term: 'Osteoporosis', type: 'condition', meaning: 'Decreased bone density causing fragility', casualMeaning: 'weak, brittle, porous bones', system: 'Musculoskeletal', example: 'Postmenopausal osteoporosis, fragility fractures', definition: 'Reduction in bone mass (density) leading to increased fracture risk; common in postmenopausal women', wordParts: [{part:'oste/o', meaning:'bone', type:'root'},{part:'por/o', meaning:'pore/passage', type:'root'},{part:'-osis', meaning:'abnormal condition', type:'suffix'}] },
  { id: 'c35', term: 'Arthritis', type: 'condition', meaning: 'Inflammation of one or more joints', casualMeaning: 'inflamed, painful joints', system: 'Musculoskeletal', example: 'Rheumatoid arthritis, osteoarthritis', definition: 'Inflammation of a joint, characterized by pain, swelling, and limited motion; many forms including rheumatoid (autoimmune) and osteoarthritis (wear and tear)', wordParts: [{part:'arthr/o', meaning:'joint', type:'root'},{part:'-itis', meaning:'inflammation', type:'suffix'}] },
  { id: 'c36', term: 'Osteomyelitis', type: 'condition', meaning: 'Infection/inflammation of bone and bone marrow', casualMeaning: 'bone infection', system: 'Musculoskeletal', example: 'Hematogenous osteomyelitis in children', definition: 'Inflammation of bone and marrow (usually caused by bacterial infection); may be acute or chronic', wordParts: [{part:'oste/o', meaning:'bone', type:'root'},{part:'myel/o', meaning:'marrow', type:'root'},{part:'-itis', meaning:'inflammation', type:'suffix'}] },

  // CLINICAL TERMS – Urinary
  { id: 'c37', term: 'Nephrolithiasis', type: 'condition', meaning: 'Presence of stones in the kidney', casualMeaning: 'kidney stones', system: 'Urinary', example: 'Calcium oxalate nephrolithiasis', definition: 'Presence of calculi (stones) in the kidney; stones form when urine becomes supersaturated with mineral salts', wordParts: [{part:'nephr/o', meaning:'kidney', type:'root'},{part:'lith/o', meaning:'stone', type:'root'},{part:'-iasis', meaning:'condition', type:'suffix'}] },
  { id: 'c38', term: 'Pyelonephritis', type: 'condition', meaning: 'Bacterial infection of kidney and renal pelvis', casualMeaning: 'kidney infection (serious UTI)', system: 'Urinary', example: 'Ascending pyelonephritis from E. coli', definition: 'Bacterial infection of the renal pelvis and kidney tissue; more serious than cystitis (bladder infection)', wordParts: [{part:'pyel/o', meaning:'renal pelvis', type:'root'},{part:'nephr/o', meaning:'kidney', type:'root'},{part:'-itis', meaning:'inflammation', type:'suffix'}] },
  { id: 'c39', term: 'Hematuria', type: 'condition', meaning: 'Presence of blood in urine', casualMeaning: 'blood in the urine', system: 'Urinary', example: 'Gross hematuria from kidney stone', definition: 'Presence of blood in the urine; may be gross (visible) or microscopic (detected only by urinalysis)', wordParts: [{part:'hemat/o', meaning:'blood', type:'root'},{part:'-uria', meaning:'urine condition', type:'suffix'}] },
  { id: 'c40', term: 'Cystitis', type: 'condition', meaning: 'Inflammation/infection of the urinary bladder', casualMeaning: 'bladder infection (UTI)', system: 'Urinary', example: 'Bacterial cystitis (most common UTI)', definition: 'Inflammation of the urinary bladder, usually caused by bacterial infection; common in women', wordParts: [{part:'cyst/o', meaning:'bladder', type:'root'},{part:'-itis', meaning:'inflammation', type:'suffix'}] },
  { id: 'c41', term: 'Oliguria', type: 'condition', meaning: 'Decreased urine output (<400 mL/day)', casualMeaning: 'producing too little urine', system: 'Urinary', example: 'Oliguria in acute kidney injury', definition: 'Diminished amount of urine output; a sign of kidney dysfunction or severe dehydration', wordParts: [{part:'olig/o', meaning:'few/scanty', type:'prefix'},{part:'-uria', meaning:'urine condition', type:'suffix'}] },

  // CLINICAL TERMS – Endocrine
  { id: 'c42', term: 'Diabetes Mellitus', type: 'condition', meaning: 'Chronic disorder of glucose metabolism due to insulin deficiency or resistance', casualMeaning: 'high blood sugar disease', system: 'Endocrine', example: 'Type 1 DM (insulin deficiency), Type 2 DM (insulin resistance)', definition: 'Chronic metabolic disorder in which the body cannot properly use glucose; characterized by hyperglycemia (high blood sugar)' },
  { id: 'c43', term: 'Hypothyroidism', type: 'condition', meaning: 'Underactive thyroid gland producing insufficient thyroid hormone', casualMeaning: 'sluggish thyroid / slow metabolism', system: 'Endocrine', example: 'Hashimoto\'s thyroiditis causing hypothyroidism', definition: 'Deficient activity of the thyroid gland; results in decreased metabolic rate, fatigue, weight gain, and cold intolerance', wordParts: [{part:'hypo-', meaning:'below/deficient', type:'prefix'},{part:'thyroid/o', meaning:'thyroid gland', type:'root'},{part:'-ism', meaning:'condition/state', type:'suffix'}] },
  { id: 'c44', term: 'Hyperthyroidism', type: 'condition', meaning: 'Overactive thyroid producing excess thyroid hormone', casualMeaning: 'overactive thyroid / fast metabolism', system: 'Endocrine', example: 'Graves\' disease (most common hyperthyroidism)', definition: 'Excessive functional activity of the thyroid gland; results in increased metabolic rate, weight loss, sweating, and tremor', wordParts: [{part:'hyper-', meaning:'above/excessive', type:'prefix'},{part:'thyroid/o', meaning:'thyroid gland', type:'root'},{part:'-ism', meaning:'condition/state', type:'suffix'}] },

  // CLINICAL TERMS – Blood
  { id: 'c45', term: 'Anemia', type: 'condition', meaning: 'Deficiency of red blood cells or hemoglobin', casualMeaning: 'not enough red blood cells', system: 'Blood', example: 'Iron deficiency anemia, sickle cell anemia', definition: 'Reduction below normal in the number or size of red blood cells or the amount of hemoglobin in the blood; results in reduced oxygen-carrying capacity', wordParts: [{part:'an-', meaning:'without', type:'prefix'},{part:'-emia', meaning:'blood condition', type:'suffix'}] },
  { id: 'c46', term: 'Leukemia', type: 'condition', meaning: 'Malignant disease of bone marrow with uncontrolled white blood cell production', casualMeaning: 'blood cancer (too many bad white blood cells)', system: 'Blood', example: 'Acute lymphocytic leukemia (ALL), chronic myelogenous leukemia (CML)', definition: 'Malignant disease of blood-forming organs, marked by abnormal proliferation of leukocytes (white blood cells) in the bone marrow and blood', wordParts: [{part:'leuk/o', meaning:'white', type:'root'},{part:'-emia', meaning:'blood condition', type:'suffix'}] },
  { id: 'c47', term: 'Thrombocytopenia', type: 'condition', meaning: 'Abnormally low platelet count', casualMeaning: 'dangerously few platelets (bleeding risk)', system: 'Blood', example: 'Immune thrombocytopenic purpura (ITP)', definition: 'Decrease in the number of platelets (thrombocytes) in the blood; predisposes to bleeding and hemorrhage', wordParts: [{part:'thrombocyt/o', meaning:'platelet', type:'root'},{part:'-penia', meaning:'deficiency', type:'suffix'}] },

  // PROCEDURES
  { id: 'pr1', term: 'Electrocardiogram (ECG/EKG)', type: 'procedure', meaning: 'Graphic record of the heart\'s electrical activity', casualMeaning: 'the heart rhythm printout', system: 'Cardiovascular', example: 'ECG showing ST elevation in MI', definition: 'Record of the electrical changes in the heart muscle during a cardiac cycle; used to detect arrhythmias, ischemia, and infarction' },
  { id: 'pr2', term: 'Echocardiography', type: 'procedure', meaning: 'Ultrasound imaging of the heart', casualMeaning: 'heart ultrasound', system: 'Cardiovascular', example: 'Transthoracic echo for valve assessment', definition: 'Ultrasound examination of the heart; records sound waves reflected from heart structures to evaluate function and anatomy' },
  { id: 'pr3', term: 'Coronary Angiography', type: 'procedure', meaning: 'X-ray imaging of coronary arteries using contrast dye', casualMeaning: 'looking inside the heart\'s arteries with dye and X-ray', system: 'Cardiovascular', example: 'Coronary angiogram showing 90% LAD stenosis', definition: 'Radiographic examination of blood vessels of the heart after injection of a radiopaque contrast medium' },
  { id: 'pr4', term: 'Appendectomy', type: 'procedure', meaning: 'Surgical removal of the appendix', casualMeaning: 'removing the appendix', system: 'Digestive', example: 'Laparoscopic appendectomy for acute appendicitis', definition: 'Surgical excision of the vermiform appendix', wordParts: [{part:'appendic/o', meaning:'appendix', type:'root'},{part:'-ectomy', meaning:'surgical removal', type:'suffix'}] },
  { id: 'pr5', term: 'Colonoscopy', type: 'procedure', meaning: 'Visual examination of the colon using a flexible endoscope', casualMeaning: 'camera examination inside the colon', system: 'Digestive', example: 'Screening colonoscopy for colorectal cancer', definition: 'Endoscopic examination of the entire large intestine (colon) and terminal ileum using a colonoscope', wordParts: [{part:'colon/o', meaning:'colon', type:'root'},{part:'-scopy', meaning:'visual examination', type:'suffix'}] },
  { id: 'pr6', term: 'Cholecystectomy', type: 'procedure', meaning: 'Surgical removal of the gallbladder', casualMeaning: 'gallbladder removal surgery', system: 'Digestive', example: 'Laparoscopic cholecystectomy for gallstones', definition: 'Surgical removal of the gallbladder; most commonly performed laparoscopically', wordParts: [{part:'cholecyst/o', meaning:'gallbladder', type:'root'},{part:'-ectomy', meaning:'surgical removal', type:'suffix'}] },
  { id: 'pr7', term: 'Thoracentesis', type: 'procedure', meaning: 'Needle puncture of chest to drain pleural fluid', casualMeaning: 'draining fluid from around the lung with a needle', system: 'Respiratory', example: 'Thoracentesis for malignant pleural effusion', definition: 'Surgical puncture of the chest wall and pleural space with a needle to aspirate (remove) fluid from the pleural cavity', wordParts: [{part:'thorac/o', meaning:'chest', type:'root'},{part:'-centesis', meaning:'surgical puncture', type:'suffix'}] },
  { id: 'pr8', term: 'Bronchoscopy', type: 'procedure', meaning: 'Visual examination of bronchial tubes with a scope', casualMeaning: 'looking inside the airways with a camera', system: 'Respiratory', example: 'Bronchoscopy for suspected lung cancer', definition: 'Endoscopic examination of the bronchi (airways) using a bronchoscope; used for diagnosis and treatment', wordParts: [{part:'bronch/o', meaning:'bronchus', type:'root'},{part:'-scopy', meaning:'visual examination', type:'suffix'}] },
  { id: 'pr9', term: 'Nephrectomy', type: 'procedure', meaning: 'Surgical removal of a kidney', casualMeaning: 'kidney removal', system: 'Urinary', example: 'Radical nephrectomy for renal cell carcinoma', definition: 'Surgical excision of a kidney', wordParts: [{part:'nephr/o', meaning:'kidney', type:'root'},{part:'-ectomy', meaning:'surgical removal', type:'suffix'}] },
  { id: 'pr10', term: 'Cystoscopy', type: 'procedure', meaning: 'Visual examination of the bladder using a scope', casualMeaning: 'camera inside the bladder', system: 'Urinary', example: 'Cystoscopy for hematuria workup', definition: 'Endoscopic examination of the urinary bladder using a cystoscope; allows visualization of the bladder interior', wordParts: [{part:'cyst/o', meaning:'bladder', type:'root'},{part:'-scopy', meaning:'visual examination', type:'suffix'}] },
  { id: 'pr11', term: 'Arthroscopy', type: 'procedure', meaning: 'Visual examination of a joint interior with a scope', casualMeaning: 'camera inside a joint', system: 'Musculoskeletal', example: 'Knee arthroscopy for meniscus tear', definition: 'Endoscopic examination of the interior of a joint using an arthroscope; allows diagnosis and surgical treatment of joint conditions', wordParts: [{part:'arthr/o', meaning:'joint', type:'root'},{part:'-scopy', meaning:'visual examination', type:'suffix'}] },
  { id: 'pr12', term: 'Electroencephalography (EEG)', type: 'procedure', meaning: 'Recording of brain\'s electrical activity', casualMeaning: 'brain wave recording', system: 'Nervous', example: 'EEG for seizure diagnosis', definition: 'Recording of the electrical activity of the brain through electrodes placed on the scalp; used to detect epilepsy and other brain disorders' },
  { id: 'pr13', term: 'Lumbar Puncture (Spinal Tap)', type: 'procedure', meaning: 'Needle inserted into subarachnoid space to collect CSF', casualMeaning: 'spinal tap to collect fluid around the spinal cord', system: 'Nervous', example: 'Lumbar puncture for meningitis diagnosis', definition: 'Puncture of the subarachnoid space in the lumbar region of the spinal cord to obtain cerebrospinal fluid (CSF) for analysis' },
];

export const HOMONYM_TERMS = ALL_TERMS.filter(t => t.homonymWarning);

export const getTermsBySystem = (systemId: string) =>
  ALL_TERMS.filter(t => t.system.toLowerCase() === systemId.toLowerCase() || t.system === 'General');

export const getTermsByType = (type: MedicalTerm['type']) =>
  ALL_TERMS.filter(t => t.type === type);

export const PREFIXES = ALL_TERMS.filter(t => t.type === 'prefix');
export const SUFFIXES = ALL_TERMS.filter(t => t.type === 'suffix');
export const ROOTS = ALL_TERMS.filter(t => t.type === 'root');
export const CONDITIONS = ALL_TERMS.filter(t => t.type === 'condition');
export const PROCEDURES = ALL_TERMS.filter(t => t.type === 'procedure');

export const SYSTEM_MAP = Object.fromEntries(SYSTEMS.map(s => [s.id, s]));

// ─── Chapter Definitions ───────────────────────────────────────────────────
export interface Chapter {
  num: number;
  title: string;
  subtitle: string;
  color: string;
  termIds: string[];
}

export const CHAPTERS: Chapter[] = [
  {
    num: 1,
    title: 'Chapter 1',
    subtitle: 'Basic Prefixes (a- through macro-)',
    color: '#596e60',
    termIds: ['p1','p2','p3','p4','p5','p6','p7','p8','p9','p10','p11','p12','p13','p14','p15','p16','p17','p18'],
  },
  {
    num: 2,
    title: 'Chapter 2',
    subtitle: 'More Prefixes & Key Suffixes',
    color: '#4a5a6a',
    termIds: ['p19','p20','p21','p22','p23','p24','p25','p26','p27','p28','p29','p30','p31','p32','p33','p34','p35','p36','s1','s2','s3','s4','s5','s6','s7','s8','s9','s10','s11','s12','s13','s14','s15','s16','s17','s18','s19','s20'],
  },
  {
    num: 3,
    title: 'Chapter 3',
    subtitle: 'All Suffixes Complete (-osis through -sclerosis)',
    color: '#9c6f5e',
    termIds: ['s21','s22','s23','s24','s25','s26','s27','s28','s29','s30','s31','s32','s33','s34','s35','s36','s37','s38','s39','s40','s41','s42','s43'],
  },
  {
    num: 4,
    title: 'Chapter 4',
    subtitle: 'Digestive System',
    color: '#596e60',
    termIds: ['r23','r24','r25','r26','r27','r28','r29','r30','r31','r32','r33','c21','c22','c23','c24','c25','c26','c27','pr4','pr5','pr6'],
  },
  {
    num: 5,
    title: 'Chapter 5',
    subtitle: 'Cardiovascular System',
    color: '#4a5a6a',
    termIds: ['r1','r2','r3','r4','r5','r6','r7','r8','r9','r10','c1','c2','c3','c4','c5','c6','c7','c8','c9','c10','c11','c12','pr1','pr2','pr3'],
  },
  {
    num: 6,
    title: 'Chapter 6',
    subtitle: 'Respiratory System',
    color: '#9c6f5e',
    termIds: ['r11','r12','r13','r14','r15','r16','r17','r18','r19','r20','r21','r22','c13','c14','c15','c16','c17','c18','c19','c20','pr7','pr8'],
  },
  {
    num: 7,
    title: 'Chapter 7',
    subtitle: 'Nervous System',
    color: '#5c4a6a',
    termIds: ['r34','r35','r36','r37','r38','r39','c28','c29','c30','c31','c32','c33','pr12','pr13'],
  },
  {
    num: 8,
    title: 'Chapter 8',
    subtitle: 'Musculoskeletal System',
    color: '#4f4f4f',
    termIds: ['r40','r41','r42','r43','r44','r45','r46','r47','c34','c35','c36','pr11'],
  },
  {
    num: 9,
    title: 'Chapter 9',
    subtitle: 'Urinary System',
    color: '#3b5e66',
    termIds: ['r48','r49','r50','r51','r52','r53','c37','c38','c39','c40','c41','pr9','pr10'],
  },
  {
    num: 10,
    title: 'Chapter 10',
    subtitle: 'Endocrine System',
    color: '#3b5e66',
    termIds: ['r54','r55','r56','r57','c42','c43','c44'],
  },
  {
    num: 11,
    title: 'Chapter 11',
    subtitle: 'Integumentary System (Skin)',
    color: '#4a5a6e',
    termIds: ['r58','r59','r60','r61'],
  },
  {
    num: 12,
    title: 'Chapter 12',
    subtitle: 'Blood & Lymphatic Systems',
    color: '#4a5a6e',
    termIds: ['r62','r63','r64','r65','r72','r73','r74','r75','c45','c46','c47'],
  },
  {
    num: 13,
    title: 'Chapter 13',
    subtitle: 'Reproductive System',
    color: '#6a4a5e',
    termIds: ['r66','r67','r68','r69','r70','r71'],
  },
];

const _chapterMap: Record<string, number> = {};
CHAPTERS.forEach(ch => ch.termIds.forEach(id => { _chapterMap[id] = ch.num; }));

export function getTermsByChapter(chapter: number): MedicalTerm[] {
  const ch = CHAPTERS.find(c => c.num === chapter);
  if (!ch) return ALL_TERMS;
  const ids = new Set(ch.termIds);
  return ALL_TERMS.filter(t => ids.has(t.id));
}

export function getTermChapter(termId: string): number {
  return _chapterMap[termId] ?? 0;
}

export const STUDY_CHAPTER_KEY = 'anatomix_study_chapter';

/**
 * Apply owner-saved overrides on top of ALL_TERMS in-place.
 * Called once at app startup after loading from Firestore.
 * Also called immediately after the mod saves an edit so all pages
 * see the change without a reload.
 */
export function applyTermOverrides(overrides: Record<string, Partial<MedicalTerm>>): void {
  for (let i = 0; i < ALL_TERMS.length; i++) {
    const patch = overrides[ALL_TERMS[i].id];
    if (patch && Object.keys(patch).length > 0) {
      ALL_TERMS[i] = { ...ALL_TERMS[i], ...patch };
    }
  }
}
