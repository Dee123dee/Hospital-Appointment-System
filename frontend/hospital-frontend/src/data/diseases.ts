export interface Disease {
  id: string;
  name: string;
  doctor: string;
  description: string;
}

export const diseases: Disease[] = [
  {
    id: "general-surgery",
    name: "General Surgery",
    doctor: "Dr. T. Vijayaragavan",
    description: "Comprehensive surgical care for a wide range of common illnesses and surgical conditions with advanced techniques.",
  },
  {
    id: "hernia",
    name: "Hernia Treatment",
    doctor: "Dr. T. Vijayaragavan",
    description: "Minimally invasive and tension-free mesh repair for inguinal, umbilical, and incisional hernias.",
  },
  {
    id: "appendix",
    name: "Appendix Surgery",
    doctor: "Dr. T. Vijayaragavan",
    description: "Prompt laparoscopic and open appendectomy for acute and chronic appendicitis.",
  },
  {
    id: "gall-bladder",
    name: "Gall Bladder Stone",
    doctor: "Dr. T. Vijayaragavan",
    description: "Modern laparoscopic cholecystectomy for gallstone removal with minimal recovery time.",
  },
  {
    id: "piles",
    name: "Piles / Hemorrhoids",
    doctor: "Dr. T. Vijayaragavan",
    description: "Advanced laser and surgical treatments for internal and external hemorrhoids ensuring painless relief.",
  },
  {
    id: "fissure",
    name: "Anal Fissure",
    doctor: "Dr. T. Vijayaragavan",
    description: "Specialized medical and surgical management for chronic anal fissures to restore comfort.",
  },
  {
    id: "fistula",
    name: "Anal Fistula",
    doctor: "Dr. T. Vijayaragavan",
    description: "Expert evaluation and surgical procedures including laser fistula closure for complex anal fistulas.",
  },
  {
    id: "diabetic-care",
    name: "Diabetic Care",
    doctor: "Dr. T. Vijayaragavan",
    description: "Specialized preventive care and treatment for diabetic foot ulcers and related complications.",
  },
  {
    id: "wound-care",
    name: "Chronic Wound Care",
    doctor: "Dr. T. Vijayaragavan",
    description: "Advanced wound debridement, modern dressing techniques, and tissue regeneration therapies for non-healing wounds.",
  },
  {
    id: "minor-procedures",
    name: "Minor Surgical Procedures",
    doctor: "Dr. T. Vijayaragavan",
    description: "Safe in-clinic excisions of cysts, lipomas, abscess drainage, and minor biopsies under local anesthesia.",
  },
];

