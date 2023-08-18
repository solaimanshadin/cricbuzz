import db from "../utils/db";
import MatchSettings from "./MatchSettings";
import Team from "./Team";
class Match implements MatchType {
  readonly _id: string;
  public teamOne;
  public teamTwo;
  public tossWinner;
  public optedTo: TossOptionType;
  public totalOver: number;
  public currentInning: InningOptionType;
  public matchWinner: TeamOptionType | null;
  public innings: InningsType;

  constructor({
    teamOneName,
    teamTwoName,
    tossWinner,
    optedTo,
    totalOver,
  }: {
    teamOneName: string;
    teamTwoName: string;
    tossWinner: TeamOptionType;
    optedTo: TossOptionType;
    totalOver: number;
  }) {
    this.teamOne = new Team(teamOneName);
    this.teamTwo = new Team(teamTwoName);
    this.tossWinner = tossWinner;
    this.optedTo = optedTo;
    this.totalOver = totalOver;
    this.currentInning = "first";
    this.matchWinner = null;
    const onBattingTeam =
      this.optedTo === "bat"
        ? this.tossWinner
        : this.tossWinner === "teamOne"
        ? "teamTwo"
        : "teamOne";
    this.innings = {
      first: {
        team: onBattingTeam,
        striker: null,
        nonStriker: null,
        overs: [],
      },
      second: {
        team: onBattingTeam === "teamOne" ? "teamTwo" : "teamOne",
        striker: null,
        nonStriker: null,
        overs: [],
      },
    };

    const { _id } = db.match.insertOne(this);
    this._id = _id;
  }

  addPlayerToTeam(team: TeamType, ...players: PlayerType[]): void {
    Team.prototype.addPlayer.apply(team, players);
  }

  addBatsManToTeam(...players: PlayerType[]) {
    this.addPlayerToTeam(
      this[this.innings[this.currentInning].team],
      ...players
    );
  }

  addBowlerOrFielderToTeam(...players: PlayerType[]) {
    this.addPlayerToTeam(
      this[
        this.innings[this.currentInning].team == "teamOne"
          ? "teamTwo"
          : "teamOne"
      ],
      ...players
    );
  }

  selectOpeningPlayers({
    striker,
    nonStriker,
    openingBowler,
  }: {
    striker: string;
    nonStriker: string;
    openingBowler: string;
  }) {
    this.innings[this.currentInning].striker = { name: striker };
    this.innings[this.currentInning].nonStriker = { name: nonStriker };

    this.addBatsManToTeam(
      this.innings[this.currentInning].striker as PlayerType,
      this.innings[this.currentInning].nonStriker as PlayerType
    );
    this.addBowlerOrFielderToTeam({ name: openingBowler });

    this.getThisOver().bowler = { name: openingBowler };
    // updating in localStorage
    db.match.updateOneById(this._id, this);
    // end of localStorage updating
  }

  addNewOver(bowler: PlayerType | null = null): OverType {
    bowler && this.addBowlerOrFielderToTeam(bowler);
    const overs = this.innings[this.currentInning].overs;
    overs.push({
      bowler,
      balls: [],
    });

    // updating in localStorage
    db.match.updateOneById(this._id, this);
    // end of localStorage updating
    return overs[overs.length - 1];
  }

  addBowlerForNewOver(newBowler: PlayerType) {
    this.addBowlerOrFielderToTeam(newBowler);
    const overs = this.innings[this.currentInning].overs;
    const previousBowler = overs?.[overs.length - 2]?.bowler;
    if (!previousBowler) {
      return {
        success: false,
        message: "Valid name required!",
      };
    }
    if (previousBowler.name == newBowler?.name) {
      return {
        success: false,
        message: "New bowler's name can not be same as previous bowler",
      };
    }
    this.getThisOver().bowler = newBowler;
    // updating in localStorage
    db.match.updateOneById(this._id, this);
    // end of localStorage updating
    return {
      success: true,
    };
  }

