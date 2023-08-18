import { retrieveMatch } from "../utils/retrieveMatch";
import { getRouterParams, router } from "../utils/router";
// "use strict"
export default function inningSummary(): Component {
  const [ matchId ] = getRouterParams()
  const match: MatchType | null = retrieveMatch(matchId)
  const { run, summaryText, requiredRunRate } = match?.getInningSummary() as InningSummaryType;

  const bindEvents = (element: HTMLElement) => {
    const submitButton = element.querySelector("#submitButton") as HTMLButtonElement;
    submitButton.addEventListener("click", () => {
      match?.startSecondInning();
      match && router("#opening-player-selection", [match._id]);
    });
  };

  const template = `
  <div class="container">
    <div class="box-shadow">
      <h3 class="subtitle">Inning Summary</h3>
      <div >
        <p bizIf="${match?.currentInning == "second"}" class="text--center">${summaryText}</p>
        <div bizIf="${match?.currentInning == "first"}">
          <p>End of the ${match?.currentInning} inning</p>
          <p> ${match?.teamTwo.name} need ${run} run in ${match?.totalOver} over.</p>
          <p> Required Run rate ${requiredRunRate}.</p>
        </div>

      </div>
      <div bizIf="${match?.currentInning == "first"}"  class="text--center">
        <button id="submitButton" class="btn btn--primary">Start New Inning</button>
      </div>
    </div>
  </div>
  `;

  return {
    template,
    bindEvents,
  };
}
