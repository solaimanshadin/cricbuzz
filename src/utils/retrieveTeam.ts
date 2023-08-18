import Team from "../model/Team";
import db from "./db";

export function retrieveTeam(teamName: string): TeamType | null {
  const team = db.team
    .findAll<TeamType[]>()
    .find((team: TeamType) => team.name == teamName) || null;
  team && Object.setPrototypeOf(team, Team.prototype);
  return team;
}
