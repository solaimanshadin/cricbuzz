import MatchHistory from "../model/MatchHistory";
import { getRouterParams } from "../utils/router";

export default function playerDetails(): Component {
  const [teamName, playerName] = getRouterParams();
  const { batting, bowling, fielding, matches } = MatchHistory.getPlayerDetails(
    teamName,
    playerName
  );

  const template = `<div class="container">
    <div class="player box-shadow">
    <h3 class="subtitle">${playerName}</h3>
    <div>
      <h3>Batting</h3>
      <div class="player__stats">
        <div>
          Matches
          <h4>${matches}</h4>
        </div>
        <div>
          Innings
          <h4>${batting.innings}</h4>
        </div>
        <div>
          Runs
          <h4>${batting.totalRun}</h4>
        </div>
        <div>
          Not outs
          <h4>${batting.notOut}</h4>
        </div>
        <div>
          Best Score
          <h4>${batting.bestScore}</h4>
        </div>
        <div>
          Strike Rate
          <h4>${batting.strikeRate}</h4>
        </div>
        <div>
          Average
          <h4>
            ${batting.totalRun ? (batting.totalRun / batting.innings).toFixed(2) : 0}
          </h4>
        </div>
        <div>
          Fours
          <h4>${batting.boundaryCount}</h4>
        </div>
        <div>
          Sixes
          <h4>${batting.overBoundaryCount}</h4>
        </div>
        <div>
          Thirties
          <h4>${batting.thirties}</h4>
        </div>
        <div>
          Fifties
          <h4>${batting.fifties}</h4>
        </div>
        <div>
          Hundreds
          <h4>${batting.hundreds}</h4>
        </div>
        <div>
          Ducks
          <h4>${batting.ducks}</h4>
        </div>
      </div>
      <div>
        <h3>Bowling</h3>
        <div class="player__stats">
          <div>
            Matches
            <h4>${matches}</h4>
          </div>
          <div>
            Innings
            <h4>${bowling.innings}</h4>
          </div>
          <div>
            Overs
            <h4>${bowling.over}</h4>
          </div>
          <div>
            Maidens
            <h4>${bowling.maidenOvers}</h4>
          </div>
          <div>
            Wickets
            <h4>${bowling.totalWicketTaken}</h4>
          </div>
          <div>
            Runs
            <h4>${bowling.totalRunGiven}</h4>
          </div>
          <div>
            B. Bowling
            <h4>${bowling.bestBowling}</h4>
          </div>
          <div>
            Eco. Rate
            <h4>${bowling.economyRate}</h4>
          </div>
          <div>
            Strike Rate
            <h4>${bowling.strikeRate}</h4>
          </div>
          <div>
            Average
            <h4>
              ${
                bowling.totalRunGiven
                  ? (bowling.totalRunGiven / bowling.innings).toFixed(2)
                  : 0
              }
            </h4>
          </div>
          <div>
            Wides
            <h4>${bowling.wides}</h4>
          </div>
          <div>
            No Balls
            <h4>${bowling.noBalls}</h4>
          </div>
          <div>
            Dots balls
            <h4>${bowling.dotsBalls}</h4>
          </div>
        </div>
      </div>
      <div>
        <h3>Fielding</h3>
        <div class="player__stats">
          <div>
            Matches
            <h4>${matches}</h4>
          </div>
          <div>
            Catches
            <h4>${fielding.catches}</h4>
          </div>
          <div>
            Stumping
            <h4>${fielding.stumpings}</h4>
          </div>
          <div>
            Run outs
            <h4>${fielding.runOuts}</h4>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
  `;

  return {
    template,
  };
}
