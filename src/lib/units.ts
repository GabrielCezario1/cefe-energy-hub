export interface Unit {
  id: string;
  name: string;
  location: string;
  state: string;
  installedCapacity: string;
  installDate: string;
}

export const units: Unit[] = [
  {
    id: "th30-industria",
    name: "TH30 Indústria",
    location: "Ceará",
    state: "CE",
    installedCapacity: "2.5 MWp",
    installDate: "2022-03-15",
  },
  {
    id: "th30-jazira",
    name: "TH30 Jazira",
    location: "Ceará",
    state: "CE",
    installedCapacity: "3.2 MWp",
    installDate: "2021-11-20",
  },
  {
    id: "argos",
    name: "Argos",
    location: "Espírito Santo",
    state: "ES",
    installedCapacity: "1.8 MWp",
    installDate: "2023-01-10",
  },
  {
    id: "thor",
    name: "Thor",
    location: "Espírito Santo",
    state: "ES",
    installedCapacity: "4.1 MWp",
    installDate: "2022-08-05",
  },
  {
    id: "serra",
    name: "Serra",
    location: "Espírito Santo",
    state: "ES",
    installedCapacity: "2.9 MWp",
    installDate: "2023-05-22",
  },
  {
    id: "th01",
    name: "TH01",
    location: "Rio de Janeiro",
    state: "RJ",
    installedCapacity: "3.5 MWp",
    installDate: "2021-09-14",
  },
  {
    id: "manilha-niteroi",
    name: "Manilha Niterói",
    location: "Rio de Janeiro",
    state: "RJ",
    installedCapacity: "2.2 MWp",
    installDate: "2022-12-03",
  },
  {
    id: "kratos",
    name: "Kratos",
    location: "Rio de Janeiro",
    state: "RJ",
    installedCapacity: "5.0 MWp",
    installDate: "2023-02-18",
  },
];