  getThisOver() {
    const overs = this.innings[this.currentInning].overs;
    let thisOver =
      overs.length > 0 ? overs[overs.length - 1] : this.addNewOver();
    const validBallsOfThisOver = thisOver.balls.reduce(
      (acc, crr) => Number(crr.isValid) + acc,
      0
    );
    thisOver.ballCount = validBallsOfThisOver;
    thisOver.isLastOver = overs.length == this.totalOver;
    if (validBallsOfThisOver === 6 && !thisOver.isLastOver) {
      this.addNewOver();
      this.swapStrike();
    }
    // updating in localStorage
    db.match.updateOneById(this._id, this);
    // end of localStorage updating
    return thisOver;
  }

  swapStrike() {
    const currentInning = this.innings[this.currentInning];
    const oldStriker = currentInning.striker;
    currentInning.striker = currentInning.nonStriker;
    currentInning.nonStriker = oldStriker;
    // updating in localStorage
    db.match.updateOneById(this._id, this);
    // end of localStorage updating
  }

  countBall(payload: BallType) {
    let isValid = true;
    if (
      (payload.noBall && MatchSettings.noBallReBall) ||
      (payload.wide && MatchSettings.wideReBall)
    ) {
      isValid = false;
    }

    this.getThisOver().balls.push({
      ...payload,
      isValid,
      striker: this.innings[this.currentInning].striker as PlayerType,
      nonStriker: this.innings[this.currentInning].nonStriker as PlayerType,
    });

    if (isValid && (payload.run == 1 || payload.run == 3)) {
      this.swapStrike();
    }
    // updating in localStorage
    db.match.updateOneById(this._id, this);
    // end of localStorage updating
  }

  getInningSummary() {
    let previousInning = null;
    let isMatchOver = false;
    const showingForInning = this.currentInning;
    const calcSummary = (chosenInnings: InningOptionType) => {
      const runOfOvers = this.innings[chosenInnings].overs.map((over) =>
        over.balls.reduce(
          (acc, crr) =>
            acc +
            Number(crr.run) +
            Number(crr.wide && MatchSettings.wideRun) +
            Number(crr.noBall && MatchSettings.noBallRun) +
            Number(crr.penaltyRun || 0),
          0
        )
      );
      const run = runOfOvers.reduce((acc, crr) => acc + crr, 0);
      const ballCount = this.innings[chosenInnings].overs
        .map((over) =>
          over.balls.reduce((acc, crr) => acc + Number(crr.isValid), 0)
        )
        .reduce((acc, crr) => crr + acc, 0);
      const wickets = this.innings[chosenInnings].overs
        .map((over) =>
          over.balls.reduce((acc, crr) => acc + Number(crr.wicket), 0)
        )
        .reduce((acc, crr) => acc + crr, 0);

      return {
        run,
        currentRunRate: Number((run / (ballCount / 6)).toFixed(2)) || 0,
        teamName: this[this.innings[chosenInnings].team].name,
        striker: this.innings[chosenInnings].striker,
        nonStriker: this.innings[chosenInnings].nonStriker,
        over: this.calcOver(ballCount),
        ballLeft: this.totalOver * 6 - ballCount,
        wickets,
      };
    };
    const selectedInningSummary = calcSummary(showingForInning);

    let summaryText = "";
    if (this.currentInning == "first") {
      summaryText = `${this[this.tossWinner]?.name} won the toss and opted to ${
        this.optedTo
      } first`;
    } else {
      previousInning = calcSummary("first");

      if (selectedInningSummary.run === previousInning.run) {
        summaryText = `Match Draw!`;
        // isMatchOver = true;
      } else if (selectedInningSummary.run > previousInning.run) {
        summaryText = `${selectedInningSummary.teamName} Won by ${
          MatchSettings.playerPerTeam - 1 - selectedInningSummary.wickets
        } wickets!`;
        isMatchOver = true;
        this.matchWinner = this.innings.second.team;
      } else if (
        Number(selectedInningSummary.over) === Number(this.totalOver) ||
        selectedInningSummary.wickets == MatchSettings.playerPerTeam - 1
      ) {
        summaryText = `${previousInning.teamName} Won by ${
          previousInning.run - selectedInningSummary.run
        } run!`;
        isMatchOver = true;
        this.matchWinner = this.innings.first.team;
      } else {
        summaryText = `${selectedInningSummary.teamName} need ${
          previousInning.run - selectedInningSummary.run
        } run in ${selectedInningSummary.ballLeft} balls.`;
      }
    }

    const summary = {
      ...selectedInningSummary,
      summaryText,
      previousInning,
      isMatchOver,
      requiredRunRate: Number(
        (
          (previousInning?.run
            ? previousInning?.run + 1 - selectedInningSummary.run
            : selectedInningSummary.run + 1) /
          (selectedInningSummary.ballLeft / 6 || this.totalOver)
        ).toFixed(2)
      ),
    };
    return summary;
  }

