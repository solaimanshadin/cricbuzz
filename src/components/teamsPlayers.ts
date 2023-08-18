import modal from "../lib/modal/index";
import toast from "../lib/toast/index";
import MatchHistory from "../model/MatchHistory";
import { retrieveTeam } from "../utils/retrieveTeam";
import { getRouterParams, rerenderRoute, router } from "../utils/router";

export default function teamsPlayers(): Component {
  const [teamName] = getRouterParams();
  const teamPlayers = MatchHistory.getPlayersOfATeam(teamName);
  const bindEvents = (element: HTMLElement) => {
    const team: TeamType | null = retrieveTeam(teamName);

    const teamCards = element.querySelectorAll(
      ".team__card"
    ) as NodeListOf<HTMLDivElement>;

    teamCards.forEach((teamCard) => {
      teamCard.addEventListener("click", () => {
        teamCard.dataset.name &&
          router("#player-details", [teamName, teamCard.dataset.name]);
      });
    });

    const addPlayerBtn = element.querySelector(
      ".btn--add-player"
    ) as HTMLButtonElement;

    addPlayerBtn.addEventListener("click", () => {
      modal(
        `
          <div class="form">
            <h4>Add Player</h4>
            <div>
            <input type="text" name="teamName" id="playerNameInput"  class="form-control" placeholder="Player Name" />

            <button id="confirmSaveBtn" style="margin-top: 10px"  class="btn btn--primary"> Save </button>
            </div>
          </div>
        `,
        (element: HTMLElement, callback: Function) => {
          const confirmSaveBtn = element.querySelector("#confirmSaveBtn");
          let name: string = "";
          const inputRef = element.querySelector(
            "#playerNameInput"
          ) as HTMLInputElement;
          inputRef.addEventListener("change", ({ target }) => {
            name = (target as HTMLInputElement).value;
          });
          confirmSaveBtn?.addEventListener("click", () => {
            const { success, message } = team?.addPlayer({
              name,
            }) as ActionStatus;
            if (!name) {
              return toast(`Valid name required!`, {
                type: "error",
                timeOut: 1500,
              });
            }
            callback();
            rerenderRoute();
            toast(message, {
              type: success ? "success" : "warning",
              timeOut: 1500,
            });
          });
        }
      );
    });

    const actionButtonList = element.querySelectorAll(
      ".player__action"
    ) as NodeListOf<HTMLOrSVGImageElement>;
    actionButtonList.forEach((actionButtons) => {
      actionButtons.addEventListener("click", (event: Event) => {
        event.stopPropagation();
        const target = event.target as HTMLOrSVGImageElement;
        if (target.classList.contains("player__action--delete")) {
          modal(
            `
            <div class="text--center">
              <p>Are you sure to delete this player?</p>
              <button id="confirmDeleteBtn" style="margin:20px" class="btn btn--primary"> Yes </button>
            </div>
          `,
            (element: HTMLElement, callback: Function) => {
              const confirmDeleteBtn =
                element.querySelector("#confirmDeleteBtn");
              confirmDeleteBtn?.addEventListener("click", () => {
                target.dataset.name && team?.removePlayer(target.dataset.name);
                rerenderRoute();
                callback();
                toast("Player deleted successfully!", {
                  type: "success",
                  timeOut: 1500,
                });
              });
            }
          );
        } else if (target.classList.contains("player__action--edit")) {
          modal(
            `
              <div class="form">
                <h4>Update player name</h4>
                <div>
                <input type="text" name="teamName" id="teamNameInput" value="${
                  (event.target as HTMLElement).dataset.name
                }" class="form-control" placeholder="Team 1" />
                <button id="confirmUpdateBtn" style="margin-top: 10px"  class="btn btn--primary"> Update </button>
                </div>
              </div>
            `,
            (element: HTMLElement, callback: Function) => {
              const confirmUpdateBtn = element.querySelector(
                "#confirmUpdateBtn"
              ) as HTMLButtonElement;
              let name = target.dataset.name;
              const inputRef = element.querySelector(
                "#teamNameInput"
              ) as HTMLInputElement;
              inputRef.addEventListener("change", ({ target }) => {
                name = (target as HTMLInputElement).value;
              });
              confirmUpdateBtn.addEventListener("click", () => {
                if (!name) {
                  return toast(`Valid name required!`, {
                    type: "error",
                    timeOut: 1500,
                  });
                }
                target.dataset.name &&
                  team?.updatePlayerName(target.dataset.name, name);
                callback();
                rerenderRoute();
                toast("Player name updated!", {
                  type: "success",
                  timeOut: 1500,
                });
              });
            }
          );
        }
      });
    });
  };

  const template = `
    <div class="container">
      <div class="team box-shadow">
        <div class="team__header">
          <h3>${teamName}</h3>
          <button class="btn btn--primary btn--add-player">Add Player</button>
        </div>
        <div class="team__cards">
          <div bizFor="teamPlayers"  class="team__card" data-name="{{name}}">
            <div class="team__team">
              <div data-name="{{name}}">
                <span class="team__avatar">{{name}}</span>
                <span class="team__team--name">{{name}}</span>
              </div>
              <div class="player__action d--flex" style="width: 100px">
                <svg style="width:25px;margin: 0 20px;cursor:pointer" data-name="{{name}}" xmlns="http://www.w3.org/2000/svg" class="player__action--edit" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path data-name="{{name}}" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
                    <svg
                      data-name="{{name}}"
                      xmlns="http://www.w3.org/2000/svg"
                      style="width: 25px; cursor: pointer"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      class="player__action--delete"
                    >
                      <path
                        data-name="{{name}}"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="{2}"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </div>
            </div>
          </div>
        <p bizIf="${
          teamPlayers.length == 0
        }" class="text--center">No player found.</p>
        </div>
      </div>
    </div>
  `;

  return {
    template,
    bindEvents,
    exports: {
      teamPlayers,
    },
  };
}
