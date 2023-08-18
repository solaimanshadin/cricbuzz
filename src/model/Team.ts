import db from "../utils/db";

class Team implements TeamType {
  readonly _id: string;
  public name;
  public playerList: PlayerType[];
  constructor(name: string) {
    this.name = name;
    this.playerList = [];
    const allTeams = db.team.findAll<TeamType[]>();
    const teamAlreadyExist = allTeams.find((team: TeamType) => team.name === name);
    let newTeam = teamAlreadyExist as TeamType;

    if (teamAlreadyExist) {
      this.playerList = [...teamAlreadyExist?.playerList];
    } else {
      newTeam = db.team.insertOne<TeamType>(this);
    }

    this._id = newTeam._id;
  }

  addPlayer(...playerList: PlayerType[]) {
    let status = {
      success: true,
      message: "Player added successfully",
    };
    playerList.forEach((player) => {
      const inTeam = this.playerList.find(
        (oldPlayer) => oldPlayer.name == player.name
      );
      if (inTeam) {
        status = {
          success: false,
          message: `${player.name} already in team`,
        };
      }
      !inTeam && this.playerList.push(player);
    });
    // updating in localStorage
    db.team.updateOneById(this._id, this);
    // end of localStorage updating

    return status;
  }

  removePlayer(playerName: string) {
    this.playerList = this.playerList.filter(
      (player) => player.name !== playerName
    );
    // updating in localStorage
    db.team.updateOneById(this._id, this);
    // end of localStorage updating
  }

  updateTeamName(teamName: string) {
    this.name = teamName;
    // updating in localStorage
    db.team.updateOneById(this._id, this);
    // end of localStorage updating
  }

  updatePlayerName(playerName: string, newName: string) {
    this.playerList = this.playerList.map((player) =>
      player.name == playerName ? { name: newName } : player
    );
    // updating in matches
    const matches = db.match.findAll<MatchType[]>();

    matches
      .filter(
        (match: MatchType) =>
          match.teamOne?.name == this.name || match.teamTwo?.name == this.name
      )
      .map((match: MatchType) => {
        const isOnFirstInning =
          match.innings.first.team ==
          (match.teamOne?.name == this.name
            ? "teamOne"
            : match.teamTwo?.name == this.name
            ? "teamTwo"
            : "");

        // batsman
        const batsman = match.innings[
          isOnFirstInning ? "first" : "second"
        ]?.overs?.map((over) => {
          return {
            ...over,
            balls: over?.balls?.map((ball) => {
              let temp = { ...ball };
              if (ball.fallOfWicket === playerName) {
                temp = { ...temp, fallOfWicket: newName };
              }
              if (ball.striker?.name === playerName) {
                temp = { ...temp, striker: { ...temp.striker, name: newName } };
              } else if (ball.nonStriker?.name === playerName) {
                temp = {
                  ...temp,
                  nonStriker: { ...temp.nonStriker, name: newName },
                };
              }
              return temp;
            }),
          };
        });
        // blower
        const bowler = match.innings[
          isOnFirstInning ? "second" : "first"
        ]?.overs?.map((over) => {
          return {
            ...over,
            bowler: {
              name:
                over.bowler?.name == playerName ? newName : over?.bowler?.name,
            },
            balls: over?.balls?.map((ball) => {
              let temp = { ...ball };
              if (ball.wicketAsset === playerName) {
                temp = { ...temp, wicketAsset: newName };
              }
              return temp;
            }),
          };
        });

        db.match.updateOneById(match._id, {
          ...match,
          innings: {
            [isOnFirstInning ? "second" : "first"]: {
              ...match.innings[isOnFirstInning ? "second" : "first"],
              overs: bowler,
            },
            [isOnFirstInning ? "first" : "second"]: {
              ...match.innings[isOnFirstInning ? "first" : "second"],
              overs: batsman,
              nonStriker: {
                name:
                  match.innings[isOnFirstInning ? "first" : "second"].nonStriker
                    ?.name === playerName
                    ? newName
                    : match.innings[isOnFirstInning ? "first" : "second"]
                        .nonStriker?.name,
              },
              striker: {
                name:
                  match.innings[isOnFirstInning ? "first" : "second"].striker
                    ?.name === playerName
                    ? newName
                    : match.innings[isOnFirstInning ? "first" : "second"]
                        .striker?.name,
              },
            },
          },
        });
      });

    // updating in localStorage
    db.team.updateOneById(this._id, this);
    // end of localStorage updating
  }
}

export default Team;
