import toast from "../lib/toast/index";
import MatchHistory from "../model/MatchHistory";
import MatchSettings from "../model/MatchSettings";
import { retrieveMatch } from "../utils/retrieveMatch";
import { getRouterParams, getRouterState, router } from "../utils/router";
import { validator } from "../utils/validator";

export default function fallOfWicket(): Component {
  let matchData: FallOfWicket = {
    wicketType: "Bowled",
    newBatsman: null,
  } as FallOfWicket;

  const [matchId] = getRouterParams();
  const match = retrieveMatch(matchId);
  const currentInning = match?.innings[match.currentInning];
  const batsmanList = currentInning
    ? MatchHistory.getPlayersOfATeam(match[currentInning?.team]?.name)
    : [];
  const alreadyFallenWickets = match?.getPlayerList().fallenWicketList || [];
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
    (listToExpect = [...listToExpect, currentInning.nonStriker?.name]);

  const yetToBat = except(batsmanList, listToExpect);

  const bowlerList: PlayerType[] = currentInning
    ? MatchHistory.getPlayersOfATeam(
        match[currentInning?.team == "teamOne" ? "teamTwo" : "teamOne"]?.name
      )
    : [];

  const bindEvents = (element: HTMLElement) => {
    const { ballInfo } = getRouterState();
    const inputs = element.querySelectorAll("input, select");
    const catchOptionNode: HTMLOptionElement | null =
      element.querySelector("#catchOutOption");
    const wicketAssetNode: HTMLOptionElement | null =
      element.querySelector("#wicketAssetNode");
    const runOutOptionNode: HTMLOptionElement | null =
      element.querySelector("#runOutOption");

    inputs.forEach((input) => {
      input.addEventListener("change", (event) => {
        const target = event.target as HTMLInputElement;
        const [key, value] = [target.name, target.value];
        matchData = {
          ...matchData,
          [key]: target.type === "checkbox" ? target.checked : value,
        };
        if (key === "wicketType" && value === "Catch out" && catchOptionNode) {
          catchOptionNode.style.display = "block";
        } else if (
          key === "wicketType" &&
          value !== "Catch out" &&
          catchOptionNode
        ) {
          catchOptionNode.style.display = "none";
        }
        if (
          key === "wicketType" &&
          (value === "Run out striker" || value === "Run out non-striker") &&
          runOutOptionNode
        ) {
          runOutOptionNode.style.display = "block";
        } else if (
          key === "wicketType" &&
          value !== "Run out striker" &&
          value !== "Run out non-striker" &&
          runOutOptionNode
        ) {
          runOutOptionNode.style.display = "none";
        }
        if (
          key === "wicketType" &&
          (value === "Stumping" ||
            value === "Catch out" ||
            value === "Run out striker" ||
            value === "Run out non-striker") &&
          wicketAssetNode
        ) {
          wicketAssetNode.style.display = "block";
        } else if (
          key === "wicketType" &&
          value !== "Stumping" &&
          value !== "Catch out" &&
          value !== "Run out striker" &&
          value !== "Run out non-striker" &&
          wicketAssetNode
        ) {
          wicketAssetNode.style.display = "none";
        }
      });
    });

    const submitButton: HTMLButtonElement | null =
      element.querySelector("#submitButton");

    submitButton?.addEventListener("click", () => {
      const validation = validator(matchData, {
        newBatsman: {
          isRequired: true,
          message: "New batsman name is required",
        },
      });

      if (validation.hasError && validation.concatenatedErrorMessage) {
        return toast(validation.concatenatedErrorMessage, {
          type: "error",
        });
      }
      const { wickets, success, message } = match?.fallOfWicket({
        ...matchData,
        ...ballInfo,
      }) as InningSummaryReturnType;

      if (!success) {
        return toast(message, {
          type: "error",
        });
      }
      if (wickets >= MatchSettings.playerPerTeam - 1) {
        match && router("#inning-summary", [match._id]);
      } else {
        match && router("#running-match", [match._id]);
      }
    });
  };

  const template = `
    <div class="container">
      <div class="form box-shadow">
        <h3 class="subtitle">Fall of wicket</h3>
        <div class="form__group">
          <label for="overs">How wicket fall?</label>
          <select name="wicketType">
            <option value="Bowled">Bowled</option>
            <option value="Catch out">Catch Out</option>
            <option value="Run out striker">Run out striker</option>
            <option value="Run out non-striker">Run out non-striker</option>
            <option value="Stumping">Stumping</option>
            <option value="LBW">LBW</option>
            <option value="Hit Wicket">Hit wicket</option>
          </select>
        </div>
        <div style="display: none" id="runOutOption" class="form__group">
          <label for="overs">Who got out?</label>
          <select name="fallOfWicket">
            <option value="${
              match?.innings[match.currentInning]?.striker?.name
            }">${match?.innings[match.currentInning]?.striker?.name}</option>
            <option value="${
              match?.innings[match.currentInning]?.nonStriker?.name
            }">${match?.innings[match.currentInning]?.nonStriker?.name}</option>
          </select>
        </div>
        <div style="display: none"  id="catchOutOption" class="form__group">
          <input name="batsmanCrossed" id="batsmanCrossed" type="checkbox" />
          <label for="batsmanCrossed">Did batsman crossed?</label>
        </div>
        <div id="wicketAssetNode" style="display: none" class="form__group">
          <label for="wicketAssetNode">Who helped?</label>
          <input list="bowlerList" name="wicketAsset" type="text" />
          <datalist id="bowlerList">
            <option bizFor="bowlerList" value="{{name}}"></option>
          </datalist>
          
        </div>
        <div class="form__group">
          <label for="overs">New batsman</label>
          <input autocomplete="off" list="batsmanList" name="newBatsman" type="text" />
          <datalist id="batsmanList">
              <option bizFor="yetToBat" value="{{name}}"></option>
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
      bowlerList,
      yetToBat,
    },
  };
}
