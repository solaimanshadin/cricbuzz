interface PlayerType {
  name: string;
}

interface ActionStatus {
  success: boolean;
  message: string;
}

interface TeamType {
  _id: string;
  name: string;
  playerList: PlayerType[];
  addPlayer(payload: PlayerType): ActionStatus;
  updateTeamName(teamName: string): void;
  removePlayer(playerName: string): void;
  updatePlayerName(playerName: string, newPlayerName: string): void;
}

interface ScoreBoardBatsman {
  totalRun: number;
  boundaryCount: number;
  overBoundaryCount: number;
  totalBallPlayed: number;
  strikeRate: number;
  batsmanName: string;
  isNotOut: boolean;
  wicketInfo: {
    wicketType: string | null;
    bowler: string | null;
    wicketAsset: string | null;
  };
}

interface ScoreBoardBowler {
  bowlerName: string;
  totalRunGiven: number;
  totalWicketTaken: number;
  over: string;
  maidenOvers: number;
  economyRate: number;
  wides: number;
  noBalls: number;
  dotsBalls: number;
}

interface ScoreboardExtras {
  byes: number;
  legByes: number;
  wide: number;
  noBall: number;
  penaltyRun: number;
  total: number;
}

type TeamOptionType = "teamOne" | "teamTwo";
type InningOptionType = "first" | "second";
type TossOptionType = "bat" | "bowling";
type WicketType =
  | "Bowled"
  | "Catch out"
  | "Stumping"
  | "Run out striker"
  | "Run out non-striker";

interface BallTypePayload {
  byes: boolean;
  legByes: boolean;
  noBall: boolean;
  run: number;
  wicket: boolean;
  wide: boolean;
  wicketAsset?: string;
  fallOfWicket?: string;
  wicketType?: WicketType;
  penaltyRun?: number;
}

interface BallType extends BallTypePayload {
  striker: PlayerType;
  isValid: boolean;
  nonStriker: PlayerType;
}
interface OverType {
  ballCount?: number;
  bowler: PlayerType | null;
  balls: BallType[];
  isLastOver?: boolean;
}
interface InningType {
  team: TeamOptionType;
  overs: OverType[];
  striker: null | { name: string };
  nonStriker: null | { name: string };
}

interface InningsType {
  first: InningType;
  second: InningType;
}

interface InningSummaryType {
  summaryText?: string;
  isMatchOver?: boolean;
  requiredRunRate?: number;
  run: number;
  currentRunRate: number;
  teamName: string;
  striker: PlayerType | null;
  nonStriker: PlayerType | null;
  over: string;
  ballLeft: number;
  wickets: number;
  previousInning?: InningSummaryType | null;
}

interface InningSummaryReturnType extends InningSummaryType  {
  success: boolean;
  message: string
}

interface ScoreboardType {
  teamOne: {
    batsmanList: ScoreBoardBatsman[];
    bowlerList: ScoreBoardBowler[];
    name: string;
    inningSummary: string;
    extras: ScoreboardExtras;
  };
  teamTwo: {
    batsmanList: ScoreBoardBatsman[];
    bowlerList: ScoreBoardBowler[];
    name: string;
    inningSummary: string;
    extras: ScoreboardExtras;
  };
}

interface FallOfWicket extends BallType {
  wicketType: WicketType;
  newBatsman: string | null;
  fallOfWicket: string;
  catchOutOption?: string;
  batsmanCrossed?: boolean;
  wicketAsset?: string;
}

interface PartnershipType{
  partnership: number;
  balls: number;
  extraRuns: number;
  batsmanOne: ScoreBoardBatsman;
  batsmanTwo: ScoreBoardBatsman;
}

interface MatchType {
  _id: string;
  teamOne: TeamType;
  teamTwo: TeamType;
  tossWinner: TeamOptionType;
  optedTo: TossOptionType;
  totalOver: number;
  currentInning: InningOptionType;
  matchWinner: null | TeamOptionType;
  currentInning: InningOptionType;
  createdAt?: Date;
  innings: InningsType;
  addNewOver(bowler: PlayerType | null): OverType;
  getEconomyOfBowler(
    bowlerName?: string | null,
    showingForInning?: InningOptionType
  ): ScoreBoardBowler;

  getScoreboard(): ScoreBoardType;
  getRunOfBatsman(
    batsmanName: string,
    showingForInning?: InningOptionType
  ): ScoreBoardBatsman;
  getPerformanceOfFielder(
    fielderName: string,
    showingForInning?: InningOptionType
  ): {
    catches: number;
    stumpings: number;
    runOuts: number;
  };
  selectOpeningPlayers(payload: {
    striker: string;
    nonStriker: string;
    openingBowler: string;
  }): void;

  getInningSummary(): InningSummaryType;

  getThisOver(): OverType;
  startSecondInning(): void;
  swapStrike(): void;
  undo(): void;
  countBall(payload: BallTypePayload): void;
  getPartnership(): PartnershipType;
  getExtraRuns(): ScoreboardExtras;
  addBowlerForNewOver(bowler: PlayerType): {
    success: boolean;
    message?: string;
  };
  getPlayerList(selectedInning?: InningOptionType): {
    batsmanList: string[];
    bowlerList: string[];
    teamName: string;
    fielderList: string[];
    fallenWicketList: string[];
  };
  fallOfWicket(payload: FallOfWicket): InningSummaryReturnType;
  retireBatsman(payload: {
    toRetire: "striker" | "nonStriker";
    newBatsman: string;
  }): void;
}

interface MatchSettingsType {
  playerPerTeam: number;
  noBallReBall: boolean;
  wideReBall: boolean;
  noBallRun: number;
  wideRun: number;
}

interface Component {
  template: string;
  bindEvents?: Function;
  exports?: object;
}

