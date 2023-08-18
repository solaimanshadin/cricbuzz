import { retrieveMatch } from "../utils/retrieveMatch";
import { getRouterParams } from "../utils/router";
import MatchSettings from "../model/MatchSettings";

export default function scoreboard(): Component {
  const [matchId] = getRouterParams();
  const match: MatchType | null = retrieveMatch(matchId);

  const { teamOne, teamTwo } = match?.getScoreboard();

  const template = `
    <div class="container">
      <div class="scoreboard box-shadow">
        <h3 class="subtitle">${teamOne.name} v/s ${teamTwo.name}</h3>
        
        <section class="scoreboard__team">
          <div class="scoreboard__team-header">
            <p>${teamOne.name}</p>
            <p>
            ${teamOne.inningSummary.run}
            -
            ${teamOne.inningSummary.wickets} (${teamOne.inningSummary.over})</p>
          </div>
          <table class="scoreboard__table">
            <tr>
              <th>Batsman</th>
              <th>R</th>
              <th>B</th>
              <th>4s</th>
              <th>6s</th>
              <th>SR</th>
            </tr>
            ${teamOne.batsmanList
              .map(
                (batsman: ScoreBoardBatsman) => `
            <tr>
              <td>
                <p>${batsman.batsmanName}</p>
                <small>${
                  batsman.isNotOut
                    ? `Not out`
                    : `${batsman.wicketInfo?.wicketType} by ${
                        batsman.wicketInfo?.wicketAsset
                          ? batsman.wicketInfo?.wicketAsset + " b"
                          : ""
                      }  ${batsman.wicketInfo?.bowler}`
                }</small>
              </td>
              <td>${batsman.totalRun}</td>
              <td>${batsman.totalBallPlayed}</td>
              <td>${batsman.boundaryCount}</td>
              <td>${batsman.overBoundaryCount}</td>
              <td>${batsman.strikeRate}</td>
            </tr>
            `
              )
              .join("")}
              
          </table>
          <div class="row--cols-2">
              <div>Extras</div>
              <div>
              ${teamOne.extras?.byes} B, ${teamOne.extras?.legByes} LB, ${
    teamOne.extras?.wide
  } WD, ${teamOne.extras?.noBall} NB , P ${teamOne.extras?.penaltyRun}
              </div>
          </div>
          <table class="scoreboard__table">
            <tr>
              <th>Bowler</th>
              <th>O</th>
              <th>M</th>
              <th>R</th>
              <th>W</th>
              <th>ER</th>
            </tr>
            <tr bizFor="teamTwoBowlerList">
              <td>
                {{bowlerName}}
              </td>
              <td>{{over}}</td>
              <td>{{maidenOvers}}</td>
              <td>{{totalRunGiven}}</td>
              <td>{{totalWicketTaken}}</td>
              <td>{{economyRate}}</td>
            </tr>
          </table>
          
        </section>
        <section class="overs__team">
        ${match?.innings.first.overs
          .filter((over) => over.bowler)
          .map(
            (over, i) => `
          <div class="d--flex over__wrapper">
            <div class="over__meta">
              <p> Ov ${i + 1}</p>
              <small>
              ${over.balls.reduce(
                (acc, crr) =>
                  acc +
                  Number(crr.run) +
                  Number(crr.wide && MatchSettings.wideRun) +
                  Number(crr.noBall && MatchSettings.noBallRun),
                0
              )} runs
              </small>
            </div>
            <div>
              <p>  ${over.bowler?.name} to ${[
              ...new Set(over.balls.map((ball) => ball.striker.name)),
            ]}</p>
              <div class="match__over d--flex">
              ${over.balls
                .map((ball) => {
                  let extraInfo = "";
                  if (ball.wide) extraInfo += " Wide ";
                  if (ball.noBall) extraInfo += " No-ball ";
                  if (ball.wicket) extraInfo += " Wicket ";
                  if (ball.byes) extraInfo += " Byes ";
                  if (ball.legByes) extraInfo += " Leg-byes ";

                  return `
                  <div class="match__ball ">
                    <p class="match__run ${
                      (ball.run == 4 ||
                        ball.run == 5 ||
                        ball.run == ball.penaltyRun) &&
                      "match__ball--orange"
                    } ${ball.run == 6 && "match__ball--green"} ${
                    ball.wicket && "match__ball--red"
                  }">${ball.wicket ? "out" : ball.run}</p>
                    <p class="match__ball-info">${extraInfo}</p>
                  </div>
                `;
                })
                .join("")}
              </div>
            </div>
          </div>
          `
          )
          .join("")}
      </section>

        <section class="scoreboard__team">
          <div class="scoreboard__team-header">
          <p>${teamTwo.name}</p>
          <p>${teamTwo.inningSummary.run}
          -
          ${teamTwo.inningSummary.wickets} (${teamTwo.inningSummary.over})</p>
          </div>
          <table class="scoreboard__table">
            <tr>
              <th>Batsman</th>
              <th>R</th>
              <th>B</th>
              <th>4s</th>
              <th>6s</th>
              <th>SR</th>
            </tr>
            ${teamTwo.batsmanList
              .map(
                (batsman: ScoreBoardBatsman) => `
            <tr>
              <td>
                <p>${batsman.batsmanName}</p>
                <small>${
                  batsman.isNotOut
                    ? `Not out`
                    : `${batsman.wicketInfo?.wicketType} by ${
                        batsman.wicketInfo?.wicketAsset
                          ? batsman.wicketInfo?.wicketAsset + " b"
                          : ""
                      }  ${batsman.wicketInfo?.bowler}`
                }</small>
              </td>
              <td>${batsman.totalRun}</td>
              <td>${batsman.totalBallPlayed}</td>
              <td>${batsman.boundaryCount}</td>
              <td>${batsman.overBoundaryCount}</td>
              <td>${batsman.strikeRate}</td>
            </tr>
            `
              )
              .join("")}
          
          </table>
          <div class="row--cols-2">
              <div>Extras</div>
              <div>
              ${teamTwo.extras?.byes} B, ${teamTwo.extras?.legByes} LB, ${
    teamTwo.extras?.wide
  } WD, ${teamTwo.extras?.noBall} NB, P ${teamTwo.extras?.penaltyRun}
              </div>
          </div>
          <table class="scoreboard__table">
            <tr>
              <th>Bowler</th>
              <th>O</th>
              <th>M</th>
              <th>R</th>
              <th>W</th>
              <th>ER</th>
            </tr>
            
                <tr bizFor="teamOneBowlerList">
                  <td>
                    {{bowlerName}}
                  </td>
                  <td>{{over}}</td>
                  <td>{{maidenOvers}}</td>
                  <td>{{totalRunGiven}}</td>
                  <td>{{totalWicketTaken}}</td>
                  <td>{{economyRate}}</td>
                </tr>
            
          </table>
         
          
        </section>
        <section class="overs__team">
          ${match?.innings.second.overs
            .filter((over) => over.bowler)
            .map(
              (over, i) => `
            <div class="d--flex over__wrapper">
              <div class="over__meta">
                <p> Ov ${i + 1}</p>
                <small>
                ${over.balls.reduce(
                  (acc, crr) =>
                    acc +
                    Number(crr.run) +
                    Number(crr.wide) +
                    Number(crr.noBall),
                  0
                )} runs
                </small>
              </div>
              <div>
              <p>  ${over.bowler?.name} to ${[
                ...new Set(over.balls.map((ball) => ball.striker.name)),
              ]}</p>
                <div class="match__over d--flex">
                ${over.balls
                  .map((ball) => {
                    let extraInfo = "";
                    if (ball.wide) extraInfo += " Wide ";
                    if (ball.noBall) extraInfo += " No-ball ";
                    if (ball.wicket) extraInfo += " Wicket ";
                    if (ball.byes) extraInfo += " Byes ";
                    if (ball.legByes) extraInfo += " Leg-byes ";

                    return `
                    <div class="match__ball ">
                      <p class="match__run ${
                        (ball.run == 4 ||
                          ball.run == 5 ||
                          ball.run == ball.penaltyRun) &&
                        "match__ball--orange"
                      } ${ball.run == 6 && "match__ball--green"} ${
                      ball.wicket && "match__ball--red"
                    }">${ball.wicket ? "out" : ball.run}</p>
                      <p class="match__ball-info">${extraInfo}</p>
                    </div>
                  `;
                  })
                  .join("")}
                </div>
              </div>
            </div>
            `
            )
            .join("")}
        </section>
      </div>
    </div>
    `;

  return {
    template,
    exports: {
      teamOneBowlerList: teamOne.bowlerList,
      teamTwoBowlerList: teamTwo.bowlerList,
    },
  };
}
