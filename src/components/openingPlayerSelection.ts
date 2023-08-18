import toast from "../lib/toast/index";
import MatchHistory from "../model/MatchHistory";
import { retrieveMatch } from "../utils/retrieveMatch";
import { getRouterParams, router } from "../utils/router";
import { validator } from "../utils/validator";
interface PlayerFormData {
  striker: string;
  nonStriker: string;
  openingBowler: string;
}

export default function openingPlayerSelection(): Component {
  let matchData: PlayerFormData = {
    striker: "",
    nonStriker: "",
    openingBowler: "",
  };
  const [matchId] = getRouterParams();
  const match: MatchType | null = retrieveMatch(matchId);
  const batsmanList = match
    ? MatchHistory.getPlayersOfATeam(
        match[match.innings[match.currentInning]?.team]?.name
      )
    : [];
  const bowlerList = match
    ? MatchHistory.getPlayersOfATeam(
        match[
          match.innings[match.currentInning]?.team == "teamOne"
            ? "teamTwo"
            : "teamOne"
        ]?.name
      )
    : [];
  const bindEvents = (element: HTMLElement) => {
    const inputs = element.querySelectorAll(
      "input"
    ) as NodeListOf<HTMLInputElement>;

    inputs.forEach((input) => {
      input.addEventListener("blur", (event: Event) => {
        const target = event.target as HTMLInputElement;
        matchData = { ...matchData, [target.name]: target.value };
      });
    });

    const submitButton = element.querySelector(
      "#submitSelectionData"
    ) as HTMLButtonElement;

    submitButton.addEventListener("click", () => {
      const validate = validator(matchData, {
        striker: {
          isRequired: true,
          message: "Striker name is required",
        },
        nonStriker: {
          isRequired: true,
          expression:
            matchData.striker?.trim()?.toLowerCase() !=
            matchData.nonStriker?.trim()?.toLowerCase(),
          message:
            matchData.nonStriker &&
            matchData.striker?.trim()?.toLowerCase() ==
              matchData.nonStriker?.trim()?.toLowerCase()
              ? "Striker name and non-striker name can not be same"
              : "Non-striker name is required",
        },
        openingBowler: {
          isRequired: true,
          message: "Bowler name is required",
        },
      });

      if (validate.hasError && validate.concatenatedErrorMessage) {
        return toast(validate.concatenatedErrorMessage, {
          type: "error",
        });
      }

      match?.selectOpeningPlayers(matchData);
      match && router("#running-match", [match._id]);
    });
  };

  const template = `
  <div class="container">
    <div class="form box-shadow">
      <h3 class="subtitle">Select Opening Players</h3>
      
      <div class="form__group">
        <label for="overs">Striker</label>
        <input autocomplete="off" list="batsmanList" name="striker" type="text" />
        <datalist id="batsmanList">
            <option bizFor="batsmanList" value="{{name}}"></option>
        </datalist>
      </div>
      <div class="form__group">
        <label for="overs">Non-striker</label>
        <input autocomplete="off" list="batsmanList" name="nonStriker" type="text" />
      </div>
      <div class="form__group">
        <label for="overs">Opening Bowler</label>
        <input autocomplete="off" list="bowlerList" name="openingBowler" type="text" />
        <datalist id="bowlerList">
            <option bizFor="bowlerList" value="{{name}}"></option>
        </datalist>
      </div>
      <div class="text--center">
        <button id="submitSelectionData" class="btn btn--primary">Start match</button>
      </div>
      
    </div>
  </div>
  `;

  return {
    template,
    bindEvents,
    exports: {
      batsmanList,
      bowlerList,
    },
  };
}
