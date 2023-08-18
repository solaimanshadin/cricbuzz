import matchStarter from "./components/matchStarter";
import teams from "./components/teams";
import history from "./components/history";
import openingPlayerSelection from "./components/openingPlayerSelection";
import runningMatch from "./components/runningMatch";
import newBowler from "./components/newBowler";
import inningSummary from "./components/inningSummary";
import fallOfWicket from "./components/fallOfWicket";
import batsmanRetire from "./components/batsmanRetire";
import scoreboard from "./components/scoreboard";
import teamsPlayers from "./components/teamsPlayers";
import playerDetails from "./components/playerDetails";
import matchSettings from "./components/matchSettings";

interface RouteType {
  path: string,
  component: Function,
  params?: string[]
}

const routes: RouteType[] = [
  {
    path: "#new-match",
    component: matchStarter,
  },
  {
    path: "#teams",
    component: teams,
  },
  {
    path: "#history",
    component: history,
  },
  {
    path: "#opening-player-selection",
    component: openingPlayerSelection,
    params: ["matchId"],
  },
  {
    path: "#running-match",
    component: runningMatch,
    params: ["matchId"],
  },
  {
    path: "#new-bowler",
    component: newBowler,
    params: ["matchId"],
  },
  {
    path: "#inning-summary",
    component: inningSummary,
    params: ["matchId"],
  },
  {
    path: "#fall-of-wicket",
    component: fallOfWicket,
    params: ["matchId"],
  },
  {
    path: "#batsman-retire",
    component: batsmanRetire,
    params: ["matchId"],
  },
  {
    path: "#scoreboard",
    component: scoreboard,
    params: ["matchId"],
  },
  {
    path: "#team-players",
    component: teamsPlayers,
    params: ["teamName"],
  },
  {
    path: "#player-details",
    component: playerDetails,
    params: ["teamName", "playerName"],
  },
  {
    path: "#match-settings",
    component: matchSettings,
  },
];

export default routes;