  getRunOfBatsman(
    batsmanName: string,
    showingForInning: InningOptionType = this.currentInning
  ): ScoreBoardBatsman {
    const runsOfBatsman = this.innings[showingForInning].overs
      .map((over) =>
        over.balls.filter(
          (ball) =>
            ball.striker.name === batsmanName && !ball.byes && !ball.legByes
        )
      )
      .flat();
    const totalRun = runsOfBatsman.reduce(
      (acc, crr) => acc + Number(crr.run),
      0
    );
    const boundaryCount = runsOfBatsman.filter((ball) => ball.run == 4).length;
    const overBoundaryCount = runsOfBatsman.filter(
      (ball) => ball.run == 6
    ).length;
    const totalBallPlayed = runsOfBatsman.reduce(
      (acc, crr) => acc + Number(crr.isValid),
      0
    );
    const fallOfWicket = this.innings[showingForInning].overs
      .map((over) =>
        over.balls.map((ball) => ({ ...ball, bowler: over.bowler?.name }))
      )
      .flat()
      .find((ball) => ball.fallOfWicket == batsmanName);

    const strikeRate =
      Number(((totalRun / totalBallPlayed) * 100).toFixed(2)) || 0;
    return {
      totalRun,
      boundaryCount,
      overBoundaryCount,
      totalBallPlayed,
      strikeRate,
      batsmanName,
      isNotOut: !fallOfWicket,
      wicketInfo: {
        wicketType: fallOfWicket?.wicketType || null,
        bowler: fallOfWicket?.bowler || null,
        wicketAsset: fallOfWicket?.wicketAsset || null,
      },
    };
  }

  getExtraRuns(batsmanName = "", showingForInning = this.currentInning) {
    const extra = {
      byes: 0,
      legByes: 0,
      wide: 0,
      noBall: 0,
      penaltyRun: 0,
      total: 0,
    };
    this.innings[showingForInning].overs.forEach((over) =>
      over.balls.filter((ball) => {
        if (ball.striker.name == batsmanName || !batsmanName) {
          if (ball.byes) {
            extra.byes += Number(ball.run);
            extra.total += Number(ball.run);
          } else if (ball.legByes) {
            extra.legByes += Number(ball.run);
            extra.total += Number(ball.run);
          } else if (ball.noBall) {
            extra.noBall += MatchSettings.noBallRun;
            extra.total += MatchSettings.noBallRun;
          } else if (ball.wide) {
            extra.wide += MatchSettings.wideRun;
            extra.total += MatchSettings.wideRun;
          } else if (ball.penaltyRun) {
            extra.penaltyRun += Number(ball.penaltyRun);
            extra.total += 1;
          }
        }
      })
    );

    return extra;
  }
  getPartnership(
    batsmanOneName = this.innings[this.currentInning].striker?.name,
    batsmanTwoName = this.innings[this.currentInning].nonStriker?.name
  ) {
    const batsmanOne = this.getRunOfBatsman(batsmanOneName as string);
    const batsmanTwo = this.getRunOfBatsman(batsmanTwoName as string);
    const extraRuns =
      this.getExtraRuns(batsmanOneName).total +
      this.getExtraRuns(batsmanTwoName).total;

    return {
      partnership: batsmanOne.totalRun + batsmanTwo.totalRun,
      balls: batsmanOne.totalBallPlayed + batsmanTwo.totalBallPlayed,
      extraRuns,
      batsmanOne,
      batsmanTwo,
    };
  }

