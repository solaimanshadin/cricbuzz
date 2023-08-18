import Match from "../model/Match";
import db from "./db";

export function retrieveMatch(matchId: string): MatchType | null {
  const match = db.match.findById<MatchType>(matchId);
  match && Object.setPrototypeOf(match, Match.prototype);
  return match;
}
