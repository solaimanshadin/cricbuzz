import toast from "../lib/toast/index";
import Match from "../model/Match";
import MatchHistory from "../model/MatchHistory";
import { router } from "../utils/router";
import { validator } from "../utils/validator";

interface MatchFormData {
  teamOneName: string;
  teamTwoName: string;
  tossWinner: TeamOptionType;
  optedTo: TossOptionType;
  totalOver: number;
}

export default function matchStarter(): Component {
  let matchData: MatchFormData = {
    // default
    teamOneName: "",
    teamTwoName: "",
    tossWinner: "teamOne",
    optedTo: "bat",
    totalOver: 0,
  };
  const teamList = MatchHistory.getTeams();
  const bindEvents = (element: HTMLElement) => {
    const inputs = element.querySelectorAll(
      "input"
    ) as NodeListOf<HTMLInputElement>;
    inputs.forEach((input) => {
      input.addEventListener("change", (event: Event) => {
        const target = event.target as HTMLInputElement;
        matchData = {
          ...matchData,
          [target.name]:
            target.type == "number" ? target.valueAsNumber : target.value,
        };
        // updating tossWinner label with team name
        if (target.name == "teamOneName") {
          (
            element.querySelector("#tossWinnerTeamOneLabel") as HTMLLabelElement
          ).innerText = target.value;
        }
        if (target.name == "teamTwoName") {
          (
            element.querySelector("#tossWinnerTeamTwoLabel") as HTMLLabelElement
          ).innerText = target.value;
        }
      });
    });

    const submitButton = element.querySelector(
      "#submitMatchData"
    ) as HTMLButtonElement;

    submitButton.addEventListener("click", () => {
      const validation = validator(matchData, {
        teamOneName: {
          isRequired: true,
          message: "Team one name is required",
        },
        teamTwoName: {
          isRequired: true,
          expression:
            matchData.teamOneName?.trim()?.toLowerCase() !=
            matchData.teamTwoName?.trim()?.toLowerCase(),
          message:
            matchData.teamTwoName &&
            matchData.teamOneName?.trim()?.toLowerCase() ==
              matchData.teamTwoName?.trim()?.toLowerCase()
              ? "Team names can not be same"
              : "Team two name is required",
        },
        totalOver: {
          expression: matchData.totalOver > 0,
          message: "Over should be greater than 0",
        },
      });

      if (validation.hasError && validation.concatenatedErrorMessage) {
        return toast(validation.concatenatedErrorMessage, {
          type: "error",
        });
      }
      const newMatch = new Match(matchData);

      router("#opening-player-selection", [newMatch._id]);
    });
  };

  const template = `
  <div class="container">
    <div class="form box-shadow">
      <h3 class="subtitle">New Match</h3>
      <fieldset class="form__fieldset">
        <legend>Teams</legend>
        <div class="row--cols-2">
          <div>
            <input autocomplete="off" type="text" list="teamList" name="teamOneName" class="form-control" placeholder="Team One" />
            <datalist id="teamList">
              <option bizFor="teamList" value="{{name}}"></option>
            </datalist>
          </div>
          <div>
            <input autocomplete="off" type="text" list="teamList" name="teamTwoName" class="form-control" placeholder="Team Two" />
          </div>
        </div>
      </fieldset>
      <fieldset class="form__fieldset">
        <legend>Toss won by?</legend>
        <div class="row--cols-2">
          <div>
            <input
              class="form-check-input"
              type="radio"
              name="tossWinner"
              id="tossWinnerTeamOne"
              value="teamOne"
              checked
            />
            <label class="form-check-label me-3" id="tossWinnerTeamOneLabel" for="tossWinnerTeamOne">
              Team One
            </label>
          </div>
          <div>
            <input
              class="form-check-input"
              type="radio"
              name="tossWinner"
              id="tossWinnerTeamTwo"
              value="teamTwo"
            />
            <label class="form-check-label" id="tossWinnerTeamTwoLabel" for="tossWinnerTeamTwo">
              Team two
            </label>
          </div>
        </div>
      </fieldset>
      <fieldset class="form__fieldset">
        <legend>Opted to?</legend>
        <div class="row--cols-2">
          <div>
            <input
              class="form__input--radio"
              type="radio"
              name="optedTo"
              id="optedTo1"
              value="bat"
              checked
            />
            <label for="optedTo1"> Bat </label>
          </div>
          <div>
            <input
              class="form__input--radio"
              type="radio"
              name="optedTo"
              id="optedTo2"
              value="bowl"
            />
            <label for="optedTo2"> Bowl </label>
          </div>
        </div>
      </fieldset>
      <div class="form__group">
        <label for="overs">Overs?</label>
        <input name="totalOver" type="number" />
      </div>
      <div class="text--center">
        <button id="submitMatchData" class="btn btn--primary">Start match</button>
      </div>
      
    </div>
  </div>
  `;

  return {
    template,
    bindEvents,
    exports: {
      teamList,
    },
  };
}