  getEconomyOfBowler(
    bowlerName: string = this.getThisOver()?.bowler?.name as string,
    showingForInning: InningOptionType = this.currentInning
  ): ScoreBoardBowler {
    const oversOfBowler = this.innings[showingForInning].overs.filter(
      (over) => over.bowler?.name == bowlerName
    );

    const ballsOfBowler = oversOfBowler.map((over) => over.balls).flat();
    const totalRunGiven = ballsOfBowler.reduce(
      (acc, crr) =>
        acc +
        Number(crr.run) +
        Number(crr.wide && MatchSettings.wideRun) +
        Number(crr.noBall && MatchSettings.noBallRun) +
        Number(crr.penaltyRun || 0),
      0
    );
    const totalWicketTaken = ballsOfBowler.filter((ball) => ball.wicket).length;
    const totalValidBall = ballsOfBowler.filter((ball) => ball.isValid).length;
    const maidenOvers =
      ballsOfBowler.length &&
      oversOfBowler.filter(
        (over) =>
          over.balls.reduce(
            (acc, crr) =>
              acc +
              Number(crr.run) +
              Number(crr.wide && MatchSettings.wideRun) +
              Number(crr.noBall && MatchSettings.noBallRun) +
              Number(crr.penaltyRun || 0),
            0
          ) === 0
      ).length;
    const over = this.calcOver(totalValidBall);
    const wides = ballsOfBowler.reduce((acc, crr) => acc + Number(crr.wide), 0);
    const noBalls = ballsOfBowler.reduce(
      (acc, crr) => acc + Number(crr.noBall),
      0
    );
    const dotsBalls = ballsOfBowler.reduce(
      (acc, crr) =>
        acc + Number(crr.isValid && crr.run === 0 && crr.penaltyRun == 0),
      0
    );

    return {
      bowlerName: bowlerName || "_",
      totalRunGiven,
      totalWicketTaken,
      over,
      maidenOvers,
      economyRate: Number((totalRunGiven / Number(over)).toFixed(2)) || 0,
      wides,
      noBalls,
      dotsBalls,
    };
  }

  getPerformanceOfFielder(
    fielder: string,
    showingForInning = this.currentInning
  ) {
    const allBalls = this.innings[showingForInning].overs
      .map((over) => over.balls)
      .flat();
    const wickets = {
      catches: 0,
      stumpings: 0,
      runOuts: 0,
    };
    allBalls.forEach((ball) => {
      if (ball.wicketAsset === fielder) {
        if (ball.wicketType == "Catch out") {
          wickets.catches += 1;
        } else if (
          ball.wicketType == "Run out striker" ||
          ball.wicketType == "Run out non-striker"
        ) {
          wickets.runOuts += 1;
        } else if (ball.wicketType == "Stumping") {
          wickets.catches += 1;
        }
      }
    });

    return wickets;
  }

  startSecondInning() {
    this.currentInning = "second";
    // updating in localStorage
    db.match.updateOneById(this._id, this);
    // end of localStorage updating
  }

  fallOfWicket(payload: FallOfWicket): InningSummaryReturnType {
    const { batsmanList } = this.getPlayerList(this.currentInning);
    payload.newBatsman && this.addBatsManToTeam({ name: payload.newBatsman });
    payload.wicketAsset &&
      this.addBowlerOrFielderToTeam({ name: payload.wicketAsset });
    if (batsmanList.includes(payload.newBatsman as string)) {
      return {
        ...this.getInningSummary(),
        success: false,
        message:
          "New batsman's name can not be same as any other previous batsman",
      };
    }

    const fallOfWicket = this.innings[this.currentInning].striker?.name;
    if (!payload.fallOfWicket) {
      payload.fallOfWicket = fallOfWicket as string;
    }
    this.countBall({
      ...payload,
    });

    if (payload.wicketType == "Run out striker") {
      payload.newBatsman &&
        (this.innings[this.currentInning].striker = {
          name: payload.newBatsman,
        });
    } else if (payload.wicketType == "Run out non-striker") {
      payload.newBatsman &&
        (this.innings[this.currentInning].nonStriker = {
          name: payload.newBatsman,
        });
    } else {
      payload.newBatsman &&
        (this.innings[this.currentInning].striker = {
          name: payload.newBatsman,
        });
    }

    if (payload.wicketType == "Catch out" && payload.batsmanCrossed) {
      this.swapStrike();
    }
    // updating in localStorage
    db.match.updateOneById(this._id, this);
    // end of localStorage updating
    return { ...this.getInningSummary(), success: true, message: "" };
  }
  retireBatsman(payload: {
    toRetire: "striker" | "nonStriker";
    newBatsman: string;
  }) {
    this.addBatsManToTeam({ name: payload.newBatsman });
    this.innings[this.currentInning][payload.toRetire] = {
      name: payload.newBatsman,
    };
    // updating in localStorage
    db.match.updateOneById(this._id, this);
    // end of localStorage updating
  }

