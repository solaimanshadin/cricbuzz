import db from "../utils/db";
import { retrieveMatch } from "../utils/retrieveMatch";

class MatchHistory {
  getTeams() {
    const histories = db.match.findAll<MatchType[]>();
    const teams = db.team.findAll<TeamType[]>().map((team: TeamType) => ({
      name: team.name,
      matches: 0,
      loss: 0,
      win: 0,
    }));
    histories.forEach((match: MatchType) => {
      const teamOneSearchResult = teams.find(
        (team) => team.name === match.teamOne.name
      );
      const teamTwoSearchResult = teams.find(
        (team) => team.name === match.teamTwo.name
      );

      if (teamOneSearchResult) {
        teamOneSearchResult.matches += 1;
        teamOneSearchResult.win += Number(match.matchWinner == "teamOne");
        teamOneSearchResult.loss += match.matchWinner
          ? Number(match.matchWinner != "teamOne")
          : 0;
      }

      if (teamTwoSearchResult) {
        teamTwoSearchResult.matches += 1;
        teamTwoSearchResult.win += Number(match.matchWinner == "teamTwo");
        teamTwoSearchResult.loss += match.matchWinner
          ? Number(match.matchWinner != "teamTwo")
          : 0;
      }
    });

    return teams;
  }

  getPlayersOfATeam(teamName: string): PlayerType[] {
    const teams = db.team.findAll<TeamType[]>();
    const teamPlayers: PlayerType[] =
      teams.find((team: PlayerType) => team?.name === teamName)?.playerList ||
      [];
    return teamPlayers;
  }

  getPlayerDetails(teamName: string, playerName: string) {
    const matches = db.match.findAll<MatchType[]>();
    const overAllData = {
      matches: 0,
      batting: {
        totalRun: 0,
        boundaryCount: 0,
        overBoundaryCount: 0,
        thirties: 0,
        fifties: 0,
        hundreds: 0,
        bestScore: 0,
        notOut: 0,
        ducks: 0,
        innings: 0,
        strikeRate: 0,
      },
      bowling: {
        maidenOvers: 0,
        totalRunGiven: 0,
        totalWicketTaken: 0,
        over: 0,
        wides: 0,
        noBalls: 0,
        dotsBalls: 0,
        innings: 0,
        economyRate: 0,
        bestBowling: "-/-",
        strikeRate: 0,
      },
      fielding: {
        catches: 0,
        stumpings: 0,
        runOuts: 0,
      },
    };
    const playedMatches = matches
      .filter(
        (match: MatchType) =>
          match.teamOne?.name == teamName || match.teamTwo?.name == teamName
      )
      .map((match: MatchType) => {
        const matchInstance: MatchType | null = retrieveMatch(match._id);
        const isOnFirstInning =
          matchInstance?.innings.first.team ==
          (match.teamOne?.name == teamName
            ? "teamOne"
            : match.teamTwo?.name == teamName
            ? "teamTwo"
            : "");

        return {
          batting: matchInstance?.getRunOfBatsman(
            playerName,
            isOnFirstInning ? "first" : "second"
          ),
          bowling: matchInstance?.getEconomyOfBowler(
            playerName,
            isOnFirstInning ? "second" : "first"
          ),
          fielding: matchInstance?.getPerformanceOfFielder(
            playerName,
            isOnFirstInning ? "second" : "first"
          ),
        };
      });

    playedMatches.forEach((data: any) => {
      overAllData.batting.totalRun += data.batting.totalRun;
      overAllData.batting.boundaryCount += data.batting.boundaryCount;
      overAllData.batting.overBoundaryCount += data.batting.overBoundaryCount;
      overAllData.batting.ducks +=
        data.batting.totalRun == 0 && !data.batting.isNotOut ? 1 : 0;
      overAllData.batting.thirties += data.batting.totalRun >= 30 ? 1 : 0;
      overAllData.batting.fifties += data.batting.totalRun >= 50 ? 1 : 0;
      overAllData.batting.hundreds += data.batting.totalRun >= 100 ? 1 : 0;
      overAllData.batting.bestScore =
        data.batting.totalRun > overAllData.batting.bestScore
          ? data.batting.totalRun
          : overAllData.batting.bestScore || 0;
      overAllData.batting.innings += data.batting.totalBallPlayed > 0 ? 1 : 0;
      overAllData.batting.strikeRate += data.batting.strikeRate;
      overAllData.batting.notOut += overAllData.batting.innings
        ? Number(data.batting.isNotOut)
        : 0;

      // bowling
      overAllData.bowling.totalRunGiven += data.bowling.totalRunGiven;
      overAllData.bowling.over += Number(data.bowling.over);
      overAllData.bowling.maidenOvers += data.bowling.maidenOvers;
      overAllData.bowling.totalWicketTaken += data.bowling.totalWicketTaken;
      overAllData.bowling.wides += Number(data.bowling.wides);
      overAllData.bowling.noBalls += Number(data.bowling.noBalls);
      overAllData.bowling.economyRate += data.bowling.economyRate;
      overAllData.bowling.dotsBalls += data.bowling.dotsBalls;
      overAllData.bowling.innings += data.bowling.over > 0 ? 1 : 0;
      const previousBest = overAllData.bowling.bestBowling.split("/");
      if (
        overAllData.bowling.totalWicketTaken > Number(previousBest[0]) ||
        (overAllData.bowling.totalWicketTaken == Number(previousBest[0]) &&
          overAllData.bowling.totalRunGiven < Number(previousBest[1]))
      ) {
        overAllData.bowling.bestBowling = `${overAllData.bowling.totalWicketTaken}/${overAllData.bowling.totalRunGiven}`;
      }

      // fielding
      overAllData.fielding.catches += data.fielding.catches;
      overAllData.fielding.stumpings += data.fielding.stumpings;
      overAllData.fielding.runOuts += data.fielding.runOuts;

      if (
        overAllData.batting.innings ||
        overAllData.bowling.innings ||
        overAllData.fielding.catches ||
        overAllData.fielding.stumpings ||
        overAllData.fielding.runOuts
      ) {
        overAllData.matches++;
      }
    });
    overAllData.bowling.economyRate = Number(
      overAllData.bowling.innings
        ? (
            overAllData.bowling.economyRate / overAllData.bowling.innings
          ).toFixed(2)
        : 0
    );
    overAllData.bowling.strikeRate = Number(
      overAllData.bowling.totalWicketTaken
        ? (
            (overAllData.bowling.over * 6) /
            overAllData.bowling.totalWicketTaken
          ).toFixed(2)
        : 0
    );
    overAllData.batting.strikeRate = Number(
      overAllData.batting.innings
        ? (
            overAllData.batting.strikeRate / overAllData.batting.innings
          ).toFixed(2)
        : 0
    );
    return overAllData;

    // const teamPlayers = match.find(team => team?.name === teamName)?.playerList;
  }
}

export default new MatchHistory();
