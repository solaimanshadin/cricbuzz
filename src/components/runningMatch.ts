import modal from "../lib/modal/index";
import MatchSettings from "../model/MatchSettings";
import { retrieveMatch } from "../utils/retrieveMatch";
import { getRouterParams, rerenderRoute, router } from "../utils/router";
interface PenaltyFormData {
  penaltyRun: number;
  scoredRun: number;
}
export default function runningMatch(): Component {
  const [matchId] = getRouterParams();
  const match: MatchType | null = retrieveMatch(matchId);
  const currentInning = match?.getInningSummary();
  const initialBattingData: ScoreBoardBatsman = {
    totalRun: 0,
    totalBallPlayed: 0,
    boundaryCount: 0,
    overBoundaryCount: 0,
    strikeRate: 0,
    batsmanName: "",
    isNotOut: false,
    wicketInfo: { wicketType: null, bowler: null, wicketAsset: null },
  };
  const striker = currentInning?.striker?.name
    ? match?.getRunOfBatsman(currentInning?.striker?.name)
    : initialBattingData;
  const nonStriker = currentInning?.nonStriker?.name
    ? match?.getRunOfBatsman(currentInning?.nonStriker?.name)
    : initialBattingData;
  const currentBowler = match?.getEconomyOfBowler();
  const { balls, ballCount, isLastOver, bowler } =
    match?.getThisOver() as OverType;

  const bindEvents = (element: HTMLElement) => {
    if (ballCount === 6 || !bowler) {
      element
        .querySelector("#startNewOver")!
        .addEventListener(
          "click",
          () => match && router("#new-bowler", [match._id])
        );
    }
    if (!currentInning?.striker) {
      currentInning?.previousInning && match?.startSecondInning();
      match && router("#opening-player-selection", [match._id]);
    }
    if (ballCount === 6 && isLastOver) {
      match && router("#inning-summary", [match._id]);
    }
    if (currentInning?.isMatchOver) {
      match && router("#inning-summary", [match._id]);
    }

    const batsmanSwapBtn = element.querySelector(
      "#batsmanSwapBtn"
    ) as HTMLButtonElement;
    batsmanSwapBtn.addEventListener("click", () => {
      match?.swapStrike();
      rerenderRoute();
    });

    // Run control
    let ballExtraInfo = {
      wicket: false,
      wide: false,
      noBall: false,
      byes: false,
      legByes: false,
    };
    const controlCheckboxes = element?.querySelectorAll(
      ".match__control input[type=checkbox]"
    );

    controlCheckboxes?.forEach((checkbox) => {
      checkbox.addEventListener("change", (event: Event) => {
        const target = event.target as HTMLInputElement;
        ballExtraInfo = {
          ...ballExtraInfo,
          [target.name]: target.checked,
        };
      });
    });
    const runButtons = element?.querySelectorAll(".btn--run");
    runButtons?.forEach((button) => {
      button.addEventListener("click", (event) => {
        const target = event.target as HTMLButtonElement;
        if (ballExtraInfo.wicket) {
          if (match) {
            return router("#fall-of-wicket", [match._id], {
              match,
              ballInfo: {
                run: Number(target.dataset.run),
                ...ballExtraInfo,
              },
            });
          }
        }
        match?.countBall({
          run: Number(target.dataset.run),
          ...ballExtraInfo,
        });
        rerenderRoute();
      });
    });

    const runModal = element?.querySelector(".btn--run-modal");
    runModal &&
      runModal.addEventListener("click", () => {
        modal(
          `
        <div class="form">
        <div class="form__group">
          <label>Scored run (including overthrows)?</label>
          <input type="number" name="scoredRun"  class="form-control"  />
        </div>
        <div class="form__group">
          <label>Penalty runs?</label>
          <input type="number" name="penaltyRun"  class="form-control"  />
        </div>
          <button id="confirmBtn" style="margin:20px" class="btn btn--primary"> OK </button>
        </div>
      `,
          (element: HTMLElement, cb: Function) => {
            const confirmBtn = element.querySelector("#confirmBtn");
            const penaltyInputs = element.querySelectorAll("input");
            let penaltyInputsValue: PenaltyFormData = {
              penaltyRun: 0,
              scoredRun: 0,
            };
            penaltyInputs.forEach((penaltyInput) => {
              penaltyInput.addEventListener("change", (event) => {
                const target = event.target as HTMLInputElement;
                penaltyInputsValue = {
                  ...penaltyInputsValue,
                  [target.name]: target.valueAsNumber,
                };
              });
            });

            confirmBtn?.addEventListener("click", () => {
              if (ballExtraInfo.wicket) {
                match &&
                  router("#fall-of-wicket", [match._id], {
                    match,
                    ballInfo: {
                      run: penaltyInputsValue.scoredRun,
                      penaltyRun: penaltyInputsValue.penaltyRun,
                      ...ballExtraInfo,
                    },
                  });
              }
              match?.countBall({
                run: penaltyInputsValue.scoredRun,
                penaltyRun: penaltyInputsValue.penaltyRun,
                ...ballExtraInfo,
              });
              rerenderRoute();
              cb();
            });
          }
        );
      });
    const undoBtn = element?.querySelector("#undoBtn");
    undoBtn?.addEventListener("click", () => {
      modal(
        `
        <div class="text--center">
          <p>Are you sure to Undo?</p>
          <button id="confirmUndoBtn" style="margin:20px" class="btn btn--primary"> Yes </button>
        </div>
      `,
        (element: HTMLElement, cb: Function) => {
          const confirmUndoBtn = element.querySelector("#confirmUndoBtn");
          confirmUndoBtn?.addEventListener("click", () => {
            match?.undo();
            rerenderRoute();
            cb();
          });
        }
      );
    });

    const togglePartnershipBtn = element?.querySelector(
      "#togglePartnershipBtn"
    );
    togglePartnershipBtn?.addEventListener("click", () => {
      const { partnership, balls, batsmanOne, batsmanTwo, extraRuns } =
        match?.getPartnership() as PartnershipType;
      modal(`
      Partnership: ${partnership} from ${balls} balls <br>
      ${batsmanOne.batsmanName} : ${batsmanOne.totalRun} from ${batsmanOne.totalBallPlayed} <br>
      ${batsmanTwo.batsmanName} : ${batsmanTwo.totalRun} from ${batsmanTwo.totalBallPlayed}<br>
      Extra : ${extraRuns} <br>
      `);
    });

    const toggleExtraRunBtn = element?.querySelector("#toggleExtraRunBtn");
    toggleExtraRunBtn?.addEventListener("click", () => {
      const { noBall, byes, legByes, wide, penaltyRun } =
        match?.getExtraRuns() as ScoreboardExtras;
      modal(`
      Extras: ${byes} B, ${legByes} LB, ${wide} WD, ${noBall} NB, P ${penaltyRun}
      `);
    });

    const batsmanRetireBtn = element?.querySelector("#batsmanRetireBtn");
    batsmanRetireBtn?.addEventListener("click", () => {
      match && router("#batsman-retire", [match._id]);
    });
  };

  const template = `
    <div class="container">
      <div class="box-shadow match">
        <h2 class="subtitle">${match?.teamOne?.name} v/s ${
    match?.teamTwo?.name
  }</h2>
        <section class="match__inning-summary row--cols-2">
          <div>
            <span>${currentInning?.teamName}</span>,
            <span>${match?.currentInning} Inning</span>
            <p>${currentInning?.run}-${currentInning?.wickets}<small>(${
    currentInning?.over
  })</small></p>
          </div>
          <div class="d--flex" >
            <div>
              <span>CRR</span>
              <p>${currentInning?.currentRunRate || 0}</p>
            </div>
            ${
              currentInning?.previousInning
                ? `<div style="margin-left:30px">
              <span>RRR</span>
              <p>${currentInning.requiredRunRate || 0}</p>
            </div> `
                : ""
            }
          </div>
        </section>

        <section class="match__scoreboard">
          <table>
            <tr>
              <th>Batsman</th>
              <th>R</th>
              <th>B</th>
              <th>4s</th>
              <th>6s</th>
              <th>SR</th>
            </tr>
            <tr id="striker">
              <td>${currentInning?.striker?.name}  *</td>
              <td>${striker?.totalRun}</td>
              <td>${striker?.totalBallPlayed}</td>
              <td>${striker?.boundaryCount}</td>
              <td>${striker?.overBoundaryCount}</td>
              <td>${striker?.strikeRate}</td>
            </tr>
            <tr id="nonStriker">
              <td>${currentInning?.nonStriker?.name} </td>
              <td>${nonStriker?.totalRun}</td>
              <td>${nonStriker?.totalBallPlayed}</td>
              <td>${nonStriker?.boundaryCount}</td>
              <td>${nonStriker?.overBoundaryCount}</td>
              <td>${nonStriker?.strikeRate}</td>
            </tr>
          </table>
          <table>
            <tr>
              <th>Bowler</th>
              <th>O</th>
              <th>M</th>
              <th>R</th>
              <th>W</th>
              <th>ER</th>
            </tr>
            <tr id="currentBowler">
              <td>${currentBowler?.bowlerName} </td>
              <td>${currentBowler?.over}</td>
              <td>${currentBowler?.maidenOvers}</td>
              <td>${currentBowler?.totalRunGiven}</td>
              <td>${currentBowler?.totalWicketTaken}</td>
              <td>${currentBowler?.economyRate}</td>
            </tr>
          </table>
        </section>

        <section class="match__over-summary">
          <h5>This Over</h5>
          <div class="match__over d--flex">
          ${balls
            .map((ball: BallType) => {
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
        </section>

        <section class="match__control d--flex">
            <div bizIf="${
              MatchSettings.wideReBall || Number(MatchSettings.wideRun)
            }">
            <input
              class="form-check-input"
              type="checkbox"
              name="wide"
              id="wideCheckbox"
            />
            <label
              class="form-check-label"
              for="wideCheckbox"
            >
              Wide
            </label>
          </div>
            
          <div bizIf="${
            MatchSettings.noBallReBall || Number(MatchSettings.noBallRun)
          }">
            <input
              class="form-check-input"
              type="checkbox"
              name="noBall"
              id="noBallCheckbox"
            />
            <label
              class="form-check-label"
              for="noBallCheckbox"
            >
              No Ball
            </label>
          </div>
          
          <div>
            <input
              class="form-check-input"
              type="checkbox"
              name="legByes"
              id="legByesCheckbox"
            />
            <label
              class="form-check-label"
              for="legByesCheckbox"
            >
              Leg Byes
            </label>
          </div>
          <div>
            <input
              class="form-check-input"
              type="checkbox"
              name="wicket"
              id="wicketCheckbox"
            />
            <label
              class="form-check-label"
              for="wicketCheckbox"
            >
              Wicket
            </label>
          </div>
          <div>
            <button id="batsmanRetireBtn" class="btn btn--primary">Retire</button>
            <button id="batsmanSwapBtn" class="btn btn--primary">Swap Batsman</button>
          </div>
        </section>

        <div class="row--cols-2">
          <section class="match__extra-info">
            <button id="undoBtn" class="btn btn--primary">Undo</button>
            <button id="togglePartnershipBtn" class="btn btn--primary">Partnerships</button>
            <button id="toggleExtraRunBtn" class="btn btn--primary">Extras</button>
          </section>
            <button bizIf="${
              ballCount === 6 || !bowler
            }" id="startNewOver" class="btn btn--primary">Start new over</button>
              <section bizIf="${!(
                ballCount === 6 || !bowler
              )}" class="match__run-control">
              <button data-run="0" class="btn btn--run">0</button>
              <button data-run="1" class="btn btn--run">1</button>
              <button data-run="2" class="btn btn--run">2</button>
              <button data-run="3" class="btn btn--run">3</button>
              <button data-run="4" class="btn btn--run">4</button>
              <button data-run="5" class="btn btn--run">5</button>
              <button data-run="6" class="btn btn--run">6</button>
              <button class="btn btn--run-modal">...</button>
            </section>
        </div>
      </div>
    </div>
    `;

  return {
    template,
    bindEvents,
  };
}
