export const sedhiouDepartments = [
  {
    name: "Bounkiling",
    communes: [
      "Bona",
      "Bounkiling",
      "Diacounda",
      "Diambati",
      "Diaroumé",
      "Djinany",
      "Faoune",
      "Inor",
      "Kandion Mangana",
      "Madina Wandifa",
      "Ndiamacouta",
      "Ndiamalathiel",
      "Tankon",
    ],
  },
  {
    name: "Goudomp",
    communes: [
      "Baghère",
      "Diattacounda",
      "Diouboudou",
      "Djibanar",
      "Goudomp",
      "Kaour",
      "Karantaba",
      "Kolibantang",
      "Mangaroungou Santo",
      "Niagha",
      "Samine",
      "Simbandi Balante",
      "Simbandi Brassou",
      "Tanaff",
      "Yarang Balante",
    ],
  },
  {
    name: "Sédhiou",
    communes: [
      "Bambaly",
      "Bémet Bidjini",
      "Boghall",
      "Diannah Ba",
      "Diannah Malary",
      "Diendé",
      "Djibabouya",
      "Djiredji",
      "Koussy",
      "Marsassoum",
      "Oudoucar",
      "Sakar",
      "Sama Kanta Peulh",
      "Sansamba",
      "Sédhiou",
    ],
  },
];

export const sedhiouCommunes = sedhiouDepartments.flatMap((department) =>
  department.communes.map((commune) => ({
    name: commune,
    department: department.name,
  }))
);

export const activeTerritory = {
  region: "Sédhiou",
  departments: sedhiouDepartments,
  communes: sedhiouCommunes,
};
