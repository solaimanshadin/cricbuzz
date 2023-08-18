import toast from "../lib/toast/index";
import Match from "../model/Match";
import MatchSettings from "../model/MatchSettings";
import { rerenderRoute } from "../utils/router";
import { validator } from "../utils/validator";

export default function matchSettings(): Component {
  let matchSettings: MatchSettingsType = {} as MatchSettingsType;
  const bindEvents = (element: HTMLElement) => {
    const inputs = element.querySelectorAll("input") as NodeListOf<HTMLInputElement>;
    inputs.forEach((input) => {
      input.addEventListener("change", (event: Event) => {
        const target = event.target as HTMLInputElement;
        matchSettings = {
          ...matchSettings,
          [target.name]:
            target.type == "checkbox"
              ? target.checked
              : (target.type == "number"
              ? target.valueAsNumber
              : target.value),
        };
        // updating tossWinner label with team name
        if (target.name == "teamOneName") {
          const tossWinnerTeamOneLabel = element.querySelector(
            "#tossWinnerTeamOneLabel"
          ) as HTMLLabelElement;
          tossWinnerTeamOneLabel &&
            (tossWinnerTeamOneLabel.innerText = target.value);
        }
        if (target.name == "teamTwoName") {
          const tossWinnerTeamTwoLabel =
            element.querySelector("#tossWinnerTeamTwoLabel") as HTMLLabelElement;
          tossWinnerTeamTwoLabel &&
            (tossWinnerTeamTwoLabel.innerText = target.value);
        }
      });
    });

    const submitButton = element.querySelector("#submitmatchSettings") as HTMLButtonElement;

    submitButton.addEventListener("click", () => {
      const validation = validator(matchSettings, {});
      MatchSettings.updateSettings(matchSettings);

      if (validation.hasError && validation.concatenatedErrorMessage) {
        return toast(validation.concatenatedErrorMessage, {
          type: "error",
        });
      }
      rerenderRoute();
      toast("Match settings updated!", {
        type: "success",
        timeOut: 1500,
      });
    });
  };

  const template = `
  <div class="container">
    <div class="form box-shadow">
      <h3 class="subtitle">Match settings</h3>
      <div class="form__group">
        <label for="playerPerTeam">Player per team?</label>
        <input value="${
          MatchSettings.playerPerTeam
        }" name="playerPerTeam" type="number" />
      </div>
      <fieldset class="form__fieldset">
        <legend>No Ball</legend>
        <div class="row--cols-2">
          <div>
          <input
            class="form-check-input"
            type="checkbox"
            name="noBallReBall"
            id="noBallReBall"
            ${MatchSettings.noBallReBall && "checked"}
          />
          <label class="form-check-label me-3"  for="noBallReBall">
            Re-ball
          </label>
        </div>
          <div>
            <label>No ball run</label>
            <input type="number"  name="noBallRun" value="${
              MatchSettings.noBallRun
            }" class="form-control"  />
          </div>
        </div>
      </fieldset>
      <fieldset class="form__fieldset">
        <legend>Wide</legend>
        <div class="row--cols-2">
          <div>
          <input
            class="form-check-input"
            type="checkbox"
            name="wideReBall"
            id="wideReBall"
           ${MatchSettings.wideReBall && "checked"} 
          />
          <label class="form-check-label me-3" for="wideReBall">
            Re-ball
          </label>
        </div>
          <div>
            <label>Wide ball run</label>
            <input  type="number"  name="wideRun" class="form-control" type="text" value="${
              MatchSettings.wideRun
            }" />
          </div>
        </div>
      </fieldset>
      
      <div class="text--center">
        <button id="submitmatchSettings" class="btn btn--primary">Save</button>
      </div>
      
    </div>
  </div>
  `;

  return {
    template,
    bindEvents,
  };
}