  calcOver(balls: number): string {
    return parseInt(String(balls / 6)) + "." + (balls % 6);
  }
  undo() {
    const deletedBall = this.getThisOver().balls.pop();
    const overs = this.innings[this.currentInning].overs;
    let thisOver = overs[overs.length - 1];
    const lastBall = thisOver.balls.slice(-1)?.[0];
    if (lastBall?.striker) {
      this.innings[this.currentInning].striker = { ...lastBall.striker };
      this.innings[this.currentInning].nonStriker = { ...lastBall.nonStriker };
    } else if (deletedBall?.striker) {
      this.innings[this.currentInning].striker = { ...deletedBall.striker };
      this.innings[this.currentInning].nonStriker = {
        ...deletedBall.nonStriker,
      };
    }
    // updating in localStorage
    db.match.updateOneById(this._id, this);
    // end of localStorage updating
  }

  getPlayerList(selectedInning = this.currentInning) {
    const batsmanList: string[] = [];
    const bowlerList: string[] = [];
    const fielderList: string[] = [];
    const fallenWicketList: string[] = [];
    let playerList: string[] = [];
    const allBalls: BallType[] = this.innings[selectedInning].overs
      .map((over) => over.balls)
      .flat();
    this.innings[selectedInning].overs.forEach((over) => {
      if (over.bowler?.name && !bowlerList.includes(over.bowler?.name)) {
        bowlerList.push(over.bowler?.name);
      }
    });

    allBalls.forEach((ball) => {
      if (!batsmanList.includes(ball.striker.name)) {
        batsmanList.push(ball.striker.name);
      }
      if (!batsmanList.includes(ball.nonStriker.name)) {
        batsmanList.push(ball.nonStriker.name);
      }
      if (ball.fallOfWicket && !fallenWicketList.includes(ball.fallOfWicket)) {
        ball.fallOfWicket && fallenWicketList.push(ball.fallOfWicket);
      }
      if (ball.wicketAsset && !fielderList.includes(ball.wicketAsset)) {
        ball.wicketAsset && fielderList.push(ball.wicketAsset);
      }
    });

    playerList = [...new Set([...playerList, ...bowlerList, ...batsmanList])];

    return {
      batsmanList,
      bowlerList,
      teamName: this[this.innings[selectedInning].team].name,
      fielderList,
      fallenWicketList,
    };
  }
  getScoreboard() {
    const firstInningPlayers = this.getPlayerList("first");
    const secondInningPlayers = this.getPlayerList("second");
    const innings = this.getInningSummary();
    const inningSummary: { first: any; second: any } = {
      first: { run: 0, over: "0.0", wickets: 0, runRate: 0 },
      second: { run: 0, over: "0.0", wickets: 0, runRate: 0 },
    };

    if (innings.previousInning) {
      inningSummary.first = innings.previousInning;
      inningSummary.second = innings;
    } else {
      inningSummary.first = innings;
    }

    const teams = {
      teamOne: {
        batsmanList: firstInningPlayers.batsmanList.map((batsman) =>
          this.getRunOfBatsman(batsman, "first")
        ),
        bowlerList: secondInningPlayers.bowlerList.map((bowler) =>
          this.getEconomyOfBowler(bowler, "second")
        ),
        name: firstInningPlayers.teamName,
        inningSummary: inningSummary.first,
        extras: this.getExtraRuns("", "first"),
      },
      teamTwo: {
        batsmanList: secondInningPlayers.batsmanList.map((batsman) =>
          this.getRunOfBatsman(batsman, "second")
        ),
        bowlerList: firstInningPlayers.bowlerList.map((bowler) =>
          this.getEconomyOfBowler(bowler, "first")
        ),
        name: secondInningPlayers.teamName,
        inningSummary: inningSummary.second,
        extras: this.getExtraRuns("", "second"),
      },
    };
    return teams;
  }
}
export default Match;
