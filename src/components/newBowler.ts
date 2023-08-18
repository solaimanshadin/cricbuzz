import toast from "../lib/toast/index";
import MatchHistory from "../model/MatchHistory";
import { retrieveMatch } from "../utils/retrieveMatch";
import { getRouterParams, router } from "../utils/router";
import { validator } from "../utils/validator";

export default function newBowler(): Component {
  let matchData: PlayerType = {
    name: "",
  };

  const [matchId] = getRouterParams();
  const match: MatchType | null = retrieveMatch(matchId);
  const previousBowler =
    match?.innings[match.currentInning].overs?.[
      match.innings[match.currentInning].overs?.length - 2
    ]?.bowler;

  const bowlerList = match
    ? MatchHistory.getPlayersOfATeam(
        match[
          match.innings[match.currentInning]?.team == "teamOne"
            ? "teamTwo"
            : "teamOne"
        ]?.name
      )?.filter((bowler: PlayerType) => bowler.name !== previousBowler?.name)
    : [];

  const bindEvents = (element: HTMLElement) => {
    const inputs = element.querySelectorAll(
      "input"
    ) as NodeListOf<HTMLInputElement>;

    inputs.forEach((input) => {
      input.addEventListener("blur", (event: Event) => {
        const target = event.target as HTMLInputElement;
        matchData = {
          ...matchData,
          [target.name]:
            target.type == "number" ? target.valueAsNumber : target.value,
        };
      });
    });

    const submitButton = element.querySelector(
      "#submitButton"
    ) as HTMLButtonElement;

    submitButton.addEventListener("click", () => {
      const validation = validator(matchData, {
        name: {
          isRequired: true,
          message: "Bowler name is required",
        },
      });
      if (validation.hasError && validation.concatenatedErrorMessage) {
        return toast(validation.concatenatedErrorMessage, {
          type: "error",
        });
      }
      const { success, message } = match?.addBowlerForNewOver(
        matchData
      ) as ActionStatus;

      if (!success && message) {
        return toast(message, {
          type: "error",
        });
      }
      match && router("#running-match", [match._id]);
    });
  };

  const template = `
  <div class="container">
    <div class="form box-shadow">
      <h3 class="subtitle">New Bowler</h3>
      <div class="form__group">
        <label for="overs">New Bowler</label>
        <input autocomplete="off" list="bowlerList" name="name" type="text" />
        <datalist id="bowlerList">
            ${bowlerList.map(
              (player: PlayerType) =>
                `<option value="${player.name}">Overs ${
                  match?.getEconomyOfBowler(player.name).over
                } </option>`
            )}
        </datalist>
      </div>
      <div class="text--center">
        <button id="submitButton" class="btn btn--primary">Start New Over</button>
      </div>
    </div>
  </div>
  `;

  return {
    template,
    bindEvents,
  };
}
