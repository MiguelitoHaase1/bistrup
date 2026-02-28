export type InitiativeStatus = "ikke_startet" | "i_gang" | "færdig";

export type Category =
  | "VVS"
  | "El"
  | "Gulv"
  | "Vægge"
  | "Loft"
  | "Vinduer"
  | "Ventilation"
  | "Andet";

export type Floor = "1.sal" | "kælder";

export interface Initiative {
  category: Category;
  description: string;
  status: InitiativeStatus;
}

export interface OpenQuestion {
  question: string;
  category: Category;
  resolved: boolean;
  resolution?: string;
}

export interface Room {
  id: number;
  name: string;
  floor: Floor;
  description: string;
  initiatives: Initiative[];
  openQuestions: OpenQuestion[];
  notes?: string;
}

export interface CrossCuttingInitiative {
  description: string;
  status: InitiativeStatus;
  affectedRooms: number[];
}

export interface ProjectData {
  projectName: string;
  address: string;
  rooms: Room[];
  crossCuttingInitiatives: CrossCuttingInitiative[];
  crossCuttingQuestions: OpenQuestion[];
}
