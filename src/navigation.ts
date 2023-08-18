interface NavigationType {
  link: string;
  name: string;
}

const navigation: NavigationType[] = [
  {
    link: "#new-match",
    name: "New Match",
  },
  {
    link: "#teams",
    name: "Teams",
  },
  {
    link: "#history",
    name: "History",
  },
];

export default navigation;
