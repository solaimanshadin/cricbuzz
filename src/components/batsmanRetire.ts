import MatchHistory from "../model/MatchHistory";
import { retrieveMatch } from "../utils/retrieveMatch";
import { getRouterParams, router } from "../utils/router";

interface FormData {
  toRetire: "striker" | "nonStriker";
  newBatsman: string;
}

export default function batsmanRetire(): Component {
  let matchData: FormData = {
    // default
    toRetire: "striker",
    newBatsman: "",
  };
  const [matchId] = getRouterParams();
  const match: MatchType | null = retrieveMatch(matchId);
  const currentInning = match?.innings[match.currentInning];
  const batsmanList: PlayerType[] = currentInning
    ? MatchHistory.getPlayersOfATeam(match?.[currentInning?.team]?.name)
    : [];

  const alreadyFallenWickets: string[] =
    match?.getPlayerList().fallenWicketList || [];

  function except(array: PlayerType[], excluded: string[]): PlayerType[] {
    const check1 = array.filter(function (value: PlayerType) {
      return !excluded.find((player) => player == value.name);
    });
    const check2: PlayerType[] = excluded
      .filter(function (value) {
        return !array.find((player) => player.name == value);
      })
      .map((player) => ({ name: player }));
    return check1.concat(check2);
  }
  let listToExpect = [...alreadyFallenWickets];
  currentInning?.striker?.name &&
    (listToExpect = [...listToExpect, currentInning.striker?.name]);
  currentInning?.nonStriker?.name &&
    (listToExpect = [...listToExpect, currentInning?.nonStriker?.name]);

  const yetToBat = except(batsmanList, listToExpect);

  const bindEvents = (element: HTMLElement) => {
    const inputs = element.querySelectorAll("input, select");
    inputs.forEach((input) => {
      input.addEventListener("change", (event) => {
        const target = event.target as HTMLInputElement;
        const [key, value] = [target.name, target.value];
        matchData = {
          ...matchData,
          [key]: value,
        };
      });
    });

    const submitButton =
      element.querySelector("#submitButton") as HTMLButtonElement;
    submitButton?.addEventListener("click", () => {
      match?.retireBatsman({ ...matchData });
      match && router("#running-match", [match?._id]);
    });
  };

  const template = `
    <div class="container">
      <div class="form box-shadow">
        <h3 class="subtitle">Batsman retire</h3>
        <div class="form__group">
        <div>
        <p>Select batsman to retire</p>
        <input
          class="form-check-input"
          type="radio"
          name="toRetire"
          id="striker"
          value="striker"
          checked
        />
        
        <label class="form-check-label me-3" id="strikerLabel" for="striker">
        ${currentInning?.striker?.name}
        </label>
      </div>
      <div>
        <input
          class="form-check-input"
          type="radio"
          name="toRetire"
          value="nonStriker"
          id="nonStriker"
        />
        <label class="form-check-label" id="nonStrikerLabel" for="nonStriker">
          ${currentInning?.nonStriker?.name}
        </label>
      </div>
      </div>
        <div class="form__group">
          <label for="overs">New batsman</label>
          <input autocomplete="off" list="batsmanList" name="newBatsman" type="text" />
          <datalist id="batsmanList">
            <option bizFor="yetToBat"  value="{{name}}"></option>
          </datalist>
        </div>

        <div class="text--center">
          <button id="submitButton" class="btn btn--primary">Done</button>
        </div>
      </div>
    </div>
  `;

  return {
    template,
    bindEvents,
    exports: {
      yetToBat,
    },
  };
}
